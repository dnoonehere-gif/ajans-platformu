"use client";
import { useState, useEffect, useCallback } from "react";
import { useBrand } from "@/components/dashboard/brand-provider";
import {
  Plus, Trash2, Save, Edit2, ChevronDown, ChevronUp,
  Globe, QrCode, Copy, Check, Loader2, Eye, EyeOff,
  UtensilsCrossed, Star, X,
} from "lucide-react";
import QRCode from "qrcode";

interface MenuItem {
  id: string; name: string; description?: string | null; price?: number | null;
  imageUrl?: string | null; isAvailable: boolean; isPopular: boolean; allergens: string[];
}
interface MenuCategory { id: string; name: string; emoji?: string | null; description?: string | null; items: MenuItem[] }
interface Menu {
  id: string; title: string; description?: string | null; currency: string;
  isPublished: boolean; theme: string; categories: MenuCategory[];
}

const THEMES = [
  { id: "modern", label: "Modern" },
  { id: "classic", label: "Klasik" },
  { id: "minimal", label: "Minimal" },
];
const ALLERGENS = ["Gluten", "Süt", "Yumurta", "Fıstık", "Deniz Ürünleri", "Susam", "Soya", "Vegan", "Vejetaryen"];

const inp = "w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.4)] px-3 py-2 text-sm outline-none focus:border-[hsl(var(--primary))] focus:ring-1 focus:ring-[hsl(var(--primary)/0.3)]";

