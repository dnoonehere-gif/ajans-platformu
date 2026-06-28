import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { prisma } from "@/lib/prisma";
import { sendNotification } from "@/server/notifications/send";
import { sendSubscriptionCancelEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { brandId } = await req.json();
  if (!brandId) return NextResponse.json({ error: "brandId gerekli" }, { status: 400 });

  const brand = await prisma.brand.findFirst({
    where: { id: brandId, ownerId: (session.user as { id: string }).id },
  });
  if (!brand) return NextResponse.json({ error: "Marka bulunamadı" }, { status: 404 });

  const subscription = await prisma.subscription.findFirst({
    where: { brandId, status: { in: ["TRIALING", "ACTIVE", "PAST_DUE"] } },
    orderBy: { createdAt: "desc" },
  });
  if (!subscription) return NextResponse.json({ error: "Aktif abonelik bulunamadı" }, { status: 404 });

  const updated = await prisma.subscription.update({
    where: { id: subscription.id },
    data: {
      status: "CANCELED",
      endsAt: subscription.trialEndsAt ?? new Date(),
    },
    include: { plan: true },
  });

  await sendNotification({
    userId: (session.user as { id: string }).id,
    brandId,
    type: "subscription_canceled",
    title: "Abonelik iptal edildi",
    body: updated.endsAt
      ? `${new Date(updated.endsAt).toLocaleDateString("tr-TR")} tarihine kadar kullanmaya devam edebilirsiniz.`
      : "Aboneliğiniz iptal edildi.",
  });

  const dbUser = await prisma.user.findUnique({ where: { id: (session.user as { id: string }).id }, select: { email: true, name: true } });
  if (dbUser?.email) {
    sendSubscriptionCancelEmail(dbUser.email, {
      name: dbUser.name ?? "Kullanıcı",
      planName: updated.plan.name,
      endsAt: updated.endsAt?.toISOString(),
    }).catch(() => null);
  }

  return NextResponse.json({ subscription: updated });
}
