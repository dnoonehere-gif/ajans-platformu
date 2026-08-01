import type { Metadata } from "next";
import Link from "next/link";
import { LogoMark } from "@/components/logo";

export const metadata: Metadata = { title: "Giriş — Novelya" };

/**
 * Kimlik doğrulama kabuğu. Referans videodaki dil: sade zemin, ortada yumuşak
 * organik gradyan bulut ve onun üzerinde kompakt, ortalanmış kart.
 * Renkler pazarlama paleti token'larından gelir → koyu mod kendiliğinden çalışır.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--mk-surface)] px-4 py-10">
      {/* Ortadaki gradyan bulut — CSS-only, katmanlı ve yumuşak */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div
          className="nv-auth-glow absolute left-1/2 top-1/2 h-[46rem] w-[46rem] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[70px]"
          style={{
            background:
              "radial-gradient(closest-side, rgba(99,102,241,0.55), rgba(139,92,246,0.32) 45%, transparent 72%)",
          }}
        />
        <div
          className="nv-auth-glow-2 absolute left-[58%] top-[44%] h-[30rem] w-[30rem] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[60px]"
          style={{
            background:
              "radial-gradient(closest-side, rgba(56,189,248,0.42), rgba(99,102,241,0.20) 50%, transparent 74%)",
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-[400px]">
        {/* Logo */}
        <div className="mb-6 text-center">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <LogoMark size={34} />
            <span className="text-base font-bold tracking-tight text-[var(--mk-ink)]">Novelya</span>
          </Link>
        </div>

        {/* Kart */}
        <div className="rounded-2xl border border-[var(--mk-line)] bg-[var(--mk-surface)] p-7 shadow-[0_24px_60px_-24px_rgba(20,20,50,0.35)]">
          {children}
        </div>
      </div>
    </div>
  );
}
