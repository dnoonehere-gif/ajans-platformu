/**
 * Site üreticisinin tasarım kararlarını aldığı katalog.
 *
 * Eski üretici tek bir iskeleti sabitliyor, AI'a sadece metin yazdırıyordu;
 * bu yüzden hangi sektör için üretilirse üretilsin çıktı aynı görünüyordu.
 * Burada palet / tipografi / düzen seçenekleri veri olarak duruyor, AI
 * bunlardan sektöre uyanı SEÇİYOR. Böylece kuaförle diş kliniği aynı
 * sayfayı almıyor, ama çıktı da rastgele/bozuk olmuyor — seçenekler elle
 * dengelenmiş durumda.
 */

export interface Palette {
  id: string;
  /** Hangi işlerde doğru durur — AI'ın seçim yaparken okuduğu ipucu */
  uygun: string;
  bg: string;
  surface: string;
  ink: string;
  inkSoft: string;
  accent: string;
  accentInk: string;
  /** Kahraman bölümün zemini: koyu palette hero da koyu olmalı */
  dark: boolean;
}

export const PALETTES: Palette[] = [
  { id: "gece-altin", uygun: "lüks, kuaför, güzellik, restoran, otel — akşam hissi",
    bg: "#0f0d13", surface: "#1a1720", ink: "#f5f1ea", inkSoft: "#a89e94", accent: "#c9a227", accentInk: "#1a1200", dark: true },
  { id: "klinik-mavi", uygun: "diş, sağlık, laboratuvar, danışmanlık — güven ve hijyen",
    bg: "#ffffff", surface: "#f1f6fb", ink: "#0f2033", inkSoft: "#5a7086", accent: "#0f7ec4", accentInk: "#ffffff", dark: false },
  { id: "toprak", uygun: "kafe, fırın, el yapımı, çiçekçi, butik — sıcak ve samimi",
    bg: "#fbf7f1", surface: "#f3eade", ink: "#2e2117", inkSoft: "#7c6b5a", accent: "#b4551f", accentInk: "#ffffff", dark: false },
  { id: "yesil-doga", uygun: "veteriner, pet, organik, spa, yoga, peyzaj — doğal ve sakin",
    bg: "#f7fbf7", surface: "#e9f3ea", ink: "#16281a", inkSoft: "#5c7060", accent: "#2f7d4f", accentInk: "#ffffff", dark: false },
  { id: "endustriyel", uygun: "oto servis, tesisat, inşaat, nakliye, teknik servis — sağlam ve net",
    bg: "#14161a", surface: "#1e2228", ink: "#f2f4f7", inkSoft: "#98a2b3", accent: "#f79009", accentInk: "#1a1200", dark: true },
  { id: "pastel-butik", uygun: "kuaför, tırnak, kozmetik, pastane, çocuk — yumuşak ve şık",
    bg: "#fffafc", surface: "#fdeef4", ink: "#33202a", inkSoft: "#8a6b78", accent: "#d6417d", accentInk: "#ffffff", dark: false },
  { id: "keskin-mono", uygun: "mimarlık, fotoğraf, tasarım, hukuk, emlak — minimal ve ciddi",
    bg: "#ffffff", surface: "#f4f4f5", ink: "#111113", inkSoft: "#71717a", accent: "#111113", accentInk: "#ffffff", dark: false },
  { id: "gece-mor", uygun: "yazılım, ajans, eğitim, oyun, teknoloji — modern ve enerjik",
    bg: "#0d0b18", surface: "#171331", ink: "#f0edff", inkSoft: "#a09ac4", accent: "#7c5cff", accentInk: "#ffffff", dark: true },
  { id: "deniz", uygun: "otel, pansiyon, tur, balık restoranı, dalış — ferah ve tatil",
    bg: "#f5fbfd", surface: "#e3f1f7", ink: "#0d2b38", inkSoft: "#5b7f8e", accent: "#0891a8", accentInk: "#ffffff", dark: false },
];

