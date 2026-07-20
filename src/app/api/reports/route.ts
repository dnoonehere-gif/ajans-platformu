import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  brandId: z.string(),
  period: z.enum(["week", "month"]).default("month"),
});

async function hasReportingAccess(userId: string, brandId: string): Promise<boolean> {
  const brand = await prisma.brand.findFirst({
    where: { id: brandId, ownerId: userId },
    include: { subscriptions: { where: { status: "ACTIVE" }, include: { plan: true }, take: 1 } },
  });
  if (!brand) return false;
  const features = brand.subscriptions[0]?.plan?.features as Record<string, unknown> | undefined;
  return features?.clientReporting === true;
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

    const userId = (session.user as { id: string }).id;
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Geçersiz veri" }, { status: 400 });

    const { brandId, period } = parsed.data;
    const hasAccess = await hasReportingAccess(userId, brandId);
    if (!hasAccess) return NextResponse.json({ error: "Bu özellik Ajans planına özeldir" }, { status: 403 });

    const now = new Date();
    const since = new Date(now);
    if (period === "week") since.setDate(since.getDate() - 7);
    else since.setMonth(since.getMonth() - 1);

    const brand = await prisma.brand.findUnique({ where: { id: brandId }, select: { name: true } });

    const [contentCount, reviews, chatbotMessages, qrCodes, aiUsage, emailsSent, crmLeads, socialPosts] = await Promise.all([
      prisma.contentItem.count({ where: { brandId, createdAt: { gte: since } } }),
      prisma.review.findMany({ where: { brandId, createdAt: { gte: since } }, select: { rating: true, sentiment: true } }),
      prisma.chatbotMessage.count({ where: { conversation: { chatbot: { brandId } }, createdAt: { gte: since } } }),
      prisma.qrCode.aggregate({ where: { brandId }, _sum: { scanCount: true } }),
      prisma.aiUsage.count({ where: { brandId, createdAt: { gte: since } } }),
      prisma.emailCampaign.aggregate({ where: { brandId, status: "SENT", sentAt: { gte: since } }, _sum: { sentCount: true } }),
      prisma.crmLead.count({ where: { brandId, createdAt: { gte: since } } }),
      prisma.socialPost.count({ where: { brandId, createdAt: { gte: since } } }),
    ]);

    const avgRating = reviews.length > 0
      ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10
      : 0;

    const sentimentBreakdown = {
      positive: reviews.filter((r) => r.sentiment === "POSITIVE").length,
      neutral: reviews.filter((r) => r.sentiment === "NEUTRAL").length,
      negative: reviews.filter((r) => r.sentiment === "NEGATIVE").length,
    };

    const report = {
      brand: brand?.name ?? "Bilinmeyen",
      // Etiket istemcide dile göre üretilir; sabit Türkçe metin geriye
      // dönük uyumluluk için korunuyor.
      periodKey: period,
      period: period === "week" ? "Haftalık" : "Aylık",
      dateRange: { from: since.toISOString(), to: now.toISOString() },
      metrics: {
        contentProduced: contentCount,
        reviewsReceived: reviews.length,
        avgRating,
        sentimentBreakdown,
        chatbotInteractions: chatbotMessages,
        qrScans: qrCodes._sum.scanCount ?? 0,
        aiUsage,
        emailsSent: emailsSent._sum.sentCount ?? 0,
        crmLeads,
        socialPosts,
      },
      generatedAt: now.toISOString(),
    };

    return NextResponse.json({ report });
  } catch (e) {
    console.error("Reports POST error:", e);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
