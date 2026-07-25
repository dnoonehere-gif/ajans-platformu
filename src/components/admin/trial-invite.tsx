"use client";
import { useState } from "react";
import { Gift, Loader2, Send } from "lucide-react";
import { useLang } from "@/components/language-provider";

const L = {
  tr: {
    title: "Deneme Daveti Gönder",
    sub: "Kişi e-postadaki bağlantıya tıklayıp denemeyi kendi başlatır — manuel plan atamazsın",
    email: "Kişinin e-postası",
    emailPh: "musteri@eposta.com",
    days: "Süre (gün)",
    note: "Kişisel not (isteğe bağlı)",
    notePh: "Merhaba, konuştuğumuz gibi 7 günlük denemeyi hazırladım…",
    send: "Daveti Gönder",
    sending: "Gönderiliyor...",
    done: (e: string, d: number) => `${d} günlük deneme daveti ${e} adresine gönderildi.`,
    err: "Bir hata oluştu",
  },
  en: {
    title: "Send Trial Invite",
    sub: "The person clicks the email link and starts the trial themselves — no manual plan assignment",
    email: "Recipient email",
    emailPh: "customer@example.com",
    days: "Duration (days)",
    note: "Personal note (optional)",
    notePh: "Hi, as we discussed I've set up your 7-day trial…",
    send: "Send Invite",
    sending: "Sending...",
    done: (e: string, d: number) => `${d}-day trial invite sent to ${e}.`,
    err: "Something went wrong",
  },
};

export function TrialInvite() {
  const { lang } = useLang();
  const s = L[lang];
  const [email, setEmail] = useState("");
  const [days, setDays] = useState(7);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function send() {
    if (!email.trim()) return;
    setBusy(true); setMsg(null);
    try {
      const r = await fetch("/api/admin/trial-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), days, note: note.trim() || undefined }),
      });
      const d = await r.json();
      if (!r.ok) setMsg({ ok: false, text: d.error ?? s.err });
      else { setMsg({ ok: true, text: s.done(d.email, d.days) }); setEmail(""); setNote(""); }
    } catch { setMsg({ ok: false, text: s.err }); }
    setBusy(false);
  }

  const inp = "rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2.5 text-sm outline-none transition focus:border-[hsl(var(--primary))]";

  return (
    <div className="glass rounded-2xl p-5">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/12">
          <Gift className="h-4 w-4 text-amber-400" />
        </div>
        <div>
          <h2 className="font-semibold">{s.title}</h2>
          <p className="text-xs text-[hsl(var(--muted-foreground))]">{s.sub}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-64 flex-1">
          <label className="mb-1.5 block text-xs font-medium text-[hsl(var(--muted-foreground))]">{s.email}</label>
          <input
            className={`${inp} w-full`}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={s.emailPh}
            type="email"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-[hsl(var(--muted-foreground))]">{s.days}</label>
          <select className={inp} value={days} onChange={(e) => setDays(Number(e.target.value))}>
            {[7, 14, 30].map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
      </div>

      <div className="mt-3">
        <label className="mb-1.5 block text-xs font-medium text-[hsl(var(--muted-foreground))]">{s.note}</label>
        <textarea
          className={`${inp} w-full`}
          rows={2}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={s.notePh}
          maxLength={500}
        />
      </div>

      <button
        onClick={send}
        disabled={busy || !email.trim()}
        className="mt-3 flex items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        {busy ? s.sending : s.send}
      </button>

      {msg && (
        <p className={`mt-3 rounded-lg px-3 py-2 text-sm ${msg.ok ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
          {msg.text}
        </p>
      )}
    </div>
  );
}
