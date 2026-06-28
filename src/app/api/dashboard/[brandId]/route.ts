import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { prisma } from "@/lib/prisma";
import { cached, cacheDel, CacheKeys, CacheTTL } from "@/server/cache/redis-cache";

export async function GET(req: NextRequest, { params }: { params: Promise<{ brandId: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { brandId } = await params;

  const brand = await prisma.brand.findFirst({
    where: { id: brandId, ownerId: (session.user as { id: string }).id },
    include: { website: true, chatbot: true },
  });
  if (!brand) return NextResponse.json({ error: "Marka bulunamadı" }, { status: 404 });

  // ?refresh=1 ile cache'i temizle (yorum ekleme sonrası)
  const url = new URL(req.url);
  if (url.searchParams.get("refresh") === "1") {
    await cacheDel(CacheKeys.dashboard(brandId));
  }

  const data = await cached(
    CacheKeys.dashboard(brandId),
    () => computeDashboard(brand, brandId),
    { ttl: CacheTTL.DASHBOARD, tags: [`brand:${brandId}`] }
  );

  const res = NextResponse.json(data);
  res.headers.set("Cache-Control", "private, max-age=60");
  return res;
}

type BrandWithRelations = NonNullable<Awaited<ReturnType<typeof prisma.brand.findFirst<{
  include: { website: true; chatbot: true }
}>>>>;

async function computeDashboard(brand: BrandWithRelations, brandId: string) {
  const now = new Date();
  const thirtyDaysAgo   = new Date(now); thirtyDaysAgo.setDate(now.getDate() - 30);
  const sixtyDaysAgo    = new Date(now); sixtyDaysAgo.setDate(now.getDate() - 60);
  const sevenDaysAgo    = new Date(now); sevenDaysAgo.setDate(now.getDate() - 7);
  const fourteenDaysAgo = new Date(now); fourteenDaysAgo.setDate(now.getDate() - 14);

  const [
    reviewStats, reviewsLast30, reviewsPrev30Count, reviewsLast7Count,
    reviewsPrev7Count, chatbotConversations, contentItems, recentReviews,
    latestSummary, ratingDistRaw, sourceDistRaw, avgRating, prevAvgRating,
  ] = await Promise.all([
    prisma.review.groupBy({ by: ["sentiment"], where: { brandId }, _count: true }),
    prisma.review.findMany({
      where: { brandId, createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true, rating: true, sentiment: true, source: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.review.count({ where: { brandId, createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } } }),
    prisma.review.count({ where: { brandId, createdAt: { gte: sevenDaysAgo } } }),
    prisma.review.count({ where: { brandId, createdAt: { gte: fourteenDaysAgo, lt: sevenDaysAgo } } }),
    brand.chatbot
      ? prisma.chatbotConversation.count({ where: { chatbotId: brand.chatbot.id } })
      : Promise.resolve(0),
    prisma.contentItem.count({ where: { brandId } }),
    prisma.review.findMany({
      where: { brandId },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, authorName: true, rating: true, text: true, sentiment: true, source: true, createdAt: true },
    }),
    prisma.dashboardSummary.findFirst({ where: { brandId }, orderBy: { date: "desc" } }),
    prisma.review.groupBy({ by: ["rating"], where: { brandId }, _count: true }),
    prisma.review.groupBy({ by: ["source"], where: { brandId }, _count: true }),
    prisma.review.aggregate({ where: { brandId }, _avg: { rating: true } }),
    prisma.review.aggregate({
      where: { brandId, createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } },
      _avg: { rating: true },
    }),
  ]);

  const sentimentMap: Record<string, number> = { POSITIVE: 0, NEUTRAL: 0, NEGATIVE: 0 };
  reviewStats.forEach((r) => {
    const key = r.sentiment ?? "NEUTRAL";
    sentimentMap[key] = (sentimentMap[key] ?? 0) + r._count;
  });
  const totalReviews = Object.values(sentimentMap).reduce((a, b) => a + b, 0);

  // 30 günlük günlük trend
  const trendMap: Record<string, { date: string; shortDate: string; count: number; totalRating: number; avgRating: number }> = {};
  reviewsLast30.forEach((r) => {
    const date = r.createdAt.toISOString().split("T")[0];
    if (!trendMap[date]) trendMap[date] = { date, shortDate: "", count: 0, totalRating: 0, avgRating: 0 };
    trendMap[date].count++;
    trendMap[date].totalRating += r.rating;
    trendMap[date].avgRating = Math.round((trendMap[date].totalRating / trendMap[date].count) * 10) / 10;
  });

  const trend = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now); d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0];
    const shortDate = d.toLocaleDateString("tr-TR", { day: "2-digit", month: "short" });
    const point = trendMap[key] ?? { date: key, shortDate, count: 0, totalRating: 0, avgRating: 0 };
    point.shortDate = shortDate;
    trend.push(point);
  }

  const ratingDist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  ratingDistRaw.forEach((r) => { if (r.rating >= 1 && r.rating <= 5) ratingDist[r.rating] = r._count; });

  const sourceDist: Record<string, number> = {};
  sourceDistRaw.forEach((r) => { sourceDist[r.source] = r._count; });

  const last30Count = reviewsLast30.length;
  const weeklyChange = reviewsPrev7Count === 0 ? null : Math.round(((reviewsLast7Count - reviewsPrev7Count) / reviewsPrev7Count) * 100);
  const monthlyChange = reviewsPrev30Count === 0 ? null : Math.round(((last30Count - reviewsPrev30Count) / reviewsPrev30Count) * 100);

  return {
    brand: { id: brand.id, name: brand.name, primaryColor: brand.primaryColor },
    kpis: {
      totalReviews,
      avgRating: avgRating._avg.rating,
      prevAvgRating: prevAvgRating._avg.rating,
      sentiment: { positive: sentimentMap.POSITIVE, neutral: sentimentMap.NEUTRAL, negative: sentimentMap.NEGATIVE },
      chatbotConversations, contentItems,
      websitePublished: brand.website?.isPublished ?? false,
      last30Count, reviewsPrev30Count, reviewsLast7Count, reviewsPrev7Count,
      weeklyChange, monthlyChange,
    },
    trend,
    ratingDist: [5, 4, 3, 2, 1].map((r) => ({ rating: r, count: ratingDist[r], label: `${r}★` })),
    sourceDist: Object.entries(sourceDist).map(([source, count]) => ({ source, count })),
    recentReviews,
    latestSummary,
  };
}
