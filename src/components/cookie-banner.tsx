"use client";
import { useState, useEffect } from "react";
import { Cookie, X } from "lucide-react";
import { useLang } from "@/components/language-provider";

const L = {
  tr: {
    title: "Çerez Tercihleri",
    desc: "Deneyiminizi iyileştirmek için çerezler kullanıyoruz. Zorunlu çerezler sitenin çalışması için gereklidir; analitik çerezler ise kullanımı anlamamıza yardımcı olur.",
    essential: "Zorunlu çerezler", alwaysOn: "Her zaman açık",
    analytics: "Analitik çerezler",
    acceptAll: "Tümünü Kabul Et", settings: "Ayarlar", saveChoice: "Seçimi Kaydet", reject: "Reddet",
  },
  en: {
    title: "Cookie Preferences",
    desc: "We use cookies to improve your experience. Essential cookies are required for the site to work; analytics cookies help us understand usage.",
    essential: "Essential cookies", alwaysOn: "Always on",
    analytics: "Analytics cookies",
    acceptAll: "Accept All", settings: "Settings", saveChoice: "Save Choice", reject: "Reject",
  },
};

interface Consent {
  necessary: true;
  analytics: boolean;
  date: string;
}

export function CookieBanner() {
  const { lang } = useLang();
  const sL = L[lang];
  const [visible, setVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [analytics, setAnalytics] = useState(true);

  useEffect(() => {
    if (!localStorage.getItem("nv-cookie-consent")) setVisible(true);
  }, []);

  function save(analyticsAllowed: boolean) {
    const consent: Consent = { necessary: true, analytics: analyticsAllowed, date: new Date().toISOString() };
    localStorage.setItem("nv-cookie-consent", JSON.stringify(consent));
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[100] mx-auto max-w-lg rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-2xl shadow-black/30">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <Cookie className="h-5 w-5 text-[hsl(var(--primary))]" />
          <p className="font-semibold text-sm">{sL.title}</p>
        </div>
        <button onClick={() => save(false)} className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">
          <X className="h-4 w-4" />
        </button>
      </div>

      <p className="mb-4 text-xs leading-relaxed text-[hsl(var(--muted-foreground))]">
        {sL.desc}
      </p>

      {showSettings && (
        <div className="mb-4 space-y-2 rounded-xl bg-[hsl(var(--muted)/0.4)] p-3">
          <label className="flex items-center justify-between text-xs">
            <span className="font-medium">{sL.essential}</span>
            <span className="text-[hsl(var(--muted-foreground))]">{sL.alwaysOn}</span>
          </label>
          <label className="flex cursor-pointer items-center justify-between text-xs">
            <span className="font-medium">{sL.analytics}</span>
            <div
              className={`relative h-5 w-9 rounded-full transition ${analytics ? "bg-[hsl(var(--primary))]" : "bg-[hsl(var(--muted))]"}`}
              onClick={() => setAnalytics(!analytics)}
            >
              <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${analytics ? "left-4" : "left-0.5"}`} />
            </div>
          </label>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => save(true)}
          className="flex-1 rounded-lg bg-[hsl(var(--primary))] px-4 py-2 text-xs font-semibold text-white transition hover:opacity-90"
        >
          {sL.acceptAll}
        </button>
        <button
          onClick={() => (showSettings ? save(analytics) : setShowSettings(true))}
          className="flex-1 rounded-lg border border-[hsl(var(--border))] px-4 py-2 text-xs font-medium transition hover:bg-[hsl(var(--accent))]"
        >
          {showSettings ? sL.saveChoice : sL.settings}
        </button>
        <button
          onClick={() => save(false)}
          className="rounded-lg px-3 py-2 text-xs text-[hsl(var(--muted-foreground))] transition hover:bg-[hsl(var(--accent))]"
        >
          {sL.reject}
        </button>
      </div>
    </div>
  );
}
