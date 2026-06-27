import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

export const metadata: Metadata = {
  title: "Ajans Platformu — Yapay Zekâ Destekli Dijital Ajans",
  description: "Türkiye'deki işletmeler için yapay zekâ destekli, çok kiracılı SaaS dijital ajans platformu.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
