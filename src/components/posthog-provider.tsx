"use client";
import posthog from "posthog-js";
import { PostHogProvider as PHProvider, usePostHog } from "posthog-js/react";
import { useEffect } from "react";
import { useSession } from "next-auth/react";

/**
 * PostHog kurulumu.
 *
 * NOT (önemli): Daha önce `capture_pageview: false` + elle `$pageview` gönderme
 * denendi; $pageleave/scroll/web-vitals gelmesine rağmen $pageview HİÇ ulaşmadı
 * ve PostHog Web Analytics tamamen 0 gösterdi (tüm raporlar $pageview'e dayanır).
 * Artık kütüphanenin kendi SPA desteği kullanılıyor: "history_change" App
 * Router'daki rota değişimlerini de kendisi yakalar. Elle gönderim YAPMAYIN.
 */
/**
 * NOT (2): Anahtar artık `process.env.NEXT_PUBLIC_*` üzerinden OKUNMUYOR.
 * NEXT_PUBLIC_ değişkenleri DERLEME anında gömülür; Railway'de değişken
 * derlemeden sonra eklendiği için kod tamamen ölüydü ve PostHog hiç
 * yüklenmiyordu (window.posthog tanımsız, tek bir istek bile gitmiyordu).
 * Anahtar sunucudan prop olarak geliyor — çalışma anında okunuyor, yani
 * değişken eklendiğinde yeniden derleme gerekmiyor.
 */
let baslatildi = false;

function baslat(apiKey: string, apiHost: string) {
  if (baslatildi || typeof window === "undefined") return;
  baslatildi = true;
  posthog.init(apiKey, {
    api_host: apiHost,
    capture_pageview: "history_change",
    capture_pageleave: true,
    persistence: "localStorage",
    defaults: "2025-05-24",
  });
}

function PostHogIdentify() {
  const { data: session } = useSession();
  const ph = usePostHog();

  useEffect(() => {
    if (!ph) return;
    if (session?.user) {
      const u = session.user as { id?: string; email?: string; name?: string };
      if (u.id) ph.identify(u.id, { email: u.email, name: u.name });
    } else {
      ph.reset();
    }
  }, [session, ph]);

  return null;
}

export function PostHogProvider({
  children,
  apiKey,
  apiHost,
}: {
  children: React.ReactNode;
  apiKey?: string | null;
  apiHost?: string | null;
}) {
  // Anahtar yoksa sessizce geçme — konsola yaz ki bir daha aylarca
  // fark edilmeden kalmasın.
  useEffect(() => {
    if (!apiKey) {
      console.warn("[PostHog] Anahtar yok — POSTHOG_KEY ortam değişkenini tanımlayın.");
      return;
    }
    baslat(apiKey, apiHost || "https://eu.i.posthog.com");
  }, [apiKey, apiHost]);

  if (!apiKey) return <>{children}</>;

  return (
    <PHProvider client={posthog}>
      <PostHogIdentify />
      {children}
    </PHProvider>
  );
}
