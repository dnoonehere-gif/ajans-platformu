"use client";
import { useState } from "react";
import Link from "next/link";
import { Loader2, Mail } from "lucide-react";
import { useLang } from "@/components/language-provider";

const L = {
  tr: {
    title: "Şifremi Unuttum",
    desc: "E-posta adresinizi girin, şifre sıfırlama linki gönderelim.",
    email: "E-posta",
    emailPh: "ornek@email.com",
    submit: "Link Gönder",
    back: "← Giriş sayfasına dön",
    doneTitle: "Mail Gönderildi",
    doneDesc: "adresine şifre sıfırlama linki gönderdik. Lütfen gelen kutunuzu kontrol edin.",
    goLogin: "Giriş Sayfasına Dön",
    genericError: "Bir hata oluştu",
  },
  en: {
    title: "Forgot Password",
    desc: "Enter your email and we will send you a password reset link.",
    email: "Email",
    emailPh: "you@example.com",
    submit: "Send Link",
    back: "← Back to sign in",
    doneTitle: "Email Sent",
    doneDesc: "— we sent a password reset link. Please check your inbox.",
    goLogin: "Back to Sign In",
    genericError: "Something went wrong",
  },
};

export default function SifremiUnuttumPage() {
  const { lang } = useLang();
  const sL = L[lang];
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/sifremi-unuttum", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? sL.genericError);
      setLoading(false);
      return;
    }

    setDone(true);
    setLoading(false);
  }

  if (done) {
    return (
      <div className="glass rounded-3xl p-8 text-center">
        <Mail className="mx-auto mb-4 h-14 w-14 text-[hsl(var(--primary))]" />
        <h2 className="mb-2 text-xl font-bold">{sL.doneTitle}</h2>
        <p className="mb-6 text-sm text-[hsl(var(--muted-foreground))]">
          <strong>{email}</strong> {sL.doneDesc}
        </p>
        <Link
          href="/giris"
          className="inline-block w-full rounded-xl bg-[hsl(var(--primary))] py-3 text-center text-sm font-semibold text-white transition hover:opacity-90"
        >
          {sL.goLogin}
        </Link>
      </div>
    );
  }

  return (
    <div className="glass rounded-3xl p-8">
      <h1 className="mb-1 text-2xl font-bold">{sL.title}</h1>
      <p className="mb-6 text-sm text-[hsl(var(--muted-foreground))]">
        {sL.desc}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">{sL.email}</label>
          <input
            type="email"
            required
            placeholder={sL.emailPh}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
          {sL.submit}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-[hsl(var(--muted-foreground))]">
        <Link href="/giris" className="font-semibold text-[hsl(var(--primary))] hover:underline">
          {sL.back}
        </Link>
      </p>
    </div>
  );
}
