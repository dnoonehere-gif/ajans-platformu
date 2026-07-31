"use client";
import { ThemeProvider as NextThemes } from "next-themes";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // Yayınlanan müşteri siteleri (/site/*) marka kimliğini korumalı; onlar
  // açık temada sabit kalır. Diğer tüm sayfalarda (landing dahil) kullanıcı
  // koyu/açık modu seçebilir.
  const isPublishedSite = pathname.startsWith("/site/");

  return (
    <NextThemes
      attribute="class"
      defaultTheme="light"
      enableSystem
      forcedTheme={isPublishedSite ? "light" : undefined}
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
