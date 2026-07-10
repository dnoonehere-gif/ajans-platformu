"use client";
import { LogoMark } from "@/components/logo";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Check, Loader2, Zap, Building2, Rocket } from "lucide-react";

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

const PLAN_ICONS = [Zap, Rocket, Building2];
const PLAN_COLORS = ["from-blue-500 to-indigo-600", "from-violet-500 to-purple-600", "from-orange-500 to-rose-500"];
const POPULAR_SLUGS = ["profesyonel", "profesyonel-yillik"];

const SUPPORT_LABELS: Record<string, string> = {
  email: "E-posta destek",
  priority: "Öncelikli destek",
  dedicated: "Dedike hesap yöneticisi",
};

function fmt(cents: number) {
  return (cents / 100).toLocaleString("tr-TR", { style: "currency", currency: "TRY", minimumFractionDigits: 0 });
}

function featLine(label: string, value: number | boolean | string, color: string) {
  if (value === false) return null;
  return (
    <li key={label} className="flex items-center gap-2.5 text-sm">
      <Check className={`h-4 w-4 shrink-0`} style={{ color }} />
      <span>{label}</span>
      {typeof value === "number" && value > 0 && <span className="ml-auto text-xs font-semibold opacity-70">{value === -1 ? "Sınırsız" : value}</span>}
    </li>
  );
}

