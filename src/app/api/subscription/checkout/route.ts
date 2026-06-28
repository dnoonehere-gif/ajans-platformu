import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { sendNotification } from "@/server/notifications/send";
import { sendSubscriptionConfirmEmail } from "@/lib/email";
import { auditFromRequest } from "@/server/audit/log";

const schema = z.object({
  brandId: z.string(),
  planId: z.string(),
  provider: z.enum(["PAYTR", "SHOPIER"]).optional().default("PAYTR"),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Geçersiz veri" }, { status: 400 });

  const { brandId, planId } = parsed.data;
  const userId = (session.user as { id: string }).id;

  const brand = await prisma.brand.findFirst({
    where: { id: brandId, ownerId: userId },
  });
  if (!brand) return NextResponse.json({ error: "Marka bulunamadı" }, { status: 404 });

  const plan = await prisma.plan.findUnique({ where: { id: planId, isActive: true } });
  if (!plan) return NextResponse.json({ error: "Plan bulunamadı" }, { status: 404 });

  // Mevcut aktif aboneliği iptal et
  await prisma.subscription.updateMany({
    where: { brandId, status: { in: ["TRIALING", "ACTIVE"] } },
    data: { status: "CANCELED" },
  });

  // Deneme süresi hesapla
  const trialEndsAt = plan.trialDays > 0
    ? new Date(Date.now() + plan.trialDays * 24 * 60 * 60 * 1000)
    : null;

  // Yeni abonelik oluştur — ödeme tamamlanana kadar TRIALING
  const subscription = await prisma.subscription.create({
    data: {
      brandId,
      planId,
      status: "TRIALING",
      trialEndsAt,
      provider: "PAYTR",
    },
    include: { plan: true },
  });

  // Bekleyen fatura oluştur
  await prisma.invoice.create({
    data: {
      subscriptionId: subscription.id,
      amountCents: plan.priceCents,
      currency: plan.currency,
      status: "PENDING",
      provider: "PAYTR",
    },
  });

  await sendNotification({
    userId,
    brandId,
    type: "subscription_started",
    title: `${plan.name} planı başlatıldı`,
    body: `${plan.trialDays} günlük ücretsiz denemeniz başladı. İyi kullanımlar!`,
    data: { planId: plan.id, planName: plan.name, subscriptionId: subscription.id },
  });

  // Abonelik onay maili
  const dbUser = await prisma.user.findUnique({ where: { id: userId }, select: { email: true, name: true } });
  if (dbUser?.email) {
    sendSubscriptionConfirmEmail(dbUser.email, {
      name: dbUser.name ?? "Kullanıcı",
      planName: plan.name,
      trialDays: plan.trialDays,
      endsAt: trialEndsAt?.toISOString(),
    }).catch(() => null);
  }

  auditFromRequest("subscription.create", userId, {
    entity: "Subscription", entityId: subscription.id,
    metadata: { brandId, planId: plan.id, planName: plan.name },
  }).catch(() => null);

  // TODO: PayTR / Shopier ödeme bağlantısı oluştur
  const checkoutUrl = null;

  return NextResponse.json({ subscription, checkoutUrl });
}
