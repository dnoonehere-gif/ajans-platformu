"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Building2, ImagePlus, MapPin, Phone, Instagram,
  MessageCircle, ChevronRight, ChevronLeft, Check, Loader2,
} from "lucide-react";
import { useLang } from "@/components/language-provider";

const L = {
  tr: {
    genericError: "Hata oluştu",
    title: "Marka Oluştur", stepWord: "Adım",
    s1Title: "İşletmenizin adı nedir?", s1Desc: "Müşterilerinizin sizi tanıdığı isim",
    pageUrl: "Sayfa adresi:",
    sector: "Sektör (opsiyonel)", pick: "Seçin...",
    sectors: ["Restoran & Kafe", "Güzellik & Kuaför", "Sağlık & Klinik", "Eğitim", "Perakende", "Hizmet", "Teknoloji", "Diğer"],
    s2Title: "Logonuzu ekleyin", s2Desc: "PNG veya JPG, en az 200×200px önerilir",
    clickOrDrag: "Tıkla veya sürükle", removeLogo: "Logoyu kaldır",
    optionalNote: "Opsiyonel — daha sonra da ekleyebilirsiniz.",
    s3Title: "Adresiniz nedir?", s3Desc: "Müşterilerinizin sizi bulabileceği yer", addressPh: "Atatürk Cad. No:12, Kadıköy / İstanbul",
    s4Title: "Telefon numaranız?", s4Desc: "Müşterileriniz sizi bu numaradan arayabilir",
    s5Title: "Instagram hesabınız?", s5Desc: "@ olmadan sadece kullanıcı adınızı girin",
    s6Title: "WhatsApp numaranız?", s6Desc: "Ülke kodu dahil girin",
    back: "Geri", next: "Devam Et", create: "Markayı Oluştur", skip: "Bu adımı atla →",
  },
  en: {
    genericError: "Something went wrong",
    title: "Create Brand", stepWord: "Step",
    s1Title: "What is your business called?", s1Desc: "The name your customers know you by",
    pageUrl: "Page address:",
    sector: "Industry (optional)", pick: "Select...",
    sectors: ["Restaurant & Cafe", "Beauty & Salon", "Health & Clinic", "Education", "Retail", "Services", "Technology", "Other"],
    s2Title: "Add your logo", s2Desc: "PNG or JPG, at least 200×200px recommended",
    clickOrDrag: "Click or drag", removeLogo: "Remove logo",
    optionalNote: "Optional — you can add it later.",
    s3Title: "What is your address?", s3Desc: "Where customers can find you", addressPh: "123 Main St, Downtown / New York",
    s4Title: "Your phone number?", s4Desc: "Customers can call you at this number",
    s5Title: "Your Instagram handle?", s5Desc: "Enter your username without the @",
    s6Title: "Your WhatsApp number?", s6Desc: "Include the country code",
    back: "Back", next: "Continue", create: "Create Brand", skip: "Skip this step →",
  },
};

interface FormData {
  name: string;
  slug: string;
  logoFile: File | null;
  logoPreview: string;
  address: string;
  phone: string;
  instagram: string;
  whatsapp: string;
  sector: string;
  description: string;
}

const STEPS = [
  { id: 1, label: "İşletme Adı", icon: Building2 },
  { id: 2, label: "Logo", icon: ImagePlus },
  { id: 3, label: "Adres", icon: MapPin },
  { id: 4, label: "Telefon", icon: Phone },
  { id: 5, label: "Instagram", icon: Instagram },
  { id: 6, label: "WhatsApp", icon: MessageCircle },
];

const inputCls = "flex h-12 w-full rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.4)] px-4 text-sm outline-none transition focus:border-[hsl(var(--primary))] focus:ring-2 focus:ring-[hsl(var(--primary)/0.2)] placeholder:text-[hsl(var(--muted-foreground))]";

