"use client";
import { ThemeProvider as NextThemes } from "next-themes";
import { useEffect } from "react";

function ColorThemeApplier() {
  useEffect(() => {
    const saved = localStorage.getItem("color-theme") ?? "purple";
    document.documentElement.setAttribute("data-color", saved);
  }, []);
  return null;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemes attribute="class" defaultTheme="light" enableSystem>
      <ColorThemeApplier />
      {children}
    </NextThemes>
  );
}
