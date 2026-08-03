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
  label: string;
  /** Kısa açıklama — kullanıcı hangi bölümü eklediğini bilsin */
  hint: string;
  make: () => Block;
}

/** Aynı türden ikinci bir blok eklenince kimlikler çakışmasın. */
function yeniId(type: string) {
  return `${type}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;
}

export const BLOCK_PRESETS: BlockPreset[] = [
  {
    type: "gallery",
    label: "Galeri",
    hint: "Fotoğraf veya video ızgarası — kareye tıklayıp yükleyin",
    make: () => ({
      id: yeniId("gallery"),
      type: "gallery",
      variant: "izgara",
      data: { title: "Çalışmalarımız", images: [] },
    }),
  },
  {
    type: "services",
    label: "Hizmetler",
    hint: "Sunduğunuz hizmetlerin listesi",
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
    label: "Fiyat Listesi",
    hint: "Hizmet ve fiyat eşleşmeleri",
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
    label: "Çalışma Saatleri",
    hint: "Haftalık açılış-kapanış",
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
    label: "Sık Sorulanlar",
    hint: "Soru-cevap listesi",
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
    label: "Ekip",
    hint: "Çalışanlar — fotoğraf eklenebilir",
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
    label: "Hakkımızda",
    hint: "İşletmenizin hikâyesi",
    make: () => ({
      id: yeniId("about"),
      type: "about",
      data: { title: "Hakkımızda", body: "İşletmenizi kısaca anlatın.", stats: [] },
    }),
  },
  {
    type: "features",
    label: "Öne Çıkanlar",
    hint: "Sizi ayıran özellikler",
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
    label: "Harekete Geçirme",
    hint: "Renkli kutu ve buton",
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
