import * as Sentry from "@sentry/nextjs";

export const onRequestError = Sentry.captureRequestError;

async function startCronScheduler() {
  if (process.env.NODE_ENV !== "production") return;

  const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL;
  const secret = process.env.CRON_SECRET;
  if (!baseUrl || !secret) return;

  const endpoints = [
    { path: "/api/cron/subscription-check", method: "GET" },
    { path: "/api/cron/trial-check", method: "POST" },
  ];

  const runChecks = async () => {
    for (const ep of endpoints) {
      try {
        await fetch(`${baseUrl}${ep.path}`, {
          method: ep.method,
          headers: { Authorization: `Bearer ${secret}` },
        });
      } catch {}
    }
  };

  // İlk çalıştırma: 60 saniye sonra (server'ın ayağa kalkmasını bekle)
  setTimeout(() => {
    runChecks();
    // Sonra her 24 saatte bir
    setInterval(runChecks, 24 * 60 * 60 * 1000);
  }, 60_000);
}

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { init } = await import("@sentry/nextjs");
    init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      environment: process.env.NODE_ENV,
      tracesSampleRate: process.env.NODE_ENV === "production" ? 0.2 : 1.0,
      enabled: process.env.NODE_ENV === "production",
    });

    startCronScheduler();
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    const { init } = await import("@sentry/nextjs");
    init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      environment: process.env.NODE_ENV,
      tracesSampleRate: 0.1,
      enabled: process.env.NODE_ENV === "production",
    });
  }
}
