import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { prisma } from "@/lib/prisma";
import { generateContent } from "@/server/ai/content-generator";
import { z } from "zod";
import type { ContentType } from "@prisma/client";
import { auditFromRequest } from "@/server/audit/log";
import { rateLimit, getRateLimitKey, LIMITS } from "@/server/security/rate-limit";
import { getBrandPlanFeatures, getMonthlyAiContentCount, isUnderLimit } from "@/lib/plan-guard";

const CONTENT_TYPES: ContentType[] = [
  "INSTAGRAM_POST", "REELS_IDEA", "STORY_IDEA", "FACEBOOK_POST", "LINKEDIN_POST",
  "BLOG_POST", "GOOGLE_ADS", "META_ADS", "SEO_CONTENT", "HASHTAGS", "CONTENT_PLAN",
];

const schema = z.object({
  brandId: z.string(),
  type: z.enum(CONTENT_TYPES as [ContentType, ...ContentType[]]),
  sector: z.string().min(2),
  description: z.string().min(5),
  topic: z.string().optional(),
  tone: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const rl = await rateLimit(getRateLimitKey(req), LIMITS.AI_GENERATE);
  if (!rl.allowed) return NextResponse.json({ error: "AI limit aşıldı. 1 dakika sonra tekrar deneyin." }, { status: 429 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Geçersiz veri" }, { status: 400 });

  const { brandId, type, sector, description, topic, tone } = parsed.data;

  const brand = await prisma.brand.findFirst({
    where: { id: brandId, ownerId: (session.user as { id: string }).id },
  });
  if (!brand) return NextResponse.json({ error: "Marka bulunamadı" }, { status: 404 });

  // Plan limiti: aylık AI içerik sayısı
  const features = await getBrandPlanFeatures(brandId);
  const monthlyCount = await getMonthlyAiContentCount(brandId);
  if (!isUnderLimit(monthlyCount, features.aiContent)) {
    return NextResponse.json({
      error: `Bu ay ${features.aiContent} AI içerik limitinize ulaştınız. Daha fazlası için planınızı yükseltin.`,
      code: "PLAN_LIMIT_AI_CONTENT",
    }, { status: 403 });
  }

  const generated = await generateContent(type, {
    brandName: brand.name,
    sector,
    description,
    topic,
    tone,
    primaryColor: brand.primaryColor ?? undefined,
  });

  const item = await prisma.contentItem.create({
    data: {
      brandId,
      type,
      title: generated.title,
      body: generated.body,
      meta: (generated.meta ?? {}) as never,
      createdById: (session.user as { id: string }).id,
    },
  });

  await prisma.aiUsage.create({
    data: { brandId, feature: "content", model: "claude-sonnet-4-6", tokensIn: 0, tokensOut: 0 },
  });

  auditFromRequest("content.generate", (session.user as { id: string }).id, {
    entity: "ContentItem", entityId: item.id, metadata: { brandId, type, topic },
  }).catch(() => null);

  return NextResponse.json({ item });
}
