"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Globe, Sparkles, Loader2, ChevronRight, ChevronLeft, Check, Palette, Phone, Building2, ImageIcon } from "lucide-react";
import Image from "next/image";
import { useBrand } from "@/components/dashboard/brand-provider";

const SECTORS = [
  "Restoran & Kafe",
  "Güzellik & Kuaför",
  "Hukuk Bürosu",
  "Muhasebe & Mali Müşavir",
  "Sağlık & Klinik",
  "Diş Hekimi",
  "Eğitim & Kurs",
  "İnşaat & Tadilat",
  "Gayrimenkul",
  "Otomotiv & Servis",
  "Tekstil & Giyim",
  "E-ticaret",
  "Spor & Fitness",
  "Otel & Konaklama",
  "Teknoloji & Yazılım",
  "Hediyelik & Çiçek",
  "Temizlik Hizmetleri",
  "Diğer",
];

const COLORS = [
  { label: "İndigo", value: "#6366f1" },
  { label: "Mor", value: "#8b5cf6" },
  { label: "Pembe", value: "#ec4899" },
  { label: "Kırmızı", value: "#ef4444" },
  { label: "Turuncu", value: "#f97316" },
  { label: "Sarı", value: "#eab308" },
  { label: "Yeşil", value: "#22c55e" },
  { label: "Teal", value: "#14b8a6" },
  { label: "Mavi", value: "#3b82f6" },
  { label: "Lacivert", value: "#1e3a8a" },
  { label: "Siyah", value: "#111827" },
  { label: "Gri", value: "#6b7280" },
];

const STEPS = [
  { id: 1, label: "Sektör", icon: Building2 },
  { id: 2, label: "Renk", icon: Palette },
  { id: 3, label: "Logo", icon: ImageIcon },
  { id: 4, label: "İletişim", icon: Phone },
];

const inputCls =
  "flex h-11 w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.5)] px-4 text-sm outline-none transition focus:border-[hsl(var(--primary))] focus:ring-2 focus:ring-[hsl(var(--primary)/0.2)] placeholder:text-[hsl(var(--muted-foreground))]";

