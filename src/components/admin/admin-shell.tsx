"use client";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { LogoMark } from "@/components/logo";
import { AdminNav } from "@/components/admin/admin-nav";
import { useLang } from "@/components/language-provider";

const L = {
  tr: { open: "Menüyü aç", close: "Menüyü kapat", panel: "Admin Panel" },
  en: { open: "Open menu", close: "Close menu", panel: "Admin Panel" },
};

/**
 * Admin paneli kabuğu. Masaüstünde sabit sidebar, mobilde çekmece.
 * Önceden sidebar her boyutta `fixed w-60` + içerik `ml-60` idi; telefonda
 * ekranın çoğunu kaplayıp içeriği okunamaz hale getiriyordu.
 */
export function AdminShell({ children }: { children: React.ReactNode }) {
  const { lang } = useLang();
  const s = L[lang];
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Rota değişince çekmeceyi kapat
  useEffect(() => { setOpen(false); }, [pathname]);

  // Çekmece açıkken arka planı kilitle
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const brandBlock = (
    <div className="flex h-16 shrink-0 items-center gap-3 border-b border-[hsl(var(--border))] px-5">
      <LogoMark size={32} />
      <div>
        <p className="text-sm font-bold">Novelya</p>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
          {s.panel}
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      {/* Mobil üst bar */}
      <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 lg:hidden">
        <button
          onClick={() => setOpen(true)}
          aria-label={s.open}
          className="rounded-lg p-2 text-[hsl(var(--muted-foreground))] transition hover:bg-[hsl(var(--accent))]"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2">
          <LogoMark size={24} />
          <span className="text-sm font-bold">{s.panel}</span>
        </div>
      </header>

      {/* Mobil çekmece — overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar: masaüstünde sabit, mobilde kayar çekmece */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-[hsl(var(--border))] bg-[hsl(var(--card))] transition-transform duration-300 lg:w-60 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between lg:block">
          {brandBlock}
          <button
            onClick={() => setOpen(false)}
            aria-label={s.close}
            className="mr-3 rounded-lg p-2 text-[hsl(var(--muted-foreground))] transition hover:bg-[hsl(var(--accent))] lg:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <AdminNav />
      </aside>

      {/* İçerik */}
      <main className="min-w-0 lg:ml-60">{children}</main>
    </div>
  );
}
