import { generateText } from "./anthropic";

export interface DashboardInput {
  brandName: string;
  totalReviews: number;
  positiveCount: number;
  neutralCount: number;
  negativeCount: number;
  avgRating: number | null;
  newReviewsToday: number;
  chatbotConversations: number;
  contentItemsGenerated: number;
  topComplaints: string[];
  recentNegatives: string[];
}

export interface SummaryOutput {
  performance: {
    reviewScore: number;
    sentimentScore: number;
    engagementScore: number;
    overallScore: number;
  };
  negativeTrend: {
    isRising: boolean;
    percentage: number;
  };
  topComplaint: string;
  aiSuggestions: string[];
  briefing: string;
}

export async function generateDashboardSummary(input: DashboardInput): Promise<SummaryOutput> {
  const sentimentRatio =
    input.totalReviews > 0
      ? Math.round((input.positiveCount / input.totalReviews) * 100)
      : 0;

  const prompt = `Sen bir dijital ajans platformunun AI analist asistanısın.
Aşağıdaki marka verileriyle günlük bir performans özeti ve aksiyon listesi üret.

Marka: ${input.brandName}
Toplam Yorum: ${input.totalReviews} (Olumlu: ${input.positiveCount}, Nötr: ${input.neutralCount}, Olumsuz: ${input.negativeCount})
Ortalama Puan: ${input.avgRating?.toFixed(1) ?? "—"}/5
Bugün Gelen Yorum: ${input.newReviewsToday}
Chatbot Konuşmaları: ${input.chatbotConversations}
Üretilen İçerik: ${input.contentItemsGenerated}
En Çok Şikayet: ${input.topComplaints.slice(0, 3).join(", ") || "Yok"}
Son Olumsuz Yorumlar: ${input.recentNegatives.slice(0, 2).join(" | ") || "Yok"}

Sadece aşağıdaki JSON formatında yanıt ver:
{
  "performance": {
    "reviewScore": 0-100,
    "sentimentScore": ${sentimentRatio},
    "engagementScore": 0-100,
    "overallScore": 0-100
  },
  "negativeTrend": {
    "isRising": true/false,
    "percentage": 0-100
  },
  "topComplaint": "en kritik şikayet konusu veya boş string",
  "aiSuggestions": ["öneri 1", "öneri 2", "öneri 3"],
  "briefing": "2-3 cümle Türkçe günlük özet, net ve motive edici"
}`;

  const raw = await generateText({ prompt, maxTokens: 512, model: "claude-haiku-4-5-20251001" });
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("AI özet üretemedi");
  return JSON.parse(jsonMatch[0]) as SummaryOutput;
}