export default function WebsitePage() {
  const router = useRouter();
  const { activeBrand } = useBrand();

  const [checking, setChecking] = useState(true);
  const [step, setStep] = useState(1);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  // Mevcut website varsa editöre yönlendir
  useEffect(() => {
    if (!activeBrand) { setChecking(false); return; }
    setChecking(true);
    fetch(`/api/website/${activeBrand.id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.website?.id) {
          router.replace(`/dashboard/website/editor/${d.website.id}`);
        } else {
          setChecking(false);
        }
      })
      .catch(() => setChecking(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeBrand?.id, router]);

  const [sector, setSector] = useState("");
  const [customSector, setCustomSector] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#6366f1");
  const [customColor, setCustomColor] = useState("");
  const [phone, setPhone] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const effectiveSector = sector === "Diğer" ? customSector : sector;
  const effectiveColor = customColor || primaryColor;

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  }

  async function uploadLogo(): Promise<void> {
    if (!logoFile || !activeBrand) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", logoFile);
    fd.append("slug", activeBrand.id);
    await fetch("/api/brand/logo", { method: "POST", body: fd });
    setUploading(false);
  }

  async function handleGenerate() {
    if (!activeBrand) return;
    setGenerating(true);
    setError("");

    if (logoFile) await uploadLogo();

    try {
      const res = await fetch("/api/website/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandId: activeBrand.id,
          sector: effectiveSector,
          primaryColor: effectiveColor,
          phone: phone || undefined,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Bir hata oluştu");
        setGenerating(false);
        return;
      }

      router.push(`/dashboard/website/editor/${data.website.id}`);
    } catch {
      setError("Bağlantı hatası");
      setGenerating(false);
    }
  }

  if (!activeBrand || checking) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-[hsl(var(--primary))]" />
      </div>
    );
  }

  if (generating) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 p-8">
        <div className="relative flex h-24 w-24 items-center justify-center">
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-[hsl(var(--primary))]" />
          <Sparkles className="h-8 w-8 text-[hsl(var(--primary))]" />
        </div>
        <div className="text-center">
          <p className="text-xl font-bold">Yapay zekâ sitenizi oluşturuyor</p>
          <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
            <span className="font-semibold text-[hsl(var(--foreground))]">{activeBrand.name}</span> ·{" "}
            {effectiveSector}
          </p>
          <p className="mt-2 text-xs text-[hsl(var(--muted-foreground))]">15–30 saniye sürebilir</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      {/* Başlık */}
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(var(--primary)/0.12)]">
          <Globe className="h-5 w-5 text-[hsl(var(--primary))]" />
        </div>
        <div>
          <h1 className="text-xl font-bold">AI Website Builder</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            {activeBrand.name} · Birkaç adımda kurumsal siteniz hazır
          </p>
        </div>
      </div>

      {/* Step göstergesi */}
      <div className="mb-8 flex items-center gap-2">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex flex-1 items-center gap-2">
            <button
              onClick={() => step > s.id && setStep(s.id)}
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold transition ${
                step === s.id
                  ? "bg-[hsl(var(--primary))] text-white shadow-md"
                  : step > s.id
                  ? "cursor-pointer bg-green-500 text-white"
                  : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]"
              }`}
            >
              {step > s.id ? <Check className="h-4 w-4" /> : s.id}
            </button>
            <span
              className={`hidden text-xs font-medium sm:block ${
                step >= s.id ? "text-[hsl(var(--foreground))]" : "text-[hsl(var(--muted-foreground))]"
              }`}
            >
              {s.label}
            </span>
            {i < STEPS.length - 1 && (
              <div
                className={`h-0.5 flex-1 rounded-full transition-colors ${
                  step > s.id ? "bg-green-500" : "bg-[hsl(var(--border))]"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Sektör */}
      {step === 1 && (
        <div className="glass rounded-3xl p-8">
          <div className="mb-6">
            <h2 className="text-lg font-bold">Sektörünüz nedir?</h2>
            <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
              AI sitenizi sektörünüze özel içerikle oluşturur
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {SECTORS.map((s) => (
              <button
                key={s}
                onClick={() => setSector(s)}
                className={`rounded-xl border px-3 py-3 text-left text-sm font-medium transition ${
                  sector === s
                    ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.08)] text-[hsl(var(--primary))]"
                    : "border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.4)] hover:bg-[hsl(var(--accent))]"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          {sector === "Diğer" && (
            <div className="mt-4">
              <input
                className={inputCls}
                placeholder="Sektörünüzü yazın..."
                value={customSector}
                onChange={(e) => setCustomSector(e.target.value)}
                autoFocus
              />
            </div>
          )}
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => setStep(2)}
              disabled={!sector || (sector === "Diğer" && !customSector.trim())}
              className="flex items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-40"
            >
              İleri <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Renk */}
      {step === 2 && (
        <div className="glass rounded-3xl p-8">
          <div className="mb-6">
            <h2 className="text-lg font-bold">Marka renginiz nedir?</h2>
            <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
              Seçtiğiniz renk sitenizin ana rengini belirler
            </p>
          </div>
          <div className="grid grid-cols-4 gap-3 sm:grid-cols-6">
            {COLORS.map((c) => (
              <button
                key={c.value}
                onClick={() => { setPrimaryColor(c.value); setCustomColor(""); }}
                title={c.label}
                className={`relative h-12 w-full rounded-xl transition hover:scale-105 ${
                  primaryColor === c.value && !customColor
                    ? "ring-2 ring-[hsl(var(--primary))] ring-offset-2 ring-offset-[hsl(var(--background))]"
                    : ""
                }`}
                style={{ backgroundColor: c.value }}
              >
                {primaryColor === c.value && !customColor && (
                  <Check className="absolute inset-0 m-auto h-5 w-5 text-white drop-shadow" />
                )}
              </button>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-3">
            <label className="text-sm font-medium text-[hsl(var(--muted-foreground))]">Özel:</label>
            <input
              type="color"
              value={customColor || primaryColor}
              onChange={(e) => setCustomColor(e.target.value)}
              className="h-10 w-16 cursor-pointer rounded-lg border border-[hsl(var(--border))] bg-transparent p-1"
            />
            {customColor && (
              <span className="rounded-lg bg-[hsl(var(--accent))] px-3 py-1 font-mono text-xs">
                {customColor}
              </span>
            )}
          </div>
          <div className="mt-6 flex justify-between">
            <button
              onClick={() => setStep(1)}
              className="flex items-center gap-2 rounded-xl border border-[hsl(var(--border))] px-5 py-2.5 text-sm transition hover:bg-[hsl(var(--accent))]"
            >
              <ChevronLeft className="h-4 w-4" /> Geri
            </button>
            <button
              onClick={() => setStep(3)}
              className="flex items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
            >
              İleri <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Logo */}
      {step === 3 && (
        <div className="glass rounded-3xl p-8">
          <div className="mb-6">
            <h2 className="text-lg font-bold">Logo (opsiyonel)</h2>
            <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
              Mevcut logonuzu kullanabilir veya yeni bir logo yükleyebilirsiniz
            </p>
          </div>
          <div className="flex flex-col items-center gap-5">
            <div
              className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-[hsl(var(--border))]"
              style={{ backgroundColor: effectiveColor + "20" }}
            >
              {logoPreview ? (
                <Image
                  src={logoPreview}
                  alt="Logo"
                  width={128}
                  height={128}
                  className="h-full w-full object-contain"
                  unoptimized
                />
              ) : (
                <div className="text-center">
                  <ImageIcon className="mx-auto h-8 w-8 text-[hsl(var(--muted-foreground)/0.4)]" />
                  <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">Logo yok</p>
                </div>
              )}
            </div>
            <label className="cursor-pointer rounded-xl border border-[hsl(var(--border))] px-5 py-2.5 text-sm font-medium transition hover:bg-[hsl(var(--accent))]">
              {logoPreview ? "Logoyu Değiştir" : "Logo Yükle"}
              <input type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
            </label>
            {logoPreview && (
              <button
                onClick={() => { setLogoFile(null); setLogoPreview(null); }}
                className="text-xs text-red-400 hover:underline"
              >
                Logoyu kaldır
              </button>
            )}
          </div>
          <div className="mt-6 flex justify-between">
            <button
              onClick={() => setStep(2)}
              className="flex items-center gap-2 rounded-xl border border-[hsl(var(--border))] px-5 py-2.5 text-sm transition hover:bg-[hsl(var(--accent))]"
            >
              <ChevronLeft className="h-4 w-4" /> Geri
            </button>
            <button
              onClick={() => setStep(4)}
              className="flex items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
            >
              İleri <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 4: İletişim + Özet */}
      {step === 4 && (
        <div className="glass rounded-3xl p-8">
          <div className="mb-6">
            <h2 className="text-lg font-bold">İletişim bilgileri</h2>
            <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
              Sitenizde görünmesini istediğiniz telefon numarası
            </p>
          </div>
          <div className="mb-6">
            <label className="mb-1.5 block text-sm font-medium">Telefon</label>
            <input
              className={inputCls}
              placeholder="0212 xxx xx xx"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          {/* Özet */}
          <div className="mb-6 space-y-3 rounded-2xl bg-[hsl(var(--accent)/0.5)] p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
              Özet
            </p>
            {[
              { k: "Marka", v: activeBrand.name },
              { k: "Sektör", v: effectiveSector },
              { k: "Logo", v: logoPreview ? "Var" : "Yok" },
              ...(phone ? [{ k: "Telefon", v: phone }] : []),
            ].map(({ k, v }) => (
              <div key={k} className="flex items-center justify-between text-sm">
                <span className="text-[hsl(var(--muted-foreground))]">{k}</span>
                <span className="font-semibold">{v}</span>
              </div>
            ))}
            <div className="flex items-center justify-between text-sm">
              <span className="text-[hsl(var(--muted-foreground))]">Ana Renk</span>
              <div className="flex items-center gap-2">
                <div
                  className="h-4 w-4 rounded-full border border-[hsl(var(--border))]"
                  style={{ backgroundColor: effectiveColor }}
                />
                <span className="font-mono text-xs">{effectiveColor}</span>
              </div>
            </div>
          </div>

          {error && (
            <p className="mb-4 rounded-xl bg-red-500/10 px-4 py-2.5 text-sm text-red-400">{error}</p>
          )}

          <div className="flex justify-between">
            <button
              onClick={() => setStep(3)}
              className="flex items-center gap-2 rounded-xl border border-[hsl(var(--border))] px-5 py-2.5 text-sm transition hover:bg-[hsl(var(--accent))]"
            >
              <ChevronLeft className="h-4 w-4" /> Geri
            </button>
            <button
              onClick={handleGenerate}
              disabled={uploading}
              className="flex items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
            >
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              AI ile Oluştur
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
