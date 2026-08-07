"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Globe, Sparkles, Loader2, ChevronRight, ChevronLeft, Check, Palette, Phone, Building2, ImageIcon, Pencil, ExternalLink, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useBrand } from "@/components/dashboard/brand-provider";
import { DomainRequestButton } from "@/components/website/domain-request-button";
import { useLang } from "@/components/language-provider";
import { PageLoading } from "@/components/ui/page-loading";

const L = {
  tr: {
    libraryTitle: "Web Siteniz",
    published: "Yayında", draft: "Taslak",
    edit: "Düzenle", view: "Siteyi Gör", regenerate: "Yeniden Oluştur", remove: "Kaldır",
    removeConfirm: "Site kalıcı olarak silinecek. Emin misiniz?",
    regenerateNote: "Yeniden oluştur, mevcut sitenin üzerine yazar. İçeriğini kaybetmek istemiyorsan önce Dışa Aktar ile yedek al.",
    steps: ["Sektör", "Renk", "Logo", "İletişim", "Brief"],
    briefTitle: "Son birkaç soru",
    briefSub: "Bunları doldurdukça site sizin işletmenize özel çıkar. Boş bıraktıklarınız için yapay zekâ bilgi uydurmaz.",
    qAudience: "Kimlere hizmet veriyorsunuz?",
    phAudience: "Örn. mahalle sakinleri, 30-50 yaş kadınlar, kurumsal firmalar",
    qServices: "En çok yaptığınız 3-4 iş nedir?",
    phServices: "Örn. saç kesimi, ombre, kaş alımı, gelin başı",
    qGoal: "Site ziyaretçisi ne yapsın?",
    goals: ["Randevu alsın", "Arasın", "Bilgi edinsin", "Satın alsın", "Rezervasyon yapsın"],
    qTone: "Nasıl bir his versin?",
    tones: ["Lüks", "Samimi", "Profesyonel", "Eğlenceli", "Sade"],
    qDiff: "Sizi rakiplerinizden ayıran ne?",
    phDiff: "Örn. 7/24 açığız, tek seansta bitiriyoruz, ithal ürün kullanıyoruz",
    qHours: "Çalışma saatleriniz",
    phHours: "Örn. Hafta içi 09:00-19:00, Pazar kapalı",
    qStats: "Paylaşmak istediğiniz gerçek rakamlar",
    phStats: "Örn. 12 yıldır hizmetteyiz, 3 şube",
    statsNote: "Boş bırakırsanız sitede uydurma rakam yazılmaz.",
    qPhotos: "İşletmeme ait fotoğraflarım var (galeri bölümü eklensin)",
    qPricing: "Fiyatlarımı sitede göstermek istiyorum",
    sectors: ["Restoran & Kafe", "Güzellik & Kuaför", "Hukuk Bürosu", "Muhasebe & Mali Müşavir", "Sağlık & Klinik", "Diş Hekimi", "Eğitim & Kurs", "İnşaat & Tadilat", "Gayrimenkul", "Otomotiv & Servis", "Tekstil & Giyim", "E-ticaret", "Spor & Fitness", "Otel & Konaklama", "Teknoloji & Yazılım", "Hediyelik & Çiçek", "Temizlik Hizmetleri", "Diğer"],
    genericError: "Bir hata oluştu", connFail: "Bağlantı hatası",
    generatingTitle: "Yapay zekâ sitenizi oluşturuyor",
    takesTime: "15–30 saniye sürebilir",
    title: "AI Website Builder",
    subtitle: "Birkaç adımda kurumsal siteniz hazır",
    s1Title: "Sektörünüz nedir?", s1Desc: "AI sitenizi sektörünüze özel içerikle oluşturur",
    customSectorPh: "Sektörünüzü yazın...",
    next: "İleri", back: "Geri",
    s2Title: "Marka renginiz nedir?", s2Desc: "Seçtiğiniz renk sitenizin ana rengini belirler",
    custom: "Özel:",
    s3Title: "Logo (opsiyonel)", s3Desc: "Mevcut logonuzu kullanabilir veya yeni bir logo yükleyebilirsiniz",
    noLogo: "Logo yok", changeLogo: "Logoyu Değiştir", uploadLogo: "Logo Yükle", removeLogo: "Logoyu kaldır",
    s4Title: "İletişim bilgileri", s4Desc: "Sitenizde görünmesini istediğiniz telefon numarası",
    phone: "Telefon",
    summary: "Özet", brand: "Marka", sector: "Sektör", logo: "Logo",
    yes: "Var", no: "Yok", mainColor: "Ana Renk",
    generate: "AI ile Oluştur",
  },
  en: {
    libraryTitle: "Your Website",
    published: "Live", draft: "Draft",
    edit: "Edit", view: "View Site", regenerate: "Regenerate", remove: "Remove",
    removeConfirm: "The site will be permanently deleted. Are you sure?",
    regenerateNote: "Regenerating overwrites the current site. Export a backup first if you want to keep it.",
    steps: ["Industry", "Color", "Logo", "Contact", "Brief"],
    briefTitle: "A few last questions",
    briefSub: "The more you fill in, the more the site fits your business. Anything left blank will not be invented by the AI.",
    qAudience: "Who do you serve?",
    phAudience: "e.g. local residents, women aged 30-50, corporate clients",
    qServices: "Your 3-4 most common jobs?",
    phServices: "e.g. haircut, ombre, brow shaping, bridal styling",
    qGoal: "What should a visitor do?",
    goals: ["Book", "Call", "Learn more", "Buy", "Reserve"],
    qTone: "What feeling should it have?",
    tones: ["Luxury", "Warm", "Professional", "Playful", "Minimal"],
    qDiff: "What sets you apart?",
    phDiff: "e.g. open 24/7, done in one session, imported products",
    qHours: "Opening hours",
    phHours: "e.g. Weekdays 09:00-19:00, closed Sunday",
    qStats: "Real numbers you want to share",
    phStats: "e.g. 12 years in business, 3 branches",
    statsNote: "Leave blank and no made-up numbers will appear.",
    qPhotos: "I have photos of my business (add a gallery)",
    qPricing: "I want to show my prices",
    sectors: ["Restaurant & Cafe", "Beauty & Salon", "Law Firm", "Accounting", "Health & Clinic", "Dentist", "Education & Courses", "Construction & Renovation", "Real Estate", "Automotive & Service", "Textile & Fashion", "E-commerce", "Sports & Fitness", "Hotel & Lodging", "Technology & Software", "Gifts & Flowers", "Cleaning Services", "Other"],
    genericError: "Something went wrong", connFail: "Connection error",
    generatingTitle: "AI is building your website",
    takesTime: "May take 15–30 seconds",
    title: "AI Website Builder",
    subtitle: "Your business website ready in a few steps",
    s1Title: "What is your industry?", s1Desc: "AI builds your site with industry-specific content",
    customSectorPh: "Type your industry...",
    next: "Next", back: "Back",
    s2Title: "What is your brand color?", s2Desc: "The color you pick becomes your site's primary color",
    custom: "Custom:",
    s3Title: "Logo (optional)", s3Desc: "Use your existing logo or upload a new one",
    noLogo: "No logo", changeLogo: "Change Logo", uploadLogo: "Upload Logo", removeLogo: "Remove logo",
    s4Title: "Contact details", s4Desc: "The phone number to display on your site",
    phone: "Phone",
    summary: "Summary", brand: "Brand", sector: "Industry", logo: "Logo",
    yes: "Yes", no: "No", mainColor: "Primary Color",
    generate: "Generate with AI",
  },
};

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

