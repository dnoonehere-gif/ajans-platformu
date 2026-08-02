"use client";

/**
 * Yükleme sırasında dönen çark göstermek yerine, MEVCUT içeriği bulanıklaştırıp
 * üstünde ince bir ilerleme şeridi gösterir. Veri gelince bulanıklık çözülür ve
 * içerik yerinde kalır — ekran boşalıp yeniden dolmadığı için sıçrama olmaz.
 *
 * Kullanım:
 *   <BlurLoading loading={loading}>{içerik}</BlurLoading>
 */
export function BlurLoading({
  loading,
  children,
  className = "",
}: {
  loading: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      {/* Üstte ince, sürekli akan ilerleme şeridi — "yükleniyor" sinyali */}
      {loading && (
        <div
          className="pointer-events-none absolute inset-x-0 -top-1 z-30 h-[3px] overflow-hidden rounded-full bg-[hsl(var(--primary)/0.15)]"
          role="status"
          aria-live="polite"
          aria-label="Yükleniyor"
        >
          <div className="nv-progress h-full w-1/3 rounded-full bg-[hsl(var(--primary))]" />
        </div>
      )}

      <div
        aria-busy={loading}
        className={`transition-all duration-500 ease-out ${
          loading ? "pointer-events-none select-none blur-[6px] saturate-[0.85] opacity-60" : "blur-0 opacity-100"
        }`}
      >
        {children}
      </div>
    </div>
  );
}
