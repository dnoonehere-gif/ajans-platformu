"use client";
import { useCallback, useEffect, useState } from "react";
import { Globe2, Check, Loader2, X, Clock } from "lucide-react";
import { useLang } from "@/components/language-provider";

/**
 * "Kendi alan adımla yayınlayın" talebi.
 *
 * Özel alan adı bağlamak DNS ayarı gerektiriyor ve müşterilerin çoğu bunu
 * yapamıyor. Self-servis bir akış yerine talep ekibe düşüyor: kullanıcı
 * istediği adı yazıyor, ekip alan adını alıp kuruyor ve bilgileri iletiyor.
 *
 * Fiyat baştan gösteriliyor: kurulum tek seferlik, YENİLEME ise yıllık.
 * Yenileme ücretini gizlemek ikinci yıl sürpriz fatura demek olurdu —
 * müşteri kaybettiren şey tam olarak budur. İşletme ve Ajans paketlerinde
 * kurulum ücretsiz; yükseltme sebebi olsun diye.
 */

interface DomainRequest {
  id: string;
  desiredDomain: string;
  status: "PENDING" | "QUOTED" | "IN_PROGRESS" | "COMPLETED" | "REJECTED";
  priceCents?: number | null;
  finalDomain?: string | null;
  adminNote?: string | null;
}

const L = {
  tr: {
    cta: "Kendi Alan Adımla Yayınla",
    title: "Sitenizi kendi adınızla yayınlayalım",
    intro:
      "Şu anda siteniz Novelya adresinde yayınlanıyor. İsterseniz sizin seçtiğiniz bir alan adıyla (örn. kuaforayse.com.tr) yayınlayalım — alan adını biz alalım, kurulumu biz yapalım, siz hiçbir teknik işlemle uğraşmayın.",
    how: "Nasıl işliyor?",
    steps: [
      "İstediğiniz alan adını aşağıya yazın.",
      "Ekibimiz adın müsait olup olmadığına bakar ve size ücreti bildirir.",
      "Onaylarsanız alan adını alır, sitenizi oraya taşır ve yayına alırız.",
      "Bilmeniz gereken her şeyi e-posta veya mesajla iletiriz.",
    ],
    priceNote:
      "Kurulum ücreti 3.900 ₺ (ilk yıl alan adı dahil), sonraki yıllarda yıllık 2.400 ₺ yenileme ücreti oluşur. İşletme ve Ajans paketlerinde kurulum ücretsizdir. Ekibimiz onayınızı almadan hiçbir ücret tahsil edilmez.",
    domainLabel: "İstediğiniz alan adı",
    domainPh: "kuaforayse.com.tr",
    altLabel: "Alternatif (ilk isim alınmışsa)",
    altPh: "aysekuafor.com",
    noteLabel: "Eklemek istedikleriniz",
    notePh: "Örn. tercihen .com.tr olsun, e-posta adresi de isterim",
    send: "Talebi Gönder",
    sending: "Gönderiliyor...",
    cancel: "Vazgeç",
    sentTitle: "Talebiniz alındı",
    sentBody: "Ekibimiz alan adını kontrol edip size ücreti bildirecek.",
    statusLabel: "Alan adı talebi",
    status: {
      PENDING: "İnceleniyor",
      QUOTED: "Fiyat bildirildi",
      IN_PROGRESS: "Kurulum yapılıyor",
      COMPLETED: "Yayında",
      REJECTED: "Reddedildi",
    },
    price: "Ücret",
    close: "Kapat",
  },
  en: {
    cta: "Publish on My Own Domain",
    title: "Let us publish your site on your own domain",
    intro:
      "Your site is currently served on a Novelya address. If you like, we can publish it on a domain you choose (e.g. yoursalon.com) — we buy the domain, we handle the setup, you deal with no technical steps.",
    how: "How it works",
    steps: [
      "Write the domain you want below.",
      "We check availability and tell you the price.",
      "If you approve, we buy it, move your site there and publish.",
      "We send you everything you need to know by email or message.",
    ],
    priceNote:
      "Setup is ₺3,900 (first-year domain included), then ₺2,400 per year for renewal. Setup is free on the Business and Agency plans. Nothing is charged without your approval.",
    domainLabel: "Domain you want",
    domainPh: "yoursalon.com",
    altLabel: "Alternative (if the first is taken)",
    altPh: "salonyours.com",
    noteLabel: "Anything to add",
    notePh: "e.g. prefer .com, I'd also like an email address",
    send: "Send Request",
    sending: "Sending...",
    cancel: "Cancel",
    sentTitle: "Request received",
    sentBody: "We'll check the domain and get back to you with a price.",
    statusLabel: "Domain request",
    status: {
      PENDING: "Reviewing",
      QUOTED: "Price sent",
      IN_PROGRESS: "Setting up",
      COMPLETED: "Live",
      REJECTED: "Declined",
    },
    price: "Price",
    close: "Close",
  },
};

const ROZET = {
  PENDING: "bg-amber-500/12 text-amber-500",
  QUOTED: "bg-blue-500/12 text-blue-400",
  IN_PROGRESS: "bg-violet-500/12 text-violet-400",
  COMPLETED: "bg-green-500/12 text-green-500",
  REJECTED: "bg-red-500/12 text-red-400",
} as const;

