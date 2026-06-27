import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ brandId: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { brandId } = await params;

  const brand = await prisma.brand.findFirst({
    where: { id: brandId, ownerId: (session.user as { id: string }).id },
    include: { website: true, chatbot: true },
  });
  if (!brand) return NextResponse.json({ error: "Marka bulunamadı" }, { status: 404 });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    reviewStats,
    reviewsLast30,
    chatbotConversations,
    contentItems,
    recentReviews,
    latestSummary,
  ] = await Promise.all([
    // Sentiment sayıları
    prisma.review.groupBy({
      by: ["sentiment"],
      where: { brandId },
      _count: true,
    }),
    // Son 30 gün günlük yorum sayısı (trend)
    prisma.review.findMany({
      where: { brandId, createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true, rating: true, sentiment: true },
      orderBy: { createdAt: "asc" },
    }),
    // Chatbot konuşma sayısı
    brand.chatbot
      ? prisma.chatbotConversation.count({ where: { chatbotId: brand.chatbot.id } })
      : Promise.resolve(0),
    // İçerik sayısı
    prisma.contentItem.count({ where: { brandId } }),
    // Son 5 yorum
    prisma.review.findMany({
      where: { brandId },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, authorName: true, rating: true, text: true, sentiment: true, source: true, createdAt: true },
    }),
    // Son AI özet
    prisma.dashboardSummary.findFirst({
      where: { brandId },
      orderBy: { date: "desc" },
    }),
  ]);

  const sentimentMap = { POSITIVE: 0, NEUTRAL: 0, NEGATIVE: 0, null: 0 };
  reviewStats.forEach((r) => {
    const key = r.sentiment ?? "null";
    (sentimentMap as Record<string, number>)[key] = r._count;
  });

  const totalReviews = Object.values(sentimentMap).reduce((a, b) => a + b, 0);

  const avgRating = await prisma.review.aggregate({
    where: { brandId },
    _avg: { rating: true },
  });

  // Günlük yorum trendi (son 30 gün)
  const trendMap: Record<string, { date: string; count: number; avgRating: number; total: number }> = {};
  reviewsLast30.forEach((r) => {
    const date = r.createdAt.toISOString().split("T")[0];
    if (!trendMap[date]) trendMap[date] = { date, count: 0, avgRating: 0, total: 0 };
    trendMap[date].count++;
    trendMap[date].total += r.rating;
    trendMap[date].avgRating = trendMap[date].total / trendMap[date].count;
  });

  // Son 14 günü doldur
  const trend = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0];
    trend.push(trendMap[key] ?? { date: key, count: 0, avgRating: 0, total: 0 });
  }

  return NextResponse.json({
    brand: { id: brand.id, name: brand.name, primaryColor: brand.primaryColor },
    kpis: {
      totalReviews,
      avgRating: avgRating._avg.rating,
      sentiment: { positive: sentimentMap.POSITIVE, neutral: sentimentMap.NEUTRAL, negative: sentimentMap.NEGATIVE },
      chatbotConversations,
      contentItems,
      websitePublished: brand.website?.isPublished ?? false,
    },
    trend,
    recentReviews,
    latestSummary,
  });
}
