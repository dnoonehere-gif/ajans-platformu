"use client";
import { ThemeProvider as NextThemes } from "next-themes";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // Koyu/açık tema tercihi sadece dashboard ve admin'de geçerli;
  // herkese açık sayfalar (landing, fiyatlar, site/*) hep açık temada kalır
  const isApp = pathname.startsWith("/dashboard") || pathname.startsWith("/admin");

  return (
    <NextThemes
      attribute="class"
      defaultTheme="light"
      enableSystem
      forcedTheme={isApp ? undefined : "light"}
    >
      {children}
    </NextThemes>
  );
}

// Sadece dashboard layout'unda kullanılır — landing page etkilenmez
export function DashboardColorTheme() {
  useEffect(() => {
    const saved = localStorage.getItem("color-theme") ?? "purple";
    document.documentElement.setAttribute("data-color", saved);
    return () => {
      // Dashboard'dan çıkınca renk temasını kaldır
      document.documentElement.removeAttribute("data-color");
    };
  }, []);
  return null;
}
