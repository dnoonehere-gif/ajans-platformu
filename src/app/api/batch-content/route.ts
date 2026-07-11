import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { prisma } from "@/lib/prisma";
import { generateContent } from "@/server/ai/content-generator";
import { z } from "zod";
import type { ContentType } from "@prisma/client";
import { getBrandPlanFeatures, getMonthlyAiContentCount, isUnderLimit } from "@/lib/plan-guard";

const CONTENT_TYPES: ContentType[] = [
  "INSTAGRAM_POST", "REELS_IDEA", "STORY_IDEA", "FACEBOOK_POST", "LINKEDIN_POST",
  "BLOG_POST", "GOOGLE_ADS", "META_ADS", "SEO_CONTENT", "HASHTAGS", "CONTENT_PLAN",
];

const itemSchema = z.object({
  type: z.enum(CONTENT_TYPES as [ContentType, ...ContentType[]]),
  topic: z.string().optional(),
  tone: z.string().optional(),
});

const schema = z.object({
  brandId: z.string(),
  sector: z.string().min(2),
  description: z.string().min(5),
  items: z.array(itemSchema).min(1).max(20),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const userId = (session.user as { id: string }).id;
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Geçersiz veri", details: parsed.error.flatten() }, { status: 400 });

  const { brandId, sector, description, items } = parsed.data;

  const brand = await prisma.brand.findFirst({
    where: { id: brandId, ownerId: userId },
    include: { subscriptions: { where: { status: "ACTIVE" }, include: { plan: true }, take: 1 } },
  });
  if (!brand) return NextResponse.json({ error: "Marka bulunamadı" }, { status: 404 });

  const plan = brand.subscriptions[0]?.plan;
  const planFeatures = plan?.features as Record<string, unknown> | undefined;
  if (!planFeatures?.batchContent) {
    return NextResponse.json({ error: "Toplu içerik üretimi Ajans planına özeldir" }, { status: 403 });
  }

  const features = await getBrandPlanFeatures(brandId);
  const monthlyCount = await getMonthlyAiContentCount(brandId);
  const remaining = features.aiContent === -1 ? Infinity : features.aiContent - monthlyCount;
  if (items.length > remaining) {
    return NextResponse.json({ error: `Aylık AI limit: ${remaining} içerik kaldı, ${items.length} talep edildi` }, { status: 403 });
  }

  const results: { index: number; type: string; title: string | null; body: string | null; error?: string }[] = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    try {
      const generated = await generateContent(item.type, {
        brandName: brand.name,
        sector,
        description,
        topic: item.topic,
        tone: item.tone,
        primaryColor: brand.primaryColor ?? undefined,
      });

      await prisma.contentItem.create({
        data: {
          brandId,
          type: item.type,
          title: generated.title,
          body: generated.body,
          meta: generated.meta as unknown as undefined,
        },
      });

      await prisma.aiUsage.create({
        data: { brandId, feature: "CONTENT", model: "batch", tokensIn: 0, tokensOut: 0 },
      });

      results.push({ index: i, type: item.type, title: generated.title, body: generated.body });
    } catch {
      results.push({ index: i, type: item.type, title: null, body: null, error: "Üretim başarısız" });
    }
  }

  const success = results.filter((r) => r.body).length;
  return NextResponse.json({ results, summary: { total: items.length, success, failed: items.length - success } });
}
