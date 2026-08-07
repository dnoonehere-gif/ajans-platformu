"use client";
import { useCallback, useEffect, useState } from "react";
import { ShoppingBag, Check, X, Loader2, RefreshCw, ChefHat } from "lucide-react";
import { useBrand } from "@/components/dashboard/brand-provider";
import { PageLoading } from "@/components/ui/page-loading";

/**
 * QR menüden gelen siparişlerin yönetimi.
 *
 * Mutfak/servis ekranı gibi çalışır: yeni siparişler üstte, durum tek tuşla
 * ilerletilir. 20 saniyede bir kendini tazeler, çünkü bu ekran genelde açık
 * bırakılır ve elle yenilemek pratik değil.
 */

interface OrderItem { id: string; name: string; price: number; quantity: number }
interface Order {
  id: string;
  tableNo: string;
  note?: string | null;
  total: number;
  status: "NEW" | "PREPARING" | "DELIVERED" | "CANCELLED";
  createdAt: string;
  items: OrderItem[];
}

const DURUM = {
  NEW:       { ad: "Yeni",       sinif: "bg-amber-500/12 text-amber-500" },
  PREPARING: { ad: "Hazırlanıyor", sinif: "bg-blue-500/12 text-blue-400" },
  DELIVERED: { ad: "Teslim",     sinif: "bg-green-500/12 text-green-500" },
  CANCELLED: { ad: "İptal",      sinif: "bg-red-500/12 text-red-400" },
} as const;

const SEKMELER = [
  { key: "NEW", label: "Yeni" },
  { key: "PREPARING", label: "Hazırlanıyor" },
  { key: "DELIVERED", label: "Teslim" },
  { key: "", label: "Tümü" },
] as const;

function saat(iso: string) {
  return new Date(iso).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
}

export default function OrdersPage() {
  const { activeBrand } = useBrand();
  const [sekme, setSekme] = useState<string>("NEW");
  const [siparisler, setSiparisler] = useState<Order[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [islemId, setIslemId] = useState<string | null>(null);
  // Sipariş alımı gerçekten açık mı (menü yayında + sipariş açık)
  const [acik, setAcik] = useState(true);
  const [menuYayinda, setMenuYayinda] = useState(true);

  const yukle = useCallback(async () => {
    if (!activeBrand) return;
    const q = sekme ? `&status=${sekme}` : "";
    const res = await fetch(`/api/menu/orders?brandId=${activeBrand.id}${q}`);
    const data = await res.json();
    setSiparisler(data.orders ?? []);
    setAcik(data.enabled !== false);
    setMenuYayinda(data.menuPublished !== false);
    setYukleniyor(false);
  }, [activeBrand?.id, sekme]);

  useEffect(() => {
    setYukleniyor(true);
    void yukle();
  }, [yukle]);

  // Mutfakta ekran açık kalır; elle yenilemek pratik değil.
  useEffect(() => {
    const t = setInterval(() => { void yukle(); }, 20000);
    return () => clearInterval(t);
  }, [yukle]);

  async function durumDegistir(id: string, status: Order["status"]) {
    setIslemId(id);
    await fetch("/api/menu/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    setIslemId(null);
    await yukle();
  }

  if (!activeBrand) {
    return <div className="p-8 text-sm text-[hsl(var(--muted-foreground))]">Önce üstteki menüden bir marka seçin.</div>;
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(var(--primary)/0.12)]">
            <ShoppingBag className="h-5 w-5 text-[hsl(var(--primary))]" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Siparişler</h1>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              {activeBrand.name} · 20 saniyede bir güncellenir
            </p>
          </div>
        </div>
        <button onClick={() => yukle()}
          className="flex items-center gap-2 rounded-xl border border-[hsl(var(--border))] px-4 py-2.5 text-sm transition hover:bg-[hsl(var(--accent))]">
          <RefreshCw className="h-4 w-4" /> Yenile
        </button>
      </div>

      {!acik && (
        <div className="mb-4 rounded-2xl bg-amber-500/10 px-4 py-3 text-sm text-amber-500">
          {menuYayinda
            ? "Menünüz yayında ama masadan sipariş kapalı. Dijital Menü sayfasından \"Sipariş Açık\" düğmesine basın."
            : "Menünüz henüz yayında değil. Sipariş alabilmek için önce menüyü yayınlayın, sonra siparişi açın."}
        </div>
      )}

      <div className="mb-4 flex flex-wrap gap-1.5">
        {SEKMELER.map((s) => (
          <button key={s.key} onClick={() => setSekme(s.key)}
            className={`rounded-xl px-4 py-2 text-sm transition ${sekme === s.key
              ? "bg-[hsl(var(--primary))] font-semibold text-white"
              : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))]"}`}>
            {s.label}
          </button>
        ))}
      </div>

      {yukleniyor ? (
        <PageLoading rows={3} />
      ) : siparisler.length === 0 ? (
        <div className="glass rounded-2xl p-8 text-center">
          <ShoppingBag className="mx-auto mb-3 h-8 w-8 text-[hsl(var(--muted-foreground))]" />
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            Bu bölümde sipariş yok. Sipariş alabilmek için menüde &quot;Masadan sipariş&quot; ayarının açık olması gerekir.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {siparisler.map((o) => {
            const d = DURUM[o.status] ?? DURUM.NEW;
            return (
              <div key={o.id} className="glass rounded-2xl p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-bold">Masa {o.tableNo}</p>
                      <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${d.sinif}`}>{d.ad}</span>
                      <span className="text-xs text-[hsl(var(--muted-foreground))]">{saat(o.createdAt)}</span>
                    </div>

                    <ul className="mt-2 space-y-0.5">
                      {o.items.map((it) => (
                        <li key={it.id} className="text-sm">
                          <span className="font-semibold tabular-nums">{it.quantity}×</span> {it.name}
                        </li>
                      ))}
                    </ul>

                    {o.note && (
                      <p className="mt-2 rounded-lg bg-[hsl(var(--muted)/0.5)] px-3 py-2 text-xs">{o.note}</p>
                    )}

                    <p className="mt-2 font-bold tabular-nums">{o.total.toFixed(2)} ₺</p>
                  </div>

                  <div className="flex shrink-0 flex-col gap-1.5">
                    {o.status === "NEW" && (
                      <button onClick={() => durumDegistir(o.id, "PREPARING")} disabled={islemId === o.id}
                        className="flex items-center gap-1.5 rounded-lg border border-blue-500/30 px-3 py-2 text-xs text-blue-400 transition hover:bg-blue-500/10 disabled:opacity-50">
                        {islemId === o.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ChefHat className="h-3.5 w-3.5" />}
                        Hazırlanıyor
                      </button>
                    )}
                    {(o.status === "NEW" || o.status === "PREPARING") && (
                      <>
                        <button onClick={() => durumDegistir(o.id, "DELIVERED")} disabled={islemId === o.id}
                          className="flex items-center gap-1.5 rounded-lg border border-green-500/30 px-3 py-2 text-xs text-green-500 transition hover:bg-green-500/10 disabled:opacity-50">
                          <Check className="h-3.5 w-3.5" /> Teslim
                        </button>
                        <button onClick={() => durumDegistir(o.id, "CANCELLED")} disabled={islemId === o.id}
                          className="flex items-center gap-1.5 rounded-lg border border-[hsl(var(--border))] px-3 py-2 text-xs text-[hsl(var(--muted-foreground))] transition hover:bg-[hsl(var(--accent))] disabled:opacity-50">
                          <X className="h-3.5 w-3.5" /> İptal
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
