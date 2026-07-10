"use client";
import { ThemeProvider as NextThemes } from "next-themes";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemes attribute="class" defaultTheme="light" enableSystem>
      {children}
    </NextThemes>
  );
}

// Sadece dashboard layout'unda kullanılır — landing page etkilenmez
import { useEffect } from "react";
export function DashboardColorTheme() {
  useEffect(() => {
    const saved = localStorage.getItem("color-theme") ?? "purple";
    document.documentElement.setAttribute("data-color", saved);
  }, []);
  return null;
}
