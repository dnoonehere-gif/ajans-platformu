import type { Metadata } from "next";
import Link from "next/link";
import { LogoMark } from "@/components/logo";
import { AuthPanel } from "@/components/auth-panel";

export const metadata: Metadata = { title: "Giriş — Novelya" };

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen overflow-hidden bg-gradient-to-br from-indigo-700 via-violet-700 to-purple-800">
      {/* Novelya temalı dekoratif arka plan — hafif, CSS-only */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 -top-32 h-[30rem] w-[30rem] rounded-full bg-fuchsia-400/15 blur-3xl" />
        <div className="absolute -bottom-40 -right-24 h-[34rem] w-[34rem] rounded-full bg-indigo-400/20 blur-3xl" />
        <div className="absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 rounded-full bg-violet-300/10 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "28px 28px" }}
        />
      </div>

      {/* Sol panel — marka & özellikler (client, i18n) */}
      <AuthPanel />

      {/* Sağ panel — form kartı */}
      <div className="relative z-10 flex w-full items-center justify-center px-4 py-10 lg:w-1/2">
        <div className="w-full max-w-sm">
          {/* Mobil logo */}
          <div className="mb-6 text-center lg:hidden">
            <Link href="/" className="inline-flex flex-col items-center gap-2">
              <LogoMark size={44} />
              <span className="text-lg font-bold tracking-tight text-white">Novelya</span>
            </Link>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
