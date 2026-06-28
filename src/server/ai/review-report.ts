import { generateText } from "./anthropic";

export interface ThemeItem {
  theme: string;
  percentage: number;
  sentiment: "POSITIVE" | "NEGATIVE" | "NEUTRAL";
  exampleQuote: string;
}

export interface ReviewReport {
  themes: ThemeItem[];
  overallSentiment: "POSITIVE" | "NEGATIVE" | "NEUTRAL";
  summary: string;
  strongPoints: string[];
  weakPoints: string[];
  totalAnalyzed: number;
}

export async function generateThemeReport(
  reviews: { text: string; rating: number }[],
  brandName: string
): Promise<ReviewReport> {
  const totalAnalyzed = reviews.length;

  // Çok fazla yorum varsa örneklem al (max 80 yorum)
  const sample =
    reviews.length > 80
      ? reviews.sort(() => Math.random() - 0.5).slice(0, 80)
      : reviews;

  const reviewsText = sample
    .map((r, i) => `[${i + 1}] (${r.rating}★) ${r.text}`)
    .join("\n");

  const prompt = `Sen bir müşteri deneyimi analisti olarak çalışıyorsun.
${brandName} işletmesine ait ${sample.length} müşteri yorumunu analiz et${reviews.length > 80 ? ` (${reviews.length} yorumdan örneklem)` : ""}.

YORUMLAR:
${reviewsText}

Öne çıkan temaları bul. Her tema için:
- Yorumların yaklaşık kaçında geçtiğini yüzde olarak tahmin et
- POSITIVE / NEGATIVE / NEUTRAL olarak sınıflandır
- Kısa bir örnek alıntı ver (yorumlardan biri)

SADECE şu JSON formatında yanıt ver:
{
  "themes": [
    {
      "theme": "Personel yavaş",
      "percentage": 45,
      "sentiment": "NEGATIVE",
      "exampleQuote": "Servis çok yavaştı, 40 dakika bekledik."
    }
  ],
  "overallSentiment": "POSITIVE",
  "summary": "2-3 cümle genel özet",
  "strongPoints": ["Güçlü yön 1", "Güçlü yön 2"],
  "weakPoints": ["Zayıf yön 1", "Zayıf yön 2"]
}

Kurallar:
- Tüm metin Türkçe olsun
- 5-10 tema çıkar (en önemlilerini)
- Yüzdeler 100'ü aşabilir (bir yorum birden fazla tema içerebilir)
- Temaları yüzdeye göre büyükten küçüğe sırala
- Sadece JSON döndür`;

  const raw = await generateText({ prompt, maxTokens: 2048, model: "claude-sonnet-4-6" });
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("AI rapor üretemedi");

  const parsed = JSON.parse(match[0]) as Omit<ReviewReport, "totalAnalyzed">;
  return { ...parsed, totalAnalyzed };
}
