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

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

    const userId = (session.user as { id: string }).id;
    const brandId = req.nextUrl.searchParams.get("brandId");
    if (!brandId) return NextResponse.json({ error: "brandId gerekli" }, { status: 400 });

    const brand = await prisma.brand.findFirst({ where: { id: brandId, ownerId: userId } });
    if (!brand) return NextResponse.json({ error: "Marka bulunamadı" }, { status: 404 });

    const history = await prisma.seoAnalysis.findMany({
      where: { brandId },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return NextResponse.json({ history });
  } catch (e) {
    console.error("SEO GET error:", e);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

    const userId = (session.user as { id: string }).id;
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Geçersiz veri" }, { status: 400 });

    const { brandId, url, keywords, pageTitle, pageDescription } = parsed.data;

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

    let scrapedContent = "";
    if (url) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);
        const res = await fetch(url, {
          signal: controller.signal,
          headers: { "User-Agent": "Novelya-SEO-Bot/1.0" },
        });
        clearTimeout(timeout);
        const html = await res.text();
        const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
        const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i);
        const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/gi);
        const bodyText = html.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<style[\s\S]*?<\/style>/gi, "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 2000);

        scrapedContent = `
URL: ${url}
Mevcut Title: ${titleMatch?.[1]?.trim() ?? "Yok"}
Mevcut Meta Description: ${descMatch?.[1]?.trim() ?? "Yok"}
H1 Başlıkları: ${h1Match?.map((h) => h.replace(/<[^>]+>/g, "").trim()).join(", ") ?? "Yok"}
Sayfa İçeriği (ilk 2000 karakter): ${bodyText}`;
      } catch {
        scrapedContent = `URL: ${url} (Sayfa yüklenemedi, sadece anahtar kelimelere göre analiz yap)`;
      }
    }

    const prompt = `Sen bir SEO uzmanısın. Aşağıdaki bilgilere göre detaylı Türkçe SEO analizi, meta tag önerileri VE rakip anahtar kelime önerileri üret.

Marka: ${brand.name}
Sektör: ${brand.sector ?? "Belirtilmemiş"}
${keywords ? `Hedef Anahtar Kelimeler: ${keywords}` : ""}
${pageTitle ? `Mevcut Sayfa Başlığı: ${pageTitle}` : ""}
${pageDescription ? `Mevcut Meta Açıklaması: ${pageDescription}` : ""}
${scrapedContent}

Şu bilgileri JSON formatında döndür:
{
  "metaTitle": "Önerilen SEO başlığı (50-60 karakter)",
  "metaDescription": "Önerilen meta açıklaması (150-160 karakter)",
  "keywords": ["anahtar", "kelime", "listesi", "en az 8 tane"],
  "h1Suggestion": "Önerilen H1 başlığı",
  "contentTips": ["SEO ipucu 1", "SEO ipucu 2", "SEO ipucu 3", "SEO ipucu 4", "SEO ipucu 5"],
  "score": 0-100 arası SEO skoru,
  "improvements": ["İyileştirme önerisi 1", "İyileştirme önerisi 2", "İyileştirme önerisi 3"],
  "competitorKeywords": [
    {"keyword": "rakip anahtar kelime", "difficulty": "Düşük/Orta/Yüksek", "volume": "Tahmini aylık arama hacmi", "tip": "Bu kelimeyi neden hedeflemelisiniz"}
  ]
}

competitorKeywords: Sektöre ve mevcut anahtar kelimelere göre rakiplerin hedeflediği ama bu markanın kaçırdığı 5-8 anahtar kelime öner. Her biri için zorluk, tahmini hacim ve neden hedeflenmesi gerektiğini açıkla.

Sadece JSON döndür, başka bir şey yazma.`;

    const raw = await generateText({ prompt, maxTokens: 1500, model: "claude-haiku-4-5-20251001" });
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return NextResponse.json({ error: "SEO analizi oluşturulamadı" }, { status: 500 });

    let analysis;
    try { analysis = JSON.parse(jsonMatch[0]); } catch { return NextResponse.json({ error: "Analiz ayrıştırılamadı" }, { status: 500 }); }

    await Promise.all([
      prisma.aiUsage.create({
        data: { brandId, feature: "SEO", model: "claude-haiku-4-5-20251001", tokensIn: 0, tokensOut: 0 },
      }),
      prisma.seoAnalysis.create({
        data: {
          brandId,
          url: url ?? null,
          keywords: keywords ?? null,
          score: analysis.score ?? 0,
          result: analysis,
        },
      }),
    ]);

    return NextResponse.json({ analysis });
  } catch (e) {
    console.error("SEO POST error:", e);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
