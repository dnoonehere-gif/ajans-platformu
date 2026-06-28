"use client";
import { useState } from "react";
import { Loader2, Save, User, Lock } from "lucide-react";

export default function AyarlarPage() {
  const [tab, setTab] = useState<"profil" | "sifre">("profil");
  const [profil, setProfil] = useState({ name: "", email: "" });
  const [sifre, setSifre] = useState({ current: "", next: "", confirm: "" });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setMsg(null);
    const res = await fetch("/api/user/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: profil.name }),
    });
    setMsg(res.ok ? { type: "ok", text: "Profil güncellendi." } : { type: "err", text: "Hata oluştu." });
    setSaving(false);
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault();
    if (sifre.next !== sifre.confirm) { setMsg({ type: "err", text: "Şifreler eşleşmiyor." }); return; }
    setSaving(true); setMsg(null);
    const res = await fetch("/api/user/password", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: sifre.current, newPassword: sifre.next }),
    });
    const data = await res.json();
    setMsg(res.ok ? { type: "ok", text: "Şifre güncellendi." } : { type: "err", text: data.error ?? "Hata." });
    if (res.ok) setSifre({ current: "", next: "", confirm: "" });
    setSaving(false);
  }

  const inputCls = "flex h-11 w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.5)] px-4 text-sm outline-none transition focus:border-[hsl(var(--primary))] focus:ring-2 focus:ring-[hsl(var(--primary)/0.2)]";

  return (
    <div className="mx-auto max-w-2xl p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Ayarlar</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">Hesap bilgilerinizi yönetin</p>
      </div>

      {/* Sekme */}
      <div className="mb-6 flex gap-1 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.3)] p-1">
        {[{ key: "profil", label: "Profil", icon: User }, { key: "sifre", label: "Şifre", icon: Lock }].map((t) => (
          <button key={t.key} onClick={() => { setTab(t.key as "profil" | "sifre"); setMsg(null); }}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium transition ${tab === t.key ? "bg-[hsl(var(--card))] shadow-sm" : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"}`}>
            <t.icon className="h-4 w-4" /> {t.label}
          </button>
        ))}
      </div>

      {msg && (
        <div className={`mb-4 rounded-xl px-4 py-3 text-sm ${msg.type === "ok" ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
          {msg.text}
        </div>
      )}

      {tab === "profil" && (
        <form onSubmit={saveProfile} className="glass rounded-2xl p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Ad Soyad</label>
            <input className={inputCls} placeholder="Adınız Soyadınız" value={profil.name}
              onChange={(e) => setProfil((p) => ({ ...p, name: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[hsl(var(--muted-foreground))]">E-posta (değiştirilemez)</label>
            <input className={`${inputCls} opacity-50 cursor-not-allowed`} disabled placeholder="ornek@email.com" value={profil.email}
              onChange={(e) => setProfil((p) => ({ ...p, email: e.target.value }))} />
          </div>
          <button type="submit" disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50 transition">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Kaydet
          </button>
        </form>
      )}

      {tab === "sifre" && (
        <form onSubmit={savePassword} className="glass rounded-2xl p-6 space-y-4">
          {[
            { label: "Mevcut Şifre", key: "current" },
            { label: "Yeni Şifre", key: "next" },
            { label: "Yeni Şifre (Tekrar)", key: "confirm" },
          ].map((f) => (
            <div key={f.key} className="space-y-1.5">
              <label className="text-sm font-medium">{f.label}</label>
              <input type="password" required minLength={f.key === "current" ? 1 : 8} className={inputCls}
                placeholder="••••••••" value={(sifre as Record<string, string>)[f.key]}
                onChange={(e) => setSifre((p) => ({ ...p, [f.key]: e.target.value }))} />
            </div>
          ))}
          <button type="submit" disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50 transition">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />} Şifreyi Güncelle
          </button>
        </form>
      )}
    </div>
  );
}
