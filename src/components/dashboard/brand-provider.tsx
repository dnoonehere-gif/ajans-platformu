"use client";
import { createContext, useContext, useState, useEffect } from "react";

interface Brand { id: string; name: string; slug: string; logoUrl: string | null; primaryColor: string | null; sector: string | null; description: string | null; role: string }
interface BrandCtx { brands: Brand[]; activeBrand: Brand | null; setActiveBrand: (b: Brand) => void }

const Ctx = createContext<BrandCtx>({ brands: [], activeBrand: null, setActiveBrand: () => {} });
export const useBrand = () => useContext(Ctx);

export function BrandProvider({ children }: { children: React.ReactNode }) {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [activeBrand, setActiveBrandState] = useState<Brand | null>(null);

  useEffect(() => {
    fetch("/api/user/brands")
      .then((r) => r.json())
      .then((d) => {
        const list: Brand[] = d.brands ?? [];
        setBrands(list);
        const saved = localStorage.getItem("activeBrandId");
        const found = list.find((b) => b.id === saved) ?? list[0] ?? null;
        setActiveBrandState(found);
      });
  }, []);

  function setActiveBrand(b: Brand) {
    setActiveBrandState(b);
    localStorage.setItem("activeBrandId", b.id);
  }

  return <Ctx.Provider value={{ brands, activeBrand, setActiveBrand }}>{children}</Ctx.Provider>;
}
