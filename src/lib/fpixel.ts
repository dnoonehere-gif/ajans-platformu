// Meta (Facebook) Pixel yardımcıları.
// Pixel ID herkese açık bir değerdir (her ziyaretçinin tarayıcısında görünür),
// gizli değildir; bu yüzden koda sabit yazılır, ayrıca env ile ezilebilir.
export const FB_PIXEL_ID =
  process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID || "37157982203844962";

type Fbq = (...args: unknown[]) => void;

function fbq(): Fbq | undefined {
  if (typeof window === "undefined") return undefined;
  return (window as unknown as { fbq?: Fbq }).fbq;
}

/** Standart sayfa görüntüleme olayı (rota değişimlerinde çağrılır). */
export function pageview() {
  fbq()?.("track", "PageView");
}

/** Standart olay gönder (ör. "CompleteRegistration", "Lead"). */
export function track(event: string, params?: Record<string, unknown>) {
  fbq()?.("track", event, params);
}
