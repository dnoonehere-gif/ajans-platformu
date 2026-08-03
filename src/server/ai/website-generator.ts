import { generateText } from "./anthropic";
import { PALETTES, FONT_PAIRS, HERO_LAYOUTS, BLOCK_CATALOG, SECTION_VARIANTS } from "./website-themes";

export type BlockType =
  | "hero" | "features" | "about" | "services" | "contact" | "cta"
  | "gallery" | "pricing" | "faq" | "team" | "testimonials" | "hours";

export interface Block {
  id: string;
  type: BlockType;
  /** Aynı bloğun farklı yerleşimi — bkz. SECTION_VARIANTS */
  variant?: string;
  data: Record<string, unknown>;
}

/** Sayfanın görsel kimliği. Renderer bunu CSS değişkenlerine çevirir. */
export interface SiteTheme {
  paletteId: string;
  fontPairId: string;
  heroLayout: string;
  /** Köşe yuvarlaklığı: 0 = keskin, 28 = çok yuvarlak */
  radius: number;
  density: "sikisik" | "normal" | "ferah";
}

export interface WebsiteGenerateInput {
  brandName: string;
  sector: string;
  description: string;
  phone?: string;
  email?: string;
  address?: string;
  primaryColor?: string;

  // ── Brief: üretimden önce sorulan sorular ───────────────────────────
  /** Kime hitap ediyor — "30-50 yaş kadınlar, mahalle sakinleri" */
  audience?: string;
  /** Öne çıkan hizmetler, virgülle */
  topServices?: string;
  goal?: "randevu" | "arama" | "bilgi" | "satis" | "rezervasyon";
  tone?: "luks" | "samimi" | "profesyonel" | "eglenceli" | "sade";
  /** Rakiplerden farkı */
  differentiator?: string;
  /** GERÇEK rakamlar — verilmezse istatistik uydurulmaz */
  realStats?: string;
  /** Gerçek müşteri yorumları — verilmezse yorum bloğu konmaz */
  realReviews?: string;
  hours?: string;
  showPricing?: boolean;
  /** Görseli var mı — yoksa galeri bloğu konmaz */
  hasPhotos?: boolean;
}

/** AI'ın aynı girdiye hep aynı cevabı vermemesi için tur bilgisi. */
function cesitlilikNotu(attempt: number): string {
  if (attempt <= 0) return "";
  return `\nBU ${attempt + 1}. DENEME. Önceki denemeden belirgin biçimde FARKLI bir palet, farklı bir tipografi, farklı bir hero düzeni ve farklı bir blok sırası seç. Aynı kombinasyonu tekrarlama.`;
}

