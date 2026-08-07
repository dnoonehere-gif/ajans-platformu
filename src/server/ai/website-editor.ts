import { generateText } from "./anthropic";
import type { Block, SiteTheme } from "./website-generator";
import { PALETTES, FONT_PAIRS, HERO_LAYOUTS, SECTION_VARIANTS } from "./website-themes";

export interface ConversationMessage {
  role: "user" | "ai";
  content: string;
}

/**
 * Sohbetle site düzenleme.
 *
 * ÖNEMLİ: Bu prompt eskiden `bgColor` / `buttonColor` gibi ARTIK VAR OLMAYAN
 * alanlardan bahsediyordu ve tema sistemini (palet, tipografi, hero düzeni,
 * animasyon) hiç bilmiyordu. Bu yüzden "butonları kırmızı yap" veya
 * "animasyon ekle" gibi istekler sessizce hiçbir şey değiştirmiyordu — model
 * değiştirecek bir alan bulamayıp blokları olduğu gibi geri veriyordu.
 *
 * Artık hem BLOKLARI hem TEMAYI döndürüyor; renk/font/animasyon istekleri
 * tema üzerinden karşılanıyor.
 */
export async function editWebsiteWithAI(
  blocks: Block[],
  instruction: string,
  brandName: string,
  conversationHistory: ConversationMessage[] = [],
  theme?: SiteTheme | null,
): Promise<{ blocks: Block[]; theme: SiteTheme | null }> {
  const gecmis = conversationHistory.length > 0
    ? `\nÖNCEKİ KONUŞMA\n${conversationHistory
        .map((m) => `${m.role === "user" ? "Kullanıcı" : "Asistan"}: ${m.content}`)
        .join("\n")}\n`
    : "";

  const prompt = `Sen bir web sitesi düzenleme asistanısın. Kullanıcının doğal dil komutuna göre sitenin TEMASINI ve BLOKLARINI düzenliyorsun.

Marka: ${brandName}${gecmis}
KULLANICI KOMUTU: "${instruction}"

━━ MEVCUT TEMA ━━
${JSON.stringify(theme ?? {}, null, 2)}

━━ MEVCUT BLOKLAR ━━
${JSON.stringify(blocks, null, 2)}

━━ TEMA İLE NELER DEĞİŞİR ━━
Renk, yazı tipi, köşe yuvarlaklığı, boşluk ve animasyon istekleri BLOKLARDA
DEĞİL, TEMADA değişir. Blokların içinde renk alanı YOKTUR.

paletteId (renk isteklerinde bunu değiştir):
${PALETTES.map((p) => `  ${p.id} → ${p.uygun}`).join("\n")}

fontPairId (yazı tipi isteklerinde):
${FONT_PAIRS.map((f) => `  ${f.id} → ${f.uygun}`).join("\n")}

heroLayout (açılış bölümü düzeni):
${HERO_LAYOUTS.map((h) => `  ${h.id} → ${h.aciklama}`).join("\n")}

radius: 0-28 (0 keskin köşe, 28 çok yuvarlak)
density: "sikisik" | "normal" | "ferah"  (boşluk miktarı)
animation: "yok" | "yumusak" | "belirgin"  (bölüm giriş animasyonu)

ÖRNEKLER:
- "daha çok animasyon" → animation: "belirgin"
- "animasyonları kapat" → animation: "yok"
- "kırmızı/sıcak yap" → paletteId: "toprak", "mavi yap" → "klinik-mavi"
- "daha lüks dursun" → paletteId: "gece-altin", fontPairId: "klasik-serif", radius: 4
- "köşeler yuvarlak olsun" → radius: 24
- "daha ferah olsun" → density: "ferah"

━━ BLOKLARLA NELER DEĞİŞİR ━━
Metinler, bölüm ekleme/çıkarma, sıralama, madde sayısı ve yerleşim (variant).

Blok türleri: hero, services, features, about, gallery, pricing, hours, faq,
team, testimonials, cta, contact
services/features variant: ${SECTION_VARIANTS.features.join(" | ")}
gallery variant: ${SECTION_VARIANTS.gallery.join(" | ")}

KURALLAR:
- hero ve contact silinmez.
- Yeni blok eklerken benzersiz bir "id" ver.
- Metinleri Türkçe yaz, emoji kullanma, ikon alanına lucide adı yaz.
- Uydurma istatistik veya sahte müşteri yorumu EKLEME.
- Komutla ilgisi olmayan alanlara DOKUNMA; kalanları aynen koru.
- Önceki konuşmadaki referansları ("onu geri al", "bir öncekini") dikkate al.

━━ ÇIKTI ━━
SADECE şu biçimde geçerli JSON döndür, başka hiçbir şey yazma:
{ "theme": { ...güncel tema... }, "blocks": [ ...güncel bloklar... ] }`;

  const raw = await generateText({ prompt, maxTokens: 8000 });

  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("AI geçerli JSON üretmedi");

  const parsed = JSON.parse(match[0]) as { theme?: SiteTheme; blocks?: Block[] };
  if (!Array.isArray(parsed.blocks) || parsed.blocks.length === 0) {
    throw new Error("AI blok döndürmedi");
  }

  // Tema alanları kataloğa sabitlenir; model uydurma bir id verirse sayfa
  // bozulmasın, sessizce eski değere düşsün.
  const gelen = parsed.theme;
  const yeniTema: SiteTheme | null = gelen
    ? {
        paletteId: PALETTES.some((p) => p.id === gelen.paletteId) ? gelen.paletteId : (theme?.paletteId ?? PALETTES[0].id),
        fontPairId: FONT_PAIRS.some((f) => f.id === gelen.fontPairId) ? gelen.fontPairId : (theme?.fontPairId ?? FONT_PAIRS[0].id),
        heroLayout: HERO_LAYOUTS.some((h) => h.id === gelen.heroLayout) ? gelen.heroLayout : (theme?.heroLayout ?? HERO_LAYOUTS[0].id),
        radius: Math.min(28, Math.max(0, Number(gelen.radius) || theme?.radius || 16)),
        density: (["sikisik", "normal", "ferah"] as const).includes(gelen.density as never)
          ? gelen.density : (theme?.density ?? "normal"),
        animation: (["yok", "yumusak", "belirgin"] as const).includes(gelen.animation as never)
          ? gelen.animation : (theme?.animation ?? "yumusak"),
      }
    : (theme ?? null);

  return { blocks: parsed.blocks, theme: yeniTema };
}
