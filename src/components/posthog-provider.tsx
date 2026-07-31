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
if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://eu.i.posthog.com",
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

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return <>{children}</>;
  return (
    <PHProvider client={posthog}>
      <PostHogIdentify />
      {children}
    </PHProvider>
  );
}
