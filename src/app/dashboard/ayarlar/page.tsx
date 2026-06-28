"use client";
import { useState, useEffect } from "react";
import { Loader2, Save, User, Lock, ShieldCheck, ShieldOff, CheckCircle2, AlertCircle, Smartphone } from "lucide-react";

type Tab = "profil" | "sifre" | "guvenlik";

export default function AyarlarPage() {
  const [tab, setTab] = useState<Tab>("profil");
  const [profil, setProfil] = useState({ name: "", email: "" });
  const [sifre, setSifre] = useState({ current: "", next: "", confirm: "" });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  // 2FA state
  const [twoFaEnabled, setTwoFaEnabled] = useState(false);
  const [twoFaLoading, setTwoFaLoading] = useState(false);
  const [setupStep, setSetupStep] = useState<"idle" | "qr" | "verify" | "disable">("idle");
  const [qrCode, setQrCode] = useState("");
  const [secret, setSecret] = useState("");
  const [totpInput, setTotpInput] = useState("");
  const [twoFaMsg, setTwoFaMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/user/profile").then(r => r.json()).then(d => {
      if (d.user) {
        setProfil({ name: d.user.name ?? "", email: d.user.email ?? "" });
        setTwoFaEnabled(d.user.twoFactorEnabled ?? false);
      }
    });
  }, []);

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
    if (sifre.next.length < 8) { setMsg({ type: "err", text: "Şifre en az 8 karakter olmalı." }); return; }
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

  async function start2faSetup() {
    setTwoFaLoading(true); setTwoFaMsg(null);
    const res = await fetch("/api/security/2fa/setup");
    const data = await res.json();
    if (!res.ok) { setTwoFaMsg({ type: "err", text: data.error }); setTwoFaLoading(false); return; }
    setQrCode(data.qrCode);
    setSecret(data.secret);
    setSetupStep("qr");
    setTwoFaLoading(false);
  }

  async function verify2fa() {
    if (!totpInput.trim()) return;
    setTwoFaLoading(true); setTwoFaMsg(null);
    const res = await fetch("/api/security/2fa/setup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: totpInput }),
    });
    const data = await res.json();
    if (!res.ok) { setTwoFaMsg({ type: "err", text: data.error }); setTwoFaLoading(false); return; }
    setTwoFaEnabled(true);
    setSetupStep("idle");
    setTotpInput("");
    setTwoFaMsg({ type: "ok", text: "İki faktörlü doğrulama aktif edildi!" });
    setTwoFaLoading(false);
  }

  async function disable2fa() {
    if (!totpInput.trim()) return;
    setTwoFaLoading(true); setTwoFaMsg(null);
    const res = await fetch("/api/security/2fa/setup", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: totpInput }),
    });
    const data = await res.json();
    if (!res.ok) { setTwoFaMsg({ type: "err", text: data.error }); setTwoFaLoading(false); return; }
    setTwoFaEnabled(false);
    setSetupStep("idle");
    setTotpInput("");
    setTwoFaMsg({ type: "ok", text: "2FA devre dışı bırakıldı." });
    setTwoFaLoading(false);
  }

  const inputCls = "flex h-11 w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.5)] px-4 text-sm outline-none transition focus:border-[hsl(var(--primary))] focus:ring-2 focus:ring-[hsl(var(--primary)/0.2)]";

  const TABS: { key: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: "profil", label: "Profil", icon: User },
    { key: "sifre", label: "Şifre", icon: Lock },
    { key: "guvenlik", label: "Güvenlik", icon: ShieldCheck },
  ];

  return (
    <div className="mx-auto max-w-2xl p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Ayarlar</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">Hesap bilgilerinizi ve güvenlik ayarlarınızı yönetin</p>
      </div>

      {/* Sekmeler */}
      <div className="mb-6 flex gap-1 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.3)] p-1">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => { setTab(t.key); setMsg(null); setTwoFaMsg(null); }}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium transition ${tab === t.key ? "bg-[hsl(var(--card))] shadow-sm" : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"}`}>
            <t.icon className="h-4 w-4" /> {t.label}
          </button>
        ))}
      </div>

      {msg && (
        <div className={`mb-4 flex items-center gap-2 rounded-xl px-4 py-3 text-sm ${msg.type === "ok" ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
          {msg.type === "ok" ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
          {msg.text}
        </div>
      )}

      {/* ─── Profil ─── */}
      {tab === "profil" && (
        <form onSubmit={saveProfile} className="glass rounded-2xl p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Ad Soyad</label>
            <input className={inputCls} placeholder="Adınız Soyadınız" value={profil.name}
              onChange={(e) => setProfil((p) => ({ ...p, name: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[hsl(var(--muted-foreground))]">E-posta (değiştirilemez)</label>
            <input className={`${inputCls} opacity-50 cursor-not-allowed`} disabled value={profil.email} readOnly />
          </div>
          <button type="submit" disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50 transition">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Kaydet
          </button>
        </form>
      )}

      {/* ─── Şifre ─── */}
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

      {/* ─── Güvenlik (2FA) ─── */}
      {tab === "guvenlik" && (
        <div className="space-y-4">
          {twoFaMsg && (
            <div className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm ${twoFaMsg.type === "ok" ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
              {twoFaMsg.type === "ok" ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
              {twoFaMsg.text}
            </div>
          )}

          {/* 2FA durumu kartı */}
          <div className="glass rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${twoFaEnabled ? "bg-green-500/10" : "bg-[hsl(var(--muted))]"}`}>
                <Smartphone className={`h-6 w-6 ${twoFaEnabled ? "text-green-400" : "text-[hsl(var(--muted-foreground))]"}`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">İki Faktörlü Doğrulama (2FA)</h3>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${twoFaEnabled ? "bg-green-500/10 text-green-400" : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]"}`}>
                    {twoFaEnabled ? "AKTİF" : "PASİF"}
                  </span>
                </div>
                <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
                  Google Authenticator veya benzer bir uygulama ile hesabınızı ekstra güvence altına alın.
                </p>

                {!twoFaEnabled && setupStep === "idle" && (
                  <button onClick={start2faSetup} disabled={twoFaLoading}
                    className="mt-4 flex items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50">
                    {twoFaLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                    2FA Aktif Et
                  </button>
                )}

                {twoFaEnabled && setupStep === "idle" && (
                  <button onClick={() => { setSetupStep("disable"); setTotpInput(""); }}
                    className="mt-4 flex items-center gap-2 rounded-xl border border-red-500/30 px-4 py-2 text-sm font-semibold text-red-400 transition hover:bg-red-500/10">
                    <ShieldOff className="h-4 w-4" /> 2FA Devre Dışı Bırak
                  </button>
                )}
              </div>
            </div>

            {/* QR Adımı */}
            {setupStep === "qr" && (
              <div className="mt-6 space-y-4 border-t border-[hsl(var(--border))] pt-6">
                <p className="text-sm font-semibold">Adım 1 — QR kodu okutun</p>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                  Google Authenticator, Authy veya benzer bir uygulamayla aşağıdaki QR kodu tarayın.
                </p>
                {qrCode && (
                  <div className="flex justify-center">
                    <img src={qrCode} alt="2FA QR Code" className="h-48 w-48 rounded-xl" />
                  </div>
                )}
                <div className="rounded-xl bg-[hsl(var(--muted)/0.5)] p-3">
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Manuel giriş kodu</p>
                  <p className="break-all font-mono text-xs">{secret}</p>
                </div>
                <button onClick={() => setSetupStep("verify")}
                  className="flex items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90">
                  Kodu Okuttum, Devam Et →
                </button>
              </div>
            )}

            {/* Doğrulama Adımı */}
            {setupStep === "verify" && (
              <div className="mt-6 space-y-4 border-t border-[hsl(var(--border))] pt-6">
                <p className="text-sm font-semibold">Adım 2 — Kodu doğrulayın</p>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Uygulamanızın gösterdiği 6 haneli kodu girin.</p>
                <input
                  type="text" inputMode="numeric" maxLength={6} placeholder="000000"
                  value={totpInput} onChange={(e) => setTotpInput(e.target.value.replace(/\D/g, ""))}
                  className={`${inputCls} text-center text-2xl tracking-[0.5em] font-mono`}
                />
                <div className="flex gap-2">
                  <button onClick={verify2fa} disabled={twoFaLoading || totpInput.length !== 6}
                    className="flex items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50">
                    {twoFaLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                    Doğrula & Aktif Et
                  </button>
                  <button onClick={() => { setSetupStep("idle"); setTotpInput(""); }}
                    className="rounded-xl border border-[hsl(var(--border))] px-4 py-2 text-sm transition hover:bg-[hsl(var(--accent))]">
                    İptal
                  </button>
                </div>
              </div>
            )}

            {/* Devre dışı bırakma onayı */}
            {setupStep === "disable" && (
              <div className="mt-6 space-y-4 border-t border-red-500/20 pt-6">
                <p className="text-sm font-semibold text-red-400">2FA'yı devre dışı bırak</p>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Onaylamak için uygulamanızdaki mevcut 6 haneli kodu girin.</p>
                <input
                  type="text" inputMode="numeric" maxLength={6} placeholder="000000"
                  value={totpInput} onChange={(e) => setTotpInput(e.target.value.replace(/\D/g, ""))}
                  className={`${inputCls} text-center text-2xl tracking-[0.5em] font-mono`}
                />
                <div className="flex gap-2">
                  <button onClick={disable2fa} disabled={twoFaLoading || totpInput.length !== 6}
                    className="flex items-center gap-2 rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50">
                    {twoFaLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldOff className="h-4 w-4" />}
                    Devre Dışı Bırak
                  </button>
                  <button onClick={() => { setSetupStep("idle"); setTotpInput(""); }}
                    className="rounded-xl border border-[hsl(var(--border))] px-4 py-2 text-sm transition hover:bg-[hsl(var(--accent))]">
                    İptal
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Güvenlik ipuçları */}
          <div className="glass rounded-2xl p-5">
            <p className="mb-3 text-sm font-semibold">Güvenlik İpuçları</p>
            <ul className="space-y-2 text-sm text-[hsl(var(--muted-foreground))]">
              {[
                "En az 12 karakterli, büyük/küçük harf ve rakam içeren şifre kullanın.",
                "Şifrenizi hiçbir platformda tekrar kullanmayın.",
                "2FA için yedek kodlarınızı güvenli bir yerde saklayın.",
                "Şüpheli giriş denemleri için audit loglarını kontrol edin.",
              ].map((tip) => (
                <li key={tip} className="flex items-start gap-2">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-green-400" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
