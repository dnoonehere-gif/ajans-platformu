"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { useBrand } from "./brand-provider";

interface WhiteLabelSettings {
  agencyName: string | null;
  agencyLogoUrl: string | null;
  agencyFaviconUrl: string | null;
  primaryColor: string | null;
  accentColor: string | null;
  footerText: string | null;
  hideNovelya: boolean;
  customCss: string | null;
}

const WLCtx = createContext<WhiteLabelSettings | null>(null);
export const useWhiteLabel = () => useContext(WLCtx);

export function WhiteLabelProvider({ children }: { children: React.ReactNode }) {
  const { activeBrand } = useBrand();
  const [wl, setWl] = useState<WhiteLabelSettings | null>(null);

  useEffect(() => {
    if (!activeBrand) { setWl(null); return; }
    fetch(`/api/white-label?brandId=${activeBrand.id}`)
      .then(async (r) => {
        if (!r.ok) { setWl(null); return; }
        const d = await r.json();
        setWl(d.whiteLabel ?? null);
      })
      .catch(() => setWl(null));
  }, [activeBrand?.id]);

  useEffect(() => {
    if (!wl) return;
    const root = document.documentElement;

    if (wl.primaryColor) {
      root.style.setProperty("--wl-primary", wl.primaryColor);
    } else {
      root.style.removeProperty("--wl-primary");
    }

    if (wl.agencyFaviconUrl) {
      let link = document.querySelector<HTMLLinkElement>("link[rel='icon']");
      if (!link) {
        link = document.createElement("link");
        link.rel = "icon";
        document.head.appendChild(link);
      }
      link.href = wl.agencyFaviconUrl;
    }

    if (wl.agencyName) {
      document.title = `${wl.agencyName} — Dashboard`;
    }

    return () => {
      root.style.removeProperty("--wl-primary");
    };
  }, [wl]);

  return <WLCtx.Provider value={wl}>{children}</WLCtx.Provider>;
}
