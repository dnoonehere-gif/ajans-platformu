"use client";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useLang } from "@/components/language-provider";

const L = {
  tr: { menu: "Menü", open: "Menüyü aç", close: "Menüyü kapat" },
  en: { menu: "Menu", open: "Open menu", close: "Close menu" },
};

export function MobileSidebarToggle({ children }: { children: React.ReactNode }) {
  const { lang } = useLang();
  const sL = L[lang];
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => { setMounted(true); }, []);

  // Rota değişince menüyü kapat
  useEffect(() => { setOpen(false); }, [pathname]);

  // Menü açıkken body scroll kilitle
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      {/* Hamburger butonu — sadece mobilde görünür */}
      <button
        onClick={() => setOpen(true)}
        className="mr-auto flex lg:hidden items-center justify-center rounded-xl p-2 text-[hsl(var(--muted-foreground))] transition hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--foreground))]"
        aria-label={sL.open}
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Portal: backdrop-blur'lu topbar fixed konumlandırmayı bozduğu için body'ye render edilir */}
      {mounted && createPortal(
        <>
          {/* Overlay */}
          {open && (
            <div
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
              onClick={() => setOpen(false)}
            />
          )}

          {/* Slide-in sidebar */}
          <aside
            className={`fixed left-0 top-0 z-50 flex h-[100dvh] w-72 flex-col border-r border-[hsl(var(--border))] bg-[hsl(var(--card))] transition-transform duration-300 ease-in-out lg:hidden ${
              open ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            {/* Kapat butonu */}
            <div className="flex shrink-0 items-center justify-between border-b border-[hsl(var(--border))] px-4 py-3">
              <p className="text-sm font-bold">{sL.menu}</p>
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg p-1.5 text-[hsl(var(--muted-foreground))] transition hover:bg-[hsl(var(--accent))]"
                aria-label={sL.close}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {/* Blok akış: NavClient'ın flex-1'i geçersiz kalır, tek kaydırma alanı */}
            <div className="flex-1 overflow-y-auto pb-[env(safe-area-inset-bottom,16px)]">
              {children}
            </div>
          </aside>
        </>,
        document.body
      )}
    </>
  );
}
