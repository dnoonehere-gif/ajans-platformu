"use client";

/**
 * Sayfa/bölüm yüklenirken dönen çark yerine kullanılır.
 * Üstte ince akan bir şerit + yumuşak nefes alan iskelet kartlar gösterir;
 * gelen içeriğin şekline benzediği için ekran "boş" hissettirmez ve
 * içerik yerleştiğinde sıçrama olmaz.
 */
export function PageLoading({
  rows = 3,
  className = "",
}: {
  rows?: number;
  className?: string;
}) {
  return (
    <div className={`relative ${className}`} role="status" aria-live="polite" aria-label="Yükleniyor">
      {/* Akan ilerleme şeridi */}
      <div className="pointer-events-none absolute inset-x-0 -top-1 h-[3px] overflow-hidden rounded-full bg-[hsl(var(--primary)/0.15)]">
        <div className="nv-progress h-full w-1/3 rounded-full bg-[hsl(var(--primary))]" />
      </div>

      {/* İskelet kartlar — blur + nefes efektiyle */}
      <div className="space-y-3 pt-5 blur-[2px]">
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="nv-skeleton rounded-[22px] border border-[hsl(var(--border)/0.5)] bg-[hsl(var(--card))] p-5"
            style={{ animationDelay: `${i * 140}ms` }}
          >
            <div className="h-3 w-1/3 rounded-full bg-[hsl(var(--muted))]" />
            <div className="mt-4 h-7 w-1/4 rounded-full bg-[hsl(var(--muted))]" />
            <div className="mt-3 h-2.5 w-2/3 rounded-full bg-[hsl(var(--muted)/0.7)]" />
          </div>
        ))}
      </div>
    </div>
  );
}
