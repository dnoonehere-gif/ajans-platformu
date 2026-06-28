"use client";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";

function SifremiSifirlaForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) { setError("Şifreler eşleşmiyor"); return; }
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/sifremi-sifirla", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Bir hata oluştu");
      setLoading(false);
      return;
    }

    router.push("/giris?basarili=sifre-sifirlandi");
  }

  if (!token) {
    return (
      <div className="glass rounded-3xl p-8 text-center">
        <p className="text-sm text-red-400">Geçersiz veya eksik token.</p>
        <Link href="/sifremi-unuttum" className="mt-4 inline-block text-sm text-[hsl(var(--primary))] hover:underline">
          Tekrar link al
        </Link>
      </div>
    );
  }

  return (
    <div className="glass rounded-3xl p-8">
      <h1 className="mb-1 text-2xl font-bold">Yeni Şifre Belirle</h1>
      <p className="mb-6 text-sm text-[hsl(var(--muted-foreground))]">
        En az 8 karakter uzunluğunda güçlü bir şifre seçin.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Yeni Şifre</label>
          <div className="relative">
            <input
              type={show ? "text" : "password"}
              required
              minLength={8}
              placeholder="En az 8 karakter"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="flex h-11 w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.5)] px-4 pr-11 text-sm outline-none transition focus:border-[hsl(var(--primary))] focus:ring-2 focus:ring-[hsl(var(--primary)/0.2)]"
            />
            <button type="button" onClick={() => setShow((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Şifre Tekrar</label>
          <input
            type={show ? "text" : "password"}
            required
            placeholder="Şifrenizi tekrar girin"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="flex h-11 w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.5)] px-4 text-sm outline-none transition focus:border-[hsl(var(--primary))] focus:ring-2 focus:ring-[hsl(var(--primary)/0.2)]"
          />
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
          Şifremi Güncelle
        </button>
      </form>
    </div>
  );
}

export default function SifremiSifirlaPage() {
  return (
    <Suspense fallback={<div className="glass rounded-3xl p-8 h-64 animate-pulse" />}>
      <SifremiSifirlaForm />
    </Suspense>
  );
}
