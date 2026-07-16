"use client";
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { dictionaries, type Locale, type Dictionary } from "@/lib/i18n/dictionaries";

interface LangContextValue {
  lang: Locale;
  setLang: (l: Locale) => void;
  t: (key: string) => string;
  dict: Dictionary;
}

const LangContext = createContext<LangContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Locale>("tr");

  useEffect(() => {
    const saved = localStorage.getItem("nv-lang");
    if (saved === "en" || saved === "tr") setLangState(saved);
  }, []);

  const setLang = useCallback((l: Locale) => {
    setLangState(l);
    localStorage.setItem("nv-lang", l);
    document.documentElement.lang = l;
  }, []);

  const dict = dictionaries[lang];

  // "dashboard.title" gibi nokta yollu erişim
  const t = useCallback(
    (key: string): string => {
      const parts = key.split(".");
      let cur: unknown = dictionaries[lang];
      for (const p of parts) {
        if (typeof cur !== "object" || cur === null) return key;
        cur = (cur as Record<string, unknown>)[p];
      }
      return typeof cur === "string" ? cur : key;
    },
    [lang]
  );

  return (
    <LangContext.Provider value={{ lang, setLang, t, dict }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang(): LangContextValue {
  const ctx = useContext(LangContext);
  if (!ctx) {
    // Provider dışında (ör. hata sayfası) — TR sabit fallback
    return {
      lang: "tr",
      setLang: () => {},
      t: (key: string) => {
        const parts = key.split(".");
        let cur: unknown = dictionaries.tr;
        for (const p of parts) {
          if (typeof cur !== "object" || cur === null) return key;
          cur = (cur as Record<string, unknown>)[p];
        }
        return typeof cur === "string" ? cur : key;
      },
      dict: dictionaries.tr,
    };
  }
  return ctx;
}

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { lang, setLang } = useLang();
  return (
    <div className={`flex items-center rounded-xl border border-[hsl(var(--border))] p-0.5 ${compact ? "" : "gap-0.5"}`}>
      {(["tr", "en"] as Locale[]).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          className={`rounded-lg px-2 py-1 text-xs font-semibold uppercase transition ${
            lang === l
              ? "bg-[hsl(var(--primary))] text-white"
              : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