export interface FontPair {
  id: string;
  uygun: string;
  /** Başlıklar */
  display: string;
  /** Gövde metni */
  body: string;
  /** Başlık harf aralığı */
  tracking: string;
  /** Başlıklar büyük harf mi */
  upper: boolean;
}

export const FONT_PAIRS: FontPair[] = [
  { id: "modern-sans", uygun: "genel amaçlı, teknoloji, klinik", display: "'Inter', system-ui, sans-serif", body: "'Inter', system-ui, sans-serif", tracking: "-0.03em", upper: false },
  { id: "klasik-serif", uygun: "lüks, hukuk, restoran, otel, kuyumcu", display: "Georgia, 'Times New Roman', serif", body: "system-ui, sans-serif", tracking: "-0.01em", upper: false },
  { id: "iri-grotesk", uygun: "ajans, spor, oto, inşaat — iddialı", display: "'Arial Black', Impact, system-ui, sans-serif", body: "system-ui, sans-serif", tracking: "-0.04em", upper: true },
  { id: "yumusak-yuvarlak", uygun: "çocuk, pastane, pet, kozmetik — sevimli", display: "'Trebuchet MS', system-ui, sans-serif", body: "system-ui, sans-serif", tracking: "-0.01em", upper: false },
  { id: "daktilo", uygun: "kahve, el yapımı, butik, tasarım — karakterli", display: "'Courier New', monospace", body: "Georgia, serif", tracking: "0.02em", upper: true },
];

/** Kahraman bölümün kurgusu — hepsi farklı bir sayfa hissi verir. */
export const HERO_LAYOUTS = [
  { id: "ortali-buyuk", aciklama: "Ortalanmış dev başlık, altında tek buton. Sade ve iddialı." },
  { id: "sol-yazi-sag-foto", aciklama: "Solda başlık ve buton, sağda büyük görsel. Klasik ve güvenli." },
  { id: "tam-ekran-foto", aciklama: "Ekranı kaplayan görselin üstünde yazı. Otel, restoran, mekân işleri için." },
  { id: "bolunmus", aciklama: "Ekran ikiye bölünür: bir yarı renk zemin + yazı, diğer yarı görsel." },
  { id: "minimal-satir", aciklama: "Küçük etiket, orta boy başlık, tek satır açıklama. Az ve öz." },
] as const;

/** Bölüm yerleşimleri — aynı içerik farklı görünsün diye. */
export const SECTION_VARIANTS = {
  features: ["kart-izgara", "yatay-satir", "numarali-liste", "ikon-solda"],
  services: ["kart-izgara", "yatay-satir", "numarali-liste", "fiyatli-liste"],
  gallery: ["izgara", "seritli", "mozaik"],
} as const;

/** Sektöre göre seçilebilecek bloklar. AI bunlardan uygun olanları seçer. */
export const BLOCK_CATALOG = `
- hero        : Zorunlu. Sayfanın açılışı.
- services    : Sunulan hizmetler. Hizmet satan her işletmede olmalı.
- features    : "Neden biz" tarzı ayırt edici özellikler. Rekabetin yüksek olduğu işlerde işe yarar.
- gallery     : Görsel işlerde (kuaför, tasarım, mimarlık, restoran, otel) neredeyse zorunlu.
- pricing     : Fiyatı şeffaf olan işlerde (kuaför, kurs, abonelik). Fiyat gizliyse KOYMA.
- hours       : Fiziksel mekânı olan her işletme (kafe, salon, klinik, mağaza).
- faq         : Müşterinin çok soru sorduğu işler (klinik, hukuk, eğitim, teknik servis).
- team        : İnsanın öne çıktığı işler (klinik, avukat, kuaför, danışman).
- testimonials: Gerçek yorum verildiyse. Yorum yoksa KOYMA, uydurma.
- about       : Hikâyesi olan işletme. Yeni açılmışsa veya söyleyecek şey yoksa KOYMA.
- cta         : Sayfanın sonuna doğru harekete geçirme.
- contact     : Zorunlu. Sayfanın kapanışı.
`.trim();
