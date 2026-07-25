"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Gift, Loader2, CheckCircle2, XCircle, LogIn } from "lucide-react";
import { useLang } from "@/components/language-provider";

const L = {
  tr: {
    loading: "Davet kontrol ediliyor...",
    invalidTitle: "Davet bulunamadı",
    invalidDesc: "Bu bağlantı geçersiz. Lütfen size gönderilen e-postadaki bağlantıyı kullanın.",
    expiredTitle: "Davetin süresi dolmuş",
    expiredDesc: "Bu deneme daveti artık geçerli değil. Yeni bir davet için bizimle iletişime geçin.",
    usedTitle: "Davet zaten kullanılmış",
    usedDesc: "Bu deneme daveti daha önce aktive edilmiş. Panelinizden durumu görebilirsiniz.",
    readyTitle: (d: number) => `${d} günlük ücretsiz deneme`,
    readyDesc: (plan: string, d: number) => `${plan} planının tüm özellikleri ${d} gün boyunca ücretsiz. Kredi kartı gerekmez, süre sonunda otomatik ücret alınmaz.`,
    activate: "Denemeyi Aktive Et",
    activating: "Aktive ediliyor...",
    loginNeeded: "Devam etmek için bu e-posta ile giriş yapın:",
    loginBtn: "Giriş Yap ve Devam Et",
    registerHint: "Hesabınız yok mu?",
    registerBtn: "Kayıt Ol",
    mismatchTitle: "E-posta uyuşmuyor",
    mismatchDesc: "Bu davet başka bir e-posta adresi için gönderilmiş. Lütfen davetin gönderildiği hesapla giriş yapın.",
    noBrandTitle: "Önce işletmenizi oluşturun",
    noBrandDesc: "Denemeyi başlatmak için panelden ilk işletmenizi oluşturun; denemeniz otomatik olarak başlayacak.",
    goDashboard: "Panele Git",
    alreadyActiveTitle: "Zaten aktif bir planınız var",
    alreadyActiveDesc: "İşletmenizde halihazırda aktif bir abonelik veya deneme bulunuyor.",
    successTitle: "Denemeniz başladı! 🚀",
    successDesc: "Tüm özellikler açıldı. Deneme sözleşmeniz e-posta ile gönderildi.",
    errorTitle: "Bir hata oluştu",
    tryAgain: "Tekrar deneyin.",
  },
  en: {
    loading: "Checking invitation...",
    invalidTitle: "Invitation not found",
    invalidDesc: "This link is invalid. Please use the link in the email sent to you.",
    expiredTitle: "Invitation expired",
    expiredDesc: "This trial invitation is no longer valid. Contact us for a new one.",
    usedTitle: "Invitation already used",
    usedDesc: "This trial invitation has already been activated. Check your dashboard.",
    readyTitle: (d: number) => `${d}-day free trial`,
    readyDesc: (plan: string, d: number) => `All ${plan} features free for ${d} days. No credit card, no automatic charge when it ends.`,
    activate: "Activate Trial",
    activating: "Activating...",
    loginNeeded: "Sign in with this email to continue:",
    loginBtn: "Sign In and Continue",
    registerHint: "Don't have an account?",
    registerBtn: "Sign Up",
    mismatchTitle: "Email mismatch",
    mismatchDesc: "This invitation was sent to a different email. Please sign in with the invited account.",
    noBrandTitle: "Create your business first",
    noBrandDesc: "To start the trial, create your first business in the dashboard; your trial will begin automatically.",
    goDashboard: "Go to Dashboard",
    alreadyActiveTitle: "You already have an active plan",
    alreadyActiveDesc: "Your business already has an active subscription or trial.",
    successTitle: "Your trial has started! 🚀",
    successDesc: "All features are unlocked. Your trial agreement was sent by email.",
    errorTitle: "Something went wrong",
    tryAgain: "Please try again.",
  },
};

type Status = {
  valid: boolean; reason?: string; email?: string; days?: number; planName?: string;
  note?: string | null; expired?: boolean; used?: boolean; loggedIn?: boolean;
  emailMatches?: boolean; hasBrand?: boolean;
};

function Shell({ icon, iconClass, children }: { icon: React.ReactNode; iconClass: string; children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#07070c] px-6">
      <div className="w-full max-w-md rounded-3xl border border-white/[0.08] bg-[#121218] p-8 text-center shadow-2xl">
        <div className={`mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl ${iconClass}`}>{icon}</div>
        {children}
      </div>
    </div>
  );
}

