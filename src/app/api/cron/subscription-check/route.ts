import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendNotification } from "@/server/notifications/send";
import { sendSubscriptionCancelEmail } from "@/lib/email";

// Vercel Cron: her gün 09:00'da çalışır
// Authorization: Vercel cron secret ile korunur
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const now = new Date();
  const in3Days = new Date(now); in3Days.setDate(now.getDate() + 3);

  let expired = 0, warned = 0;

  // 1. Süresi dolmuş abonelikleri EXPIRED yap
  const expiredSubs = await prisma.subscription.findMany({
    where: { status: { in: ["ACTIVE", "TRIALING"] }, endsAt: { lte: now } },
    include: { brand: { include: { owner: { select: { email: true, name: true } } } }, plan: true },
  });

  for (const sub of expiredSubs) {
    await prisma.subscription.update({
      where: { id: sub.id },
      data: { status: "EXPIRED" },
    });

    // Bildirim + mail
    await sendNotification({
      userId: sub.brand.ownerId,
      brandId: sub.brandId,
      type: "subscription_expiring",
      title: "Aboneliğiniz sona erdi",
      body: `${sub.plan.name} planınız sona erdi. Hizmetlere erişmek için yeni plan seçin.`,
    });

    if (sub.brand.owner.email) {
      sendSubscriptionCancelEmail(sub.brand.owner.email, {
        name: sub.brand.owner.name ?? "Kullanıcı",
        planName: sub.plan.name,
      }).catch(() => null);
    }
    expired++;
  }

  // 2. 3 gün içinde bitecekleri uyar
  const expiringSoon = await prisma.subscription.findMany({
    where: {
      status: { in: ["ACTIVE", "TRIALING"] },
      endsAt: { gt: now, lte: in3Days },
    },
    include: { brand: true, plan: true },
  });

  for (const sub of expiringSoon) {
    const daysLeft = Math.ceil((sub.endsAt!.getTime() - now.getTime()) / 86400000);
    await sendNotification({
      userId: sub.brand.ownerId,
      brandId: sub.brandId,
      type: "subscription_expiring",
      title: `Aboneliğiniz ${daysLeft} gün içinde sona eriyor`,
      body: `${sub.plan.name} planınızı yenilemek için Abonelik sayfasını ziyaret edin.`,
    });
    warned++;
  }

  return NextResponse.json({ ok: true, expired, warned, checkedAt: now.toISOString() });
}
