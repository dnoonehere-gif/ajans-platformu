"use client";

/**
 * Üretilen içeriği okunabilir biçimde gösterir.
 *
 * Reklam türlerinde model JSON döndürüyor (başlıklar, açıklamalar, anahtar
 * kelimeler). Panel bu metni olduğu gibi bastığı için kullanıcı süslü
 * parantezlerle dolu ham çıktı görüyordu. Burada JSON ayrıştırılıp alanlara
 * dökülüyor; ayrıştırılamazsa metin aynen gösteriliyor, yani hiçbir içerik
 * kaybolmuyor.
 */

/** Metin JSON ise nesneye çevirir; değilse null. Kod bloğu işaretlerini temizler. */
function jsonCoz(metin: string): Record<string, unknown> | null {
  const temiz = metin.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  if (!temiz.startsWith("{") && !temiz.startsWith("[")) return null;
  try {
    const veri = JSON.parse(temiz);
    return typeof veri === "object" && veri !== null ? (veri as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

const ETIKET: Record<string, string> = {
  headlines: "Başlıklar",
  descriptions: "Açıklamalar",
  keywords: "Anahtar Kelimeler",
  displayUrl: "Görünen Adres",
  primaryText: "Ana Metin",
  headline: "Başlık",
  description: "Açıklama",
  cta: "Harekete Geçirici",
  hashtags: "Etiketler",
  title: "Başlık",
  body: "Metin",
  slug: "Adres",
  metaDescription: "Meta Açıklama",
};

function baslik(anahtar: string) {
  return ETIKET[anahtar] ?? anahtar;
}

/** Karakter sınırı olan alanlarda uzunluğu gösterir — reklam yazarken kritik. */
const SINIR: Record<string, number> = { headlines: 30, descriptions: 90 };

export function ContentResult({ text }: { text: string }) {
  const veri = jsonCoz(text);

  if (!veri) {
    return <p className="whitespace-pre-wrap text-sm text-[hsl(var(--foreground))]">{text}</p>;
  }

  return (
    <div className="space-y-4">
      {Object.entries(veri).map(([anahtar, deger]) => {
        if (deger == null || (Array.isArray(deger) && deger.length === 0)) return null;
        const sinir = SINIR[anahtar];

        return (
          <div key={anahtar}>
            <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
              {baslik(anahtar)}
            </p>

            {Array.isArray(deger) ? (
              anahtar === "keywords" || anahtar === "hashtags" ? (
                <div className="flex flex-wrap gap-1.5">
                  {deger.map((k, i) => (
                    <span key={i} className="rounded-full bg-[hsl(var(--accent))] px-2.5 py-1 text-xs">
                      {String(k)}
                    </span>
                  ))}
                </div>
              ) : (
                <ul className="space-y-1.5">
                  {deger.map((satir, i) => {
                    const metin = String(satir);
                    const asim = sinir != null && metin.length > sinir;
                    return (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className="mt-0.5 shrink-0 text-[10px] tabular-nums text-[hsl(var(--muted-foreground))]">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="flex-1">{metin}</span>
                        {sinir != null && (
                          <span className={`shrink-0 text-[10px] tabular-nums ${asim ? "font-semibold text-red-400" : "text-[hsl(var(--muted-foreground))]"}`}>
                            {metin.length}/{sinir}
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )
            ) : typeof deger === "object" ? (
              <pre className="overflow-x-auto rounded-lg bg-[hsl(var(--muted)/0.5)] p-2 text-xs">
                {JSON.stringify(deger, null, 2)}
              </pre>
            ) : (
              <p className="whitespace-pre-wrap text-sm">{String(deger)}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
