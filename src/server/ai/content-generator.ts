import { generateText } from "./anthropic";
import type { ContentType } from "@prisma/client";

export interface ContentInput {
  brandName: string;
  sector: string;
  description: string;
  tone?: string;
  topic?: string;
  primaryColor?: string;
  /** Üretilecek içeriğin dili. Global hedef kitleye yayın yapanlar için. */
  language?: string;
}

/** Prompt'un sonuna eklenen dil talimatı. Varsayılan Türkçe. */
function langLine(language?: string): string {
  if (!language || language === "tr") return "\nİçeriği Türkçe yaz.";
  const names: Record<string, string> = {
    en: "İngilizce (English)",
    de: "Almanca (Deutsch)",
    es: "İspanyolca (Español)",
    fr: "Fransızca (Français)",
    ar: "Arapça (العربية)",
    ru: "Rusça (Русский)",
  };
  const name = names[language] ?? language;
  return `\nÖNEMLİ: İçeriğin tamamını ${name} dilinde yaz. JSON anahtarları İngilizce kalsın, sadece değerler bu dilde olsun.`;
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

  FACEBOOK_POST: ({ brandName, sector, topic, tone }) =>
    `${brandName} (${sector}) için Facebook gönderisi yaz.
Konu: ${topic ?? "marka tanıtımı veya duyuru"}
Ton: ${tone ?? "sıcak, topluluk odaklı"}
Facebook kitlesine uygun: hikaye anlatımı, duygusal bağ, topluluk katılımını artıran sorular.
Format: Dikkat çekici açılış + hikaye/bilgi + soru veya CTA. Emoji kullan.
200-250 kelime. Sadece gönderi metnini yaz.`,

  LINKEDIN_POST: ({ brandName, sector, topic, tone }) =>
    `${brandName} (${sector}) için LinkedIn gönderisi yaz.
Konu: ${topic ?? "sektör içgörüsü, başarı hikayesi veya şirket haberi"}
Ton: ${tone ?? "profesyonel, özgün ve düşündürücü"}
LinkedIn formatı: Güçlü hook + 3-5 kısa paragraf + öğrenim/içgörü paylaşımı + soru veya CTA.
Her paragraf 1-2 cümle. Emoji minimal kullan. 150-250 kelime.
Sadece gönderi metnini yaz.`,

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
  "keywords": ["anahtar kelime 1", "anahtar kelime 2", "anahtar kelime 3", "anahtar kelime 4", "anahtar kelime 5"]
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
JSON formatında döndür:
{
  "metaTitle": "Meta başlık (max 60 karakter)",
  "metaDescription": "Meta açıklama (max 155 karakter)",
  "h1": "H1 başlık",
  "content": "300 kelimelik sayfa içeriği (anahtar kelime yoğunluğu %2-3)",
  "lsiKeywords": ["kelime 1", "kelime 2", "kelime 3", "kelime 4", "kelime 5"]
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
Her güne bir içerik, 4 hafta = 28 gün. JSON formatında:
{
  "weeks": [
    {
      "week": 1,
      "days": [
        {"day": 1, "date": "Pazartesi", "type": "INSTAGRAM_POST", "topic": "konu", "caption": "kısa açıklama"}
      ]
    }
  ]
}
Çeşitli içerik türleri kullan: INSTAGRAM_POST, REELS_IDEA, STORY_IDEA, FACEBOOK_POST, LINKEDIN_POST, BLOG_POST`,

  // ─── YouTube ──────────────────────────────────────────────────────
  YOUTUBE_SHORTS: ({ brandName, sector, topic }) =>
    `${brandName} (${sector}) için YouTube Shorts senaryosu yaz.
Konu: ${topic ?? "kanalın ana teması"}
Shorts formatı kritik: ilk 2 saniyede izleyiciyi yakala, sonuna kadar tut, döngüye uygun bitir.
JSON döndür:
{
  "hook": "İlk 2 saniyede söylenecek/gösterilecek çarpıcı açılış",
  "scenes": [
    {"time": "0-3sn", "visual": "ne görünecek", "voiceover": "ne söylenecek", "text": "ekranda çıkacak yazı"}
  ],
  "cta": "Son 2 saniyede abone/takip çağrısı",
  "loopTip": "Videonun sonu başına nasıl bağlanır (tekrar izletme taktiği)",
  "hashtags": ["#etiket"],
  "duration": "30-45 saniye"
}
5-7 sahne yaz. Sahneler somut ve çekilebilir olsun.`,

  YOUTUBE_TITLE: ({ brandName, sector, topic }) =>
    `${brandName} (${sector}) YouTube videosu için tıklanma oranı (CTR) yüksek başlıklar üret.
Konu: ${topic ?? "kanalın ana teması"}
JSON döndür:
{
  "titles": [
    {"title": "başlık", "style": "merak/liste/sonuç/karşılaştırma/duygusal", "why": "neden tıklanır"}
  ],
  "bestPick": "en güçlü başlık",
  "tip": "başlık optimizasyonu için kısa öneri"
}
8 farklı başlık üret. Her biri 60 karakteri geçmesin (arama sonuçlarında kesilmesin).
Clickbait yapma — başlık videonun gerçekten vaat ettiği şeyi anlatsın.`,

  YOUTUBE_DESCRIPTION: ({ brandName, sector, topic }) =>
    `${brandName} (${sector}) YouTube videosu için açıklama metni yaz.
Konu: ${topic ?? "kanalın ana teması"}
JSON döndür:
{
  "hookLines": "İlk 2-3 satır (arama sonucunda görünen kısım, anahtar kelime içersin)",
  "body": "Videoyu anlatan 2-3 paragraf",
  "chapters": [{"time": "00:00", "title": "bölüm adı"}],
  "links": ["Sosyal medya / abone ol / önerilen video satırları"],
  "keywords": ["açıklamaya doğal şekilde serpiştirilecek anahtar kelimeler"]
}
6-8 bölüm (chapter) öner — izlenme süresini artırır.`,

  YOUTUBE_SCRIPT: ({ brandName, sector, topic, tone }) =>
    `${brandName} (${sector}) için uzun format YouTube video senaryosu yaz.
Konu: ${topic ?? "kanalın ana teması"}
Ton: ${tone ?? "samimi ve bilgilendirici"}
Amaç: izlenme süresini (watch time) maksimize etmek.
JSON döndür:
{
  "hook": "İlk 15 saniye — izleyiciyi tutacak açılış, videoda ne öğreneceğini söyle",
  "sections": [
    {"title": "bölüm başlığı", "duration": "tahmini süre", "talkingPoints": ["madde"], "bRoll": "önerilen görüntü"}
  ],
  "retentionTips": ["izleyiciyi elde tutmak için uygulanacak taktikler"],
  "cta": "Abone ol / yorum / sonraki video çağrısı",
  "estimatedLength": "8-12 dakika"
}
5-7 bölüm yaz. Her bölümde izleyiciyi bir sonrakine bağlayan bir merak unsuru bırak.`,

  YOUTUBE_TAGS: ({ brandName, sector, topic }) =>
    `${brandName} (${sector}) YouTube videosu için etiket (tag) seti üret.
Konu: ${topic ?? "kanalın ana teması"}
JSON döndür:
{
  "broad": ["geniş kitleye hitap eden genel etiketler"],
  "specific": ["videoya özel niş etiketler"],
  "longTail": ["uzun kuyruk arama terimleri"],
  "total": "toplam karakter sayısı tahmini"
}
Toplam 20-25 etiket. YouTube etiket limiti 500 karakterdir, aşma.`,

  THUMBNAIL_TEXT: ({ brandName, sector, topic }) =>
    `${brandName} (${sector}) YouTube videosu için kapak görseli (thumbnail) metni ve konsepti öner.
Konu: ${topic ?? "kanalın ana teması"}
JSON döndür:
{
  "options": [
    {"text": "kapakta yazacak metin", "emotion": "uyandırdığı duygu", "visual": "arka planda ne olmalı", "colors": "renk önerisi"}
  ],
  "bestPick": "en güçlü seçenek",
  "rules": ["bu kapak için uyulacak tasarım kuralları"]
}
5 seçenek üret. Kapak metni EN FAZLA 4 kelime olsun — telefonda okunabilmeli.
Başlıkla aynı şeyi tekrarlama; başlığı tamamlasın.`,
};

/**
 * Her prompt'un başına eklenen marka bağlamı. Marka açıklaması ve
 * anlamsız/çok kısa konu girildiğinde AI'ı markaya göre yönlendirir —
 * "asdasd" gibi bir konu verildiğinde saçma içerik üretilmesini engeller.
 */
function brandContext(input: ContentInput): string {
  const lines = [
    `MARKA: ${input.brandName}`,
    `SEKTÖR: ${input.sector}`,
  ];
  if (input.description && input.description.trim().length > 3) {
    lines.push(`MARKA AÇIKLAMASI: ${input.description.trim()}`);
  }
  // Anlamsız konu tespitini regex'e bırakmak kırılgan ("asdasd" gibi klavye
  // saçmalıkları sesli harf içerdiği için filtreye takılmıyor). Kararı modele
  // bırakmak daha sağlam: her zaman talimat olarak veriyoruz.
  const topic = (input.topic ?? "").trim();
  if (topic.length > 0) {
    lines.push(
      `KONU: ${topic}`,
      `ÖNEMLİ: Yukarıdaki konu anlamsız, rastgele veya klavye saçmalığı ise (ör. "asdasd", "test", "aaa"), onu TAMAMEN GÖRMEZDEN GEL. O kelimeyi içerikte hiç geçirme. Bunun yerine markanın sektörüne ve açıklamasına uygun, gerçekten yayınlanabilir bir konu SEN seç ve onu işle.`
    );
  }
  return lines.join("\n") + "\n\n";
}

/**
 * Başlığı üretilen içerikten türetir. Kullanıcının girdiği konuyu olduğu gibi
 * yazmak, konu anlamsızsa ("bv vx vx cx c") başlığı da bozuyordu — üstelik
 * model o konuyu zaten görmezden geliyor. Bu yüzden önce içerikteki anlamlı
 * bir alan denenir, bulunamazsa konuya, o da yoksa marka adına düşülür.
 */
function deriveTitle(type: ContentType, meta: Record<string, unknown>, input: ContentInput): string {
  const label = TYPE_LABELS[type];
  const pick = (v: unknown): string | null => {
    if (typeof v === "string" && v.trim().length > 2) return v.trim();
    if (Array.isArray(v) && v.length > 0) {
      const first = v[0];
      if (typeof first === "string" && first.trim().length > 2) return first.trim();
      if (first && typeof first === "object") {
        const o = first as Record<string, unknown>;
        for (const k of ["title", "headline", "text", "content"]) {
          if (typeof o[k] === "string" && (o[k] as string).trim().length > 2) return (o[k] as string).trim();
        }
      }
    }
    return null;
  };

  // İçerik türüne göre en anlamlı alanı sırayla dene
  for (const key of ["bestPick", "hook", "metaTitle", "h1", "headline", "headlines", "hookLines", "titles", "primaryText"]) {
    const found = pick(meta[key]);
    if (found) {
      const clean = found.replace(/\s+/g, " ").slice(0, 70);
      return `${label} — ${clean}${found.length > 70 ? "…" : ""}`;
    }
  }
  const topic = (input.topic ?? "").trim();
  return `${label} — ${topic.length > 2 ? topic : input.brandName}`;
}

export async function generateContent(
  type: ContentType,
  input: ContentInput
): Promise<GeneratedContent> {
  const prompt = brandContext(input) + PROMPTS[type](input) + langLine(input.language);
  const raw = await generateText({ prompt, maxTokens: 1800 });

  // JSON döndüren tipler. Buraya eklenmeyen bir tip, prompt'u JSON istese bile
  // düz metin dalına düşer ve ham çıktı (```json çitiyle birlikte) gövdeye basılır.
  const jsonTypes: ContentType[] = [
    "REELS_IDEA", "STORY_IDEA", "GOOGLE_ADS", "META_ADS",
    "SEO_CONTENT", "HASHTAGS", "CONTENT_PLAN",
    "YOUTUBE_SHORTS", "YOUTUBE_TITLE", "YOUTUBE_DESCRIPTION",
    "YOUTUBE_SCRIPT", "YOUTUBE_TAGS", "THUMBNAIL_TEXT",
  ];

  if (jsonTypes.includes(type)) {
    const jsonMatch = raw.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    let meta: Record<string, unknown> = {};
    try {
      if (jsonMatch) meta = JSON.parse(jsonMatch[0]);
    } catch {
      // Model bozuk JSON döndürdüyse üretimi tamamen kaybetme; ham metni göster
      return { title: `${TYPE_LABELS[type]} — ${input.brandName}`, body: raw.trim() };
    }
    return {
      title: deriveTitle(type, meta, input),
      body: JSON.stringify(meta, null, 2),
      meta,
    };
  }

  // Düz metin tiplerinde ilk anlamlı satırı başlık olarak kullan
  const firstLine = raw
    .trim()
    .split("\n")
    .map((l) => l.replace(/^#+\s*/, "").trim())
    .find((l) => l.length > 10);
  return {
    title: firstLine
      ? `${TYPE_LABELS[type]} — ${firstLine.slice(0, 70)}${firstLine.length > 70 ? "…" : ""}`
      : `${TYPE_LABELS[type]} — ${input.brandName}`,
    body: raw.trim(),
  };
}

export const TYPE_LABELS: Record<ContentType, string> = {
  INSTAGRAM_POST: "Instagram Gönderisi",
  REELS_IDEA: "Reels Fikri",
  STORY_IDEA: "Story Serisi",
  FACEBOOK_POST: "Facebook Gönderisi",
  LINKEDIN_POST: "LinkedIn Gönderisi",
  BLOG_POST: "Blog Yazısı",
  GOOGLE_ADS: "Google Reklamı",
  META_ADS: "Meta Reklamı",
  SEO_CONTENT: "SEO İçeriği",
  HASHTAGS: "Hashtag Seti",
  CONTENT_PLAN: "30 Günlük Plan",
  YOUTUBE_SHORTS: "YouTube Shorts",
  YOUTUBE_TITLE: "Video Başlıkları",
  YOUTUBE_DESCRIPTION: "Video Açıklaması",
  YOUTUBE_SCRIPT: "Video Senaryosu",
  YOUTUBE_TAGS: "Video Etiketleri",
  THUMBNAIL_TEXT: "Kapak (Thumbnail)",
};

export const TYPE_ICONS: Record<ContentType, string> = {
  INSTAGRAM_POST: "📸",
  REELS_IDEA: "🎬",
  STORY_IDEA: "✨",
  FACEBOOK_POST: "👥",
  LINKEDIN_POST: "💼",
  BLOG_POST: "📝",
  GOOGLE_ADS: "🔍",
  META_ADS: "📣",
  SEO_CONTENT: "🔎",
  HASHTAGS: "#️⃣",
  CONTENT_PLAN: "📅",
  YOUTUBE_SHORTS: "⚡",
  YOUTUBE_TITLE: "🎯",
  YOUTUBE_DESCRIPTION: "📄",
  YOUTUBE_SCRIPT: "🎥",
  YOUTUBE_TAGS: "🏷️",
  THUMBNAIL_TEXT: "🖼️",
};
