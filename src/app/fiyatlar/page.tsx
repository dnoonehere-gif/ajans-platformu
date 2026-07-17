"use client";
import { LogoMark } from "@/components/logo";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Check, Loader2, Zap, Building2, Rocket, Crown } from "lucide-react";
import ElectricBorder from "@/components/reactbits/electric-border";
import { useLang, LanguageSwitcher } from "@/components/language-provider";

const L = {
  tr: {
    login: "Giriş Yap",
    signup: "Ücretsiz Başla",
    badge: "🚀 Türkiye'nin dijital ajans platformu",
    heroT1: "Markanızı büyütün.",
    heroT2: "Her boyuta uygun fiyat.",
    heroDesc: "AI website, chatbot, yorum analizi, içerik üretimi — hepsi tek platformda.",
    monthly: "Aylık",
    yearly: "Yıllık",
    noPlans: "Planlar henüz oluşturulmadı.",
    noPlansSub: "Admin panelinden planları seed edin.",
    popular: "En Popüler",
    perMonth: "ay",
    perYear: "yıl",
    yearlyNote: "2 ay bedava",
    cta: "Ücretsiz Başla",
    unlimited: "Sınırsız",
    brand: "marka",
    teamMember: "takım üyesi",
    aiContent: "AI içerik/ay",
    qrCode: "QR Kod",
    features: {
      website: "AI Website Builder", chatbot: "AI Chatbot", reviews: "Yorum Analizi",
      googleBusiness: "Google Business", seoContent: "SEO İçerik Üretimi", whiteLabel: "White-Label",
      batchContent: "Toplu İçerik Üretimi", clientReporting: "Müşteri Raporlama",
      socialMedia: "Sosyal Medya Yönetimi", apiAccess: "API Erişimi",
    },
    support: { email: "E-posta destek", priority: "Öncelikli e-posta destek" },
    faqTitle: "Sıkça Sorulan Sorular",
    faq: [
      { q: "Abonelik nasıl çalışır?", a: "Plan seçtikten sonra aylık veya yıllık olarak ödeme yaparsınız. İstediğiniz zaman plan değiştirebilirsiniz." },
      { q: "İstediğim zaman iptal edebilir miyim?", a: "Evet, istediğiniz zaman tek tıkla iptal edebilirsiniz. İptal sonrası dönem sonuna kadar kullanmaya devam edersiniz." },
      { q: "Plan yükseltmek/düşürmek nasıl çalışır?", a: "Dashboard'dan istediğiniz zaman plan değişikliği yapabilirsiniz. Kalan süre ücretine orantılı olarak hesaplanır." },
      { q: "Ödeme güvenli mi?", a: "Tüm ödemeler Shopier altyapısı üzerinden SSL ile şifreli olarak işlenir. Kart bilgileriniz sistemimizde saklanmaz." },
      { q: "Fatura alabilir miyim?", a: "Evet, her ödeme sonrası otomatik e-fatura oluşturulur. Dashboard'ın Abonelik bölümünden indirebilirsiniz." },
      { q: "Kurumsal fiyatlandırma var mı?", a: "10'dan fazla marka veya özel entegrasyon ihtiyacınız için iletişime geçin, size özel teklif sunalım." },
    ],
    ctaTitle: "Hemen başlayın",
    ctaDesc: "Markanızı büyütmek için doğru plan sizin için burada.",
    ctaBtn: "Ücretsiz Hesap Oluştur",
  },
  en: {
    login: "Sign In",
    signup: "Start Free",
    badge: "🚀 The digital agency platform",
    heroT1: "Grow your brand.",
    heroT2: "A price for every size.",
    heroDesc: "AI website, chatbot, review analysis, content generation — all in one platform.",
    monthly: "Monthly",
    yearly: "Yearly",
    noPlans: "No plans created yet.",
    noPlansSub: "Seed plans from the admin panel.",
    popular: "Most Popular",
    perMonth: "mo",
    perYear: "yr",
    yearlyNote: "2 months free",
    cta: "Start Free",
    unlimited: "Unlimited",
    brand: "brands",
    teamMember: "team members",
    aiContent: "AI content/mo",
    qrCode: "QR codes",
    features: {
      website: "AI Website Builder", chatbot: "AI Chatbot", reviews: "Review Analysis",
      googleBusiness: "Google Business", seoContent: "SEO Content Generation", whiteLabel: "White-Label",
      batchContent: "Batch Content Generation", clientReporting: "Client Reporting",
      socialMedia: "Social Media Management", apiAccess: "API Access",
    },
    support: { email: "Email support", priority: "Priority email support" },
    faqTitle: "Frequently Asked Questions",
    faq: [
      { q: "How does the subscription work?", a: "After choosing a plan you pay monthly or yearly. You can change plans anytime." },
      { q: "Can I cancel anytime?", a: "Yes, cancel with one click whenever you want. You keep access until the end of the paid period." },
      { q: "How do upgrades/downgrades work?", a: "Change your plan from the dashboard anytime. Remaining time is prorated." },
      { q: "Is payment secure?", a: "All payments are processed over SSL via the Shopier infrastructure. Your card details are never stored on our systems." },
      { q: "Do I get an invoice?", a: "Yes, an invoice is generated automatically after each payment. Download it from the Subscription section." },
      { q: "Is there enterprise pricing?", a: "For 10+ brands or custom integrations, contact us for a tailored offer." },
    ],
    ctaTitle: "Get started now",
    ctaDesc: "The right plan to grow your brand is right here.",
    ctaBtn: "Create Free Account",
  },
};