export default function MenuPage() {
  const { activeBrand } = useBrand();
  const brandId = activeBrand?.id ?? "";
  const brandSlug = activeBrand?.slug ?? "";

  const [menu, setMenu] = useState<Menu | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [qrUrl, setQrUrl] = useState("");
  const [copied, setCopied] = useState(false);

  // Kategori formu
  const [catName, setCatName] = useState("");
  const [catEmoji, setCatEmoji] = useState("");
  const [catDesc, setCatDesc] = useState("");
  const [addingCat, setAddingCat] = useState(false);

  // Ürün formu
  const [editingItem, setEditingItem] = useState<{ categoryId: string; item?: MenuItem } | null>(null);
  const [itemForm, setItemForm] = useState({ name: "", description: "", price: "", isPopular: false, allergens: [] as string[] });

  // Açık kategoriler
  const [openCats, setOpenCats] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    if (!brandId) return;
    setLoading(true);
    const res = await fetch(`/api/menu/${brandId}`);
    const d = await res.json();
    setMenu(d.menu);
    if (d.menu) setOpenCats(new Set(d.menu.categories.map((c: MenuCategory) => c.id)));
    setLoading(false);
  }, [brandId]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!brandSlug) return;
    const url = `${window.location.origin}/menu/${brandSlug}`;
    QRCode.toDataURL(url, { width: 256, margin: 2, color: { dark: "#000000", light: "#ffffff" } })
      .then(setQrUrl);
  }, [brandSlug]);

  async function saveSettings(patch: Partial<Menu>) {
    if (!brandId) return;
    setSaving(true);
    const res = await fetch(`/api/menu/${brandId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(patch) });
    const d = await res.json();
    if (d.menu) setMenu(prev => prev ? { ...prev, ...d.menu } : d.menu);
    setSaving(false);
  }

  async function addCategory() {
    if (!catName.trim() || !brandId) return;
    const res = await fetch(`/api/menu/${brandId}/categories`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: catName.trim(), emoji: catEmoji || null, description: catDesc || null }),
    });
    const d = await res.json();
    if (d.category) {
      setMenu(prev => prev ? { ...prev, categories: [...prev.categories, { ...d.category, items: [] }] } : prev);
      setOpenCats(prev => new Set([...prev, d.category.id]));
    }
    setCatName(""); setCatEmoji(""); setCatDesc(""); setAddingCat(false);
  }

  async function deleteCategory(id: string) {
    if (!confirm("Bu kategori ve tüm ürünleri silinecek. Emin misiniz?")) return;
    await fetch(`/api/menu/${brandId}/categories/${id}`, { method: "DELETE" });
    setMenu(prev => prev ? { ...prev, categories: prev.categories.filter(c => c.id !== id) } : prev);
  }

  async function saveItem() {
    if (!editingItem || !itemForm.name.trim()) return;
    const body = {
      categoryId: editingItem.categoryId,
      name: itemForm.name.trim(),
      description: itemForm.description || null,
      price: itemForm.price ? parseFloat(itemForm.price) : null,
      isPopular: itemForm.isPopular,
      allergens: itemForm.allergens,
    };

    if (editingItem.item) {
      const res = await fetch(`/api/menu/${brandId}/items/${editingItem.item.id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
      });
      const d = await res.json();
      if (d.item) setMenu(prev => prev ? {
        ...prev, categories: prev.categories.map(c => c.id === editingItem.categoryId
          ? { ...c, items: c.items.map(i => i.id === d.item.id ? d.item : i) }
          : c),
      } : prev);
    } else {
      const res = await fetch(`/api/menu/${brandId}/items`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
      });
      const d = await res.json();
      if (d.item) setMenu(prev => prev ? {
        ...prev, categories: prev.categories.map(c => c.id === editingItem.categoryId
          ? { ...c, items: [...c.items, d.item] }
          : c),
      } : prev);
    }
    setEditingItem(null);
    setItemForm({ name: "", description: "", price: "", isPopular: false, allergens: [] });
  }

  async function deleteItem(categoryId: string, itemId: string) {
    await fetch(`/api/menu/${brandId}/items/${itemId}`, { method: "DELETE" });
    setMenu(prev => prev ? {
      ...prev, categories: prev.categories.map(c => c.id === categoryId
        ? { ...c, items: c.items.filter(i => i.id !== itemId) }
        : c),
    } : prev);
  }

  function openItemForm(categoryId: string, item?: MenuItem) {
    setEditingItem({ categoryId, item });
    setItemForm({
      name: item?.name ?? "",
      description: item?.description ?? "",
      price: item?.price?.toString() ?? "",
      isPopular: item?.isPopular ?? false,
      allergens: item?.allergens ?? [],
    });
  }

  function copyLink() {
    navigator.clipboard.writeText(`${window.location.origin}/menu/${brandSlug}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (!activeBrand) return (
    <div className="flex h-64 items-center justify-center text-[hsl(var(--muted-foreground))]">Önce bir marka seçin</div>
  );

  const menuUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/menu/${brandSlug}`;

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <UtensilsCrossed className="h-6 w-6 text-[hsl(var(--primary))]" />
            Menü Yöneticisi
          </h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">Dijital menünüzü oluşturun ve yayınlayın</p>
        </div>
        {menu && (
          <button onClick={() => saveSettings({ isPublished: !menu.isPublished })} disabled={saving}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${menu.isPublished ? "bg-green-500/10 text-green-500 hover:bg-green-500/20" : "bg-[hsl(var(--primary))] text-white hover:opacity-90"}`}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : menu.isPublished ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            {menu.isPublished ? "Yayında" : "Yayınla"}
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--primary))]" /></div>
      ) : (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">

          {/* Sol: Menü ayarları + QR */}
          <div className="space-y-5">

            {/* Genel Ayarlar */}
            <div className="glass rounded-2xl p-5 space-y-4">
              <h2 className="font-bold">Menü Ayarları</h2>

              <div>
                <label className="mb-1 block text-xs font-medium text-[hsl(var(--muted-foreground))]">Menü Başlığı</label>
                <input className={inp} defaultValue={menu?.title ?? "Menümüz"} id="menu-title"
                  onBlur={e => saveSettings({ title: e.target.value })} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-[hsl(var(--muted-foreground))]">Açıklama</label>
                <textarea className={`${inp} resize-none`} rows={2} defaultValue={menu?.description ?? ""}
                  onBlur={e => saveSettings({ description: e.target.value || null })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-[hsl(var(--muted-foreground))]">Para Birimi</label>
                  <select className={inp} defaultValue={menu?.currency ?? "₺"}
                    onChange={e => saveSettings({ currency: e.target.value })}>
                    {["₺", "$", "€", "£"].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-[hsl(var(--muted-foreground))]">Tema</label>
                  <select className={inp} defaultValue={menu?.theme ?? "modern"}
                    onChange={e => saveSettings({ theme: e.target.value })}>
                    {THEMES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* QR Kod + Link */}
            <div className="glass rounded-2xl p-5 space-y-4">
              <h2 className="font-bold flex items-center gap-2">
                <QrCode className="h-4 w-4 text-[hsl(var(--primary))]" />
                QR Kod & Link
              </h2>

              {qrUrl && (
                <div className="flex justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={qrUrl} alt="QR Kod" className="h-48 w-48 rounded-xl border border-[hsl(var(--border))]" />
                </div>
              )}

              <div className="flex items-center gap-2 rounded-xl bg-[hsl(var(--muted)/0.5)] px-3 py-2.5">
                <Globe className="h-3.5 w-3.5 shrink-0 text-[hsl(var(--muted-foreground))]" />
                <code className="flex-1 truncate text-xs">{menuUrl}</code>
                <button onClick={copyLink} className="shrink-0 rounded-lg border border-[hsl(var(--border))] px-2 py-1 text-xs transition hover:bg-[hsl(var(--accent))]">
                  {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>

              {qrUrl && (
                <a href={qrUrl} download={`menu-qr-${brandSlug}.png`}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-[hsl(var(--border))] py-2.5 text-sm font-semibold transition hover:bg-[hsl(var(--accent))]">
                  <QrCode className="h-4 w-4" /> QR İndir
                </a>
              )}

              {menu?.isPublished && (
                <a href={menuUrl} target="_blank" rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[hsl(var(--primary))] py-2.5 text-sm font-semibold text-white transition hover:opacity-90">
                  <Eye className="h-4 w-4" /> Menüyü Görüntüle
                </a>
              )}
            </div>
          </div>

          {/* Sağ: Kategoriler ve ürünler */}
          <div className="xl:col-span-2 space-y-4">

            {/* Kategori ekle */}
            {addingCat ? (
              <div className="glass rounded-2xl p-5 space-y-3">
                <h3 className="font-semibold">Yeni Kategori</h3>
                <div className="flex gap-2">
                  <input className={`${inp} w-16`} placeholder="🍕" value={catEmoji} onChange={e => setCatEmoji(e.target.value)} maxLength={2} />
                  <input className={inp} placeholder="Kategori adı (örn: Ana Yemekler)" value={catName} onChange={e => setCatName(e.target.value)} autoFocus />
                </div>
                <input className={inp} placeholder="Açıklama (opsiyonel)" value={catDesc} onChange={e => setCatDesc(e.target.value)} />
                <div className="flex gap-2">
                  <button onClick={addCategory} disabled={!catName.trim()}
                    className="flex items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-4 py-2 text-sm font-semibold text-white disabled:opacity-40">
                    <Save className="h-3.5 w-3.5" /> Kaydet
                  </button>
                  <button onClick={() => setAddingCat(false)} className="rounded-xl border border-[hsl(var(--border))] px-4 py-2 text-sm transition hover:bg-[hsl(var(--accent))]">
                    İptal
                  </button>
                </div>
              </div>
            ) : (
              <button onClick={() => setAddingCat(true)}
                className="glass flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-semibold text-[hsl(var(--primary))] transition hover:bg-[hsl(var(--primary)/0.08)] border-2 border-dashed border-[hsl(var(--primary)/0.3)]">
                <Plus className="h-4 w-4" /> Kategori Ekle
              </button>
            )}

            {/* Kategoriler */}
            {(menu?.categories ?? []).map(cat => (
              <div key={cat.id} className="glass rounded-2xl overflow-hidden">
                {/* Kategori başlık */}
                <div className="flex items-center gap-3 px-5 py-4 border-b border-[hsl(var(--border))]">
                  {cat.emoji && <span className="text-xl">{cat.emoji}</span>}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold">{cat.name}</p>
                    {cat.description && <p className="text-xs text-[hsl(var(--muted-foreground))] truncate">{cat.description}</p>}
                  </div>
                  <span className="text-xs text-[hsl(var(--muted-foreground))]">{cat.items.length} ürün</span>
                  <button onClick={() => setOpenCats(prev => { const n = new Set(prev); n.has(cat.id) ? n.delete(cat.id) : n.add(cat.id); return n; })}
                    className="rounded-lg p-1.5 transition hover:bg-[hsl(var(--accent))]">
                    {openCats.has(cat.id) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                  <button onClick={() => deleteCategory(cat.id)} className="rounded-lg p-1.5 text-red-400 transition hover:bg-red-500/10">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {/* Ürünler */}
                {openCats.has(cat.id) && (
                  <div>
                    {cat.items.map(item => (
                      <div key={item.id} className="flex items-center gap-3 px-5 py-3 border-b border-[hsl(var(--border)/0.5)] last:border-0">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold">{item.name}</p>
                            {item.isPopular && <Star className="h-3 w-3 text-amber-400 fill-amber-400" />}
                            {!item.isAvailable && <span className="text-[10px] text-red-400 font-medium">Mevcut değil</span>}
                          </div>
                          {item.description && <p className="text-xs text-[hsl(var(--muted-foreground))] truncate">{item.description}</p>}
                        </div>
                        {item.price != null && (
                          <span className="shrink-0 text-sm font-bold text-[hsl(var(--primary))]">
                            {menu?.currency}{item.price.toFixed(2)}
                          </span>
                        )}
                        <button onClick={() => openItemForm(cat.id, item)} className="rounded-lg p-1.5 transition hover:bg-[hsl(var(--accent))]">
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => deleteItem(cat.id, item.id)} className="rounded-lg p-1.5 text-red-400 transition hover:bg-red-500/10">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}

                    <button onClick={() => openItemForm(cat.id)}
                      className="flex w-full items-center justify-center gap-2 py-3 text-sm text-[hsl(var(--primary))] transition hover:bg-[hsl(var(--primary)/0.05)]">
                      <Plus className="h-3.5 w-3.5" /> Ürün Ekle
                    </button>
                  </div>
                )}
              </div>
            ))}

            {(!menu || menu.categories.length === 0) && !addingCat && (
              <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                <UtensilsCrossed className="h-12 w-12 text-[hsl(var(--muted-foreground)/0.3)]" />
                <p className="font-semibold">Henüz kategori yok</p>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Başlamak için bir kategori ekleyin (örn: Başlangıçlar, Ana Yemekler, İçecekler)</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Ürün ekleme/düzenleme modalı */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="glass w-full max-w-md rounded-3xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="font-bold">{editingItem.item ? "Ürünü Düzenle" : "Ürün Ekle"}</h3>
              <button onClick={() => setEditingItem(null)} className="rounded-xl p-2 transition hover:bg-[hsl(var(--accent))]">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-[hsl(var(--muted-foreground))]">Ürün Adı *</label>
                <input className={inp} value={itemForm.name} onChange={e => setItemForm(f => ({ ...f, name: e.target.value }))} placeholder="örn: Margherita Pizza" autoFocus />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-[hsl(var(--muted-foreground))]">Açıklama</label>
                <textarea className={`${inp} resize-none`} rows={2} value={itemForm.description}
                  onChange={e => setItemForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="İçerikler, pişirme yöntemi..." />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-[hsl(var(--muted-foreground))]">Fiyat ({menu?.currency ?? "₺"})</label>
                <input className={inp} type="number" step="0.50" min="0" value={itemForm.price}
                  onChange={e => setItemForm(f => ({ ...f, price: e.target.value }))} placeholder="0.00" />
              </div>

              <div>
                <label className="mb-2 block text-xs font-medium text-[hsl(var(--muted-foreground))]">Alerjen / Etiket</label>
                <div className="flex flex-wrap gap-1.5">
                  {ALLERGENS.map(a => (
                    <button key={a} type="button"
                      onClick={() => setItemForm(f => ({ ...f, allergens: f.allergens.includes(a) ? f.allergens.filter(x => x !== a) : [...f.allergens, a] }))}
                      className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${itemForm.allergens.includes(a) ? "bg-[hsl(var(--primary))] text-white" : "bg-[hsl(var(--muted))] hover:bg-[hsl(var(--accent))]"}`}>
                      {a}
                    </button>
                  ))}
                </div>
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <div className={`relative h-5 w-9 rounded-full transition ${itemForm.isPopular ? "bg-[hsl(var(--primary))]" : "bg-[hsl(var(--muted))]"}`}
                  onClick={() => setItemForm(f => ({ ...f, isPopular: !f.isPopular }))}>
                  <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${itemForm.isPopular ? "left-4" : "left-0.5"}`} />
                </div>
                <span className="text-sm">Popüler ürün olarak işaretle</span>
              </label>
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={saveItem} disabled={!itemForm.name.trim()}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[hsl(var(--primary))] py-3 text-sm font-semibold text-white disabled:opacity-40">
                <Save className="h-4 w-4" /> Kaydet
              </button>
              <button onClick={() => setEditingItem(null)}
                className="rounded-xl border border-[hsl(var(--border))] px-5 py-3 text-sm transition hover:bg-[hsl(var(--accent))]">
                İptal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
