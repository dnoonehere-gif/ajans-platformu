"use client";
import { useState } from "react";
import { Send, Loader2, Users, User, Shield, CheckCircle2, AlertCircle } from "lucide-react";

type Target = "all" | "role" | "user";

const ROLES = [
  { value: "CUSTOMER", label: "Müşteriler" },
  { value: "ADMIN", label: "Adminler" },
  { value: "STAFF", label: "Personel" },
  { value: "SUPER_ADMIN", label: "Süper Adminler" },
];

export function MailSender() {
  const [target, setTarget] = useState<Target>("all");
  const [role, setRole] = useState("CUSTOMER");
  const [userId, setUserId] = useState("");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; sent?: number; error?: string } | null>(null);

  async function send() {
    if (!subject.trim() || !content.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/admin/mail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, content, target, role: target === "role" ? role : undefined, userId: target === "user" ? userId : undefined }),
      });
      const data = await res.json();
      if (res.ok) setResult({ ok: true, sent: data.sent });
      else setResult({ ok: false, error: data.error });
    } catch {
      setResult({ ok: false, error: "Bağlantı hatası" });
    }
    setLoading(false);
  }

  return (
    <div className="glass rounded-2xl p-6">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10">
          <Send className="h-4.5 w-4.5 text-violet-400" />
        </div>
        <div>
          <h2 className="font-semibold">Toplu Mail Gönder</h2>
          <p className="text-xs text-[hsl(var(--muted-foreground))]">Kullanıcılara özel veya toplu e-posta gönder</p>
        </div>
      </div>

      {/* Hedef seçimi */}
      <div className="mb-4">
        <label className="mb-2 block text-xs font-medium text-[hsl(var(--muted-foreground))]">Hedef kitle</label>
        <div className="flex gap-2">
          {[
            { value: "all" as Target, label: "Herkes", icon: Users },
            { value: "role" as Target, label: "Role göre", icon: Shield },
            { value: "user" as Target, label: "Tek kullanıcı", icon: User },
          ].map(({ value, label, icon: Icon }) => (
            <button key={value} onClick={() => setTarget(value)}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl border py-2 text-xs font-medium transition ${
                target === value ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]" : "border-[hsl(var(--border))] hover:bg-[hsl(var(--accent))]"
              }`}>
              <Icon className="h-3.5 w-3.5" /> {label}
            </button>
          ))}
        </div>
      </div>

      {target === "role" && (
        <div className="mb-4">
          <label className="mb-2 block text-xs font-medium text-[hsl(var(--muted-foreground))]">Rol</label>
          <select value={role} onChange={(e) => setRole(e.target.value)}
            className="w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary)/0.5)]">
            {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
        </div>
      )}

      {target === "user" && (
        <div className="mb-4">
          <label className="mb-2 block text-xs font-medium text-[hsl(var(--muted-foreground))]">E-posta adresi</label>
          <input value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="ornek@mail.com" type="email"
            className="w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary)/0.5)]" />
        </div>
      )}

      <div className="mb-4">
        <label className="mb-2 block text-xs font-medium text-[hsl(var(--muted-foreground))]">Konu</label>
        <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Mail konusu..."
          className="w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary)/0.5)]" />
      </div>

      <div className="mb-5">
        <label className="mb-2 block text-xs font-medium text-[hsl(var(--muted-foreground))]">İçerik</label>
        <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={5}
          placeholder="Mail içeriği... HTML desteklenmez, düz metin kullanın."
          className="w-full resize-none rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary)/0.5)]" />
      </div>

      {result && (
        <div className={`mb-4 flex items-center gap-2 rounded-xl p-3 text-sm ${result.ok ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
          {result.ok ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
          {result.ok ? `${result.sent} kullanıcıya başarıyla gönderildi.` : result.error}
        </div>
      )}

      <button onClick={send} disabled={loading || !subject.trim() || !content.trim()}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[hsl(var(--primary))] py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        Gönder
      </button>
    </div>
  );
}
