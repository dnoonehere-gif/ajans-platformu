import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendCustomEmail } from "@/lib/email";

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

      const lines = [
        `Merhaba${brand.owner.name ? ` ${brand.owner.name}` : ""},`,
        ``,
        `${brand.name} için geçen haftanın özeti:`,
        ``,
        `⭐ ${reviews} yeni yorum${negativeCount > 0 ? ` (${negativeCount} olumsuz — incelemenizi öneririz)` : ""}`,
        `📅 ${reservations} yeni rezervasyon`,
        `👤 ${leads} yeni müşteri adayı (CRM)`,
        `💬 ${conversations} chatbot konuşması`,
        ``,
        `Detaylar için dashboard'unuza göz atın: ${process.env.NEXTAUTH_URL ?? "https://www.novelya.com.tr"}/dashboard`,
        ``,
        `İyi haftalar dileriz,`,
        `Novelya Ekibi`,
      ];

      await sendCustomEmail(
        brand.owner.email,
        `📊 ${brand.name} — Haftalık Özet`,
        lines.join("\n")
      );
      sent++;
    } catch (e) {
      console.error(`Weekly digest error for brand ${brand.id}:`, e);
    }
  }

  return NextResponse.json({ brands: brands.length, sent });
}
