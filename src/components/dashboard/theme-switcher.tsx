"use client";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Monitor, Zap } from "lucide-react";

const COLORS = [
  { id: "purple", label: "Mor", hex: "#7c6ff7" },
  { id: "blue",   label: "Mavi", hex: "#3b82f6" },
  { id: "indigo", label: "İndigo", hex: "#818cf8" },
  { id: "cyan",   label: "Cyan", hex: "#06b6d4" },
  { id: "teal",   label: "Teal", hex: "#14b8a6" },
  { id: "green",  label: "Yeşil", hex: "#22c55e" },
  { id: "amber",  label: "Amber", hex: "#f59e0b" },
  { id: "orange", label: "Turuncu", hex: "#f97316" },
  { id: "red",    label: "Kırmızı", hex: "#ef4444" },
  { id: "rose",   label: "Pembe", hex: "#e8477a" },
];

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [color, setColor] = useState("purple");
  const [mounted, setMounted] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("color-theme") ?? "purple";
    setColor(saved);
    document.documentElement.setAttribute("data-color", saved);

    const savedMotion = localStorage.getItem("reduced-motion") === "true";
    setReducedMotion(savedMotion);
    document.documentElement.setAttribute("data-reduced-motion", String(savedMotion));
  }, []);

  function applyColor(id: string) {
    setColor(id);
    localStorage.setItem("color-theme", id);
    document.documentElement.setAttribute("data-color", id);
  }

  function toggleMotion() {
    const next = !reducedMotion;
    setReducedMotion(next);
    localStorage.setItem("reduced-motion", String(next));
    document.documentElement.setAttribute("data-reduced-motion", String(next));
  }

  if (!mounted) return null;

  return (
    <div className="space-y-3 p-3">
      {/* Karanlık / Aydınlık */}
      <div>
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Görünüm</p>
        <div className="flex gap-1">
          {[
            { v: "light", icon: Sun, label: "Açık" },
            { v: "dark",  icon: Moon, label: "Koyu" },
            { v: "system", icon: Monitor, label: "Sistem" },
          ].map(({ v, icon: Icon, label }) => (
            <button
              key={v}
              onClick={() => setTheme(v)}
              title={label}
              className={`flex flex-1 items-center justify-center gap-1 rounded-lg py-1.5 text-[10px] font-medium transition ${
                theme === v
                  ? "bg-[hsl(var(--primary))] text-white"
                  : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))]"
              }`}
            >
              <Icon className="h-3 w-3" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Renk teması */}
      <div>
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Renk</p>
        <div className="flex flex-wrap gap-2">
          {COLORS.map((c) => (
            <button
              key={c.id}
              onClick={() => applyColor(c.id)}
              title={c.label}
              className={`h-6 w-6 rounded-full transition-all hover:scale-110 ${
                color === c.id ? "ring-2 ring-offset-2 ring-offset-[hsl(var(--background))]" : ""
              }`}
              style={{ backgroundColor: c.hex, ...(color === c.id ? { ringColor: c.hex } : {}) }}
            />
          ))}
        </div>
      </div>

      {/* Animasyon */}
      <div>
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Performans</p>
        <button
          onClick={toggleMotion}
          className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[11px] font-medium transition ${
            reducedMotion
              ? "bg-amber-500/10 text-amber-500"
              : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))]"
          }`}
        >
          <Zap className="h-3.5 w-3.5" />
          <span className="flex-1 text-left">Animasyonları kapat</span>
          <span className={`h-4 w-7 rounded-full transition-colors ${reducedMotion ? "bg-amber-500" : "bg-[hsl(var(--border))]"}`}>
            <span className={`block h-3 w-3 translate-y-0.5 rounded-full bg-white transition-transform ${reducedMotion ? "translate-x-3.5" : "translate-x-0.5"}`} />
          </span>
        </button>
      </div>
    </div>
  );
}
