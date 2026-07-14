"use client";
import { Suspense } from "react";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";

const lineInput =
  "w-full border-0 border-b-2 border-gray-200 bg-transparent px-0 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-violet-600 placeholder:text-gray-400";

function GirisForm() {
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

    const res = await signIn("credentials", { email, password, redirect: false });

    if (res?.error) {
      setError("E-posta veya şifre hatalı");
      setLoading(false);
      return;
    }

    const callbackUrl = params.get("callbackUrl") ?? "/dashboard";
    router.push(callbackUrl);
  }

  return (
    <div className="rounded-2xl bg-white p-8 shadow-2xl shadow-black/20">
      <h1 className="mb-6 text-xl font-bold text-gray-900">Giriş Yap</h1>

      {basarili === "dogrulandi" && (
        <div className="mb-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
          E-posta adresiniz doğrulandı. Giriş yapabilirsiniz.
        </div>
      )}
      {basarili === "sifre-sifirlandi" && (
        <div className="mb-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
          Şifreniz başarıyla güncellendi.
        </div>
      )}
      {hata === "suresi-doldu" && (
        <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
          Doğrulama linkinin süresi dolmuş. Lütfen tekrar kayıt olun.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">E-posta</label>
          <input
            type="email"
            required
            autoComplete="email"
            placeholder="ornek@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={lineInput}
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">Şifre</label>
          <div className="relative">
            <input
              type={show ? "text" : "password"}
              required
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`${lineInput} pr-9`}
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-violet-600 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-violet-700 disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Giriş Yap
        </button>

        <Link
          href="/sifremi-unuttum"
          className="block text-center text-sm font-medium text-violet-600 hover:underline"
        >
          Şifrenizi mi unuttunuz?
        </Link>
      </form>

      <div className="mt-6 border-t border-gray-100 pt-5 text-center text-sm text-gray-500">
        Hesabınız yok mu?{" "}
        <Link href="/kayit" className="font-semibold text-violet-600 hover:underline">
          Kayıt Ol
        </Link>
      </div>
    </div>
  );
}

export default function GirisPage() {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-white/20" />}>
      <GirisForm />
    </Suspense>
  );
}
