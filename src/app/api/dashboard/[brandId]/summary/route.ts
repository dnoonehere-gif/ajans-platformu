import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { prisma } from "@/lib/prisma";
import { generateDashboardSummary } from "@/server/ai/dashboard-summary";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ brandId: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { brandId } = await params;

  const summaries = await prisma.dashboardSummary.findMany({
    where: { brandId, brand: { ownerId: (session.user as { id: string }).id } },
    orderBy: { date: "desc" },
    take: 7,
  });

  return NextResponse.json({ summaries });
}

export async function POST(_req: NextRequest, { params }: { params: Promise<{ brandId: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { brandId } = await params;

  const brand = await prisma.brand.findFirst({
    where: { id: brandId, ownerId: (session.user as { id: string }).id },
    include: { chatbot: true },
  });
  if (!brand) return NextResponse.json({ error: "Marka bulunamadı" }, { status: 404 });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [reviewStats, avgRating, newToday, contentCount, chatbotCount, negativeReviews] =
    await Promise.all([
      prisma.review.groupBy({ by: ["sentiment"], where: { brandId }, _count: true }),
      prisma.review.aggregate({ where: { brandId }, _avg: { rating: true } }),
      prisma.review.count({ where: { brandId, createdAt: { gte: today } } }),
      prisma.contentItem.count({ where: { brandId } }),
      brand.chatbot
        ? prisma.chatbotConversation.count({ where: { chatbotId: brand.chatbot.id } })
        : Promise.resolve(0),
      prisma.review.findMany({
        where: { brandId, sentiment: "NEGATIVE" },
        select: { text: true, topics: true },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
    ]);

  const sm = { POSITIVE: 0, NEUTRAL: 0, NEGATIVE: 0 };
  reviewStats.forEach((r) => { if (r.sentiment) sm[r.sentiment] = r._count; });

  const topComplaints = negativeReviews
    .flatMap((r) => r.topics)
    .reduce((acc: Record<string, number>, t) => ({ ...acc, [t]: (acc[t] ?? 0) + 1 }), {});
  const sortedComplaints = Object.entries(topComplaints).sort((a, b) => b[1] - a[1]).map(([t]) => t);

  const result = await generateDashboardSummary({
    brandName: brand.name,
    totalReviews: sm.POSITIVE + sm.NEUTRAL + sm.NEGATIVE,
    positiveCount: sm.POSITIVE,
    neutralCount: sm.NEUTRAL,
    negativeCount: sm.NEGATIVE,
    avgRating: avgRating._avg.rating,
    newReviewsToday: newToday,
    chatbotConversations: chatbotCount,
    contentItemsGenerated: contentCount,
    topComplaints: sortedComplaints,
    recentNegatives: negativeReviews.map((r) => r.text).filter(Boolean) as string[],
  });

  const summary = await prisma.dashboardSummary.upsert({
    where: { brandId_date: { brandId, date: today } },
    create: {
      brandId,
      date: today,
      performance: result.performance,
      negativeTrend: result.negativeTrend,
      topComplaint: result.topComplaint || null,
      aiSuggestions: result.aiSuggestions,
    },
    update: {
      performance: result.performance,
      negativeTrend: result.negativeTrend,
      topComplaint: result.topComplaint || null,
      aiSuggestions: result.aiSuggestions,
    },
  });

  return NextResponse.json({ summary, briefing: result.briefing });
}
