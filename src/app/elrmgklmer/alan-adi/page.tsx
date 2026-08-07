"use client";
import { useCallback, useEffect, useState } from "react";
import { Globe2, Loader2, ExternalLink, Check, RefreshCw, Copy } from "lucide-react";

/**
 * Alan adı talepleri yönetimi.
 *
 * Kullanıcı "sitemi kendi adımla yayınlayın" dediğinde talep buraya düşer.
 * Ekip alan adını kontrol eder, ücreti yazar, kurulumu yapar ve durumu
 * ilerletir. Kullanıcı kendi panelinde durumu ve ücreti görür.
 *
 * NOT: Giriş bilgileri/şifreler buraya YAZILMAZ — not alanı kullanıcıya
 * gösteriliyor ve veritabanında düz metin duruyor.
 */

interface DomainRequest {
  id: string;
  desiredDomain: string;
  altDomain?: string | null;
  note?: string | null;
  status: "PENDING" | "QUOTED" | "IN_PROGRESS" | "COMPLETED" | "REJECTED";
  priceCents?: number | null;
  finalDomain?: string | null;
  adminNote?: string | null;
  createdAt: string;
  brand: { name: string; slug: string; phone?: string | null };
  user: { name?: string | null; email?: string | null };
  website: { id: string; title: string; subdomain?: string | null; isPublished: boolean };
}

const DURUM: Record<DomainRequest["status"], { ad: string; sinif: string }> = {
  PENDING:     { ad: "İnceleniyor",    sinif: "bg-amber-500/12 text-amber-500" },
  QUOTED:      { ad: "Fiyat verildi",  sinif: "bg-blue-500/12 text-blue-400" },
  IN_PROGRESS: { ad: "Kurulumda",      sinif: "bg-violet-500/12 text-violet-400" },
  COMPLETED:   { ad: "Yayında",        sinif: "bg-green-500/12 text-green-500" },
  REJECTED:    { ad: "Reddedildi",     sinif: "bg-red-500/12 text-red-400" },
};

const SEKMELER = ["PENDING", "QUOTED", "IN_PROGRESS", "COMPLETED", ""] as const;

const inp =
  "w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.5)] px-3 py-2 text-sm outline-none transition focus:border-[hsl(var(--primary))]";

