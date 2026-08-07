"use client";
import { useCallback, useEffect, useState } from "react";
import { ShoppingBag, Check, X, Loader2, RefreshCw, ChefHat } from "lucide-react";
import { useBrand } from "@/components/dashboard/brand-provider";
import { PageLoading } from "@/components/ui/page-loading";
import { useLang } from "@/components/language-provider";

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

const L = {
  tr: {
    title: "Siparişler", sub: "20 saniyede bir güncellenir", refresh: "Yenile",
    table: "Masa", noBrand: "Önce üstteki menüden bir marka seçin.",
    tabs: { NEW: "Yeni", PREPARING: "Hazırlanıyor", DELIVERED: "Teslim", ALL: "Tümü" },
    status: { NEW: "Yeni", PREPARING: "Hazırlanıyor", DELIVERED: "Teslim", CANCELLED: "İptal" },
    empty: "Bu bölümde sipariş yok. Sipariş alabilmek için menüde \"Masadan sipariş\" ayarının açık olması gerekir.",
    warnClosed: "Menünüz yayında ama masadan sipariş kapalı. Dijital Menü sayfasından \"Sipariş Açık\" düğmesine basın.",
    warnUnpublished: "Menünüz henüz yayında değil. Sipariş alabilmek için önce menüyü yayınlayın, sonra siparişi açın.",
    prep: "Hazırlanıyor", deliver: "Teslim", cancel: "İptal",
  },
  en: {
    title: "Orders", sub: "refreshes every 20 seconds", refresh: "Refresh",
    table: "Table", noBrand: "Select a brand from the switcher above first.",
    tabs: { NEW: "New", PREPARING: "Preparing", DELIVERED: "Delivered", ALL: "All" },
    status: { NEW: "New", PREPARING: "Preparing", DELIVERED: "Delivered", CANCELLED: "Cancelled" },
    empty: "No orders here. To receive orders, enable \"Table ordering\" on the menu page.",
    warnClosed: "Your menu is live but table ordering is off. Turn on \"Ordering\" on the Digital Menu page.",
    warnUnpublished: "Your menu is not published yet. Publish it first, then enable ordering.",
    prep: "Preparing", deliver: "Delivered", cancel: "Cancel",
  },
};

const DURUM_SINIF = {
  NEW:       "bg-amber-500/12 text-amber-500",
  PREPARING: "bg-blue-500/12 text-blue-400",
  DELIVERED: "bg-green-500/12 text-green-500",
  CANCELLED: "bg-red-500/12 text-red-400",
} as const;

const SEKME_ANAHTARLARI = ["NEW", "PREPARING", "DELIVERED", ""] as const;

function saat(iso: string, dil: string) {
  return new Date(iso).toLocaleTimeString(dil === "en" ? "en-GB" : "tr-TR", { hour: "2-digit", minute: "2-digit" });
}

export default function OrdersPage() {
  const { activeBrand } = useBrand();
  const { lang } = useLang();
  const sL = L[lang];
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
    return <div className="p-8 text-sm text-[hsl(var(--muted-foreground))]">{L.tr.noBrand}</div>;
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(var(--primary)/0.12)]">
            <ShoppingBag className="h-5 w-5 text-[hsl(var(--primary))]" />
          </div>
          <div>
            <h1 className="text-xl font-bold">{sL.title}</h1>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              {activeBrand.name} · {sL.sub}
            </p>
          </div>
        </div>
        <button onClick={() => yukle()}
          className="flex items-center gap-2 rounded-xl border border-[hsl(var(--border))] px-4 py-2.5 text-sm transition hover:bg-[hsl(var(--accent))]">
          <RefreshCw className="h-4 w-4" /> {sL.refresh}
        </button>
      </div>

      {!acik && (
        <div className="mb-4 rounded-2xl bg-amber-500/10 px-4 py-3 text-sm text-amber-500">
          {menuYayinda ? sL.warnClosed : sL.warnUnpublished}
        </div>
      )}

      <div className="mb-4 flex flex-wrap gap-1.5">
        {SEKME_ANAHTARLARI.map((k) => (
          <button key={k || "ALL"} onClick={() => setSekme(k)}
            className={`rounded-xl px-4 py-2 text-sm transition ${sekme === k
              ? "bg-[hsl(var(--primary))] font-semibold text-white"
              : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))]"}`}>
            {sL.tabs[(k || "ALL") as keyof typeof sL.tabs]}
          </button>
        ))}
      </div>

      {yukleniyor ? (
        <PageLoading rows={3} />
      ) : siparisler.length === 0 ? (
        <div className="glass rounded-2xl p-8 text-center">
          <ShoppingBag className="mx-auto mb-3 h-8 w-8 text-[hsl(var(--muted-foreground))]" />
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            {sL.empty}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {siparisler.map((o) => {
            const sinif = DURUM_SINIF[o.status] ?? DURUM_SINIF.NEW;
            return (
              <div key={o.id} className="glass rounded-2xl p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-bold">{sL.table} {o.tableNo}</p>
                      <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${sinif}`}>{sL.status[o.status] ?? o.status}</span>
                      <span className="text-xs text-[hsl(var(--muted-foreground))]">{saat(o.createdAt, lang)}</span>
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
                        {sL.prep}
                      </button>
                    )}
                    {(o.status === "NEW" || o.status === "PREPARING") && (
                      <>
                        <button onClick={() => durumDegistir(o.id, "DELIVERED")} disabled={islemId === o.id}
                          className="flex items-center gap-1.5 rounded-lg border border-green-500/30 px-3 py-2 text-xs text-green-500 transition hover:bg-green-500/10 disabled:opacity-50">
                          <Check className="h-3.5 w-3.5" /> {sL.deliver}
                        </button>
                        <button onClick={() => durumDegistir(o.id, "CANCELLED")} disabled={islemId === o.id}
                          className="flex items-center gap-1.5 rounded-lg border border-[hsl(var(--border))] px-3 py-2 text-xs text-[hsl(var(--muted-foreground))] transition hover:bg-[hsl(var(--accent))] disabled:opacity-50">
                          <X className="h-3.5 w-3.5" /> {sL.cancel}
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
