"use client";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Monitor } from "lucide-react";

const COLORS = [
  { id: "purple", label: "Mor", hex: "#7c6ff7" },
  { id: "blue",   label: "Mavi", hex: "#3b82f6" },
  { id: "green",  label: "Yeşil", hex: "#22c55e" },
  { id: "orange", label: "Turuncu", hex: "#f97316" },
  { id: "rose",   label: "Pembe", hex: "#e8477a" },
];

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [color, setColor] = useState("purple");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("color-theme") ?? "purple";
    setColor(saved);
    document.documentElement.setAttribute("data-color", saved);
  }, []);

  function applyColor(id: string) {
    setColor(id);
    localStorage.setItem("color-theme", id);
    document.documentElement.setAttribute("data-color", id);
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
        <div className="flex gap-2">
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
    </div>
  );
}
