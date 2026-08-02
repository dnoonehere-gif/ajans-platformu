"use client";
import { signIn, getProviders } from "next-auth/react";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useLang } from "@/components/language-provider";

const L = {
  tr: { google: "Google ile devam et", or: "veya" },
  en: { google: "Continue with Google", or: "or" },
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

/**
 * Sosyal giriş butonu. Görünürlük için ayrı bir env bayrağı YOK: NextAuth'un
 * kendi /api/auth/providers ucu sorgulanır. Sunucuda GOOGLE_CLIENT_ID/SECRET
 * tanımlıysa sağlayıcı listede döner ve buton görünür; tanımlı değilse hiç
 * render edilmez. Böylece tek yerde (sunucu env'i) yapılandırma yeter.
 */
export function OAuthButtons({ callbackUrl = "/dashboard" }: { callbackUrl?: string }) {
  const { lang } = useLang();
  const s = L[lang];
  const [busy, setBusy] = useState<string | null>(null);
  const [googleOn, setGoogleOn] = useState(false);

  useEffect(() => {
    let alive = true;
    getProviders()
      .then((p) => { if (alive) setGoogleOn(Boolean(p && "google" in p)); })
      .catch(() => null);
    return () => { alive = false; };
  }, []);

  if (!googleOn) return null;

  const btn =
    "flex h-11 w-full items-center justify-center gap-2.5 rounded-md border border-gray-300 bg-white text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-60";

  return (
    <div className="mb-6">
      <div className="flex flex-col gap-2.5">
        {
          <button type="button" disabled={busy !== null}
            onClick={() => { setBusy("google"); signIn("google", { callbackUrl }); }}
            className={btn}>
            {busy === "google" ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleIcon />}
            {s.google}
          </button>
        }
      </div>

      <div className="mt-6 flex items-center gap-3">
        <span className="h-px flex-1 bg-gray-200" />
        <span className="text-xs uppercase tracking-wider text-gray-400">{s.or}</span>
        <span className="h-px flex-1 bg-gray-200" />
      </div>
    </div>
  );
}
