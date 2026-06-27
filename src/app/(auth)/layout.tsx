import type { Metadata } from "next";

export const metadata: Metadata = { title: "Giriş — Ajans Platformu" };

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[hsl(var(--background))] px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[hsl(var(--primary))]">
            <span className="text-xl font-black text-white">A</span>
          </div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[hsl(var(--muted-foreground))]">
            Ajans Platformu
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
