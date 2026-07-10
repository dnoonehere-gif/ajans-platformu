import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { MotionProvider } from "@/components/motion-provider";
import { PostHogProvider } from "@/components/posthog-provider";
import { SessionProvider } from "next-auth/react";

export const metadata: Metadata = {
  title: "Novelya — Yapay Zekâ Destekli Dijital Ajans",
  description: "Türkiye'deki işletmeler için yapay zekâ destekli, çok kiracılı SaaS dijital ajans platformu.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <SessionProvider>
            <PostHogProvider>
              <MotionProvider>{children}</MotionProvider>
            </PostHogProvider>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
