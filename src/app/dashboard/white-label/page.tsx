"use client";
import { useEffect, useState } from "react";
import { useBrand } from "@/components/dashboard/brand-provider";
import { Loader2, Save, Crown, Palette, Globe, Image } from "lucide-react";

interface WhiteLabelData {
  agencyName: string;
  agencyLogoUrl: string;
  agencyFaviconUrl: string;
  customDomain: string;
  primaryColor: string;
  accentColor: string;
  footerText: string;
  hideNovelya: boolean;
  customCss: string;
}

const EMPTY: WhiteLabelData = {
  agencyName: "",
  agencyLogoUrl: "",
  agencyFaviconUrl: "",
  customDomain: "",
  primaryColor: "#6366f1",
  accentColor: "#8b5cf6",
  footerText: "",
  hideNovelya: false,
  customCss: "",
};

export default function WhiteLabelPage() {
  const { activeBrand } = useBrand();
  const [data, setData] = useState<WhiteLabelData>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!activeBrand) return;
    setLoading(true);
    fetch(`/api/white-label?brandId=${activeBrand.id}`)
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) { setError(d.error ?? "Veriler yüklenemedi"); setLoading(false); return; }
        if (d.whiteLabel) {
          setData({
            agencyName: d.whiteLabel.agencyName ?? "",
            agencyLogoUrl: d.whiteLabel.agencyLogoUrl ?? "",
            agencyFaviconUrl: d.whiteLabel.agencyFaviconUrl ?? "",
            customDomain: d.whiteLabel.customDomain ?? "",
            primaryColor: d.whiteLabel.primaryColor ?? "#6366f1",
            accentColor: d.whiteLabel.accentColor ?? "#8b5cf6",
            footerText: d.whiteLabel.footerText ?? "",
            hideNovelya: d.whiteLabel.hideNovelya ?? false,
            customCss: d.whiteLabel.customCss ?? "",
          });
        }
        setError("");
        setLoading(false);
      })
      .catch(() => {
        setError("Sunucuya bağlanılamadı");
        setLoading(false);
      });
  }, [activeBrand?.id]);

  async function handleSave() {
    if (!activeBrand) return;
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const res = await fetch("/api/white-label", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandId: activeBrand.id,
          ...data,
          agencyLogoUrl: data.agencyLogoUrl || null,
          agencyFaviconUrl: data.agencyFaviconUrl || null,
          customDomain: data.customDomain || null,
          footerText: data.footerText || null,
          customCss: data.customCss || null,
        }),
      });
      const result = await res.json();
      if (!res.ok) {
        setError(result.error ?? "Kayıt başarısız");
      } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch {
      setError("Sunucuya bağlanılamadı, lütfen tekrar deneyin");
    }
    setSaving(false);
  }

  const inp = "w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2.5 text-sm outline-none transition focus:border-[hsl(var(--primary))] focus:ring-2 focus:ring-[hsl(var(--primary)/0.2)]";

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-[hsl(var(--muted-foreground))]" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10">
          <Crown className="h-5 w-5 text-amber-500" />
        </div>
        <div>
          <h1 className="text-xl font-bold">White-Label Ayarları</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            Müşterilerinize kendi markanızla site sunun
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-500">
          {error}
        </div>
      )}

      {/* Marka Kimliği */}
      <section className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
        <div className="mb-4 flex items-center gap-2">
          <Image className="h-4 w-4 text-[hsl(var(--primary))]" />
          <h2 className="font-semibold">Marka Kimliği</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[hsl(var(--muted-foreground))]">Ajans Adı</label>
            <input className={inp} placeholder="Ajansınızın adı" value={data.agencyName}
              onChange={(e) => setData((d) => ({ ...d, agencyName: e.target.value }))} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[hsl(var(--muted-foreground))]">Logo URL</label>
            <input className={inp} placeholder="https://..." value={data.agencyLogoUrl}
              onChange={(e) => setData((d) => ({ ...d, agencyLogoUrl: e.target.value }))} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[hsl(var(--muted-foreground))]">Favicon URL</label>
            <input className={inp} placeholder="https://..." value={data.agencyFaviconUrl}
              onChange={(e) => setData((d) => ({ ...d, agencyFaviconUrl: e.target.value }))} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[hsl(var(--muted-foreground))]">Footer Metni</label>
            <input className={inp} placeholder="© 2026 Ajansınız" value={data.footerText}
              onChange={(e) => setData((d) => ({ ...d, footerText: e.target.value }))} />
          </div>
        </div>
      </section>

      {/* Renkler */}
      <section className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
        <div className="mb-4 flex items-center gap-2">
          <Palette className="h-4 w-4 text-[hsl(var(--primary))]" />
          <h2 className="font-semibold">Renkler</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[hsl(var(--muted-foreground))]">Ana Renk</label>
            <div className="flex items-center gap-2">
              <input type="color" className="h-10 w-10 cursor-pointer rounded-lg border border-[hsl(var(--border))]" value={data.primaryColor}
                onChange={(e) => setData((d) => ({ ...d, primaryColor: e.target.value }))} />
              <input className={inp} value={data.primaryColor}
                onChange={(e) => setData((d) => ({ ...d, primaryColor: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[hsl(var(--muted-foreground))]">Vurgu Rengi</label>
            <div className="flex items-center gap-2">
              <input type="color" className="h-10 w-10 cursor-pointer rounded-lg border border-[hsl(var(--border))]" value={data.accentColor}
                onChange={(e) => setData((d) => ({ ...d, accentColor: e.target.value }))} />
              <input className={inp} value={data.accentColor}
                onChange={(e) => setData((d) => ({ ...d, accentColor: e.target.value }))} />
            </div>
          </div>
        </div>
      </section>

      {/* Domain & Gelişmiş */}
      <section className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
        <div className="mb-4 flex items-center gap-2">
          <Globe className="h-4 w-4 text-[hsl(var(--primary))]" />
          <h2 className="font-semibold">Domain & Gelişmiş</h2>
        </div>
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[hsl(var(--muted-foreground))]">Özel Domain</label>
            <input className={inp} placeholder="app.ajansiniz.com" value={data.customDomain}
              onChange={(e) => setData((d) => ({ ...d, customDomain: e.target.value }))} />
            <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">CNAME kaydını novelya.com.tr&apos;ye yönlendirin</p>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[hsl(var(--muted-foreground))]">Özel CSS</label>
            <textarea className={inp + " h-24 resize-none font-mono text-xs"} placeholder=":root { --custom-var: #fff; }" value={data.customCss}
              onChange={(e) => setData((d) => ({ ...d, customCss: e.target.value }))} />
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={data.hideNovelya}
              onChange={(e) => setData((d) => ({ ...d, hideNovelya: e.target.checked }))}
              className="h-4 w-4 rounded border-[hsl(var(--border))] accent-[hsl(var(--primary))]" />
            <span className="text-sm">Novelya markasını gizle (footer &quot;Powered by&quot; kaldır)</span>
          </label>
        </div>
      </section>

      {/* Kaydet */}
      <div className="flex items-center gap-3">
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? "Kaydediliyor..." : "Kaydet"}
        </button>
        {saved && <span className="text-sm text-emerald-500 font-medium">Kaydedildi!</span>}
      </div>
    </div>
  );
}