export async function generateWebsiteBlocks(
  input: WebsiteGenerateInput,
  attempt = 0,
): Promise<{ blocks: Block[]; theme: SiteTheme }> {
  const brief = [
    input.audience && `Hedef kitle: ${input.audience}`,
    input.topServices && `Öne çıkan hizmetler: ${input.topServices}`,
    input.goal && `Sitenin amacı: ${input.goal}`,
    input.tone && `İstenen his: ${input.tone}`,
    input.differentiator && `Rakiplerden farkı: ${input.differentiator}`,
    input.hours && `Çalışma saatleri: ${input.hours}`,
    input.realStats && `GERÇEK rakamlar: ${input.realStats}`,
    input.realReviews && `GERÇEK müşteri yorumları: ${input.realReviews}`,
  ].filter(Boolean).join("\n");

  const prompt = `Sen deneyimli bir web tasarımcısısın. Aşağıdaki Türk işletmesi için, o işletmeye ÖZGÜ bir site üret.

İŞLETME
Ad: ${input.brandName}
Sektör: ${input.sector}
Açıklama: ${input.description}
${input.phone ? `Telefon: ${input.phone}` : ""}
${input.email ? `E-posta: ${input.email}` : ""}
${input.address ? `Adres: ${input.address}` : ""}
${brief ? `\nBRIEF\n${brief}` : ""}

━━ ÖNCE TASARIM KARARLARINI VER ━━

1) PALET seç (id yaz):
${PALETTES.map((p) => `   ${p.id} → ${p.uygun}`).join("\n")}
${input.primaryColor ? `   NOT: İşletmenin marka rengi ${input.primaryColor}. Buna en yakın paleti tercih et.` : ""}

2) TİPOGRAFİ seç (id yaz):
${FONT_PAIRS.map((f) => `   ${f.id} → ${f.uygun}`).join("\n")}

3) HERO DÜZENİ seç (id yaz):
${HERO_LAYOUTS.map((h) => `   ${h.id} → ${h.aciklama}`).join("\n")}

4) radius (0-28) ve density ("sikisik"|"normal"|"ferah") seç.
   Lüks/ciddi işlerde düşük radius + ferah; sevimli/samimi işlerde yüksek radius.

━━ SONRA BLOKLARI SEÇ ━━

Kullanılabilir bloklar:
${BLOCK_CATALOG}

BLOK SEÇİM KURALLARI — bunlara uymazsan çıktı reddedilir:
- hero ve contact ZORUNLU. Gerisini sektöre göre SEN seç.
- 5 ile 8 arası blok kullan. Her siteye aynı blokları koyma.
- Sıralamayı da sen kur; "hero → services → about → cta → contact" ezberini tekrarlama.
${input.hasPhotos === false ? "- Görseli YOK: gallery bloğu KOYMA." : ""}
${input.showPricing === false ? "- Fiyat paylaşmak istemiyor: pricing bloğu KOYMA." : ""}
${!input.realStats ? "- Gerçek rakam verilmedi: '10+ yıl deneyim', '500+ mutlu müşteri' gibi SAYI UYDURMA. about bloğunda stats dizisini boş bırak." : ""}
${!input.realReviews ? "- Gerçek yorum verilmedi: testimonials bloğu KOYMA. Yorum uydurmak yasak." : ""}
- features/services için variant seç: ${SECTION_VARIANTS.features.join(" | ")}
- gallery için variant: ${SECTION_VARIANTS.gallery.join(" | ")}

━━ METİN KURALLARI ━━
- Hepsi Türkçe. Başlıklar bu işletmeye özel olsun; "Neden Biz?", "Hizmetlerimiz", "Hakkımızda" gibi genel başlıklar YERİNE işi anlatan başlıklar yaz (örn. bir kuaför için "Saçınıza Dokunan Eller", bir oto servis için "Aracınız Emin Ellerde").
- Emoji KULLANMA. İkon alanına lucide-react ikon adı yaz (scissors, sparkles, clock, phone, map-pin, star, shield, heart, wrench, car, coffee, camera, users, award, check, calendar).
- Abartı ve klişe yok: "sektörün öncüsü", "kalitede lider" gibi ifadeler kullanma.
- Somut yaz: hizmet açıklamaları neyin nasıl yapıldığını anlatsın.

━━ ÇIKTI ━━
SADECE şu şekilde geçerli JSON döndür, başka hiçbir şey yazma:
{
  "theme": { "paletteId": "...", "fontPairId": "...", "heroLayout": "...", "radius": 16, "density": "normal" },
  "blocks": [
    { "id": "hero", "type": "hero", "data": { "eyebrow": "kısa etiket", "headline": "...", "subheadline": "...", "cta": "...", "ctaHref": "#contact" } },
    { "id": "services", "type": "services", "variant": "kart-izgara", "data": { "title": "...", "items": [ { "icon": "scissors", "title": "...", "desc": "...", "price": "" } ] } },
    { "id": "features", "type": "features", "variant": "numarali-liste", "data": { "title": "...", "items": [ { "icon": "shield", "title": "...", "desc": "..." } ] } },
    { "id": "about", "type": "about", "data": { "title": "...", "body": "...", "stats": [] } },
    { "id": "gallery", "type": "gallery", "variant": "izgara", "data": { "title": "...", "images": [] } },
    { "id": "pricing", "type": "pricing", "data": { "title": "...", "items": [ { "title": "...", "price": "...", "desc": "..." } ] } },
    { "id": "hours", "type": "hours", "data": { "title": "...", "rows": [ { "gun": "Pazartesi", "saat": "09:00 - 19:00" } ] } },
    { "id": "faq", "type": "faq", "data": { "title": "...", "items": [ { "q": "...", "a": "..." } ] } },
    { "id": "team", "type": "team", "data": { "title": "...", "items": [ { "name": "...", "role": "...", "bio": "" } ] } },
    { "id": "testimonials", "type": "testimonials", "data": { "title": "...", "items": [ { "text": "...", "author": "...", "rating": 5 } ] } },
    { "id": "cta", "type": "cta", "data": { "title": "...", "body": "...", "buttonText": "...", "buttonHref": "#contact" } },
    { "id": "contact", "type": "contact", "data": { "title": "...", "phone": "${input.phone ?? ""}", "email": "${input.email ?? ""}", "address": "${input.address ?? ""}" } }
  ]
}

Yukarıdaki liste blokların ŞEMASIDIR, hepsini kullanman gerekmez — seçtiklerini, kendi belirlediğin sırada koy.${cesitlilikNotu(attempt)}`;

  const raw = await generateText({ prompt, maxTokens: 4096 });

  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("AI geçerli JSON üretmedi");

  const parsed = JSON.parse(jsonMatch[0]) as { theme?: Partial<SiteTheme>; blocks?: Block[] };
  const blocks = Array.isArray(parsed.blocks) ? parsed.blocks : [];
  if (blocks.length === 0) throw new Error("AI hiç blok üretmedi");

  // AI bilinmeyen bir id döndürürse sayfa bozulmasın diye kataloğa sabitlenir.
  const palette = PALETTES.find((p) => p.id === parsed.theme?.paletteId) ?? PALETTES[0];
  const fonts = FONT_PAIRS.find((f) => f.id === parsed.theme?.fontPairId) ?? FONT_PAIRS[0];
  const hero = HERO_LAYOUTS.find((h) => h.id === parsed.theme?.heroLayout) ?? HERO_LAYOUTS[0];
  const densities = ["sikisik", "normal", "ferah"] as const;

  const theme: SiteTheme = {
    paletteId: palette.id,
    fontPairId: fonts.id,
    heroLayout: hero.id,
    radius: Math.min(28, Math.max(0, Number(parsed.theme?.radius ?? 16) || 16)),
    density: densities.includes(parsed.theme?.density as typeof densities[number])
      ? (parsed.theme!.density as SiteTheme["density"])
      : "normal",
  };

  // contact garanti altına alınır — AI atlarsa sayfa yarım kalmasın.
  if (!blocks.some((b) => b.type === "contact")) {
    blocks.push({
      id: "contact", type: "contact",
      data: { title: "İletişim", phone: input.phone ?? "", email: input.email ?? "", address: input.address ?? "" },
    });
  }

  return { blocks, theme };
}
