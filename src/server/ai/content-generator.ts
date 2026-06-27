import { generateText } from "./anthropic";
import type { ContentType } from "@prisma/client";

export interface ContentInput {
  brandName: string;
  sector: string;
  description: string;
  tone?: string;
  topic?: string;
  primaryColor?: string;
}

interface GeneratedContent {
  title: string;
  body: string;
  meta?: Record<string, unknown>;
}

const PROMPTS: Record<ContentType, (input: ContentInput) => string> = {
  INSTAGRAM_POST: ({ brandName, sector, topic, tone }) =>
    `${brandName} (${sector}) için Instagram gönderisi yaz.
Konu: ${topic ?? "marka tanıtımı"}
Ton: ${tone ?? "samimi ve ilgi çekici"}
Format: Güçlü açılış cümlesi + 3-4 paragraf + harekete geçirici son cümle.
Emoji kullan. 150-200 kelime. Sadece gönderi metnini yaz.`,

  REELS_IDEA: ({ brandName, sector, topic }) =>
    `${brandName} (${sector}) için viral Reels fikri üret.
Konu: ${topic ?? "ürün/hizmet tanıtımı"}
Şu formatta JSON döndür:
{
  "hook": "İlk 3 saniye dikkat çekici açılış",
  "script": ["sahne 1", "sahne 2", "sahne 3", "sahne 4"],
  "cta": "Son harekete geçirici mesaj",
  "music": "Önerilen müzik tarzı",
  "duration": "15-30 saniye"
}`,

  STORY_IDEA: ({ brandName, sector, topic }) =>
    `${brandName} (${sector}) için Instagram Story serisi planla.
Konu: ${topic ?? "kampanya veya duyuru"}
5 adet ardışık story için JSON döndür:
{
  "stories": [
    {"slide": 1, "type": "metin/anket/soru/sayaç", "content": "içerik", "sticker": "önerilen sticker"}
  ]
}`,

  BLOG_POST: ({ brandName, sector, topic, tone }) =>
    `${brandName} (${sector}) için SEO uyumlu blog yazısı yaz.
Başlık konusu: ${topic ?? "sektörde başarı ipuçları"}
Ton: ${tone ?? "bilgilendirici ve otoriter"}
Format: Başlık + Giriş + 4 ana başlık (H2) + alt içerikler + Sonuç.
500-700 kelime. Türkçe.`,

  GOOGLE_ADS: ({ brandName, sector, topic }) =>
    `${brandName} (${sector}) için Google Arama Reklamı yaz.
Ürün/Hizmet: ${topic ?? "ana hizmet"}
Şu formatta JSON döndür:
{
  "headlines": ["başlık 1 (max 30 karakter)", "başlık 2", "başlık 3"],
  "descriptions": ["açıklama 1 (max 90 karakter)", "açıklama 2"],
  "displayUrl": "orneksite.com/kampanya",
  "keywords": ["anahtar kelime 1", "anahtar kelime 2", "anahtar kelime 3"]
}`,

  META_ADS: ({ brandName, sector, topic, tone }) =>
    `${brandName} (${sector}) için Meta (Facebook/Instagram) reklam metni yaz.
Ürün/Hizmet: ${topic ?? "ana hizmet"}
Ton: ${tone ?? "ikna edici"}
Şu formatta JSON döndür:
{
  "primaryText": "Ana reklam metni (125 karakter ideal)",
  "headline": "Başlık (40 karakter max)",
  "description": "Açıklama (30 karakter max)",
  "cta": "Şimdi Al/Daha Fazla Bilgi/Kaydol/İletişime Geç",
  "targetAudience": "Hedef kitle tanımı"
}`,

  SEO_CONTENT: ({ brandName, sector, topic }) =>
    `${brandName} (${sector}) için SEO içeriği yaz.
Hedef anahtar kelime: ${topic ?? sector + " hizmetleri"}
Format:
- Meta başlık (60 karakter max)
- Meta açıklama (155 karakter max)
- H1 başlık
- 300 kelimelik sayfa içeriği (anahtar kelime yoğunluğu %2-3)
- 5 LSI anahtar kelime

JSON formatında döndür:
{
  "metaTitle": "...",
  "metaDescription": "...",
  "h1": "...",
  "content": "...",
  "lsiKeywords": ["...", "...", "...", "...", "..."]
}`,

  HASHTAGS: ({ brandName, sector, topic }) =>
    `${brandName} (${sector}) için Instagram hashtag seti oluştur.
Konu: ${topic ?? "genel paylaşım"}
Şu formatta JSON döndür:
{
  "niche": ["niş hashtag 1", "niş hashtag 2", "niş hashtag 3", "niş hashtag 4", "niş hashtag 5"],
  "medium": ["orta hashtag 1", "orta hashtag 2", "orta hashtag 3", "orta hashtag 4", "orta hashtag 5"],
  "broad": ["geniş hashtag 1", "geniş hashtag 2", "geniş hashtag 3"],
  "branded": ["#${brandName.replace(/\s/g, "")}"]
}
Tüm hashtagler # ile başlasın. Türkçe ve İngilizce karışık olabilir.`,

  CONTENT_PLAN: ({ brandName, sector, tone }) =>
    `${brandName} (${sector}) için 30 günlük sosyal medya içerik planı oluştur.
Ton: ${tone ?? "profesyonel ve samimi"}
Her hafta için 7 gün, her güne bir içerik. JSON formatında:
{
  "weeks": [
    {
      "week": 1,
      "days": [
        {"day": 1, "date": "Pazartesi", "type": "INSTAGRAM_POST/REELS_IDEA/STORY_IDEA", "topic": "konu", "caption": "kısa açıklama"}
      ]
    }
  ]
}
4 hafta, 28 gün planla. Çeşitli içerik türleri kullan.`,
};

export async function generateContent(
  type: ContentType,
  input: ContentInput
): Promise<GeneratedContent> {
  const prompt = PROMPTS[type](input);
  const raw = await generateText({ prompt, maxTokens: 1500 });

  // JSON döndüren türler
  const jsonTypes: ContentType[] = [
    "REELS_IDEA", "STORY_IDEA", "GOOGLE_ADS", "META_ADS",
    "SEO_CONTENT", "HASHTAGS", "CONTENT_PLAN",
  ];

  if (jsonTypes.includes(type)) {
    const jsonMatch = raw.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    const meta = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
    return {
      title: `${TYPE_LABELS[type]} — ${input.topic ?? input.brandName}`,
      body: JSON.stringify(meta, null, 2),
      meta,
    };
  }

  return {
    title: `${TYPE_LABELS[type]} — ${input.topic ?? input.brandName}`,
    body: raw.trim(),
  };
}

export const TYPE_LABELS: Record<ContentType, string> = {
  INSTAGRAM_POST: "Instagram Gönderisi",
  REELS_IDEA: "Reels Fikri",
  STORY_IDEA: "Story Serisi",
  BLOG_POST: "Blog Yazısı",
  GOOGLE_ADS: "Google Reklamı",
  META_ADS: "Meta Reklamı",
  SEO_CONTENT: "SEO İçeriği",
  HASHTAGS: "Hashtag Seti",
  CONTENT_PLAN: "30 Günlük Plan",
};

export const TYPE_ICONS: Record<ContentType, string> = {
  INSTAGRAM_POST: "📸",
  REELS_IDEA: "🎬",
  STORY_IDEA: "✨",
  BLOG_POST: "📝",
  GOOGLE_ADS: "🔍",
  META_ADS: "📣",
  SEO_CONTENT: "🔎",
  HASHTAGS: "#️⃣",
  CONTENT_PLAN: "📅",
};
