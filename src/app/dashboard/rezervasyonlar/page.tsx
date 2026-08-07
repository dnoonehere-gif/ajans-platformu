"use client";
import { useCallback, useEffect, useState } from "react";
import {
  CalendarDays, Check, X, Trash2, Loader2, Phone, Mail, Users, Plus, ExternalLink, Copy,
} from "lucide-react";
import { useBrand } from "@/components/dashboard/brand-provider";
import { PageLoading } from "@/components/ui/page-loading";
import { useLang } from "@/components/language-provider";

/**
 * Rezervasyon yönetimi.
 *
 * Rezervasyon modeli ve uçları vardı ama işletmenin gelen talepleri göreceği
 * bir ekran yoktu; kayıtlar yalnızca dashboard'daki sayacın içinde kalıyordu.
 */

interface Reservation {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  date: string;
  time: string;
  partySize: number;
  notes?: string | null;
  cancelReason?: string | null;
  status: "PENDING" | "CONFIRMED" | "CANCELLED";
  source: string;
  employee?: { id: string; fullName: string } | null;
  createdAt: string;
}

const L = {
  tr: {
    title: "Rezervasyonlar", addManual: "Elle Ekle", newRes: "Yeni rezervasyon",
    shareTitle: "Rezervasyon sayfanız — WhatsApp, Instagram veya sitenizde paylaşın",
    closedWarn: "Bu adres şu anda ziyaretçilere kapalı görünüyor. Açılması için web sitenizi yayınlayın ya da Chatbot bölümünden rezervasyonu etkinleştirin.",
    copy: "Kopyala", copied: "Kopyalandı",
    tabs: { PENDING: "Bekleyen", CONFIRMED: "Onaylı", CANCELLED: "İptal", ALL: "Tümü" },
    status: { PENDING: "Bekliyor", CONFIRMED: "Onaylandı", CANCELLED: "İptal" },
    source: { chatbot: "Chatbot", website: "Web sitesi", manual: "Elle" },
    empty: "Bu bölümde kayıt yok. Rezervasyon sayfanızın adresini paylaşarak talep almaya başlayabilirsiniz.",
    noBrand: "Önce üstteki menüden bir marka seçin.",
    people: "kişi", confirm: "Onayla", cancel: "İptal et", del: "Sil", save: "Kaydet",
    phName: "Müşteri adı", phPhone: "Telefon", phSize: "Kişi sayısı", phNote: "Not (isteğe bağlı)",
    errName: "İsim en az 2 karakter olmalı", errDate: "Tarih ve saat gerekli",
    errSave: "Kaydedilemedi", delConfirm: "Rezervasyon kalıcı olarak silinecek. Emin misiniz?",
  },
  en: {
    title: "Reservations", addManual: "Add Manually", newRes: "New reservation",
    shareTitle: "Your booking page — share it on WhatsApp, Instagram or your site",
    closedWarn: "This link is currently closed to visitors. Publish your website or enable reservations in the Chatbot section.",
    copy: "Copy", copied: "Copied",
    tabs: { PENDING: "Pending", CONFIRMED: "Confirmed", CANCELLED: "Cancelled", ALL: "All" },
    status: { PENDING: "Pending", CONFIRMED: "Confirmed", CANCELLED: "Cancelled" },
    source: { chatbot: "Chatbot", website: "Website", manual: "Manual" },
    empty: "Nothing here yet. Share your booking page link to start receiving requests.",
    noBrand: "Select a brand from the switcher above first.",
    people: "guests", confirm: "Confirm", cancel: "Cancel", del: "Delete", save: "Save",
    phName: "Customer name", phPhone: "Phone", phSize: "Party size", phNote: "Note (optional)",
    errName: "Name must be at least 2 characters", errDate: "Date and time are required",
    errSave: "Could not save", delConfirm: "This reservation will be permanently deleted. Are you sure?",
  },
};

const DURUM_SINIF = {
  PENDING:   "bg-amber-500/12 text-amber-500",
  CONFIRMED: "bg-green-500/12 text-green-500",
  CANCELLED: "bg-red-500/12 text-red-400",
} as const;

const SEKME_ANAHTARLARI = ["PENDING", "CONFIRMED", "CANCELLED", ""] as const;

