/**
 * QR menü temaları.
 *
 * `theme` alanı veritabanında tutuluyordu ama menü sayfası onu hiç okumuyordu;
 * bu yüzden üç seçenek de birebir aynı sayfayı üretiyordu. Burada her tema
 * gerçekten farklı bir zemin, tipografi, köşe yuvarlaklığı ve kart kurgusu
 * tanımlar. Marka rengi (accent) her temada korunur.
 */

export type MenuThemeId = "modern" | "classic" | "minimal";

export interface MenuTheme {
  id: MenuThemeId;
  /** Sayfa zemini */
  bg: string;
  /** Kart/panel zemini */
  surface: string;
  /** Ana metin */
  ink: string;
  /** İkincil metin */
  inkSoft: string;
  /** Kart köşe yuvarlaklığı */
  radius: string;
  /** Kartların gölgesi mi çizgisi mi olduğu */
  cardStyle: "shadow" | "border" | "flat";
  /** Başlık yazı tipi */
  display: string;
  /** Gövde yazı tipi */
  body: string;
  /** Kategori başlıkları büyük harf mi */
  upperHeadings: boolean;
  /** Başlık harf aralığı */
  tracking: string;
  /** Üst bant marka rengiyle mi dolsun yoksa sade mi kalsın */
  headerFill: "accent" | "surface";
  /** Ürün görselinin konumu */
  imagePosition: "left" | "right";
}

export const MENU_THEMES: Record<MenuThemeId, MenuTheme> = {
  // Varsayılan: renkli üst bant, yuvarlak kartlar, gölgeli. Kafe/fast food.
  modern: {
    id: "modern",
    bg: "#f7f8fa",
    surface: "#ffffff",
    ink: "#111827",
    inkSoft: "#6b7280",
    radius: "1rem",
    cardStyle: "shadow",
    display: "system-ui, -apple-system, sans-serif",
    body: "system-ui, -apple-system, sans-serif",
    upperHeadings: false,
    tracking: "-0.02em",
    headerFill: "accent",
    imagePosition: "left",
  },

  // Sıcak kâğıt zemin, serif başlıklar, keskin köşeler. Restoran/lokanta.
  classic: {
    id: "classic",
    bg: "#f3ece1",
    surface: "#fbf7f0",
    ink: "#2c2418",
    inkSoft: "#7a6a55",
    radius: "0.25rem",
    cardStyle: "border",
    display: "Georgia, 'Times New Roman', serif",
    body: "Georgia, serif",
    upperHeadings: true,
    tracking: "0.08em",
    headerFill: "surface",
    imagePosition: "right",
  },

  // Beyaz zemin, çizgisiz, bol boşluk. Butik kafe/pastane.
  minimal: {
    id: "minimal",
    bg: "#ffffff",
    surface: "#ffffff",
    ink: "#18181b",
    inkSoft: "#a1a1aa",
    radius: "0rem",
    cardStyle: "flat",
    display: "system-ui, sans-serif",
    body: "system-ui, sans-serif",
    upperHeadings: true,
    tracking: "0.14em",
    headerFill: "surface",
    imagePosition: "right",
  },
};

export function getMenuTheme(id?: string | null): MenuTheme {
  return MENU_THEMES[(id as MenuThemeId) ?? "modern"] ?? MENU_THEMES.modern;
}

/** Kart kurgusuna göre CSS. Gölge/çizgi/düz üçlüsü temayı ayrıştıran ana şey. */
export function cardCss(t: MenuTheme): React.CSSProperties {
  const ortak: React.CSSProperties = { background: t.surface, borderRadius: t.radius };
  if (t.cardStyle === "shadow") return { ...ortak, boxShadow: "0 1px 3px rgba(0,0,0,.08)" };
  if (t.cardStyle === "border") return { ...ortak, border: `1px solid ${t.ink}22` };
  return { ...ortak, borderBottom: `1px solid ${t.ink}14`, borderRadius: 0 };
}
