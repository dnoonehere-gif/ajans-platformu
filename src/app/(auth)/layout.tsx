import type { Metadata } from "next";
import Link from "next/link";
import { LogoMark } from "@/components/logo";

export const metadata: Metadata = { title: "Giriş — Novelya" };

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 px-4 py-10">
      {/* Logo */}
      <Link href="/" className="mb-6 flex flex-col items-center gap-2">
        <LogoMark size={44} />
        <span className="text-lg font-bold tracking-tight text-white">Novelya</span>
      </Link>

      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
