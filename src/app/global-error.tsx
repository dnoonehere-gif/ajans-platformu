"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

/**
 * Kök layout'ta oluşan render hatalarını yakalayan global sınır.
 * Sentry'ye bildirir ve kullanıcıya sade bir kurtarma ekranı gösterir.
 * Buraya düşüldüğünde LanguageProvider erişilebilir olmayabilir, bu yüzden
 * iki dilli metin tarayıcı diline göre statik seçilir.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  const en =
    typeof navigator !== "undefined" && navigator.language.startsWith("en");
  const t = en
    ? {
        title: "Something went wrong",
        desc: "An unexpected error occurred. Please try again.",
        retry: "Try again",
      }
    : {
        title: "Bir şeyler ters gitti",
        desc: "Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.",
        retry: "Tekrar dene",
      };

  return (
    <html lang={en ? "en" : "tr"}>
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0c0a1e",
          color: "#e5e7eb",
          fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif",
        }}
      >
        <div style={{ textAlign: "center", padding: "2rem", maxWidth: 420 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 8px" }}>
            {t.title}
          </h1>
          <p style={{ color: "#9ca3af", margin: "0 0 24px", lineHeight: 1.6 }}>
            {t.desc}
          </p>
          <button
            onClick={() => reset()}
            style={{
              background: "linear-gradient(to right, #7c3aed, #6366f1)",
              color: "#fff",
              border: "none",
              borderRadius: 12,
              padding: "12px 28px",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {t.retry}
          </button>
        </div>
      </body>
    </html>
  );
}
