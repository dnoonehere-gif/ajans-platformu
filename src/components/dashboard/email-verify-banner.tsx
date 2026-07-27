"use client";

import { useState } from "react";
import { MailWarning, Loader2, CheckCircle2 } from "lucide-react";
import { useLang } from "@/components/language-provider";

const L = {
  tr: {
    msg: (h: number) =>
      `E-posta adresini doğrula. ${h} saat içinde doğrulamazsan hesabın askıya alınır.`,
    resend: "Doğrulama e-postasını tekrar gönder",
    sending: "Gönderiliyor...",
    sent: "Doğrulama e-postası gönderildi, gelen kutunu kontrol et.",
    error: "Gönderilemedi, tekrar dene.",
  },
  en: {
    msg: (h: number) =>
      `Verify your email address. Your account will be suspended if you don't verify within ${h} hours.`,
    resend: "Resend verification email",
    sending: "Sending...",
    sent: "Verification email sent, check your inbox.",
    error: "Couldn't send, try again.",
  },
};

/**
 * Doğrulanmamış kullanıcıya dashboard'un üstünde gösterilen uyarı bandı.
 * Kayıttan sonra 1 günlük süre içinde görünür; kullanıcı e-postasını
 * doğrulayınca layout bu bandı hiç render etmez (kaybolur).
 */
export function EmailVerifyBanner({ hoursLeft }: { hoursLeft: number }) {
  const { lang } = useLang();
  const t = L[lang];
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function resend() {
    setState("sending");
    try {
      const res = await fetch("/api/auth/dogrulama-tekrar", { method: "POST" });
      setState(res.ok ? "sent" : "error");
    } catch {
      setState("error");
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-amber-500/25 bg-amber-500/10 px-4 py-2.5 text-sm text-amber-500 dark:text-amber-300">
      <MailWarning className="h-4 w-4 shrink-0" />
      <span className="font-medium">{t.msg(hoursLeft)}</span>
      {state === "sent" ? (
        <span className="inline-flex items-center gap-1 font-semibold text-green-500">
          <CheckCircle2 className="h-4 w-4" /> {t.sent}
        </span>
      ) : (
        <button
          onClick={resend}
          disabled={state === "sending"}
          className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500/20 px-3 py-1 text-xs font-semibold underline-offset-2 transition hover:bg-amber-500/30 disabled:opacity-60"
        >
          {state === "sending" && <Loader2 className="h-3 w-3 animate-spin" />}
          {state === "sending" ? t.sending : state === "error" ? t.error : t.resend}
        </button>
      )}
    </div>
  );
}
