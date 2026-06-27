"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export default function GirisPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const basarili = params.get("basarili");
  const hata = params.get("hata");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError("E-posta veya şifre hatalı");
      setLoading(false);
      return;
    }

    const callbackUrl = params.get("callbackUrl") ?? "/dashboard";
    router.push(callbackUrl);
  }

  return (
    <div className="glass rounded-3xl p-8">
      <h1 className="mb-1 text-2xl font-bold">Giriş Yap</h1>
      <p className="mb-6 text-sm text-[hsl(var(--muted-foreground))]">
        Hesabınıza erişin
      </p>

      {basarili === "dogrulandi" && (
        <div className="mb-4 rounded-xl bg-green-500/10 px-4 py-3 text-sm text-green-400">
          E-posta adresiniz doğrulandı. Giriş yapabilirsiniz.
        </div>
      )}
      {basarili === "sifre-sifirlandi" && (
        <div className="mb-4 rounded-xl bg-green-500/10 px-4 py-3 text-sm text-green-400">
          Şifreniz başarıyla güncellendi.
        </div>
      )}
      {hata === "suresi-doldu" && (
        <div className="mb-4 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-400">
          Doğrulama linkinin süresi dolmuş. Lütfen tekrar kayıt olun.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">E-posta</label>
          <input
            type="email"
            required
            autoComplete="email"
            placeholder="ornek@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex h-11 w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.5)] px-4 text-sm outline-none transition focus:border-[hsl(var(--primary))] focus:ring-2 focus:ring-[hsl(var(--primary)/0.2)]"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Şifre</label>
            <Link
              href="/sifremi-unuttum"
              className="text-xs text-[hsl(var(--primary))] hover:underline"
            >
              Şifremi unuttum
            </Link>
          </div>
          <div className="relative">
            <input
              type={show ? "text" : "password"}
              required
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
          Giriş Yap
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-[hsl(var(--muted-foreground))]">
        Hesabınız yok mu?{" "}
        <Link href="/kayit" className="font-semibold text-[hsl(var(--primary))] hover:underline">
          Kayıt Ol
        </Link>
      </p>
    </div>
  );
}
