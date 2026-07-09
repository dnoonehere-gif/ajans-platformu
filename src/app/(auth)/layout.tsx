import type { Metadata } from "next";
import { LogoMark } from "@/components/logo";

export const metadata: Metadata = { title: "Giriş — Novelya" };

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[hsl(var(--background))] px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <LogoMark size={48} className="mx-auto mb-3" />
          <p className="text-xs font-semibold uppercase tracking-widest text-[hsl(var(--muted-foreground))]">
            Novelya
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
