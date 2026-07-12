import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { prisma } from "@/lib/prisma";
import { generateText } from "@/server/ai/anthropic";
import { z } from "zod";
import { getBrandPlanFeatures, getMonthlyAiContentCount, isUnderLimit } from "@/lib/plan-guard";

const schema = z.object({
  brandId: z.string(),
  url: z.string().optional(),
  keywords: z.string().optional(),
  pageTitle: z.string().optional(),
  pageDescription: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const userId = (session.user as { id: string }).id;
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Geçersiz veri" }, { status: 400 });

  const { brandId, keywords, pageTitle, pageDescription } = parsed.data;

  const brand = await prisma.brand.findFirst({ where: { id: brandId, ownerId: userId } });
  if (!brand) return NextResponse.json({ error: "Marka bulunamadı" }, { status: 404 });

  const features = await getBrandPlanFeatures(brandId);
  if (!features.seoContent) {
    return NextResponse.json({ error: "SEO araçları planınızda bulunmuyor" }, { status: 403 });
  }

  const monthlyCount = await getMonthlyAiContentCount(brandId);
  if (!isUnderLimit(monthlyCount, features.aiContent)) {
    return NextResponse.json({ error: "Aylık AI limit aşıldı" }, { status: 403 });
  }

  const prompt = `Sen bir SEO uzmanısın. Aşağıdaki bilgilere göre Türkçe SEO analizi ve öneriler üret.

Marka: ${brand.name}
Sektör: ${brand.sector ?? "Belirtilmemiş"}
${keywords ? `Hedef Anahtar Kelimeler: ${keywords}` : ""}
${pageTitle ? `Mevcut Sayfa Başlığı: ${pageTitle}` : ""}
${pageDescription ? `Mevcut Meta Açıklaması: ${pageDescription}` : ""}

Şu bilgileri JSON formatında döndür:
{
  "metaTitle": "Önerilen SEO başlığı (50-60 karakter)",
  "metaDescription": "Önerilen meta açıklaması (150-160 karakter)",
  "keywords": ["anahtar", "kelime", "listesi"],
  "h1Suggestion": "Önerilen H1 başlığı",
  "contentTips": ["SEO ipucu 1", "SEO ipucu 2", "SEO ipucu 3", "SEO ipucu 4", "SEO ipucu 5"],
  "score": 0-100 arası SEO skoru (mevcut bilgilere göre),
  "improvements": ["İyileştirme önerisi 1", "İyileştirme önerisi 2", "İyileştirme önerisi 3"]
}

Sadece JSON döndür, başka bir şey yazma.`;

  const raw = await generateText({ prompt, maxTokens: 1024, model: "claude-haiku-4-5-20251001" });
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return NextResponse.json({ error: "SEO analizi oluşturulamadı" }, { status: 500 });

  let analysis;
  try { analysis = JSON.parse(jsonMatch[0]); } catch { return NextResponse.json({ error: "Analiz ayrıştırılamadı" }, { status: 500 }); }

  await prisma.aiUsage.create({
    data: { brandId, feature: "SEO", model: "claude-haiku-4-5-20251001", tokensIn: 0, tokensOut: 0 },
  });

  return NextResponse.json({ analysis });
}
