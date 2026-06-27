"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react";

export default function KayitPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const strength = (() => {
    const p = form.password;
    if (p.length === 0) return 0;
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  })();

  const strengthColor = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-green-500"][strength - 1] ?? "bg-[hsl(var(--border))]";
  const strengthLabel = ["Çok zayıf", "Zayıf", "Orta", "Güçlü"][strength - 1] ?? "";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/kayit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Bir hata oluştu");
      setLoading(false);
      return;
    }

    setDone(true);
    setLoading(false);
  }

  if (done) {
    return (
      <div className="glass rounded-3xl p-8 text-center">
        <CheckCircle2 className="mx-auto mb-4 h-14 w-14 text-green-400" />
        <h2 className="mb-2 text-xl font-bold">Hesabınız oluşturuldu!</h2>
        <p className="mb-6 text-sm text-[hsl(var(--muted-foreground))]">
          <strong>{form.email}</strong> adresine doğrulama maili gönderdik. Lütfen gelen kutunuzu kontrol edin.
        </p>
        <button
          onClick={() => router.push("/giris")}
          className="h-11 w-full rounded-xl bg-[hsl(var(--primary))] text-sm font-semibold text-white transition hover:opacity-90"
        >
          Giriş Sayfasına Git
        </button>
      </div>
    );
  }

  return (
    <div className="glass rounded-3xl p-8">
      <h1 className="mb-1 text-2xl font-bold">Kayıt Ol</h1>
      <p className="mb-6 text-sm text-[hsl(var(--muted-foreground))]">
        Ücretsiz hesap oluşturun
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Ad Soyad</label>
          <input
            type="text"
            required
            placeholder="Adınız Soyadınız"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="flex h-11 w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.5)] px-4 text-sm outline-none transition focus:border-[hsl(var(--primary))] focus:ring-2 focus:ring-[hsl(var(--primary)/0.2)]"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">E-posta</label>
          <input
            type="email"
            required
            placeholder="ornek@email.com"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            className="flex h-11 w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.5)] px-4 text-sm outline-none transition focus:border-[hsl(var(--primary))] focus:ring-2 focus:ring-[hsl(var(--primary)/0.2)]"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Şifre</label>
          <div className="relative">
            <input
              type={show ? "text" : "password"}
              required
              minLength={8}
              placeholder="En az 8 karakter"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              className="flex h-11 w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.5)] px-4 pr-11 text-sm outline-none transition focus:border-[hsl(var(--primary))] focus:ring-2 focus:ring-[hsl(var(--primary)/0.2)]"
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
            >
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {/* Şifre gücü */}
          {form.password.length > 0 && (
            <div className="space-y-1">
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className={`h-1.5 flex-1 rounded-full transition-all ${i <= strength ? strengthColor : "bg-[hsl(var(--border))]"}`}
                  />
                ))}
              </div>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">{strengthLabel}</p>
            </div>
          )}
        </div>

        {error && (
          <p className="rounded-xl bg-red-500/10 px-4 py-2.5 text-sm text-red-400">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[hsl(var(--primary))] text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Kayıt Ol
        </button>

        <p className="text-center text-xs text-[hsl(var(--muted-foreground))]">
          Kayıt olarak{" "}
          <Link href="/kullanim-kosullari" className="underline hover:text-[hsl(var(--foreground))]">
            Kullanım Koşulları
          </Link>
          'nı kabul etmiş olursunuz.
        </p>
      </form>

      <p className="mt-6 text-center text-sm text-[hsl(var(--muted-foreground))]">
        Zaten hesabınız var mı?{" "}
        <Link href="/giris" className="font-semibold text-[hsl(var(--primary))] hover:underline">
          Giriş Yap
        </Link>
      </p>
    </div>
  );
}
