"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { MailCheck, LogOut, Loader2 } from "lucide-react";
import { useLang } from "@/components/language-provider";

const L = {
  tr: {
    title: "E-postanızı doğrulayın",
    desc: "Hesabınızı kullanmaya başlamadan önce e-posta adresinizi doğrulamanız gerekiyor. Kayıt sırasında gönderdiğimiz doğrulama bağlantısına tıklayın.",
    sentTo: "Doğrulama bağlantısı şu adrese gönderildi:",
    notReceived: "E-posta gelmediyse spam klasörünü kontrol edin veya yeniden gönderin.",
    resend: "Doğrulama E-postasını Tekrar Gönder",
    sending: "Gönderiliyor...",
    sent: "Doğrulama e-postası gönderildi! Gelen kutunuzu kontrol edin.",
    already: "E-postanız zaten doğrulanmış. Yönlendiriliyorsunuz...",
    error: "Bir hata oluştu, lütfen tekrar deneyin.",
    logout: "Çıkış Yap",
    refresh: "Doğruladım, Devam Et",
  },
  en: {
    title: "Verify your email",
    desc: "You need to verify your email address before using your account. Click the verification link we sent during sign-up.",
    sentTo: "The verification link was sent to:",
    notReceived: "If you didn't receive it, check your spam folder or resend it.",
    resend: "Resend Verification Email",
    sending: "Sending...",
    sent: "Verification email sent! Check your inbox.",
    already: "Your email is already verified. Redirecting...",
    error: "Something went wrong, please try again.",
    logout: "Sign Out",
    refresh: "I've Verified, Continue",
  },
};

export default function VerificationPending() {
  const { lang } = useLang();
  const t = L[lang];
  const { data: session } = useSession();
  const email = session?.user?.email ?? "";
  const [state, setState] = useState<"idle" | "sending" | "sent" | "already" | "error">("idle");

  async function resend() {
    setState("sending");
    try {
      const res = await fetch("/api/auth/dogrulama-tekrar", { method: "POST" });
      const data = await res.json().catch(() => null);
      if (!res.ok) return setState("error");
      if (data?.already) {
        // Zaten doğrulanmış — kullanıcıyı bekletmeden dashboard'a al
        setState("already");
        window.location.href = "/dashboard";
        return;
      }
      setState("sent");
    } catch {
      setState("error");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#07070c] px-6">
      <div className="w-full max-w-md rounded-3xl border border-white/[0.08] bg-[#121218] p-8 text-center shadow-2xl">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600">
          <MailCheck className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-xl font-bold text-white">{t.title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-400">{t.desc}</p>

        {email && (
          <div className="mt-5 rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3">
            <p className="text-xs text-slate-500">{t.sentTo}</p>
            <p className="mt-1 break-all text-sm font-semibold text-violet-300">{email}</p>
          </div>
        )}

        <p className="mt-4 text-xs text-slate-500">{t.notReceived}</p>

        {state === "sent" && <p className="mt-4 rounded-lg bg-emerald-500/10 px-4 py-2 text-sm text-emerald-400">{t.sent}</p>}
        {state === "already" && <p className="mt-4 rounded-lg bg-violet-500/10 px-4 py-2 text-sm text-violet-300">{t.already}</p>}
        {state === "error" && <p className="mt-4 rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-400">{t.error}</p>}

        <button
          onClick={resend}
          disabled={state === "sending"}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
        >
          {state === "sending" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {state === "sending" ? t.sending : t.resend}
        </button>

        {/* Sayfayı yenilemek işe yaramaz (burada kalır); dashboard'a gidilmeli.
            Doğrulama tamamlandıysa layout içeri alır, tamamlanmadıysa geri döner. */}
        <button
          onClick={() => { window.location.href = "/dashboard"; }}
          className="mt-3 w-full rounded-xl border border-white/10 py-3 text-sm font-medium text-slate-200 transition hover:bg-white/[0.04]"
        >
          {t.refresh}
        </button>

        <button
          onClick={() => signOut({ callbackUrl: "/giris" })}
          className="mx-auto mt-5 flex items-center gap-1.5 text-xs text-slate-500 transition hover:text-slate-300"
        >
          <LogOut className="h-3.5 w-3.5" /> {t.logout}
        </button>
      </div>
    </div>
  );
}
