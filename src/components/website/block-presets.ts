import type { Block, BlockType } from "@/server/ai/website-generator";

/**
 * Editörde elle eklenebilen bölümler.
 *
 * Site üretilirken brief'e göre blok seçiliyordu; "fotoğrafım var" işaretlemeyen
 * kullanıcı galeriyi hiç alamıyor ve sonradan da ekleyemiyordu. Aynı şey fiyat
 * listesi, SSS, ekip gibi bloklar için de geçerliydi. Buradaki hazır şablonlar
 * sayesinde her bölüm sonradan eklenebiliyor.
 *
 * Metinler yer tutucu: kullanıcı önizlemede tıklayıp kendi yazısını giriyor.
 */

export interface BlockPreset {
  type: BlockType;
  /** Editör arayüzü iki dilli; blok İÇERİĞİ yer tutucu olarak Türkçe kalır
   *  çünkü üretilen siteler Türk işletmeleri için. */
  label: { tr: string; en: string };
  hint: { tr: string; en: string };
  make: () => Block;
}

/** Aynı türden ikinci bir blok eklenince kimlikler çakışmasın. */
function yeniId(type: string) {
  return `${type}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;
}

export const BLOCK_PRESETS: BlockPreset[] = [
  {
    type: "gallery",
    label: { tr: "Galeri", en: "Gallery" },
    hint: { tr: "Fotoğraf veya video ızgarası — kareye tıklayıp yükleyin", en: "Photo or video grid — click a tile to upload" },
    make: () => ({
      id: yeniId("gallery"),
      type: "gallery",
      variant: "izgara",
      data: { title: "Çalışmalarımız", images: [] },
    }),
  },
  {
    type: "services",
    label: { tr: "Hizmetler", en: "Services" },
    hint: { tr: "Sunduğunuz hizmetlerin listesi", en: "A list of the services you offer" },
    make: () => ({
      id: yeniId("services"),
      type: "services",
      variant: "kart-izgara",
      data: {
        title: "Hizmetlerimiz",
        items: [
          { icon: "sparkles", title: "Hizmet adı", desc: "Kısa açıklama yazın." },
          { icon: "check", title: "Hizmet adı", desc: "Kısa açıklama yazın." },
          { icon: "star", title: "Hizmet adı", desc: "Kısa açıklama yazın." },
        ],
      },
    }),
  },
  {
    type: "pricing",
    label: { tr: "Fiyat Listesi", en: "Price List" },
    hint: { tr: "Hizmet ve fiyat eşleşmeleri", en: "Service and price pairs" },
    make: () => ({
      id: yeniId("pricing"),
      type: "pricing",
      data: {
        title: "Fiyatlarımız",
        items: [
          { title: "Hizmet adı", price: "0 ₺" },
          { title: "Hizmet adı", price: "0 ₺" },
        ],
      },
    }),
  },
  {
    type: "hours",
    label: { tr: "Çalışma Saatleri", en: "Opening Hours" },
    hint: { tr: "Haftalık açılış-kapanış", en: "Weekly opening and closing times" },
    make: () => ({
      id: yeniId("hours"),
      type: "hours",
      data: {
        title: "Çalışma Saatleri",
        rows: [
          { gun: "Pazartesi - Cuma", saat: "09:00 - 19:00" },
          { gun: "Cumartesi", saat: "10:00 - 18:00" },
          { gun: "Pazar", saat: "Kapalı" },
        ],
      },
    }),
  },
  {
    type: "faq",
    label: { tr: "Sık Sorulanlar", en: "FAQ" },
    hint: { tr: "Soru-cevap listesi", en: "Question and answer list" },
    make: () => ({
      id: yeniId("faq"),
      type: "faq",
      data: {
        title: "Sık Sorulan Sorular",
        items: [
          { q: "Sorunuzu buraya yazın", a: "Cevabı buraya yazın." },
          { q: "Sorunuzu buraya yazın", a: "Cevabı buraya yazın." },
        ],
      },
    }),
  },
  {
    type: "team",
    label: { tr: "Ekip", en: "Team" },
    hint: { tr: "Çalışanlar — fotoğraf eklenebilir", en: "Staff — photos can be added" },
    make: () => ({
      id: yeniId("team"),
      type: "team",
      data: {
        title: "Ekibimiz",
        items: [
          { name: "İsim Soyisim", role: "Görev", photo: "" },
          { name: "İsim Soyisim", role: "Görev", photo: "" },
        ],
      },
    }),
  },
  {
    type: "about",
    label: { tr: "Hakkımızda", en: "About" },
    hint: { tr: "İşletmenizin hikâyesi", en: "Your business story" },
    make: () => ({
      id: yeniId("about"),
      type: "about",
      data: { title: "Hakkımızda", body: "İşletmenizi kısaca anlatın.", stats: [] },
    }),
  },
  {
    type: "features",
    label: { tr: "Öne Çıkanlar", en: "Highlights" },
    hint: { tr: "Sizi ayıran özellikler", en: "What sets you apart" },
    make: () => ({
      id: yeniId("features"),
      type: "features",
      variant: "numarali-liste",
      data: {
        title: "Neden Biz",
        items: [
          { icon: "shield", title: "Özellik", desc: "Kısa açıklama yazın." },
          { icon: "heart", title: "Özellik", desc: "Kısa açıklama yazın." },
        ],
      },
    }),
  },
  {
    type: "cta",
    label: { tr: "Harekete Geçirme", en: "Call to Action" },
    hint: { tr: "Renkli kutu ve buton", en: "Colored box with a button" },
    make: () => ({
      id: yeniId("cta"),
      type: "cta",
      data: {
        title: "Bize ulaşın",
        body: "Kısa bir çağrı metni yazın.",
        buttonText: "İletişime Geç",
        buttonHref: "#contact",
      },
    }),
  },
];
