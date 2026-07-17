"use client";
import { Suspense } from "react";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useLang } from "@/components/language-provider";

const lineInput =
  "w-full border-0 border-b border-gray-300 bg-transparent px-0 py-2.5 text-[15px] text-gray-900 outline-none transition-colors hover:border-violet-500 focus:border-b-2 focus:border-violet-600 placeholder:text-gray-400 hover:placeholder:text-violet-400";

const L = {
  tr: {
    title: "Giriş Yap",
    verified: "E-posta adresiniz doğrulandı. Giriş yapabilirsiniz.",
    pwReset: "Şifreniz başarıyla güncellendi.",
    expired: "Doğrulama linkinin süresi dolmuş. Lütfen tekrar kayıt olun.",
    identifier: "Kullanıcı adı, e-posta veya telefon",
    password: "Şifre",
    error: "Kullanıcı bilgileri hatalı",
    submit: "Giriş Yap",
    forgot: "Şifrenizi mi unuttunuz?",
    noAccount: "Hesabınız yok mu?",
    signup: "Kayıt Ol",
  },
  en: {
    title: "Sign In",
    verified: "Your email has been verified. You can sign in now.",
    pwReset: "Your password has been updated.",
    expired: "The verification link has expired. Please sign up again.",
    identifier: "Username, email or phone",
    password: "Password",
    error: "Invalid credentials",
    submit: "Sign In",
    forgot: "Forgot your password?",
    noAccount: "Don't have an account?",
    signup: "Sign Up",
  },
};

function GirisForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { lang } = useLang();
  const s = L[lang];
  const [identifier, setIdentifier] = useState("");
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

    const res = await signIn("credentials", { email: identifier, password, redirect: false });

    if (res?.error) {
      setError(s.error);
      setLoading(false);
      return;
    }

    const callbackUrl = params.get("callbackUrl") ?? "/dashboard";
    router.push(callbackUrl);
  }

  return (
    <div className="rounded-xl bg-white p-8 shadow-2xl shadow-black/25">
      <h1 className="mb-8 text-lg font-bold text-gray-900">{s.title}</h1>

      {basarili === "dogrulandi" && (
        <div className="mb-5 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">{s.verified}</div>
      )}
      {basarili === "sifre-sifirlandi" && (
        <div className="mb-5 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">{s.pwReset}</div>
      )}
      {hata === "suresi-doldu" && (
        <div className="mb-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{s.expired}</div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-8">
          <input
            type="text"
            required
            autoComplete="username"
            placeholder={s.identifier}
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            className={lineInput}
          />
        </div>

        <div className="relative mb-8">
          <input
            type={show ? "text" : "password"}
            required
            autoComplete="current-password"
            placeholder={s.password}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`${lineInput} pr-9`}
          />
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        {error && (
          <p className="mb-5 rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mb-5 flex h-11 w-full items-center justify-center gap-2 rounded-md bg-violet-600 text-sm font-bold uppercase tracking-wider text-white transition hover:bg-violet-700 disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {s.submit}
        </button>

        <Link
          href="/sifremi-unuttum"
          className="block text-sm font-medium text-violet-600 hover:underline"
        >
          {s.forgot}
        </Link>
      </form>

      <div className="mt-8 border-t border-gray-100 pt-5 text-center text-sm text-gray-500">
        {s.noAccount}{" "}
        <Link href="/kayit" className="font-semibold text-violet-600 hover:underline">
          {s.signup}
        </Link>
      </div>
    </div>
  );
}

export default function GirisPage() {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-xl bg-white/20" />}>
      <GirisForm />
    </Suspense>
  );
}
