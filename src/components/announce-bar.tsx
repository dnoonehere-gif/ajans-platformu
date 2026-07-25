"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { X, ArrowRight } from "lucide-react";
import { LogoMark } from "@/components/logo";
import { useLang } from "@/components/language-provider";

/**
 * Herkese açık sayfaların en üstünde duran ince duyuru çubuğu.
 * 7 günlük ücretsiz denemeyi reklam tıklayan ziyaretçiye ilk saniyede gösterir.
 * Dashboard / admin / giriş-kayıt gibi uygulama içi sayfalarda gizlenir.
 * Kapatılınca oturum boyunca (sessionStorage) tekrar gösterilmez.
 */
const L = {
  tr: {
    text: "7 gün ücretsiz — kredi kartı gerekmez.",
    cta: "Hemen Dene",
    close: "Kapat",
  },
  en: {
    text: "7 days free — no credit card required.",
    cta: "Start now",
    close: "Close",
  },
};

// Bu ön eklerle başlayan yollarda çubuk gösterilmez
const HIDDEN_PREFIXES = ["/dashboard", "/admin", "/giris", "/kayit", "/sifremi", "/dogrulama"];

export function AnnounceBar() {
  const { lang } = useLang();
  const s = L[lang];
  const pathname = usePathname();
  const [dismissed, setDismissed] = useState(true); // SSR/hydration'da gizli başla
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setDismissed(sessionStorage.getItem("nv-announce-dismissed") === "1");
  }, []);

  const hidden = dismissed || HIDDEN_PREFIXES.some((p) => pathname.startsWith(p));

  // Sabit konumlu navbar'ların (landing) çubuğun altına inmesi için yükseklik
  // CSS değişkeni olarak yayınlanır. Çubuk yoksa 0.
  useEffect(() => {
    const root = document.documentElement;
    if (hidden) {
      root.style.setProperty("--nv-announce-h", "0px");
      return;
    }
    const h = ref.current?.offsetHeight ?? 0;
    root.style.setProperty("--nv-announce-h", `${h}px`);
    return () => root.style.setProperty("--nv-announce-h", "0px");
  }, [hidden, lang, pathname]);

  if (hidden) return null;

  const dismiss = () => {
    sessionStorage.setItem("nv-announce-dismissed", "1");
    setDismissed(true);
  };

  return (
    <div ref={ref} className="nv-announce relative z-50 overflow-hidden text-white">
      {/* Kayan ışıltı */}
      <span className="nv-announce-shine pointer-events-none absolute inset-0" aria-hidden />
      <div className="relative mx-auto flex max-w-7xl items-center justify-center gap-3 px-10 py-2 text-center text-sm">
        <Link href="/kayit" className="group inline-flex flex-wrap items-center justify-center gap-2 font-medium">
          <LogoMark size={18} className="nv-announce-logo shrink-0" />
          <span>
            <span className="font-semibold">🎁 {s.text}</span>
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-bold backdrop-blur-sm transition group-hover:bg-white/25">
            {s.cta}
            <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
          </span>
        </Link>
      </div>
      <button
        onClick={dismiss}
        aria-label={s.close}
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-white/70 transition hover:bg-white/15 hover:text-white"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
