import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { MotionProvider } from "@/components/motion-provider";
import { PostHogProvider } from "@/components/posthog-provider";
import { SessionProvider } from "next-auth/react";
import { CookieBanner } from "@/components/cookie-banner";
import { LanguageProvider } from "@/components/language-provider";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.novelya.com.tr"),
  title: "Novelya — Yapay Zekâ Destekli Dijital Ajans",
  description: "Türkiye'deki işletmeler için yapay zekâ destekli, çok kiracılı SaaS dijital ajans platformu.",
  openGraph: {
    title: "Novelya — Yapay Zekâ Destekli Dijital Ajans",
    description: "Website, AI chatbot, rezervasyon, CRM ve pazarlama — hepsi tek platformda.",
    url: "https://www.novelya.com.tr",
    siteName: "Novelya",
    locale: "tr_TR",
    type: "website",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Novelya — AI destekli işletme platformu" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Novelya — Yapay Zekâ Destekli Dijital Ajans",
    description: "Website, AI chatbot, rezervasyon, CRM ve pazarlama — hepsi tek platformda.",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        {/* Tema flash'ını önler — React hydration öncesi çalışır */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}`,
          }}
        />
      </head>
      <body>
        <ThemeProvider>
          <SessionProvider>
            <PostHogProvider>
              <MotionProvider>
                <LanguageProvider>
                  {children}
                  <CookieBanner />
                </LanguageProvider>
              </MotionProvider>
            </PostHogProvider>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
