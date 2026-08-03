"use client";
import { useState } from "react";
import { Check, Loader2 } from "lucide-react";

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

  const inp = "w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-neutral-400 placeholder:text-neutral-400";

  // Geçmiş tarih seçilemesin
  const bugun = new Date().toISOString().slice(0, 10);

  async function gonder(e: React.FormEvent) {
    e.preventDefault();
    if (form.name.trim().length < 2) { setHata("Lütfen adınızı yazın."); return; }
    if (!form.phone.trim()) { setHata("Size ulaşabilmemiz için telefon gerekli."); return; }
    if (!form.date || !form.time) { setHata("Tarih ve saat seçin."); return; }

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
      if (!res.ok) { setHata(data.error ?? "Talep gönderilemedi."); return; }
      setTamam(true);
    } catch {
      setHata("Bağlantı hatası. Lütfen tekrar deneyin.");
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
        <p className="font-semibold">Talebiniz alındı</p>
        <p className="mt-2 text-sm text-neutral-500">
          {form.date} · {form.time} için talebiniz iletildi. İşletme onayladıktan sonra sizi arayacak.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={gonder} className="space-y-3 rounded-2xl bg-white p-6 shadow-sm">
      <input className={inp} placeholder="Adınız soyadınız" value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })} />
      <input className={inp} type="tel" placeholder="Telefon" value={form.phone}
        onChange={(e) => setForm({ ...form, phone: e.target.value })} />
      <div className="grid grid-cols-2 gap-3">
        <input className={inp} type="date" min={bugun} value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })} />
        <input className={inp} type="time" value={form.time}
          onChange={(e) => setForm({ ...form, time: e.target.value })} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <input className={inp} type="number" min={1} max={50} value={form.partySize}
          onChange={(e) => setForm({ ...form, partySize: Number(e.target.value) || 1 })} placeholder="Kişi sayısı" />
        <input className={inp} type="email" placeholder="E-posta (isteğe bağlı)" value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })} />
      </div>
      {employees.length > 0 && (
        <select className={inp} value={form.employeeId}
          onChange={(e) => setForm({ ...form, employeeId: e.target.value })}>
          <option value="">Fark etmez</option>
          {employees.map((emp) => (
            <option key={emp.id} value={emp.id}>
              {emp.fullName}{emp.title ? ` — ${emp.title}` : ""}
            </option>
          ))}
        </select>
      )}

      <textarea className={`${inp} h-20 resize-y`} placeholder="Eklemek istediğiniz not" value={form.notes}
        onChange={(e) => setForm({ ...form, notes: e.target.value })} />

      {hata && <p className="text-sm text-red-500">{hata}</p>}

      <button type="submit" disabled={gonderiliyor}
        className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
        style={{ background: color }}>
        {gonderiliyor ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {gonderiliyor ? "Gönderiliyor..." : "Rezervasyon Talebi Gönder"}
      </button>

      <p className="text-center text-[11px] text-neutral-400">
        Talebiniz onaylandığında işletme sizinle iletişime geçecek.
      </p>
    </form>
  );
}
