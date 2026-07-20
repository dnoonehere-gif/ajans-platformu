import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendWeeklyDigestEmail } from "@/lib/email";

// Haftalık özet e-postası — her pazartesi çağrılır (cron scheduler kontrol eder)
// Header: Authorization: Bearer <CRON_SECRET>
export async function POST(req: NextRequest) {
  const secret = req.headers.get("authorization")?.replace("Bearer ", "");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  // Sadece pazartesi günleri gönder (scheduler her gün tetikliyor)
  const today = new Date();
  const force = req.nextUrl.searchParams.get("force") === "1";
  if (today.getDay() !== 1 && !force) {
    return NextResponse.json({ skipped: true, reason: "Pazartesi değil" });
  }

  // Aynı gün ikinci kez gönderme (her deploy/restart scheduler'ı yeniden tetikliyor)
  const todayKey = today.toISOString().split("T")[0];
  if (!force) {
    const lastSent = await prisma.systemSetting.findUnique({ where: { key: "weekly_digest_last_sent" } });
    if (lastSent?.value === todayKey) {
      return NextResponse.json({ skipped: true, reason: "Bugün zaten gönderildi" });
    }
  }
  await prisma.systemSetting.upsert({
    where: { key: "weekly_digest_last_sent" },
    create: { key: "weekly_digest_last_sent", value: todayKey },
    update: { value: todayKey },
  });

  const weekAgo = new Date(today);
  weekAgo.setDate(today.getDate() - 7);

  const brands = await prisma.brand.findMany({
    include: { owner: { select: { email: true, name: true } }, chatbot: { select: { id: true } } },
  });

  let sent = 0;
  for (const brand of brands) {
    if (!brand.owner?.email) continue;

    try {
      const [reviews, negativeCount, reservations, leads, conversations] = await Promise.all([
        prisma.review.count({ where: { brandId: brand.id, createdAt: { gte: weekAgo } } }),
        prisma.review.count({ where: { brandId: brand.id, createdAt: { gte: weekAgo }, rating: { lte: 2 } } }),
        prisma.reservation.count({ where: { brandId: brand.id, createdAt: { gte: weekAgo } } }),
        prisma.crmLead.count({ where: { brandId: brand.id, createdAt: { gte: weekAgo } } }),
        brand.chatbot
          ? prisma.chatbotConversation.count({ where: { chatbotId: brand.chatbot.id, createdAt: { gte: weekAgo } } })
          : Promise.resolve(0),
      ]);

      // Hiç aktivite yoksa mail atma
      if (reviews + reservations + leads + conversations === 0) continue;

      await sendWeeklyDigestEmail(brand.owner.email, {
        name: brand.owner.name ?? undefined,
        brandName: brand.name,
        reviews,
        negativeCount,
        reservations,
        leads,
        conversations,
      });
      sent++;
    } catch (e) {
      console.error(`Weekly digest error for brand ${brand.id}:`, e);
    }
  }

  return NextResponse.json({ brands: brands.length, sent });
}