function tarih(iso: string) {
  return new Date(iso).toLocaleDateString("tr-TR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

export default function DomainRequestsPage() {
  const [sekme, setSekme] = useState<string>("PENDING");
  const [talepler, setTalepler] = useState<DomainRequest[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [kaydediyor, setKaydediyor] = useState<string | null>(null);
  const [taslak, setTaslak] = useState<Record<string, { fiyat: string; finalDomain: string; not: string }>>({});
  const [kopyalanan, setKopyalanan] = useState<string | null>(null);

  const yukle = useCallback(async () => {
    setYukleniyor(true);
    const q = sekme ? `?status=${sekme}` : "";
    const res = await fetch(`/api/admin/domain-request${q}`);
    const data = await res.json();
    setTalepler(data.requests ?? []);
    setYukleniyor(false);
  }, [sekme]);

  useEffect(() => { void yukle(); }, [yukle]);

  function taslakAl(t: DomainRequest) {
    return taslak[t.id] ?? {
      fiyat: t.priceCents != null ? String(t.priceCents / 100) : "",
      finalDomain: t.finalDomain ?? "",
      not: t.adminNote ?? "",
    };
  }

  async function guncelle(id: string, yama: Record<string, unknown>) {
    setKaydediyor(id);
    await fetch("/api/admin/domain-request", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...yama }),
    });
    setKaydediyor(null);
    await yukle();
  }

  function kopyala(metin: string, id: string) {
    navigator.clipboard.writeText(metin);
    setKopyalanan(id);
    setTimeout(() => setKopyalanan(null), 2000);
  }

  return (
    <div className="p-4 lg:p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(var(--primary)/0.12)]">
            <Globe2 className="h-5 w-5 text-[hsl(var(--primary))]" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Alan Adı Talepleri</h1>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              Kullanıcıların kendi alan adıyla yayınlanmasını istediği siteler
            </p>
          </div>
        </div>
        <button onClick={() => yukle()}
          className="flex items-center gap-2 rounded-xl border border-[hsl(var(--border))] px-4 py-2.5 text-sm transition hover:bg-[hsl(var(--accent))]">
          <RefreshCw className="h-4 w-4" /> Yenile
        </button>
      </div>

      <div className="mb-5 flex flex-wrap gap-1.5">
        {SEKMELER.map((k) => (
          <button key={k || "ALL"} onClick={() => setSekme(k)}
            className={`rounded-xl px-4 py-2 text-sm transition ${sekme === k
              ? "bg-[hsl(var(--primary))] font-semibold text-white"
              : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))]"}`}>
            {k ? DURUM[k as DomainRequest["status"]].ad : "Tümü"}
          </button>
        ))}
      </div>

      {yukleniyor ? (
        <p className="text-sm text-[hsl(var(--muted-foreground))]">Yükleniyor...</p>
      ) : talepler.length === 0 ? (
        <div className="glass rounded-2xl p-8 text-center">
          <Globe2 className="mx-auto mb-3 h-8 w-8 text-[hsl(var(--muted-foreground))]" />
          <p className="text-sm text-[hsl(var(--muted-foreground))]">Bu bölümde talep yok.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {talepler.map((t) => {
            const d = DURUM[t.status];
            const ts = taslakAl(t);
            const siteAdresi = t.website.subdomain
              ? `https://${t.website.subdomain}.novelya.com.tr`
              : `https://novelya.com.tr/site/${t.brand.slug}`;

            return (
              <div key={t.id} className="glass rounded-2xl p-5">
                {/* Talep başlığı */}
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-lg font-bold">{t.desiredDomain}</p>
                      <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${d.sinif}`}>{d.ad}</span>
                      <button onClick={() => kopyala(t.desiredDomain, t.id)}
                        className="rounded-lg p-1 text-[hsl(var(--muted-foreground))] transition hover:bg-[hsl(var(--accent))]">
                        {kopyalanan === t.id ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                    {t.altDomain && (
                      <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
                        Alternatif: <span className="font-medium text-[hsl(var(--foreground))]">{t.altDomain}</span>
                      </p>
                    )}
                    <p className="mt-1.5 text-sm text-[hsl(var(--muted-foreground))]">
                      {t.brand.name} · {t.user.name || t.user.email}
                      {t.brand.phone && <> · {t.brand.phone}</>}
                    </p>
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">{tarih(t.createdAt)}</p>
                  </div>

                  <a href={siteAdresi} target="_blank" rel="noopener noreferrer"
                    className="flex shrink-0 items-center gap-1.5 rounded-xl border border-[hsl(var(--border))] px-3 py-2 text-xs transition hover:bg-[hsl(var(--accent))]">
                    <ExternalLink className="h-3.5 w-3.5" />
                    Siteyi gör {t.website.isPublished ? "" : "(taslak)"}
                  </a>
                </div>

                {t.note && (
                  <p className="mt-3 rounded-xl bg-[hsl(var(--muted)/0.5)] px-3 py-2 text-sm">
                    <span className="font-semibold">Not:</span> {t.note}
                  </p>
                )}

                {/* Ekip alanları */}
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-[hsl(var(--muted-foreground))]">Ücret (₺)</label>
                    <input className={inp} type="number" min={0} value={ts.fiyat} placeholder="0"
                      onChange={(e) => setTaslak({ ...taslak, [t.id]: { ...ts, fiyat: e.target.value } })} />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-[hsl(var(--muted-foreground))]">Yayınlanan adres</label>
                    <input className={inp} value={ts.finalDomain} placeholder={t.desiredDomain}
                      onChange={(e) => setTaslak({ ...taslak, [t.id]: { ...ts, finalDomain: e.target.value } })} />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-[hsl(var(--muted-foreground))]">Durum</label>
                    <select className={inp} value={t.status}
                      onChange={(e) => guncelle(t.id, { status: e.target.value })}>
                      {Object.entries(DURUM).map(([k, v]) => <option key={k} value={k}>{v.ad}</option>)}
                    </select>
                  </div>
                </div>

                <div className="mt-3">
                  <label className="mb-1 block text-xs font-medium text-[hsl(var(--muted-foreground))]">
                    Kullanıcıya not — şifre/giriş bilgisi YAZMAYIN
                  </label>
                  <textarea className={`${inp} h-16 resize-y`} value={ts.not}
                    placeholder="Örn. Alan adı müsait, ücret 450 ₺. Onaylarsanız 2 gün içinde yayına alırız."
                    onChange={(e) => setTaslak({ ...taslak, [t.id]: { ...ts, not: e.target.value } })} />
                </div>

                <button
                  onClick={() => guncelle(t.id, {
                    priceCents: ts.fiyat ? Math.round(Number(ts.fiyat) * 100) : null,
                    finalDomain: ts.finalDomain || null,
                    adminNote: ts.not || null,
                  })}
                  disabled={kaydediyor === t.id}
                  className="mt-3 flex items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
                >
                  {kaydediyor === t.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  Kaydet
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