export default function MarkaOlusturPage() {
  const { lang } = useLang();
  const sL = L[lang];
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<FormData>({
    name: "", slug: "", logoFile: null, logoPreview: "",
    address: "", phone: "", instagram: "", whatsapp: "",
    sector: "", description: "",
  });

  function set(key: keyof FormData, value: string | File | null) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleNameChange(val: string) {
    const slug = val
      .toLowerCase()
      .replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s")
      .replace(/ı/g, "i").replace(/ö/g, "o").replace(/ç/g, "c")
      .replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    setForm((f) => ({ ...f, name: val, slug }));
  }

  function handleLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    set("logoFile", file);
    const reader = new FileReader();
    reader.onload = (ev) => set("logoPreview", ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  function canNext() {
    if (step === 1) return form.name.trim().length >= 2;
    return true; // diğer adımlar opsiyonel
  }

  async function handleFinish() {
    setLoading(true);
    setError("");

    // Logo varsa önce yükle
    let logoUrl: string | undefined;
    if (form.logoFile) {
      const fd = new FormData();
      fd.append("file", form.logoFile);
      fd.append("slug", form.slug);
      const r = await fetch("/api/brand/logo", { method: "POST", body: fd });
      const d = await r.json();
      if (r.ok) logoUrl = d.url;
    }

    const res = await fetch("/api/brand", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name, slug: form.slug,
        address: form.address || undefined,
        phone: form.phone || undefined,
        instagram: form.instagram || undefined,
        whatsapp: form.whatsapp || undefined,
        sector: form.sector || undefined,
        description: form.description || undefined,
        logoUrl,
      }),
    });

    const data = await res.json();
    if (!res.ok) { setError(data.error ?? sL.genericError); setLoading(false); return; }
    window.location.href = "/dashboard";
  }

  const progress = ((step - 1) / (STEPS.length - 1)) * 100;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[hsl(var(--primary))]">
            <Building2 className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-xl font-bold">{sL.title}</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">{sL.stepWord} {step} / {STEPS.length}</p>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-[hsl(var(--muted))]">
            <div className="h-full rounded-full bg-[hsl(var(--primary))] transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
          <div className="flex justify-between">
            {STEPS.map((s) => (
              <div key={s.id} className="flex flex-col items-center gap-1">
                <div className={`flex h-7 w-7 items-center justify-center rounded-full border-2 transition-all ${
                  step > s.id ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary))]" :
                  step === s.id ? "border-[hsl(var(--primary))] bg-transparent" :
                  "border-[hsl(var(--border))] bg-transparent"
                }`}>
                  {step > s.id
                    ? <Check className="h-3.5 w-3.5 text-white" />
                    : <s.icon className={`h-3 w-3 ${step === s.id ? "text-[hsl(var(--primary))]" : "text-[hsl(var(--muted-foreground))]"}`} />
                  }
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Kart */}
        <div className="glass rounded-3xl p-8">

          {/* Adım 1 — İşletme Adı */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-2xl font-bold">{sL.s1Title}</h2>
                <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">{sL.s1Desc}</p>
              </div>
              <input autoFocus className={inputCls} placeholder="ABC Cafe" value={form.name}
                onChange={(e) => handleNameChange(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && canNext() && setStep(2)} />
              {form.name && (
                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  {sL.pageUrl} <span className="font-mono text-[hsl(var(--primary))]">/{form.slug}</span>
                </p>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[hsl(var(--muted-foreground))]">{sL.sector}</label>
                <select
                  value={form.sector}
                  onChange={(e) => set("sector", e.target.value)}
                  className={`${inputCls} cursor-pointer`}
                >
                  <option value="">{sL.pick}</option>
                  {sL.sectors.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Adım 2 — Logo */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-2xl font-bold">{sL.s2Title}</h2>
                <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">{sL.s2Desc}</p>
              </div>

              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleLogo} />

              <button type="button" onClick={() => fileRef.current?.click()}
                className={`flex h-40 w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed transition ${
                  form.logoPreview ? "border-[hsl(var(--primary))]" : "border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.5)]"
                }`}>
                {form.logoPreview ? (
                  <img src={form.logoPreview} alt="logo" className="h-28 w-28 rounded-xl object-contain" />
                ) : (
                  <>
                    <ImagePlus className="h-8 w-8 text-[hsl(var(--muted-foreground))]" />
                    <span className="text-sm text-[hsl(var(--muted-foreground))]">{sL.clickOrDrag}</span>
                  </>
                )}
              </button>

              {form.logoPreview && (
                <button type="button" onClick={() => { set("logoFile", null); set("logoPreview", ""); }}
                  className="text-xs text-red-400 hover:underline">
                  {sL.removeLogo}
                </button>
              )}

              <p className="text-xs text-[hsl(var(--muted-foreground))]">{sL.optionalNote}</p>
            </div>
          )}

          {/* Adım 3 — Adres */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-2xl font-bold">{sL.s3Title}</h2>
                <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">{sL.s3Desc}</p>
              </div>
              <textarea
                autoFocus
                rows={3}
                className={`${inputCls} h-28 resize-none py-3`}
                placeholder={sL.addressPh}
                value={form.address}
                onChange={(e) => set("address", e.target.value)}
              />
              <p className="text-xs text-[hsl(var(--muted-foreground))]">{sL.optionalNote}</p>
            </div>
          )}

          {/* Adım 4 — Telefon */}
          {step === 4 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-2xl font-bold">{sL.s4Title}</h2>
                <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">{sL.s4Desc}</p>
              </div>
              <input
                autoFocus type="tel" className={inputCls}
                placeholder="0532 123 45 67"
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && setStep(5)}
              />
              <p className="text-xs text-[hsl(var(--muted-foreground))]">{sL.optionalNote}</p>
            </div>
          )}

          {/* Adım 5 — Instagram */}
          {step === 5 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-2xl font-bold">{sL.s5Title}</h2>
                <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">{sL.s5Desc}</p>
              </div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-[hsl(var(--muted-foreground))]">@</span>
                <input
                  autoFocus className={`${inputCls} pl-8`}
                  placeholder="abccafe"
                  value={form.instagram}
                  onChange={(e) => set("instagram", e.target.value.replace("@", ""))}
                  onKeyDown={(e) => e.key === "Enter" && setStep(6)}
                />
              </div>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">{sL.optionalNote}</p>
            </div>
          )}

          {/* Adım 6 — WhatsApp */}
          {step === 6 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-2xl font-bold">{sL.s6Title}</h2>
                <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">{sL.s6Desc}</p>
              </div>
              <input
                autoFocus type="tel" className={inputCls}
                placeholder="+90 532 123 45 67"
                value={form.whatsapp}
                onChange={(e) => set("whatsapp", e.target.value)}
              />
              <p className="text-xs text-[hsl(var(--muted-foreground))]">{sL.optionalNote}</p>

              {error && (
                <p className="rounded-xl bg-red-500/10 px-4 py-2.5 text-sm text-red-400">{error}</p>
              )}
            </div>
          )}

          {/* Navigasyon */}
          <div className="mt-8 flex gap-3">
            {step > 1 && (
              <button onClick={() => setStep((s) => s - 1)}
                className="flex items-center gap-2 rounded-2xl border border-[hsl(var(--border))] px-5 py-3 text-sm font-semibold transition hover:bg-[hsl(var(--accent))]">
                <ChevronLeft className="h-4 w-4" /> {sL.back}
              </button>
            )}

            {step < STEPS.length ? (
              <button
                onClick={() => setStep((s) => s + 1)}
                disabled={!canNext()}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[hsl(var(--primary))] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-40"
              >
                {sL.next} <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={handleFinish}
                disabled={loading}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[hsl(var(--primary))] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                {sL.create}
              </button>
            )}
          </div>

          {/* Adım atla */}
          {step > 1 && step < STEPS.length && (
            <button onClick={() => setStep((s) => s + 1)}
              className="mt-3 w-full text-center text-xs text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition">
              {sL.skip}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
