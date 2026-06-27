import { generateText } from "./anthropic";
import type { Sentiment } from "@prisma/client";

export interface ReviewAnalysis {
  sentiment: Sentiment;
  topics: string[];
  aiSummary: string;
}

export async function analyzeReview(text: string): Promise<ReviewAnalysis> {
  const prompt = `Aşağıdaki müşteri yorumunu analiz et ve sadece JSON döndür:

Yorum: "${text}"

Şu formatta yanıt ver:
{
  "sentiment": "POSITIVE" | "NEUTRAL" | "NEGATIVE",
  "topics": ["konu1", "konu2"],
  "aiSummary": "Tek cümle Türkçe özet"
}

Kurallar:
- sentiment: yorumun genel tonu
- topics: en fazla 4 konu (örn: "hizmet kalitesi", "fiyat", "temizlik", "hız", "personel", "ürün kalitesi")
- aiSummary: kısa ve net, Türkçe`;

  const raw = await generateText({ prompt, maxTokens: 256, model: "claude-haiku-4-5-20251001" });
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Analiz başarısız");
  return JSON.parse(jsonMatch[0]) as ReviewAnalysis;
}

export async function analyzeBatch(reviews: { id: string; text: string }[]): Promise<
  Map<string, ReviewAnalysis>
> {
  const results = new Map<string, ReviewAnalysis>();
  // Paralel ama API rate limit için 3'lü gruplar halinde
  for (let i = 0; i < reviews.length; i += 3) {
    const batch = reviews.slice(i, i + 3);
    await Promise.all(
      batch.map(async (r) => {
        try {
          const analysis = await analyzeReview(r.text);
          results.set(r.id, analysis);
        } catch {
          // Hatalı analizi atla
        }
      })
    );
  }
  return results;
}

export async function generateInsightReport(opts: {
  brandName: string;
  positiveCount: number;
  neutralCount: number;
  negativeCount: number;
  topTopics: string[];
  recentNegatives: string[];
}): Promise<string> {
  const prompt = `${opts.brandName} markasının yorum analizi raporu:

Olumlu: ${opts.positiveCount} | Nötr: ${opts.neutralCount} | Olumsuz: ${opts.negativeCount}
En çok geçen konular: ${opts.topTopics.join(", ")}
Son olumsuz yorumlardan örnekler: ${opts.recentNegatives.slice(0, 3).join(" / ")}

Bu verilerden yola çıkarak:
1. Güçlü yönler
2. İyileştirilmesi gereken alanlar
3. 3 somut öneri

Türkçe, madde madde, kısa yaz. Toplam 150 kelimeyi geçme.`;

  return generateText({ prompt, maxTokens: 512, model: "claude-haiku-4-5-20251001" });
}
