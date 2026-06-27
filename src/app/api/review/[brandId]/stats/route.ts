import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { prisma } from "@/lib/prisma";
import { generateInsightReport } from "@/server/ai/review-analyzer";

export async function GET(req: NextRequest, { params }: { params: Promise<{ brandId: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { brandId } = await params;

  const brand = await prisma.brand.findFirst({
    where: { id: brandId, ownerId: (session.user as { id: string }).id },
  });
  if (!brand) return NextResponse.json({ error: "Marka bulunamadı" }, { status: 404 });

  const [counts, allReviews, avgRating] = await Promise.all([
    prisma.review.groupBy({
      by: ["sentiment"],
      where: { brandId, sentiment: { not: null } },
      _count: true,
    }),
    prisma.review.findMany({
      where: { brandId },
      select: { topics: true, sentiment: true, text: true, rating: true },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.review.aggregate({
      where: { brandId },
      _avg: { rating: true },
      _count: true,
    }),
  ]);

  const sentimentMap = { POSITIVE: 0, NEUTRAL: 0, NEGATIVE: 0 };
  counts.forEach((c) => {
    if (c.sentiment) sentimentMap[c.sentiment] = c._count;
  });

  // En çok geçen konular
  const topicFreq: Record<string, number> = {};
  allReviews.forEach((r) => {
    r.topics.forEach((t) => {
      topicFreq[t] = (topicFreq[t] ?? 0) + 1;
    });
  });
  const topTopics = Object.entries(topicFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([topic, count]) => ({ topic, count }));

  // Rating dağılımı
  const ratingDist = [1, 2, 3, 4, 5].map((r) => ({
    rating: r,
    count: allReviews.filter((rv) => rv.rating === r).length,
  }));

  const { searchParams } = new URL(req.url);
  let insightReport: string | null = null;

  if (searchParams.get("insight") === "1" && allReviews.length > 0) {
    const negativeTexts = allReviews
      .filter((r) => r.sentiment === "NEGATIVE" && r.text)
      .map((r) => r.text as string);

    insightReport = await generateInsightReport({
      brandName: brand.name,
      positiveCount: sentimentMap.POSITIVE,
      neutralCount: sentimentMap.NEUTRAL,
      negativeCount: sentimentMap.NEGATIVE,
      topTopics: topTopics.map((t) => t.topic),
      recentNegatives: negativeTexts,
    });
  }

  return NextResponse.json({
    sentiment: sentimentMap,
    topTopics,
    ratingDist,
    avgRating: avgRating._avg.rating,
    totalReviews: avgRating._count,
    unanalyzed: allReviews.filter((r) => !r.sentiment).length,
    insightReport,
  });
}
