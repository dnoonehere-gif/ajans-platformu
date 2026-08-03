"use client";
import { useState } from "react";
import { Plus, Minus, ShoppingBag, Check, Loader2, X } from "lucide-react";

/**
 * QR menüden sipariş sepeti.
 *
 * Menü sayfasına eklenen yüzen sepet. Fiyat yalnızca ekranda gösterilir;
 * sunucu tutarı ürün kimliklerinden yeniden hesaplar, bu yüzden buradaki
 * değerler değiştirilse bile siparişin tutarı etkilenmez.
 */

export interface CartLine {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export function useCart() {
  const [lines, setLines] = useState<CartLine[]>([]);

  function ekle(item: { id: string; name: string; price?: number | null }) {
    setLines((s) => {
      const v = s.find((l) => l.id === item.id);
      if (v) return s.map((l) => (l.id === item.id ? { ...l, quantity: l.quantity + 1 } : l));
      return [...s, { id: item.id, name: item.name, price: item.price ?? 0, quantity: 1 }];
    });
  }

  function azalt(id: string) {
    setLines((s) =>
      s.map((l) => (l.id === id ? { ...l, quantity: l.quantity - 1 } : l)).filter((l) => l.quantity > 0)
    );
  }

  function temizle() { setLines([]); }

  const adet = lines.reduce((n, l) => n + l.quantity, 0);
  const toplam = lines.reduce((n, l) => n + l.price * l.quantity, 0);

  return { lines, ekle, azalt, temizle, adet, toplam };
}

export function CartBar({
  brandId,
  currency,
  color,
  cart,
}: {
  brandId: string;
  currency: string;
  color: string;
  cart: ReturnType<typeof useCart>;
}) {
  const [acik, setAcik] = useState(false);
  const [masa, setMasa] = useState("");
  const [not, setNot] = useState("");
  const [gonderiliyor, setGonderiliyor] = useState(false);
  const [tamam, setTamam] = useState(false);
  const [hata, setHata] = useState("");

  if (cart.adet === 0 && !tamam) return null;

  async function gonder() {
    if (!masa.trim()) { setHata("Masa numaranızı yazın."); return; }
    setHata("");
    setGonderiliyor(true);
    try {
      const res = await fetch("/api/menu/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandId,
          tableNo: masa,
          note: not || null,
          items: cart.lines.map((l) => ({ menuItemId: l.id, quantity: l.quantity })),
        }),
      });
      const data = await res.json();
      if (!res.ok) { setHata(data.error ?? "Sipariş gönderilemedi."); return; }
      setTamam(true);
      cart.temizle();
      setAcik(false);
    } catch {
      setHata("Bağlantı hatası. Lütfen tekrar deneyin.");
    } finally {
      setGonderiliyor(false);
    }
  }

  if (tamam) {
    return (
      <div className="fixed inset-x-0 bottom-0 z-50 p-4">
        <div className="mx-auto flex max-w-md items-center gap-3 rounded-2xl bg-white p-4 shadow-lg">
          <div className="flex h-9 w-9 items-center justify-center rounded-full" style={{ background: `${color}22`, color }}>
            <Check className="h-5 w-5" />
          </div>
          <p className="flex-1 text-sm">
            <span className="font-semibold">Siparişiniz alındı.</span>{" "}
            <span className="text-neutral-500">Hazırlanmaya başlandığında masanıza gelecek.</span>
          </p>
          <button onClick={() => setTamam(false)} className="rounded-lg p-1.5 text-neutral-400">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {acik && (
        <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setAcik(false)} />
      )}

      <div className="fixed inset-x-0 bottom-0 z-50 p-4">
        <div className="mx-auto max-w-md overflow-hidden rounded-2xl bg-white shadow-lg">
          {acik && (
            <div className="max-h-[50vh] overflow-y-auto border-b border-neutral-100 p-4">
              {cart.lines.map((l) => (
                <div key={l.id} className="flex items-center gap-3 py-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-neutral-900">{l.name}</p>
                    <p className="text-xs text-neutral-500">{currency}{l.price.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => cart.azalt(l.id)} className="rounded-full border border-neutral-200 p-1.5">
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-5 text-center text-sm font-semibold tabular-nums">{l.quantity}</span>
                    <button onClick={() => cart.ekle({ id: l.id, name: l.name, price: l.price })}
                      className="rounded-full border border-neutral-200 p-1.5">
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}

              <input value={masa} onChange={(e) => setMasa(e.target.value)}
                placeholder="Masa numaranız"
                className="mt-3 w-full rounded-xl border border-neutral-200 px-3.5 py-2.5 text-sm outline-none focus:border-neutral-400" />
              <input value={not} onChange={(e) => setNot(e.target.value)}
                placeholder="Not (isteğe bağlı)"
                className="mt-2 w-full rounded-xl border border-neutral-200 px-3.5 py-2.5 text-sm outline-none focus:border-neutral-400" />
              {hata && <p className="mt-2 text-xs text-red-500">{hata}</p>}
            </div>
          )}

          <div className="flex items-center gap-3 p-3">
            <button onClick={() => setAcik((a) => !a)} className="flex flex-1 items-center gap-2 text-left">
              <span className="relative flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: `${color}18`, color }}>
                <ShoppingBag className="h-5 w-5" />
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white"
                  style={{ background: color }}>
                  {cart.adet}
                </span>
              </span>
              <span>
                <span className="block text-sm font-semibold text-neutral-900">{currency}{cart.toplam.toFixed(2)}</span>
                <span className="block text-xs text-neutral-500">{acik ? "Kapat" : "Sepeti gör"}</span>
              </span>
            </button>

            <button onClick={acik ? gonder : () => setAcik(true)} disabled={gonderiliyor}
              className="flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
              style={{ background: color }}>
              {gonderiliyor ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {acik ? "Siparişi Gönder" : "Sipariş Ver"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