const inp =
  "w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.5)] px-3.5 py-2.5 text-sm outline-none transition focus:border-[hsl(var(--primary))] placeholder:text-[hsl(var(--muted-foreground))]";

function tarihYaz(iso: string, dil: string) {
  const d = new Date(iso);
  return d.toLocaleDateString(dil === "en" ? "en-GB" : "tr-TR", { day: "2-digit", month: "long", weekday: "short" });
}

export default function ReservationsPage() {
  const { activeBrand } = useBrand();
  const { lang } = useLang();
  const sL = L[lang];
  const [sekme, setSekme] = useState<string>("PENDING");
  const [kayitlar, setKayitlar] = useState<Reservation[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [islemId, setIslemId] = useState<string | null>(null);
  const [formAcik, setFormAcik] = useState(false);
  const [kopyalandi, setKopyalandi] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", date: "", time: "", partySize: 1, notes: "" });
  const [hata, setHata] = useState("");
  // Rezervasyon sayfası gerçekten açık mı (chatbot veya yayında site gerekiyor)
  const [acik, setAcik] = useState(true);

  const yukle = useCallback(async () => {
    if (!activeBrand) return;
    setYukleniyor(true);
    const q = sekme ? `&status=${sekme}` : "";
    const res = await fetch(`/api/reservations?brandId=${activeBrand.id}${q}`);
    const data = await res.json();
    setKayitlar(data.reservations ?? []);
    setAcik(data.enabled !== false);
    setYukleniyor(false);
  }, [activeBrand?.id, sekme]);

  useEffect(() => { void yukle(); }, [yukle]);

  async function durumDegistir(id: string, status: Reservation["status"]) {
    setIslemId(id);
    await fetch("/api/reservations", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    setIslemId(null);
    await yukle();
  }

  async function sil(id: string) {
    if (!confirm(sL.delConfirm)) return;
    setIslemId(id);
    await fetch("/api/reservations", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setIslemId(null);
    await yukle();
  }

  async function elleEkle() {
    if (!activeBrand) return;
    if (form.name.trim().length < 2) { setHata(sL.errName); return; }
    if (!form.date || !form.time) { setHata(sL.errDate); return; }
    setHata("");
    setIslemId("new");
    const res = await fetch("/api/reservations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ brandId: activeBrand.id, ...form, source: "manual" }),
    });
    setIslemId(null);
    if (!res.ok) { setHata((await res.json()).error ?? sL.errSave); return; }
    setForm({ name: "", phone: "", date: "", time: "", partySize: 1, notes: "" });
    setFormAcik(false);
    setSekme("PENDING");
    await yukle();
  }

  if (!activeBrand) {
    return <div className="p-8 text-sm text-[hsl(var(--muted-foreground))]">{L.tr.noBrand}</div>;
  }

  const rezervasyonLinki =
    typeof window !== "undefined" ? `${window.location.origin}/rezervasyon/${activeBrand.slug}` : "";

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(var(--primary)/0.12)]">
            <CalendarDays className="h-5 w-5 text-[hsl(var(--primary))]" />
          </div>
          <div>
            <h1 className="text-xl font-bold">{sL.title}</h1>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">{activeBrand.name}</p>
          </div>
        </div>
        <button onClick={() => setFormAcik((a) => !a)}
          className="flex items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90">
          <Plus className="h-4 w-4" /> {sL.addManual}
        </button>
      </div>

      {/* Müşteriye verilecek rezervasyon adresi */}
      <div className="glass mb-6 rounded-2xl p-4">
        <p className="mb-1.5 text-xs font-semibold text-[hsl(var(--muted-foreground))]">
          {sL.shareTitle}
        </p>
        {!acik && (
          <p className="mb-2 rounded-lg bg-amber-500/10 px-3 py-2 text-xs text-amber-500">
            {sL.closedWarn}
          </p>
        )}
        <div className="flex items-center gap-2">
          <code className="flex-1 truncate rounded-lg bg-[hsl(var(--muted)/0.5)] px-3 py-2 text-xs">{rezervasyonLinki}</code>
          <button onClick={() => { navigator.clipboard.writeText(rezervasyonLinki); setKopyalandi(true); setTimeout(() => setKopyalandi(false), 2000); }}
            className="flex items-center gap-1.5 rounded-lg border border-[hsl(var(--border))] px-3 py-2 text-xs transition hover:bg-[hsl(var(--accent))]">
            {kopyalandi ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
            {kopyalandi ? sL.copied : sL.copy}
          </button>
          <a href={rezervasyonLinki} target="_blank" rel="noopener noreferrer"
            className="rounded-lg border border-[hsl(var(--border))] p-2 transition hover:bg-[hsl(var(--accent))]">
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>

      {formAcik && (
        <div className="glass mb-6 space-y-3 rounded-2xl p-5">
          <p className="text-sm font-semibold">{sL.newRes}</p>
          <input className={inp} placeholder={sL.phName} value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <div className="grid gap-3 sm:grid-cols-2">
            <input className={inp} type="date" value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })} />
            <input className={inp} type="time" value={form.time}
              onChange={(e) => setForm({ ...form, time: e.target.value })} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <input className={inp} placeholder={sL.phPhone} value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <input className={inp} type="number" min={1} max={50} placeholder={sL.phSize} value={form.partySize}
              onChange={(e) => setForm({ ...form, partySize: Number(e.target.value) || 1 })} />
          </div>
          <input className={inp} placeholder={sL.phNote} value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          {hata && <p className="text-xs text-red-400">{hata}</p>}
          <button onClick={elleEkle} disabled={islemId === "new"}
            className="flex items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50">
            {islemId === "new" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} {sL.save}
          </button>
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
      ) : kayitlar.length === 0 ? (
        <div className="glass rounded-2xl p-8 text-center">
          <CalendarDays className="mx-auto mb-3 h-8 w-8 text-[hsl(var(--muted-foreground))]" />
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            {sL.empty}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {kayitlar.map((r) => {
            const sinif = DURUM_SINIF[r.status] ?? DURUM_SINIF.PENDING;
            return (
              <div key={r.id} className="glass rounded-2xl p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold">{r.name}</p>
                      <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${sinif}`}>{sL.status[r.status] ?? r.status}</span>
                      <span className="rounded-full bg-[hsl(var(--muted))] px-2 py-0.5 text-[10px] text-[hsl(var(--muted-foreground))]">
                        {sL.source[r.source as keyof typeof sL.source] ?? sL.source.manual}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
                      {tarihYaz(r.date, lang)} · {r.time}
                      {r.partySize > 1 && <> · <Users className="inline h-3 w-3" /> {r.partySize} {sL.people}</>}
                      {r.employee && <> · {r.employee.fullName}</>}
                    </p>
                    <div className="mt-1.5 flex flex-wrap gap-3 text-xs text-[hsl(var(--muted-foreground))]">
                      {r.phone && <a href={`tel:${r.phone}`} className="flex items-center gap-1 hover:text-[hsl(var(--primary))]"><Phone className="h-3 w-3" /> {r.phone}</a>}
                      {r.email && <a href={`mailto:${r.email}`} className="flex items-center gap-1 hover:text-[hsl(var(--primary))]"><Mail className="h-3 w-3" /> {r.email}</a>}
                    </div>
                    {r.notes && <p className="mt-2 rounded-lg bg-[hsl(var(--muted)/0.5)] px-3 py-2 text-xs">{r.notes}</p>}
                  </div>

                  <div className="flex shrink-0 gap-1.5">
                    {r.status !== "CONFIRMED" && (
                      <button onClick={() => durumDegistir(r.id, "CONFIRMED")} disabled={islemId === r.id} title={sL.confirm}
                        className="rounded-lg border border-green-500/30 p-2 text-green-500 transition hover:bg-green-500/10 disabled:opacity-50">
                        {islemId === r.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                      </button>
                    )}
                    {r.status !== "CANCELLED" && (
                      <button onClick={() => durumDegistir(r.id, "CANCELLED")} disabled={islemId === r.id} title={sL.cancel}
                        className="rounded-lg border border-[hsl(var(--border))] p-2 text-[hsl(var(--muted-foreground))] transition hover:bg-[hsl(var(--accent))] disabled:opacity-50">
                        <X className="h-4 w-4" />
                      </button>
                    )}
                    <button onClick={() => sil(r.id)} disabled={islemId === r.id} title={sL.del}
                      className="rounded-lg border border-red-500/30 p-2 text-red-400 transition hover:bg-red-500/10 disabled:opacity-50">
                      <Trash2 className="h-4 w-4" />
                    </button>
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