function DenemeInner() {
  const { lang } = useLang();
  const t = L[lang];
  const params = useSearchParams();
  const token = params.get("token") ?? "";

  const [status, setStatus] = useState<Status | null>(null);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState(false);
  const [result, setResult] = useState<"success" | "no_brand" | "already_active" | "error" | null>(null);

  useEffect(() => {
    if (!token) { setStatus({ valid: false, reason: "not_found" }); setLoading(false); return; }
    fetch(`/api/trial/invite?token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((d: Status) => setStatus(d))
      .catch(() => setStatus({ valid: false, reason: "not_found" }))
      .finally(() => setLoading(false));
  }, [token]);

  async function activate() {
    setActivating(true);
    try {
      const res = await fetch("/api/trial/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) { setResult("success"); return; }
      if (data.status === "no_brand") { setResult("no_brand"); return; }
      if (data.status === "already_active") { setResult("already_active"); return; }
      setResult("error");
    } catch {
      setResult("error");
    } finally {
      setActivating(false);
    }
  }

  const heading = (title: string, desc: string) => (
    <>
      <h1 className="text-xl font-bold text-white">{title}</h1>
      <p className="mt-3 text-sm leading-relaxed text-slate-400">{desc}</p>
    </>
  );

  if (loading) {
    return <Shell icon={<Loader2 className="h-8 w-8 animate-spin text-white" />} iconClass="bg-white/10">
      <p className="text-sm text-slate-400">{t.loading}</p>
    </Shell>;
  }

  // Sonuç ekranları
  if (result === "success") {
    return <Shell icon={<CheckCircle2 className="h-8 w-8 text-white" />} iconClass="bg-gradient-to-br from-emerald-500 to-green-600">
      {heading(t.successTitle, t.successDesc)}
      <Link href="/dashboard" className="mt-6 flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-3 text-sm font-semibold text-white transition hover:opacity-90">{t.goDashboard}</Link>
    </Shell>;
  }
  if (result === "no_brand") {
    return <Shell icon={<Gift className="h-8 w-8 text-white" />} iconClass="bg-gradient-to-br from-violet-600 to-indigo-600">
      {heading(t.noBrandTitle, t.noBrandDesc)}
      <Link href="/dashboard" className="mt-6 flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-3 text-sm font-semibold text-white transition hover:opacity-90">{t.goDashboard}</Link>
    </Shell>;
  }
  if (result === "already_active") {
    return <Shell icon={<CheckCircle2 className="h-8 w-8 text-white" />} iconClass="bg-white/10">
      {heading(t.alreadyActiveTitle, t.alreadyActiveDesc)}
      <Link href="/dashboard" className="mt-6 flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-3 text-sm font-semibold text-white transition hover:opacity-90">{t.goDashboard}</Link>
    </Shell>;
  }
  if (result === "error") {
    return <Shell icon={<XCircle className="h-8 w-8 text-white" />} iconClass="bg-red-500/80">
      {heading(t.errorTitle, t.tryAgain)}
      <button onClick={() => setResult(null)} className="mt-6 w-full rounded-xl border border-white/10 py-3 text-sm font-medium text-slate-200 transition hover:bg-white/[0.04]">{t.activate}</button>
    </Shell>;
  }

  // Durum ekranları
  if (!status?.valid) {
    return <Shell icon={<XCircle className="h-8 w-8 text-white" />} iconClass="bg-red-500/80">{heading(t.invalidTitle, t.invalidDesc)}</Shell>;
  }
  if (status.expired) {
    return <Shell icon={<XCircle className="h-8 w-8 text-white" />} iconClass="bg-orange-500/80">{heading(t.expiredTitle, t.expiredDesc)}</Shell>;
  }
  if (status.used) {
    return <Shell icon={<CheckCircle2 className="h-8 w-8 text-white" />} iconClass="bg-white/10">{heading(t.usedTitle, t.usedDesc)}</Shell>;
  }

  const loginUrl = `/giris?callbackUrl=${encodeURIComponent(`/deneme?token=${token}`)}`;

  // Giriş gerekli
  if (!status.loggedIn) {
    return <Shell icon={<Gift className="h-8 w-8 text-white" />} iconClass="bg-gradient-to-br from-violet-600 to-indigo-600">
      {heading(t.readyTitle(status.days ?? 7), t.readyDesc(status.planName ?? "Profesyonel", status.days ?? 7))}
      <div className="mt-5 rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3">
        <p className="text-xs text-slate-500">{t.loginNeeded}</p>
        <p className="mt-1 break-all text-sm font-semibold text-violet-300">{status.email}</p>
      </div>
      <Link href={loginUrl} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-3 text-sm font-semibold text-white transition hover:opacity-90">
        <LogIn className="h-4 w-4" /> {t.loginBtn}
      </Link>
      <p className="mt-4 text-xs text-slate-500">
        {t.registerHint}{" "}
        <Link href={`/kayit?callbackUrl=${encodeURIComponent(`/deneme?token=${token}`)}`} className="font-semibold text-violet-300 hover:underline">{t.registerBtn}</Link>
      </p>
    </Shell>;
  }

  // Giriş var ama e-posta uyuşmuyor
  if (!status.emailMatches) {
    return <Shell icon={<XCircle className="h-8 w-8 text-white" />} iconClass="bg-orange-500/80">
      {heading(t.mismatchTitle, t.mismatchDesc)}
      <div className="mt-5 rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3">
        <p className="mt-1 break-all text-sm font-semibold text-violet-300">{status.email}</p>
      </div>
      <Link href={loginUrl} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-3 text-sm font-semibold text-white transition hover:opacity-90">
        <LogIn className="h-4 w-4" /> {t.loginBtn}
      </Link>
    </Shell>;
  }

  // Hazır — aktive et
  return <Shell icon={<Gift className="h-8 w-8 text-white" />} iconClass="bg-gradient-to-br from-violet-600 to-indigo-600">
    {heading(t.readyTitle(status.days ?? 7), t.readyDesc(status.planName ?? "Profesyonel", status.days ?? 7))}
    {status.note && (
      <div className="mt-4 rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3 text-left">
        <p className="text-sm leading-relaxed text-slate-300">{status.note}</p>
      </div>
    )}
    <button
      onClick={activate}
      disabled={activating}
      className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
    >
      {activating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Gift className="h-4 w-4" />}
      {activating ? t.activating : t.activate}
    </button>
  </Shell>;
}

export default function DenemePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#07070c]" />}>
      <DenemeInner />
    </Suspense>
  );
}
