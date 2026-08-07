"use client";
import { useEffect, useState } from "react";
import { Check, Loader2 } from "lucide-react";

/**
 * Metinler ziyaretçinin TARAYICI diline göre seçilir; bu sayfa işletmenin
 * müşterisine açıktır, panelin dil tercihiyle ilgisi yoktur.
 */
const M = {
  tr: {
    okTitle: "Talebiniz alındı",
    okBody: (t: string, s: string) => `${t} · ${s} için talebiniz iletildi. İşletme onayladıktan sonra sizi arayacak.`,
    name: "Adınız soyadınız", phone: "Telefon", size: "Kişi sayısı",
    email: "E-posta (isteğe bağlı)", note: "Eklemek istediğiniz not",
    anyone: "Fark etmez", submit: "Rezervasyon Talebi Gönder", sending: "Gönderiliyor...",
    foot: "Talebiniz onaylandığında işletme sizinle iletişime geçecek.",
    errName: "Lütfen adınızı yazın.", errPhone: "Size ulaşabilmemiz için telefon gerekli.",
    errDate: "Tarih ve saat seçin.", errSend: "Talep gönderilemedi.",
    errNet: "Bağlantı hatası. Lütfen tekrar deneyin.",
  },
  en: {
    okTitle: "Request received",
    okBody: (t: string, s: string) => `Your request for ${t} · ${s} has been sent. The business will contact you once confirmed.`,
    name: "Your full name", phone: "Phone", size: "Party size",
    email: "Email (optional)", note: "Anything you'd like to add",
    anyone: "No preference", submit: "Send Booking Request", sending: "Sending...",
    foot: "The business will get in touch once your request is confirmed.",
    errName: "Please enter your name.", errPhone: "We need a phone number to reach you.",
    errDate: "Please pick a date and time.", errSend: "Could not send the request.",
    errNet: "Connection error. Please try again.",
  },
};

/**
 * Ziyaretçinin doldurduğu rezervasyon formu.
 *
 * Talep "Bekliyor" olarak düşer; işletme panelden onaylar. Bu yüzden burada
 * "rezervasyonunuz kesinleşti" değil, "talebiniz alındı" denir — yanlış
 * beklenti oluşturmamak için.
 */
export function ReservationForm({
  brandId, color, employees = [],
}: {
  brandId: string;
  color: string;
  employees?: { id: string; fullName: string; title?: string | null }[];
}) {
  const [form, setForm] = useState({ name: "", phone: "", email: "", date: "", time: "", partySize: 1, notes: "", employeeId: "" });
  const [gonderiliyor, setGonderiliyor] = useState(false);
  const [tamam, setTamam] = useState(false);
  const [hata, setHata] = useState("");
  // navigator sunucuda yok; ilk render TR, istemcide dile göre güncellenir.
  const [dil, setDil] = useState<"tr" | "en">("tr");
  useEffect(() => {
    setDil(navigator.language?.toLowerCase().startsWith("tr") ? "tr" : "en");
  }, []);
  const m = M[dil];

  const inp = "w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-neutral-400 placeholder:text-neutral-400";

  // Geçmiş tarih seçilemesin
  const bugun = new Date().toISOString().slice(0, 10);

  async function gonder(e: React.FormEvent) {
    e.preventDefault();
    if (form.name.trim().length < 2) { setHata(m.errName); return; }
    if (!form.phone.trim()) { setHata(m.errPhone); return; }
    if (!form.date || !form.time) { setHata(m.errDate); return; }

    setHata("");
    setGonderiliyor(true);
    try {
      const res = await fetch("/api/reservations/public", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandId,
          name: form.name,
          phone: form.phone,
          email: form.email || null,
          date: form.date,
          time: form.time,
          partySize: form.partySize,
          notes: form.notes || null,
          employeeId: form.employeeId || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setHata(data.error ?? m.errSend); return; }
      setTamam(true);
    } catch {
      setHata(m.errNet);
    } finally {
      setGonderiliyor(false);
    }
  }

  if (tamam) {
    return (
      <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full" style={{ background: `${color}22`, color }}>
          <Check className="h-6 w-6" />
        </div>
        <p className="font-semibold">{m.okTitle}</p>
        <p className="mt-2 text-sm text-neutral-500">
          {m.okBody(form.date, form.time)}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={gonder} className="space-y-3 rounded-2xl bg-white p-6 shadow-sm">
      <input className={inp} placeholder={m.name} value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })} />
      <input className={inp} type="tel" placeholder={m.phone} value={form.phone}
        onChange={(e) => setForm({ ...form, phone: e.target.value })} />
      <div className="grid grid-cols-2 gap-3">
        <input className={inp} type="date" min={bugun} value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })} />
        <input className={inp} type="time" value={form.time}
          onChange={(e) => setForm({ ...form, time: e.target.value })} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <input className={inp} type="number" min={1} max={50} value={form.partySize}
          onChange={(e) => setForm({ ...form, partySize: Number(e.target.value) || 1 })} placeholder={m.size} />
        <input className={inp} type="email" placeholder={m.email} value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })} />
      </div>
      {employees.length > 0 && (
        <select className={inp} value={form.employeeId}
          onChange={(e) => setForm({ ...form, employeeId: e.target.value })}>
          <option value="">{m.anyone}</option>
          {employees.map((emp) => (
            <option key={emp.id} value={emp.id}>
              {emp.fullName}{emp.title ? ` — ${emp.title}` : ""}
            </option>
          ))}
        </select>
      )}

      <textarea className={`${inp} h-20 resize-y`} placeholder={m.note} value={form.notes}
        onChange={(e) => setForm({ ...form, notes: e.target.value })} />

      {hata && <p className="text-sm text-red-500">{hata}</p>}

      <button type="submit" disabled={gonderiliyor}
        className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
        style={{ background: color }}>
        {gonderiliyor ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {gonderiliyor ? m.sending : m.submit}
      </button>

      <p className="text-center text-[11px] text-neutral-400">
        {m.foot}
      </p>
    </form>
  );
}
