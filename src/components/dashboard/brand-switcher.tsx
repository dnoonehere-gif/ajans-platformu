"use client";
import { useState } from "react";
import { ChevronDown, Check, Plus, Building2 } from "lucide-react";
import { useBrand } from "./brand-provider";
import { useLang } from "@/components/language-provider";
import Link from "next/link";

export function BrandSwitcher() {
  const { brands, activeBrand, setActiveBrand } = useBrand();
  const { lang } = useLang();
  const [open, setOpen] = useState(false);

  if (!activeBrand) {
    return (
      <Link
        href="/dashboard/marka-olustur"
        className="flex h-10 w-full items-center gap-2 rounded-xl border border-dashed border-[hsl(var(--border))] px-3 text-sm text-[hsl(var(--muted-foreground))] transition hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--primary))]"
      >
        <Plus className="h-4 w-4" />
        {lang === "en" ? "Create Brand" : "Marka Oluştur"}
      </Link>
    );
  }

  const color = activeBrand.primaryColor ?? "#6366f1";

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--accent)/0.5)] px-3 py-2.5 text-sm transition hover:bg-[hsl(var(--accent))]"
      >
        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs font-black text-white" style={{ background: color }}>
          {activeBrand.name.slice(0, 1).toUpperCase()}
        </div>
        <span className="flex-1 truncate text-left font-semibold">{activeBrand.name}</span>
        <ChevronDown className={`h-3.5 w-3.5 shrink-0 text-[hsl(var(--muted-foreground))] transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-xl">
          {brands.map((b) => (
            <button
              key={b.id}
              onClick={() => { setActiveBrand(b); setOpen(false); }}
              className="flex w-full items-center gap-2.5 px-3 py-2.5 text-sm transition hover:bg-[hsl(var(--accent))]"
            >
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs font-black text-white" style={{ background: b.primaryColor ?? "#6366f1" }}>
                {b.name.slice(0, 1).toUpperCase()}
              </div>
              <span className="flex-1 truncate text-left">{b.name}</span>
              {b.id === activeBrand.id && <Check className="h-3.5 w-3.5 text-[hsl(var(--primary))]" />}
            </button>
          ))}
          <div className="border-t border-[hsl(var(--border))]">
            <Link
              href="/dashboard/marka-olustur"
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-2.5 px-3 py-2.5 text-sm text-[hsl(var(--muted-foreground))] transition hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--foreground))]"
            >
              <Plus className="h-4 w-4" />
              {lang === "en" ? "Add New Brand" : "Yeni Marka Ekle"}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