interface PlanFeatures {
  brands: number;
  teamMembers: number;
  aiContent: number;
  chatbot: boolean;
  reviews: boolean;
  qrCodes: number;
  website: boolean;
  googleBusiness: boolean;
  seoContent: boolean;
  whiteLabel?: boolean;
  batchContent?: boolean;
  clientReporting?: boolean;
  socialMedia?: boolean;
  apiAccess?: boolean;
  support: string;
}

interface Plan {
  id: string;
  name: string;
  slug: string;
  priceCents: number;
  currency: string;
  interval: string;
  trialDays: number;
  features: PlanFeatures;
}

const PLAN_ICONS = [Zap, Rocket, Building2, Crown];
// Plan başına elektrik rengi: mavi / mor (popüler) / turuncu / altın
const PLAN_ELECTRIC = ["#38bdf8", "#8b5cf6", "#fb923c", "#fbbf24"];
const POPULAR_SLUGS = ["profesyonel", "profesyonel-yillik"];

const SUPPORT_LABELS: Record<string, string> = {
  email: "E-posta destek",
  priority: "Öncelikli e-posta destek",
};

function fmt(cents: number) {
  return (cents / 100).toLocaleString("tr-TR", { style: "currency", currency: "TRY", minimumFractionDigits: 0 });
}

function featLine(label: string, value: number | boolean | string, color: string) {
  if (value === false) return null;
  return (
    <li key={label} className="flex items-center gap-2.5 text-sm text-slate-300">
      <Check className="h-4 w-4 shrink-0" style={{ color }} />
      <span>{label}</span>
      {typeof value === "number" && value > 0 && <span className="ml-auto text-xs font-semibold text-slate-500">{value === -1 ? "∞" : value}</span>}
    </li>
  );
}