export default function PricingPage() {
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
    <div className="min-h-screen bg-[hsl(var(--background))]">
      {/* Header */}
      <div className="border-b border-[hsl(var(--border))]">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <LogoMark size={32} />
            <span className="font-bold">Novelya</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/giris" className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition">
              Giriş Yap
            </Link>
            <Link href="/kayit" className="rounded-xl bg-[hsl(var(--primary))] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90">
              Ücretsiz Başla
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-16">
        {/* Hero */}
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.5)] px-4 py-1.5 text-xs font-semibold">
            🚀 Türkiye'nin dijital ajans platformu
          </div>
          <h1 className="mb-4 text-4xl font-black tracking-tight lg:text-5xl">
            Markanızı büyütün.<br />
            <span className="bg-gradient-to-r from-violet-500 to-indigo-600 bg-clip-text text-transparent">Her boyuta uygun fiyat.</span>
          </h1>
          <p className="mx-auto max-w-xl text-lg text-[hsl(var(--muted-foreground))]">
            AI website, chatbot, yorum analizi, içerik üretimi — hepsi tek platformda.
          </p>

          {/* Interval toggle */}
          <div className="mt-8 inline-flex items-center rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.5)] p-1">
            <button
              onClick={() => setInterval("month")}
              className={`rounded-lg px-5 py-2 text-sm font-medium transition ${interval === "month" ? "bg-[hsl(var(--background))] shadow-sm" : "text-[hsl(var(--muted-foreground))]"}`}
            >
              Aylık
            </button>
            <button
              onClick={() => setInterval("year")}
              className={`relative rounded-lg px-5 py-2 text-sm font-medium transition ${interval === "year" ? "bg-[hsl(var(--background))] shadow-sm" : "text-[hsl(var(--muted-foreground))]"}`}
            >
              Yıllık
              <span className="absolute -top-2 -right-2 rounded-full bg-green-500 px-1.5 py-0.5 text-[9px] font-bold text-white">-17%</span>
            </button>
          </div>
        </div>

        {/* Plan kartları */}
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--primary))]" />
          </div>
        ) : plans.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center gap-3 text-center">
            <p className="text-[hsl(var(--muted-foreground))]">Planlar henüz oluşturulmadı.</p>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">Admin panelinden planları seed edin.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {plans.map((plan, i) => {
              const Icon = PLAN_ICONS[i] ?? Zap;
              const gradient = PLAN_COLORS[i] ?? PLAN_COLORS[0];
              const isPopular = POPULAR_SLUGS.includes(plan.slug);
              const f = plan.features as PlanFeatures;

              return (
                <div
                  key={plan.id}
                  className={`relative flex flex-col rounded-3xl border transition ${
                    isPopular
                      ? "border-violet-500/50 bg-gradient-to-b from-violet-500/5 to-transparent shadow-lg shadow-violet-500/10"
                      : "border-[hsl(var(--border))]"
                  }`}
                >
                  {isPopular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                      <span className="rounded-full bg-gradient-to-r from-violet-500 to-purple-600 px-4 py-1 text-xs font-bold text-white shadow">
                        En Popüler
                      </span>
                    </div>
                  )}

                  <div className="p-7">
                    {/* Plan başlık */}
                    <div className={`mb-5 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${gradient}`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <h2 className="text-xl font-bold">{plan.name}</h2>
                    <div className="mt-3 flex items-end gap-1">
                      <p className="text-4xl font-black">{displayPrice(plan)}</p>
                      <p className="mb-1 text-sm text-[hsl(var(--muted-foreground))]">/{interval === "year" ? "yıl" : "ay"}</p>
                    </div>
                    {interval === "year" && (
                      <p className="mt-1 text-xs text-green-500">
                        ≈ {fmt(Math.round(plan.priceCents / 12))}/ay · 2 ay bedava
                      </p>
                    )}

                    <Link
                      href="/kayit"
                      className={`mt-5 flex w-full items-center justify-center rounded-xl py-2.5 text-sm font-semibold transition hover:opacity-90 ${
                        isPopular
                          ? "bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/30"
                          : "border border-[hsl(var(--border))] hover:bg-[hsl(var(--accent))]"
                      }`}
                    >
                      Ücretsiz Başla
                    </Link>

                    <hr className="my-5 border-[hsl(var(--border))]" />

                    {/* Özellikler */}
                    <ul className="space-y-3">
                      {featLine(`${f.brands === -1 ? "Sınırsız" : f.brands} marka`, f.brands, isPopular ? "#8b5cf6" : "#6366f1")}
                      {featLine(`${f.teamMembers === -1 ? "Sınırsız" : f.teamMembers} takım üyesi`, f.teamMembers, isPopular ? "#8b5cf6" : "#6366f1")}
                      {featLine(`${f.aiContent === -1 ? "Sınırsız" : f.aiContent} AI içerik/ay`, f.aiContent, isPopular ? "#8b5cf6" : "#6366f1")}
                      {f.website && featLine("AI Website Builder", true, isPopular ? "#8b5cf6" : "#6366f1")}
                      {f.chatbot && featLine("AI Chatbot", true, isPopular ? "#8b5cf6" : "#6366f1")}
                      {f.reviews && featLine("Yorum Analizi", true, isPopular ? "#8b5cf6" : "#6366f1")}
                      {featLine(`${f.qrCodes === -1 ? "Sınırsız" : f.qrCodes} QR Kod`, f.qrCodes, isPopular ? "#8b5cf6" : "#6366f1")}
                      {f.googleBusiness && featLine("Google Business", true, isPopular ? "#8b5cf6" : "#6366f1")}
                      {f.seoContent && featLine("SEO İçerik Üretimi", true, isPopular ? "#8b5cf6" : "#6366f1")}
                      {featLine(SUPPORT_LABELS[f.support] ?? f.support, true, isPopular ? "#8b5cf6" : "#6366f1")}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* SSS */}
        <div className="mt-20">
          <h2 className="mb-8 text-center text-2xl font-bold">Sıkça Sorulan Sorular</h2>
          <div className="mx-auto grid max-w-3xl gap-4 md:grid-cols-2">
            {[
              { q: "Abonelik nasıl çalışır?", a: "Plan seçtikten sonra aylık veya yıllık olarak ödeme yaparsınız. İstediğiniz zaman plan değiştirebilirsiniz." },
              { q: "İstediğim zaman iptal edebilir miyim?", a: "Evet, istediğiniz zaman tek tıkla iptal edebilirsiniz. İptal sonrası dönem sonuna kadar kullanmaya devam edersiniz." },
              { q: "Plan yükseltmek/düşürmek nasıl çalışır?", a: "Dashboard'dan istediğiniz zaman plan değişikliği yapabilirsiniz. Kalan süre ücretine orantılı olarak hesaplanır." },
              { q: "Ödeme güvenli mi?", a: "Tüm ödemeler PayTR altyapısı üzerinden SSL ile şifreli olarak işlenir. Kart bilgileriniz sistemimizde saklanmaz." },
              { q: "Fatura alabilir miyim?", a: "Evet, her ödeme sonrası otomatik e-fatura oluşturulur. Dashboard'ın Abonelik bölümünden indirebilirsiniz." },
              { q: "Kurumsal fiyatlandırma var mı?", a: "10'dan fazla marka veya özel entegrasyon ihtiyacınız için iletişime geçin, size özel teklif sunalım." },
            ].map(({ q, a }) => (
              <div key={q} className="glass rounded-2xl p-5">
                <p className="mb-2 text-sm font-semibold">{q}</p>
                <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 rounded-3xl bg-gradient-to-br from-violet-500/10 to-indigo-500/10 border border-violet-500/20 p-12 text-center">
          <h2 className="mb-3 text-2xl font-bold">Hemen başlayın</h2>
          <p className="mb-6 text-[hsl(var(--muted-foreground))]">Markanızı büyütmek için doğru plan sizin için burada.</p>
          <Link href="/kayit"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-600 px-8 py-3 font-semibold text-white shadow-lg shadow-violet-500/30 transition hover:opacity-90">
            Ücretsiz Hesap Oluştur
          </Link>
        </div>
      </div>
    </div>
  );
}