/** Brief seçenekleri — değerler üreticinin beklediği anahtarlarla birebir. */
const GOALS = ["randevu", "arama", "bilgi", "satis", "rezervasyon"] as const;
const TONES = ["luks", "samimi", "profesyonel", "eglenceli", "sade"] as const;

const STEPS = [
  { id: 1, label: "Sektör", icon: Building2 },
  { id: 2, label: "Renk", icon: Palette },
  { id: 3, label: "Logo", icon: ImageIcon },
  { id: 4, label: "İletişim", icon: Phone },
  { id: 5, label: "Brief", icon: Sparkles },
];

const inputCls =
  "flex h-11 w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.5)] px-4 text-sm outline-none transition focus:border-[hsl(var(--primary))] focus:ring-2 focus:ring-[hsl(var(--primary)/0.2)] placeholder:text-[hsl(var(--muted-foreground))]";

export default function WebsitePage() {
  const router = useRouter();
  const { activeBrand } = useBrand();
  const { lang } = useLang();
  const sL = L[lang];

  const [checking, setChecking] = useState(true);
  const [step, setStep] = useState(1);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  // Mevcut site varsa KÜTÜPHANE gösterilir.
  //
  // Önceden burada editöre otomatik yönlendirme vardı; editördeki geri tuşu
  // bu sayfaya dönünce anında editöre geri fırlatılıyor ve "geri dönmüyor"
  // gibi görünüyordu. Artık sitenin üstünde düzenle/gör/kaldır seçenekleri
  // duruyor, sihirbaz yalnızca site yokken veya "yeniden oluştur" denince açılır.
  const [mevcutSite, setMevcutSite] = useState<{ id: string; title: string; isPublished: boolean; subdomain?: string } | null>(null);
  const [yenidenOlustur, setYenidenOlustur] = useState(false);
  const [siliniyor, setSiliniyor] = useState(false);

  useEffect(() => {
    if (!activeBrand) { setChecking(false); return; }
    setChecking(true);
    fetch(`/api/website/${activeBrand.id}`)
      .then((r) => r.json())
      .then((d) => setMevcutSite(d.website ?? null))
      .catch(() => setMevcutSite(null))
      .finally(() => setChecking(false));
  }, [activeBrand?.id]);

  async function siteyiKaldir() {
    if (!activeBrand || !mevcutSite) return;
    if (!confirm(sL.removeConfirm)) return;
    setSiliniyor(true);
    const res = await fetch(`/api/website/${activeBrand.id}`, { method: "DELETE" });
    setSiliniyor(false);
    if (res.ok) { setMevcutSite(null); setYenidenOlustur(false); setStep(1); }
    else setError(sL.genericError);
  }

  const [sector, setSector] = useState("");
  const [customSector, setCustomSector] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#6366f1");
  const [customColor, setCustomColor] = useState("");
  const [phone, setPhone] = useState("");
  // Brief — üretici bunları aldıkça siteyi işletmeye özel kurabiliyor.
  // Boş bırakılanlar isteğe hiç eklenmez ve AI o konuda içerik uydurmaz.
  const [audience, setAudience] = useState("");
  const [topServices, setTopServices] = useState("");
  const [goal, setGoal] = useState("");
  const [tone, setTone] = useState("");
  const [differentiator, setDifferentiator] = useState("");
  const [realStats, setRealStats] = useState("");
  const [hours, setHours] = useState("");
  const [showPricing, setShowPricing] = useState(false);
  const [hasPhotos, setHasPhotos] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const effectiveSector = sector === "Diğer" ? customSector : sector;
  const effectiveColor = customColor || primaryColor;
  // Özet için: seçili sektörün TR değerini görüntü dilindeki etikete çevir (custom sektör aynen kalır)
  const sectorLabel = (() => {
    const idx = SECTORS.indexOf(sector);
    return idx >= 0 ? sL.sectors[idx] : effectiveSector;
  })();

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
          audience: audience || undefined,
          topServices: topServices || undefined,
          goal: goal || undefined,
          tone: tone || undefined,
          differentiator: differentiator || undefined,
          realStats: realStats || undefined,
          hours: hours || undefined,
          showPricing,
          hasPhotos,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? sL.genericError);
        setGenerating(false);
        return;
      }

      router.push(`/dashboard/website/editor/${data.website.id}`);
    } catch {
      setError(sL.connFail);
      setGenerating(false);
    }
  }

  if (!activeBrand || checking) {
    return (
      <PageLoading />
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
          <p className="text-xl font-bold">{sL.generatingTitle}</p>
          <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
            <span className="font-semibold text-[hsl(var(--foreground))]">{activeBrand.name}</span> ·{" "}
            {sectorLabel}
          </p>
          <p className="mt-2 text-xs text-[hsl(var(--muted-foreground))]">{sL.takesTime}</p>
        </div>
      </div>
    );
  }

  // ── Kütüphane: site zaten varsa sihirbaz yerine bu görünür ──────────
  if (mevcutSite && !yenidenOlustur) {
    // Alt alan adı (marka.novelya.com.tr) için wildcard DNS kaydı YOK —
    // adres hiç çözülmüyor (curl: 000). Kırık bağlantı göstermemek için
    // çalışan /site/<slug> yolu kullanılıyor.
    const adres = `https://www.novelya.com.tr/site/${activeBrand.slug ?? mevcutSite.subdomain ?? ""}`;
    return (
      <div className="mx-auto max-w-2xl px-6 py-10">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(var(--primary)/0.12)]">
            <Globe className="h-5 w-5 text-[hsl(var(--primary))]" />
          </div>
          <div>
            <h1 className="text-xl font-bold">{sL.libraryTitle}</h1>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">{activeBrand.name}</p>
          </div>
        </div>

        <div className="glass rounded-3xl p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold">{mevcutSite.title}</h2>
              <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">{adres}</p>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${mevcutSite.isPublished
              ? "bg-green-500/12 text-green-500"
              : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]"}`}>
              {mevcutSite.isPublished ? sL.published : sL.draft}
            </span>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <Link href={`/dashboard/website/editor/${mevcutSite.id}`}
              className="flex items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90">
              <Pencil className="h-4 w-4" /> {sL.edit}
            </Link>
            {mevcutSite.isPublished && (
              <a href={adres} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-xl border border-[hsl(var(--border))] px-5 py-2.5 text-sm transition hover:bg-[hsl(var(--accent))]">
                <ExternalLink className="h-4 w-4" /> {sL.view}
              </a>
            )}
            <button onClick={() => { setYenidenOlustur(true); setStep(1); }}
              className="flex items-center gap-2 rounded-xl border border-[hsl(var(--border))] px-5 py-2.5 text-sm transition hover:bg-[hsl(var(--accent))]">
              <Sparkles className="h-4 w-4" /> {sL.regenerate}
            </button>
            <DomainRequestButton websiteId={mevcutSite.id} />
            <button onClick={siteyiKaldir} disabled={siliniyor}
              className="ml-auto flex items-center gap-2 rounded-xl border border-red-500/30 px-5 py-2.5 text-sm text-red-400 transition hover:bg-red-500/10 disabled:opacity-50">
              {siliniyor ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />} {sL.remove}
            </button>
          </div>
        </div>

        {error && <p className="mt-4 rounded-xl bg-red-500/10 px-4 py-2.5 text-sm text-red-400">{error}</p>}

        <p className="mt-4 text-xs text-[hsl(var(--muted-foreground))]">{sL.regenerateNote}</p>
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
            {activeBrand.name} · {sL.subtitle}
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
              {sL.steps[i]}
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
            <h2 className="text-lg font-bold">{sL.s1Title}</h2>
            <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
              {sL.s1Desc}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {SECTORS.map((s, si) => (
              <button
                key={s}
                onClick={() => setSector(s)}
                className={`rounded-xl border px-3 py-3 text-left text-sm font-medium transition ${
                  sector === s
                    ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.08)] text-[hsl(var(--primary))]"
                    : "border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.4)] hover:bg-[hsl(var(--accent))]"
                }`}
              >
                {sL.sectors[si] ?? s}
              </button>
            ))}
          </div>
          {sector === "Diğer" && (
            <div className="mt-4">
              <input
                className={inputCls}
                placeholder={sL.customSectorPh}
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
              {sL.next} <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Renk */}
      {step === 2 && (
        <div className="glass rounded-3xl p-8">
          <div className="mb-6">
            <h2 className="text-lg font-bold">{sL.s2Title}</h2>
            <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
              {sL.s2Desc}
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
            <label className="text-sm font-medium text-[hsl(var(--muted-foreground))]">{sL.custom}</label>
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
              <ChevronLeft className="h-4 w-4" /> {sL.back}
            </button>
            <button
              onClick={() => setStep(3)}
              className="flex items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
            >
              {sL.next} <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Logo */}
      {step === 3 && (
        <div className="glass rounded-3xl p-8">
          <div className="mb-6">
            <h2 className="text-lg font-bold">{sL.s3Title}</h2>
            <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
              {sL.s3Desc}
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
                  <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">{sL.noLogo}</p>
                </div>
              )}
            </div>
            <label className="cursor-pointer rounded-xl border border-[hsl(var(--border))] px-5 py-2.5 text-sm font-medium transition hover:bg-[hsl(var(--accent))]">
              {logoPreview ? sL.changeLogo : sL.uploadLogo}
              <input type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
            </label>
            {logoPreview && (
              <button
                onClick={() => { setLogoFile(null); setLogoPreview(null); }}
                className="text-xs text-red-400 hover:underline"
              >
                {sL.removeLogo}
              </button>
            )}
          </div>
          <div className="mt-6 flex justify-between">
            <button
              onClick={() => setStep(2)}
              className="flex items-center gap-2 rounded-xl border border-[hsl(var(--border))] px-5 py-2.5 text-sm transition hover:bg-[hsl(var(--accent))]"
            >
              <ChevronLeft className="h-4 w-4" /> {sL.back}
            </button>
            <button
              onClick={() => setStep(4)}
              className="flex items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
            >
              {sL.next} <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 4: İletişim + Özet */}
      {step === 4 && (
        <div className="glass rounded-3xl p-8">
          <div className="mb-6">
            <h2 className="text-lg font-bold">{sL.s4Title}</h2>
            <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
              {sL.s4Desc}
            </p>
          </div>
          <div className="mb-6">
            <label className="mb-1.5 block text-sm font-medium">{sL.phone}</label>
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
              {sL.summary}
            </p>
            {[
              { k: sL.brand, v: activeBrand.name },
              { k: sL.sector, v: sectorLabel },
              { k: sL.logo, v: logoPreview ? sL.yes : sL.no },
              ...(phone ? [{ k: sL.phone, v: phone }] : []),
            ].map(({ k, v }) => (
              <div key={k} className="flex items-center justify-between text-sm">
                <span className="text-[hsl(var(--muted-foreground))]">{k}</span>
                <span className="font-semibold">{v}</span>
              </div>
            ))}
            <div className="flex items-center justify-between text-sm">
              <span className="text-[hsl(var(--muted-foreground))]">{sL.mainColor}</span>
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
              <ChevronLeft className="h-4 w-4" /> {sL.back}
            </button>
            <button
              onClick={() => setStep(5)}
              disabled={uploading}
              className="flex items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
            >
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ChevronRight className="h-4 w-4" />}
              {sL.next}
            </button>
          </div>
        </div>
      )}

      {/* 5 — Brief. Sitenin herkese benzemesini engelleyen adım: üretici
          bu cevapları aldıkça palet, blok seçimi ve metin işletmeye özel
          kuruluyor. Tamamı isteğe bağlı; boş bırakılan alan isteğe hiç
          eklenmiyor ve AI o konuda bilgi UYDURMUYOR. */}
      {step === 5 && (
        <div className="glass rounded-3xl p-6 sm:p-8">
          <h2 className="mb-1 text-lg font-bold">{sL.briefTitle}</h2>
          <p className="mb-6 text-sm text-[hsl(var(--muted-foreground))]">{sL.briefSub}</p>

          <div className="space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-medium">{sL.qAudience}</label>
              <input className={inputCls} value={audience} onChange={(e) => setAudience(e.target.value)} placeholder={sL.phAudience} />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">{sL.qServices}</label>
              <input className={inputCls} value={topServices} onChange={(e) => setTopServices(e.target.value)} placeholder={sL.phServices} />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">{sL.qGoal}</label>
              <div className="flex flex-wrap gap-2">
                {GOALS.map((g, i) => (
                  <button key={g} onClick={() => setGoal(goal === g ? "" : g)}
                    className={`rounded-xl border px-4 py-2 text-sm transition ${goal === g
                      ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.1)] font-semibold text-[hsl(var(--primary))]"
                      : "border-[hsl(var(--border))] hover:bg-[hsl(var(--accent))]"}`}>
                    {sL.goals[i]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">{sL.qTone}</label>
              <div className="flex flex-wrap gap-2">
                {TONES.map((tn, i) => (
                  <button key={tn} onClick={() => setTone(tone === tn ? "" : tn)}
                    className={`rounded-xl border px-4 py-2 text-sm transition ${tone === tn
                      ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.1)] font-semibold text-[hsl(var(--primary))]"
                      : "border-[hsl(var(--border))] hover:bg-[hsl(var(--accent))]"}`}>
                    {sL.tones[i]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">{sL.qDiff}</label>
              <input className={inputCls} value={differentiator} onChange={(e) => setDifferentiator(e.target.value)} placeholder={sL.phDiff} />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">{sL.qHours}</label>
              <input className={inputCls} value={hours} onChange={(e) => setHours(e.target.value)} placeholder={sL.phHours} />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">{sL.qStats}</label>
              <input className={inputCls} value={realStats} onChange={(e) => setRealStats(e.target.value)} placeholder={sL.phStats} />
              <p className="mt-1.5 text-xs text-[hsl(var(--muted-foreground))]">{sL.statsNote}</p>
            </div>

            <div className="space-y-3 rounded-2xl border border-[hsl(var(--border))] p-4">
              <label className="flex cursor-pointer items-center gap-3 text-sm">
                <input type="checkbox" checked={hasPhotos} onChange={(e) => setHasPhotos(e.target.checked)} className="h-4 w-4 accent-[hsl(var(--primary))]" />
                {sL.qPhotos}
              </label>
              <label className="flex cursor-pointer items-center gap-3 text-sm">
                <input type="checkbox" checked={showPricing} onChange={(e) => setShowPricing(e.target.checked)} className="h-4 w-4 accent-[hsl(var(--primary))]" />
                {sL.qPricing}
              </label>
            </div>
          </div>

          {error && <p className="mb-4 mt-5 rounded-xl bg-red-500/10 px-4 py-2.5 text-sm text-red-400">{error}</p>}

          <div className="mt-6 flex justify-between">
            <button onClick={() => setStep(4)}
              className="flex items-center gap-2 rounded-xl border border-[hsl(var(--border))] px-5 py-2.5 text-sm transition hover:bg-[hsl(var(--accent))]">
              <ChevronLeft className="h-4 w-4" /> {sL.back}
            </button>
            <button onClick={handleGenerate} disabled={generating || uploading}
              className="flex items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50">
              {generating || uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {sL.generate}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