export default function PricingPage() {
  const { lang } = useLang();
  const sL = L[lang];
  const [allPlans, setAllPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [interval, setInterval] = useState<"month" | "year">("month");

  useEffect(() => {
    fetch("/api/plans")
      .then((r) => r.json())
      .then((d) => { setAllPlans(d.plans ?? []); setLoading(false); });
  }, []);

  const plans = allPlans.filter((p) => p.interval === interval);

  const displayPrice = (p: Plan) => fmt(p.priceCents);

  return (
    <div className="min-h-screen bg-[#07070e] text-white selection:bg-violet-500/40">
      {/* Header */}
      <div className="border-b border-white/[0.06] bg-[#07070e]/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <LogoMark size={32} />
            <span className="font-bold text-white">Novelya</span>
          </Link>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Link href="/giris" className="text-sm text-slate-400 transition hover:text-white">
              {sL.login}
            </Link>
            <Link href="/kayit" className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition hover:opacity-90">
              {sL.signup}
            </Link>
          </div>
        </div>
      </div>

      <div className="relative mx-auto max-w-6xl px-6 py-16">
        {/* Arka ışıma */}
        <div className="pointer-events-none absolute left-1/2 top-0 h-[400px] w-[700px] -translate-x-1/2 rounded-full bg-violet-600/10 blur-[130px]" />

        {/* Hero */}
        <div className="relative mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-400/25 bg-violet-500/10 px-4 py-1.5 text-xs font-semibold text-violet-300">
            {sL.badge}
          </div>
          <h1 className="mb-4 text-4xl font-black tracking-tight text-white lg:text-5xl">
            {sL.heroT1}<br />
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-indigo-400 bg-clip-text text-transparent">{sL.heroT2}</span>
          </h1>
          <p className="mx-auto max-w-xl text-lg text-slate-400">
            {sL.heroDesc}
          </p>

          {/* Interval toggle */}
          <div className="mt-8 inline-flex items-center rounded-xl border border-white/10 bg-white/[0.04] p-1">
            <button
              onClick={() => setInterval("month")}
              className={`rounded-lg px-5 py-2 text-sm font-medium transition ${interval === "month" ? "bg-white/10 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"}`}
            >
              {sL.monthly}
            </button>
            <button
              onClick={() => setInterval("year")}
              className={`relative rounded-lg px-5 py-2 text-sm font-medium transition ${interval === "year" ? "bg-white/10 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"}`}
            >
              {sL.yearly}
              <span className="absolute -top-2 -right-2 rounded-full bg-emerald-500 px-1.5 py-0.5 text-[9px] font-bold text-white">-17%</span>
            </button>
          </div>
        </div>

        {/* Plan kartları */}
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-violet-400" />
          </div>
        ) : plans.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center gap-3 text-center">
            <p className="text-slate-400">{sL.noPlans}</p>
            <p className="text-xs text-slate-500">{sL.noPlansSub}</p>
          </div>
        ) : (
          <div className="relative grid gap-8 md:grid-cols-2 lg:grid-cols-4 md:gap-5">
            {plans.map((plan, i) => {
              const Icon = PLAN_ICONS[i] ?? Zap;
              const electricColor = PLAN_ELECTRIC[i] ?? PLAN_ELECTRIC[0];
              const isPopular = POPULAR_SLUGS.includes(plan.slug);
              const f = plan.features as PlanFeatures;

              const cardInner = (
                <div className={`relative flex h-full flex-col rounded-3xl p-7 ${isPopular ? "bg-gradient-to-b from-[#151129] to-[#0c0a1c]" : "bg-[#0c0c16]"}`}>
                  {isPopular && (
                    <div className="absolute -top-3.5 left-1/2 z-10 -translate-x-1/2">
                      <span className="rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-4 py-1 text-xs font-bold text-white shadow-lg shadow-violet-500/40">
                        {sL.popular}
                      </span>
                    </div>
                  )}

                  {/* Plan başlık */}
                  <div
                    className="mb-5 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10"
                    style={{ background: `linear-gradient(135deg, ${electricColor}30, ${electricColor}10)` }}
                  >
                    <Icon className="h-5 w-5" style={{ color: electricColor }} />
                  </div>
                  <h2 className="text-xl font-bold text-white">{plan.name}</h2>
                  <div className="mt-3 flex items-end gap-1">
                    <p className="text-4xl font-black text-white">{displayPrice(plan)}</p>
                    <p className="mb-1 text-sm text-slate-500">/{interval === "year" ? sL.perYear : sL.perMonth}</p>
                  </div>
                  {interval === "year" && (
                    <p className="mt-1 text-xs text-emerald-400">
                      ≈ {fmt(Math.round(plan.priceCents / 12))}/{sL.perMonth} · {sL.yearlyNote}
                    </p>
                  )}

                  <Link
                    href="/kayit"
                    className={`mt-5 flex w-full items-center justify-center rounded-xl py-2.5 text-sm font-semibold transition hover:opacity-90 ${
                      isPopular
                        ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/30"
                        : "border border-white/10 text-slate-200 hover:bg-white/[0.06]"
                    }`}
                  >
                    {sL.cta}
                  </Link>

                  <hr className="my-5 border-white/[0.07]" />

                  {/* Özellikler */}
                  <ul className="space-y-3">
                    {featLine(`${f.brands === -1 ? sL.unlimited : f.brands} ${sL.brand}`, f.brands, electricColor)}
                    {featLine(`${f.teamMembers === -1 ? sL.unlimited : f.teamMembers} ${sL.teamMember}`, f.teamMembers, electricColor)}
                    {featLine(`${f.aiContent === -1 ? sL.unlimited : f.aiContent} ${sL.aiContent}`, f.aiContent, electricColor)}
                    {f.website && featLine(sL.features.website, true, electricColor)}
                    {f.chatbot && featLine(sL.features.chatbot, true, electricColor)}
                    {f.reviews && featLine(sL.features.reviews, true, electricColor)}
                    {featLine(`${f.qrCodes === -1 ? sL.unlimited : f.qrCodes} ${sL.qrCode}`, f.qrCodes, electricColor)}
                    {f.googleBusiness && featLine(sL.features.googleBusiness, true, electricColor)}
                    {f.seoContent && featLine(sL.features.seoContent, true, electricColor)}
                    {f.whiteLabel && featLine(sL.features.whiteLabel, true, electricColor)}
                    {f.batchContent && featLine(sL.features.batchContent, true, electricColor)}
                    {f.clientReporting && featLine(sL.features.clientReporting, true, electricColor)}
                    {f.socialMedia && featLine(sL.features.socialMedia, true, electricColor)}
                    {f.apiAccess && featLine(sL.features.apiAccess, true, electricColor)}
                    {featLine(sL.support[f.support as keyof typeof sL.support] ?? f.support, true, electricColor)}
                  </ul>
                </div>
              );

              return (
                <ElectricBorder
                  key={plan.id}
                  color={electricColor}
                  speed={isPopular ? 1 : 0.6}
                  chaos={isPopular ? 0.1 : 0.05}
                  style={{ borderRadius: 24 }}
                  className={isPopular ? "md:-translate-y-3" : ""}
                >
                  {cardInner}
                </ElectricBorder>
              );
            })}
          </div>
        )}

        {/* SSS */}
        <div className="relative mt-24">
          <h2 className="mb-8 text-center text-2xl font-bold text-white">{sL.faqTitle}</h2>
          <div className="mx-auto grid max-w-3xl gap-4 md:grid-cols-2">
            {sL.faq.map(({ q, a }) => (
              <div key={q} className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5 transition hover:border-violet-400/20 hover:bg-white/[0.05]">
                <p className="mb-2 text-sm font-semibold text-white">{q}</p>
                <p className="text-sm leading-relaxed text-slate-400">{a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="relative mt-16 rounded-3xl border border-violet-400/20 bg-gradient-to-br from-violet-500/10 to-indigo-500/5 p-12 text-center">
          <h2 className="mb-3 text-2xl font-bold text-white">{sL.ctaTitle}</h2>
          <p className="mb-6 text-slate-400">{sL.ctaDesc}</p>
          <Link href="/kayit"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-8 py-3 font-semibold text-white shadow-[0_0_40px_-8px_rgba(139,92,246,0.6)] transition hover:opacity-90">
            {sL.ctaBtn}
          </Link>
        </div>
      </div>
    </div>
  );
}
