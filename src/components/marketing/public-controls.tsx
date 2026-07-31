"use client";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useLang } from "@/components/language-provider";

/**
 * Herkese açık sayfalardaki dil + koyu/açık mod kontrolü.
 * Navbar'ı kalabalıklaştırmamak için üst menüden çıkarılıp footer'a alındı;
 * tek bir kapsül içinde toplandı.
 */
export function PublicControls({ className = "" }: { className?: string }) {
  const { lang, setLang } = useLang();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Sunucuda tema bilinmediği için ilk render'da ikon çizilmez (hydration uyumu)
  useEffect(() => setMounted(true), []);

  const isDark = resolvedTheme === "dark";

  return (
    <div
      className={`inline-flex items-center gap-1 rounded-full border border-neutral-900/[0.08] bg-neutral-900/[0.04] p-1 dark:border-white/10 dark:bg-white/[0.06] ${className}`}
    >
      {/* Dil */}
      {(["tr", "en"] as const).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          aria-label={l === "tr" ? "Türkçe" : "English"}
          aria-pressed={lang === l}
          className={`rounded-full px-3 py-1.5 text-xs font-bold uppercase transition ${
            lang === l
              ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
              : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
          }`}
        >
          {l}
        </button>
      ))}

      <span className="mx-0.5 h-4 w-px bg-neutral-900/10 dark:bg-white/15" />

      {/* Koyu / açık mod */}
      <button
        onClick={() => setTheme(isDark ? "light" : "dark")}
        aria-label={isDark ? "Açık moda geç" : "Koyu moda geç"}
        className="flex h-7 w-7 items-center justify-center rounded-full text-neutral-500 transition hover:bg-neutral-900/[0.06] hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-white/10 dark:hover:text-white"
      >
        {mounted && (isDark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />)}
      </button>
    </div>
  );
}
