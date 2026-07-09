"use client";
import { useState, useEffect, use } from "react";
import Image from "next/image";
import { Search, Phone, MapPin, Star, Loader2, ChevronRight } from "lucide-react";

interface MenuItem {
  id: string; name: string; description?: string | null;
  price?: number | null; imageUrl?: string | null;
  isPopular: boolean; allergens: string[];
}
interface MenuCategory { id: string; name: string; emoji?: string | null; description?: string | null; items: MenuItem[] }
interface Menu { title: string; description?: string | null; currency: string; theme: string; categories: MenuCategory[] }
interface Brand { name: string; logoUrl?: string | null; primaryColor?: string | null; phone?: string | null; address?: string | null }

export default function PublicMenuPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [brand, setBrand] = useState<Brand | null>(null);
  const [menu, setMenu] = useState<Menu | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/menu/public/${slug}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) setNotFound(true);
        else { setBrand(d.brand); setMenu(d.menu); setActiveCategory(d.menu.categories[0]?.id ?? null); }
      });
  }, [slug]);

  if (notFound) return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-center">
      <div className="text-6xl">🍽️</div>
      <h1 className="text-xl font-bold">Menü bulunamadı</h1>
      <p className="text-gray-500">Bu menü yayında değil veya mevcut değil.</p>
    </div>
  );

  if (!menu || !brand) return (
    <div className="flex min-h-screen items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
    </div>
  );

  const color = brand.primaryColor ?? "#6366f1";
  const filtered = search.trim()
    ? menu.categories.map(c => ({ ...c, items: c.items.filter(i => i.name.toLowerCase().includes(search.toLowerCase()) || i.description?.toLowerCase().includes(search.toLowerCase())) })).filter(c => c.items.length > 0)
    : menu.categories;

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="sticky top-0 z-30" style={{ background: color }}>
        <div className="mx-auto max-w-2xl px-4 py-4">
          <div className="flex items-center gap-3">
            {brand.logoUrl ? (
              <Image src={brand.logoUrl} alt={brand.name} width={44} height={44}
                className="h-11 w-11 rounded-xl object-contain bg-white/20" unoptimized />
            ) : (
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20 text-xl font-black text-white">
                {brand.name.slice(0, 1)}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-black text-white truncate">{brand.name}</h1>
              <p className="text-xs text-white/70">{menu.title}</p>
            </div>
          </div>

          {/* Arama */}
          <div className="mt-3 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Ürün ara..."
              className="w-full rounded-xl bg-white/95 py-2.5 pl-9 pr-4 text-sm text-gray-800 placeholder:text-gray-400 outline-none"
            />
          </div>
        </div>

        {/* Kategori çubuğu */}
        {!search && (
          <div className="overflow-x-auto scrollbar-hide bg-black/10">
            <div className="flex gap-1 px-4 py-2 min-w-max">
              {menu.categories.map(c => (
                <button key={c.id} onClick={() => {
                  setActiveCategory(c.id);
                  document.getElementById(`cat-${c.id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition ${activeCategory === c.id ? "bg-white text-gray-900" : "text-white/80 hover:text-white"}`}
                >
                  {c.emoji && <span>{c.emoji}</span>}
                  {c.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* İçerik */}
      <div className="mx-auto max-w-2xl px-4 py-6 space-y-8">
        {menu.description && (
          <p className="text-center text-sm text-gray-500 italic">{menu.description}</p>
        )}

        {filtered.map(category => (
          <div key={category.id} id={`cat-${category.id}`}>
            <div className="mb-4 flex items-center gap-2">
              {category.emoji && <span className="text-2xl">{category.emoji}</span>}
              <div>
                <h2 className="text-lg font-black text-gray-900">{category.name}</h2>
                {category.description && <p className="text-xs text-gray-400">{category.description}</p>}
              </div>
            </div>

            <div className="space-y-3">
              {category.items.map(item => (
                <div key={item.id} className="flex gap-3 rounded-2xl bg-white p-4 shadow-sm">
                  {item.imageUrl && (
                    <Image src={item.imageUrl} alt={item.name} width={80} height={80}
                      className="h-20 w-20 shrink-0 rounded-xl object-cover" unoptimized />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="font-bold text-gray-900">{item.name}</h3>
                        {item.isPopular && (
                          <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                            <Star className="h-2.5 w-2.5" /> Popüler
                          </span>
                        )}
                      </div>
                      {item.price != null && (
                        <span className="shrink-0 text-base font-black" style={{ color }}>
                          {menu.currency}{item.price.toFixed(2)}
                        </span>
                      )}
                    </div>
                    {item.description && (
                      <p className="mt-1 text-sm text-gray-500 leading-relaxed">{item.description}</p>
                    )}
                    {(item.allergens ?? []).length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {(item.allergens ?? []).map(a => (
                          <span key={a} className="rounded-md bg-red-50 px-1.5 py-0.5 text-[10px] font-medium text-red-600">{a}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="py-16 text-center">
            <div className="text-5xl mb-3">🔍</div>
            <p className="text-gray-500">"{search}" için sonuç bulunamadı.</p>
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-gray-200 pt-6 space-y-2">
          {brand.phone && (
            <a href={`tel:${brand.phone}`} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
              <Phone className="h-4 w-4" /> {brand.phone}
            </a>
          )}
          {brand.address && (
            <div className="flex items-start gap-2 text-sm text-gray-500">
              <MapPin className="h-4 w-4 mt-0.5 shrink-0" /> {brand.address}
            </div>
          )}
          <p className="text-center text-xs text-gray-300 pt-4">Novelya ile güçlendirilmiştir</p>
        </div>
      </div>
    </div>
  );
}