const inp =
  "w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.5)] px-3.5 py-2.5 text-sm outline-none transition focus:border-[hsl(var(--primary))] placeholder:text-[hsl(var(--muted-foreground))]";

export function DomainRequestButton({
  websiteId,
  className = "",
}: {
  websiteId: string;
  className?: string;
}) {
  const { lang } = useLang();
  const sL = L[lang];

  const [acik, setAcik] = useState(false);
  const [form, setForm] = useState({ desiredDomain: "", altDomain: "", note: "" });
  const [gonderiliyor, setGonderiliyor] = useState(false);
  const [hata, setHata] = useState("");
  const [mevcut, setMevcut] = useState<DomainRequest | null>(null);

  const yukle = useCallback(async () => {
    try {
      const res = await fetch(`/api/domain-request?websiteId=${websiteId}`);
      const data = await res.json();
      setMevcut((data.requests ?? [])[0] ?? null);
    } catch {
      setMevcut(null);
    }
  }, [websiteId]);

  useEffect(() => { void yukle(); }, [yukle]);

  async function gonder() {
    setHata("");
    setGonderiliyor(true);
    const res = await fetch("/api/domain-request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ websiteId, ...form }),
    });
    const data = await res.json();
    setGonderiliyor(false);
    if (!res.ok) { setHata(data.error ?? "Gönderilemedi"); return; }
    setAcik(false);
    setForm({ desiredDomain: "", altDomain: "", note: "" });
    await yukle();
  }

  // Açık bir talep varsa buton yerine durum gösterilir; kullanıcı ikinci
  // kez göndermeye çalışıp hata almasın.
  if (mevcut && mevcut.status !== "REJECTED") {
    return (
      <div className={`rounded-xl border border-[hsl(var(--border))] px-3.5 py-2.5 ${className}`}>
        <div className="flex flex-wrap items-center gap-2">
          <Globe2 className="h-4 w-4 text-[hsl(var(--primary))]" />
          <span className="text-sm font-medium">{mevcut.finalDomain || mevcut.desiredDomain}</span>
          <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${ROZET[mevcut.status]}`}>
            {sL.status[mevcut.status]}
          </span>
        </div>
        {mevcut.priceCents != null && (
          <p className="mt-1.5 text-xs text-[hsl(var(--muted-foreground))]">
            {sL.price}: <span className="font-semibold text-[hsl(var(--foreground))]">
              {(mevcut.priceCents / 100).toLocaleString("tr-TR")} ₺
            </span>
          </p>
        )}
        {mevcut.adminNote && (
          <p className="mt-1.5 text-xs leading-relaxed text-[hsl(var(--muted-foreground))]">{mevcut.adminNote}</p>
        )}
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setAcik(true)}
        className={`flex items-center gap-2 rounded-xl border border-[hsl(var(--border))] px-4 py-2.5 text-sm transition hover:bg-[hsl(var(--accent))] ${className}`}
      >
        <Globe2 className="h-4 w-4" /> {sL.cta}
      </button>

      {acik && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 p-4 sm:items-center">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
            <div className="mb-4 flex items-start justify-between gap-3">
              <h2 className="text-lg font-bold">{sL.title}</h2>
              <button onClick={() => setAcik(false)} className="rounded-lg p-1 text-[hsl(var(--muted-foreground))]">
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">{sL.intro}</p>

            <p className="mt-4 text-sm font-semibold">{sL.how}</p>
            <ol className="mt-2 space-y-1.5">
              {sL.steps.map((s, i) => (
                <li key={i} className="flex gap-2.5 text-sm text-[hsl(var(--muted-foreground))]">
                  <span className="font-bold tabular-nums text-[hsl(var(--primary))]">{i + 1}</span>
                  <span>{s}</span>
                </li>
              ))}
            </ol>

            <p className="mt-4 flex gap-2 rounded-xl bg-[hsl(var(--muted)/0.5)] p-3 text-xs leading-relaxed text-[hsl(var(--muted-foreground))]">
              <Clock className="mt-0.5 h-4 w-4 shrink-0" />
              {sL.priceNote}
            </p>

            <div className="mt-5 space-y-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium">{sL.domainLabel}</label>
                <input className={inp} value={form.desiredDomain} placeholder={sL.domainPh}
                  onChange={(e) => setForm({ ...form, desiredDomain: e.target.value })} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">{sL.altLabel}</label>
                <input className={inp} value={form.altDomain} placeholder={sL.altPh}
                  onChange={(e) => setForm({ ...form, altDomain: e.target.value })} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">{sL.noteLabel}</label>
                <textarea className={`${inp} h-20 resize-y`} value={form.note} placeholder={sL.notePh}
                  onChange={(e) => setForm({ ...form, note: e.target.value })} />
              </div>
            </div>

            {hata && <p className="mt-3 text-sm text-red-400">{hata}</p>}

            <div className="mt-5 flex gap-2">
              <button onClick={gonder} disabled={gonderiliyor}
                className="flex items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50">
                {gonderiliyor ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                {gonderiliyor ? sL.sending : sL.send}
              </button>
              <button onClick={() => setAcik(false)}
                className="rounded-xl border border-[hsl(var(--border))] px-5 py-2.5 text-sm transition hover:bg-[hsl(var(--accent))]">
                {sL.cancel}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
