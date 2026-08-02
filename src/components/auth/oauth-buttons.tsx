"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useLang } from "@/components/language-provider";

const L = {
  tr: { google: "Google ile devam et", apple: "Apple ile devam et", or: "veya" },
  en: { google: "Continue with Google", apple: "Continue with Apple", or: "or" },
};

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
      <path fill="#4285F4" d="M23.5 12.27c0-.79-.07-1.54-.2-2.27H12v4.51h6.47a5.54 5.54 0 0 1-2.4 3.63v3h3.87c2.26-2.09 3.56-5.17 3.56-8.87z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.96-1.08 7.94-2.91l-3.87-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.28v3.09A12 12 0 0 0 12 24z" />
      <path fill="#FBBC05" d="M5.27 14.29a7.2 7.2 0 0 1 0-4.58V6.62H1.28a12 12 0 0 0 0 10.76l3.99-3.09z" />
      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.28 6.62l3.99 3.09C6.22 6.86 8.87 4.75 12 4.75z" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
      <path d="M17.05 12.7c-.03-2.5 2.04-3.7 2.13-3.76-1.16-1.7-2.97-1.93-3.61-1.96-1.54-.16-3 .9-3.78.9-.78 0-1.98-.88-3.26-.86-1.67.03-3.22.97-4.08 2.47-1.74 3.02-.45 7.5 1.25 9.95.83 1.2 1.82 2.55 3.12 2.5 1.25-.05 1.72-.81 3.24-.81 1.51 0 1.94.81 3.26.78 1.35-.02 2.2-1.22 3.02-2.43.95-1.39 1.35-2.74 1.37-2.81-.03-.01-2.63-1.01-2.66-4zM14.6 4.6c.69-.84 1.16-2 1.03-3.16-1 .04-2.2.66-2.92 1.5-.64.74-1.2 1.93-1.05 3.06 1.11.09 2.25-.56 2.94-1.4z" />
    </svg>
  );
}

/**
 * Sosyal giriş butonları. Hangi sağlayıcının gösterileceği env ile belirlenir;
 * sunucuda kimlik bilgisi tanımlı değilse sağlayıcı NextAuth'a hiç eklenmediği
 * için butonu göstermek kullanıcıyı hataya düşürür — bu yüzden gizlenir.
 */
export function OAuthButtons({ callbackUrl = "/dashboard" }: { callbackUrl?: string }) {
  const { lang } = useLang();
  const s = L[lang];
  const [busy, setBusy] = useState<string | null>(null);

  const googleOn = process.env.NEXT_PUBLIC_OAUTH_GOOGLE === "1";
  const appleOn = process.env.NEXT_PUBLIC_OAUTH_APPLE === "1";
  if (!googleOn && !appleOn) return null;

  const btn =
    "flex h-11 w-full items-center justify-center gap-2.5 rounded-md border border-gray-300 bg-white text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-60";

  return (
    <div className="mb-6">
      <div className="flex flex-col gap-2.5">
        {googleOn && (
          <button type="button" disabled={busy !== null}
            onClick={() => { setBusy("google"); signIn("google", { callbackUrl }); }}
            className={btn}>
            {busy === "google" ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleIcon />}
            {s.google}
          </button>
        )}
        {appleOn && (
          <button type="button" disabled={busy !== null}
            onClick={() => { setBusy("apple"); signIn("apple", { callbackUrl }); }}
            className={`${btn} border-black bg-black text-white hover:bg-neutral-800`}>
            {busy === "apple" ? <Loader2 className="h-4 w-4 animate-spin" /> : <AppleIcon />}
            {s.apple}
          </button>
        )}
      </div>

      <div className="mt-6 flex items-center gap-3">
        <span className="h-px flex-1 bg-gray-200" />
        <span className="text-xs uppercase tracking-wider text-gray-400">{s.or}</span>
        <span className="h-px flex-1 bg-gray-200" />
      </div>
    </div>
  );
}
