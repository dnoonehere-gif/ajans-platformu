"use client";
import { useState, useEffect, useCallback } from "react";
import {
  CreditCard, Check, Loader2, Zap, Rocket, Building2,
  Crown, AlertTriangle, X, ChevronDown, ChevronUp,
  ExternalLink, RefreshCw,
} from "lucide-react";
import { useBrand } from "@/components/dashboard/brand-provider";
import { useLang } from "@/components/language-provider";

const L = {
  tr: {
    selectBrand: "Önce bir marka seçin",
    title: "Abonelik", subtitle: "Plan yönetimi", refresh: "Yenile",
    currentPlan: "Mevcut Plan",
    status: { TRIALING: "Aktif", ACTIVE: "Aktif", PAST_DUE: "Ödeme Gecikmiş", CANCELED: "İptal Edildi", EXPIRED: "Süresi Doldu" },
    invStatus: { PENDING: "Beklemede", PAID: "Ödendi", FAILED: "Başarısız", REFUNDED: "İade Edildi" },
    perYear: "yıl", perMonth: "ay",
    renewsAt: "tarihinde yenilenir",
    cancelSub: "Aboneliği İptal Et",
    cancelConfirm: "Aboneliği iptal etmek istediğinizden emin misiniz?",
    cancelUntil: (d: string) => `${d} tarihine kadar kullanmaya devam edersiniz.`,
    cancelNow: "İptal onaylandığında erişiminiz sona erecektir.",
    yesCancel: "Evet, İptal Et", giveUp: "Vazgeç",
    noSub: "Aktif abonelik yok", noSubDesc: "Aşağıdan bir plan seçerek başlayın.",
    changePlan: "Plan Değiştir", pickPlan: "Plan Seç",
    monthly: "Aylık", yearly: "Yıllık",
    popular: "En Popüler", current: "Mevcut Plan", choose: "Bu Planı Seç",
    unlimited: "Sınırsız", brand: "marka", teamMember: "takım üyesi", aiContent: "AI içerik/ay", qrCode: "QR Kod",
    chatbotFeat: "AI Chatbot", googleFeat: "Google Business", seoFeat: "SEO İçerik",
    support: { email: "E-posta destek", priority: "Öncelikli destek", dedicated: "Dedike hesap yöneticisi" },
    invoiceHistory: "Fatura Geçmişi",
    planWord: "Planı", securePay: "Güvenli ödeme", openNewTab: "Yeni sekmede aç",
    subCreated: "Aboneliğiniz oluşturuldu", paySoon: "Ödeme sistemi yakında aktive edilecek.",
    payFooter: "Ödeme tamamlandıktan sonra planınız otomatik olarak aktive olur. Bu pencereyi kapatabilirsiniz.",
  },
  en: {
    selectBrand: "Select a brand first",
    title: "Subscription", subtitle: "Plan management", refresh: "Refresh",
    currentPlan: "Current Plan",
    status: { TRIALING: "Active", ACTIVE: "Active", PAST_DUE: "Payment Overdue", CANCELED: "Cancelled", EXPIRED: "Expired" },
    invStatus: { PENDING: "Pending", PAID: "Paid", FAILED: "Failed", REFUNDED: "Refunded" },
    perYear: "yr", perMonth: "mo",
    renewsAt: "renewal date",
    cancelSub: "Cancel Subscription",
    cancelConfirm: "Are you sure you want to cancel your subscription?",
    cancelUntil: (d: string) => `You keep access until ${d}.`,
    cancelNow: "Your access will end once the cancellation is confirmed.",
    yesCancel: "Yes, Cancel", giveUp: "Keep Subscription",
    noSub: "No active subscription", noSubDesc: "Pick a plan below to get started.",
    changePlan: "Change Plan", pickPlan: "Pick a Plan",
    monthly: "Monthly", yearly: "Yearly",
    popular: "Most Popular", current: "Current Plan", choose: "Choose This Plan",
    unlimited: "Unlimited", brand: "brands", teamMember: "team members", aiContent: "AI content/mo", qrCode: "QR codes",
    chatbotFeat: "AI Chatbot", googleFeat: "Google Business", seoFeat: "SEO Content",
    support: { email: "Email support", priority: "Priority support", dedicated: "Dedicated account manager" },
    invoiceHistory: "Invoice History",
    planWord: "Plan", securePay: "Secure payment", openNewTab: "Open in new tab",
    subCreated: "Your subscription has been created", paySoon: "Payments will be activated soon.",
    payFooter: "Once payment is complete your plan activates automatically. You can close this window.",
  },
};

interface PlanFeatures {
  brands: number; teamMembers: number; aiContent: number;
  chatbot: boolean; reviews: boolean; qrCodes: number;
  website: boolean; googleBusiness: boolean; seoContent: boolean; support: string;
}
interface Plan {
  id: string; name: string; slug: string; priceCents: number;
  currency: string; interval: string; trialDays: number; features: PlanFeatures;
}
interface Subscription {
  id: string; status: string; trialEndsAt: string | null;
  startedAt: string; endsAt: string | null; plan: Plan;
}
interface Invoice {
  id: string; amountCents: number; currency: string;
  status: string; paidAt: string | null; createdAt: string; providerRef: string | null;
}

const PLAN_ICONS = [Zap, Rocket, Building2];
const PLAN_COLORS = ["from-blue-500 to-indigo-600", "from-violet-500 to-purple-600", "from-orange-500 to-rose-500"];
const POPULAR_SLUGS = ["profesyonel", "profesyonel-yillik"];

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ComponentType<{ className?: string }> }> = {
  TRIALING: { label: "Aktif", color: "text-green-400", bg: "bg-green-500/10", icon: Check },
  ACTIVE: { label: "Aktif", color: "text-green-400", bg: "bg-green-500/10", icon: Check },
  PAST_DUE: { label: "Ödeme Gecikmiş", color: "text-orange-400", bg: "bg-orange-500/10", icon: AlertTriangle },
  CANCELED: { label: "İptal Edildi", color: "text-[hsl(var(--muted-foreground))]", bg: "bg-[hsl(var(--muted))]", icon: X },
  EXPIRED: { label: "Süresi Doldu", color: "text-red-400", bg: "bg-red-500/10", icon: X },
};

const INVOICE_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  PENDING: { label: "Beklemede", color: "text-yellow-400" },
  PAID: { label: "Ödendi", color: "text-green-400" },
  FAILED: { label: "Başarısız", color: "text-red-400" },
  REFUNDED: { label: "İade Edildi", color: "text-blue-400" },
};

const SUPPORT_LABELS: Record<string, string> = {
  email: "E-posta destek",
  priority: "Öncelikli destek",
  dedicated: "Dedike hesap yöneticisi",
};

function fmt(cents: number, currency = "TRY") {
  return (cents / 100).toLocaleString("tr-TR", { style: "currency", currency, minimumFractionDigits: 0 });
}

function daysLeft(date: string) {
  const diff = new Date(date).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export default function AbonelikPage() {
  const { activeBrand } = useBrand();
  const { lang } = useLang();
  const sL = L[lang];
  const brandId = activeBrand?.id ?? "";

  const [allPlans, setAllPlans] = useState<Plan[]>([]);
  const [billingInterval, setBillingInterval] = useState<"month" | "year">("month");
  const plans = allPlans.filter((p) => p.interval === billingInterval);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState<string | null>(null);
  const [canceling, setCanceling] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [showInvoices, setShowInvoices] = useState(false);
  const [checkoutModal, setCheckoutModal] = useState<Plan | null>(null);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!brandId) return;
    setLoading(true);
    const [plansRes, subRes] = await Promise.all([
      fetch("/api/plans"),
      fetch(`/api/subscription?brandId=${brandId}`),
    ]);
    const [plansData, subData] = await Promise.all([plansRes.json(), subRes.json()]);
    setAllPlans(plansData.plans ?? []);
    setSubscription(subData.subscription ?? null);
    setInvoices(subData.invoices ?? []);
    setLoading(false);
  }, [brandId]);

  useEffect(() => { load(); }, [load]);

  async function handleUpgrade(plan: Plan) {
    if (!brandId) return;
    setUpgrading(plan.id);
    try {
      const res = await fetch("/api/subscription/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandId, planId: plan.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        console.error("Checkout hatası:", data);
        setUpgrading(null);
        return;
      }
      if (data.subscription) {
        setSubscription(data.subscription);
      }
      if (data.checkoutUrl) {
        setCheckoutUrl(data.checkoutUrl);
        setCheckoutModal(plan);
      } else {
        setCheckoutModal(plan);
      }
    } catch (err) {
      console.error("Checkout fetch hatası:", err);
    }
    setUpgrading(null);
  }

  async function handleCancel() {
    if (!brandId) return;
    setCanceling(true);
    const res = await fetch("/api/subscription/cancel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ brandId }),
    });
    const data = await res.json();
    if (data.subscription) setSubscription(data.subscription);
    setCanceling(false);
    setShowCancel(false);
  }

  const primaryColor = activeBrand?.primaryColor ?? "#6366f1";

  if (!activeBrand) return (
    <div className="flex h-64 items-center justify-center text-[hsl(var(--muted-foreground))]">{sL.selectBrand}</div>
  );

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: `${primaryColor}22` }}>
            <CreditCard className="h-5 w-5" style={{ color: primaryColor }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{sL.title}</h1>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">{activeBrand.name} · {sL.subtitle}</p>
          </div>
        </div>
        <button onClick={load} className="flex items-center gap-2 rounded-xl border border-[hsl(var(--border))] px-3 py-2 text-sm transition hover:bg-[hsl(var(--accent))]">
          <RefreshCw className="h-4 w-4" /> {sL.refresh}
        </button>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--primary))]" />
        </div>
      ) : (
        <div className="space-y-6">

          {/* Mevcut plan durumu */}
          {subscription ? (
            <div className="glass rounded-2xl p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">{sL.currentPlan}</p>
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold">{subscription.plan.name}</h2>
                    {(() => {
                      const cfg = STATUS_CONFIG[subscription.status] ?? STATUS_CONFIG["ACTIVE"];
                      const Icon = cfg.icon;
                      return (
                        <span className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${cfg.bg} ${cfg.color}`}>
                          <Icon className="h-3.5 w-3.5" /> {sL.status[subscription.status as keyof typeof sL.status] ?? cfg.label}
                        </span>
                      );
                    })()}
                  </div>
                  <p className="mt-1 text-2xl font-black">
                    {fmt(subscription.plan.priceCents, subscription.plan.currency)}
                    <span className="ml-1 text-sm font-normal text-[hsl(var(--muted-foreground))]">/{subscription.plan.interval === "year" ? sL.perYear : sL.perMonth}</span>
                  </p>
                </div>

                <div className="flex flex-col items-end gap-2">
                  {subscription.endsAt && subscription.status !== "TRIALING" && (
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">
                      {new Date(subscription.endsAt).toLocaleDateString("tr-TR", { day: "2-digit", month: "long", year: "numeric" })} — {sL.renewsAt}
                    </p>
                  )}
                  {subscription.status !== "CANCELED" && (
                    <button onClick={() => setShowCancel(true)}
                      className="text-xs text-[hsl(var(--muted-foreground))] underline underline-offset-2 transition hover:text-red-400">
                      {sL.cancelSub}
                    </button>
                  )}
                </div>
              </div>

              {/* İptal onay */}
              {showCancel && (
                <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/5 p-4">
                  <p className="mb-3 text-sm font-semibold text-red-400">{sL.cancelConfirm}</p>
                  <p className="mb-4 text-xs text-[hsl(var(--muted-foreground))]">
                    {subscription.endsAt
                      ? sL.cancelUntil(new Date(subscription.endsAt).toLocaleDateString("tr-TR"))
                      : sL.cancelNow}
                  </p>
                  <div className="flex gap-2">
                    <button onClick={handleCancel} disabled={canceling}
                      className="flex items-center gap-2 rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50">
                      {canceling ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                      {sL.yesCancel}
                    </button>
                    <button onClick={() => setShowCancel(false)}
                      className="rounded-xl border border-[hsl(var(--border))] px-4 py-2 text-sm transition hover:bg-[hsl(var(--accent))]">
                      {sL.giveUp}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="glass rounded-2xl border border-dashed border-[hsl(var(--border))] p-8 text-center">
              <Crown className="mx-auto mb-3 h-10 w-10 text-[hsl(var(--muted-foreground)/0.3)]" />
              <p className="font-semibold">{sL.noSub}</p>
              <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">{sL.noSubDesc}</p>
            </div>
          )}

          {/* Plan kartları */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-semibold">{subscription ? sL.changePlan : sL.pickPlan}</p>
              <div className="inline-flex items-center rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.4)] p-0.5 text-xs">
                <button
                  onClick={() => setBillingInterval("month")}
                  className={`rounded-md px-3 py-1.5 font-medium transition ${billingInterval === "month" ? "bg-[hsl(var(--background))] shadow-sm" : "text-[hsl(var(--muted-foreground))]"}`}
                >
                  {sL.monthly}
                </button>
                <button
                  onClick={() => setBillingInterval("year")}
                  className={`relative rounded-md px-3 py-1.5 font-medium transition ${billingInterval === "year" ? "bg-[hsl(var(--background))] shadow-sm" : "text-[hsl(var(--muted-foreground))]"}`}
                >
                  {sL.yearly}
                  <span className="absolute -top-2 -right-2 rounded-full bg-green-500 px-1 py-px text-[8px] font-bold text-white leading-none">-17%</span>
                </button>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {plans.map((plan, i) => {
                const Icon = PLAN_ICONS[i] ?? Zap;
                const gradient = PLAN_COLORS[i] ?? PLAN_COLORS[0];
                const isPopular = POPULAR_SLUGS.includes(plan.slug);
                const isCurrent = subscription?.plan.id === plan.id;
                const f = plan.features as PlanFeatures;

                return (
                  <div key={plan.id}
                    className={`relative flex flex-col rounded-2xl border transition ${
                      isCurrent ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.04)]" :
                      isPopular ? "border-violet-500/40" : "border-[hsl(var(--border))]"
                    }`}
                  >
                    {isPopular && !isCurrent && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="rounded-full bg-gradient-to-r from-violet-500 to-purple-600 px-3 py-0.5 text-[10px] font-bold text-white">{sL.popular}</span>
                      </div>
                    )}
                    {isCurrent && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="rounded-full px-3 py-0.5 text-[10px] font-bold text-white" style={{ background: primaryColor }}>{sL.current}</span>
                      </div>
                    )}

                    <div className="p-5">
                      <div className={`mb-3 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${gradient}`}>
                        <Icon className="h-4.5 w-4.5 text-white" />
                      </div>
                      <h3 className="font-bold">{plan.name}</h3>
                      <p className="mt-1 text-2xl font-black">{fmt(plan.priceCents)}<span className="text-xs font-normal text-[hsl(var(--muted-foreground))]">/{sL.perMonth}</span></p>

                      <ul className="mt-4 space-y-2">
                        {[
                          `${f.brands === -1 ? sL.unlimited : f.brands} ${sL.brand}`,
                          `${f.teamMembers === -1 ? sL.unlimited : f.teamMembers} ${sL.teamMember}`,
                          `${f.aiContent === -1 ? sL.unlimited : f.aiContent} ${sL.aiContent}`,
                          f.chatbot && sL.chatbotFeat,
                          f.googleBusiness && sL.googleFeat,
                          f.seoContent && sL.seoFeat,
                          `${f.qrCodes === -1 ? sL.unlimited : f.qrCodes} ${sL.qrCode}`,
                          sL.support[f.support as keyof typeof sL.support] ?? SUPPORT_LABELS[f.support],
                        ].filter(Boolean).map((feat) => (
                          <li key={feat as string} className="flex items-center gap-2 text-xs">
                            <Check className="h-3.5 w-3.5 shrink-0 text-green-400" />
                            {feat}
                          </li>
                        ))}
                      </ul>

                      <button
                        onClick={() => !isCurrent && handleUpgrade(plan)}
                        disabled={isCurrent || upgrading === plan.id}
                        className={`mt-5 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition ${
                          isCurrent
                            ? "cursor-default border border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))]"
                            : isPopular
                            ? "bg-gradient-to-r from-violet-500 to-purple-600 text-white hover:opacity-90"
                            : "border border-[hsl(var(--border))] hover:bg-[hsl(var(--accent))]"
                        } disabled:opacity-50`}
                      >
                        {upgrading === plan.id ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                        {isCurrent ? sL.current : sL.choose}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Fatura geçmişi */}
          {invoices.length > 0 && (
            <div className="glass rounded-2xl overflow-hidden">
              <button
                onClick={() => setShowInvoices(!showInvoices)}
                className="flex w-full items-center justify-between px-5 py-4 text-left"
              >
                <p className="text-sm font-semibold">{sL.invoiceHistory} ({invoices.length})</p>
                {showInvoices ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
              {showInvoices && (
                <div className="border-t border-[hsl(var(--border))]">
                  <div className="divide-y divide-[hsl(var(--border))]">
                    {invoices.map((inv) => {
                      const cfg = INVOICE_STATUS_CONFIG[inv.status] ?? { label: inv.status, color: "text-[hsl(var(--muted-foreground))]" };
                      return (
                        <div key={inv.id} className="flex items-center gap-4 px-5 py-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">{fmt(inv.amountCents, inv.currency)}</p>
                            <p className="text-xs text-[hsl(var(--muted-foreground))]">
                              {new Date(inv.createdAt).toLocaleDateString("tr-TR", { day: "2-digit", month: "long", year: "numeric" })}
                            </p>
                          </div>
                          <span className={`text-xs font-semibold ${cfg.color}`}>{sL.invStatus[inv.status as keyof typeof sL.invStatus] ?? cfg.label}</span>
                          {inv.providerRef && (
                            <span className="font-mono text-xs text-[hsl(var(--muted-foreground))]">{inv.providerRef.slice(0, 8)}…</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Ödeme Modal */}
      {checkoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="relative flex w-full max-w-2xl flex-col rounded-2xl bg-[hsl(var(--card))] shadow-2xl overflow-hidden" style={{ maxHeight: "90vh" }}>
            {/* Başlık */}
            <div className="flex items-center justify-between border-b border-[hsl(var(--border))] px-5 py-4 shrink-0">
              <div className="flex items-center gap-3">
                <CreditCard className="h-5 w-5" style={{ color: primaryColor }} />
                <div>
                  <p className="font-semibold">{checkoutModal.name} {sL.planWord}</p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">{fmt(checkoutModal.priceCents)}/{sL.perMonth} · {sL.securePay}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {checkoutUrl && (
                  <a
                    href={checkoutUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-lg border border-[hsl(var(--border))] px-3 py-1.5 text-xs text-[hsl(var(--muted-foreground))] transition hover:bg-[hsl(var(--accent))]"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    {sL.openNewTab}
                  </a>
                )}
                <button
                  onClick={() => { setCheckoutModal(null); setCheckoutUrl(null); load(); }}
                  className="rounded-lg p-1.5 text-[hsl(var(--muted-foreground))] transition hover:bg-[hsl(var(--accent))]"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* İframe veya fallback */}
            {checkoutUrl ? (
              <iframe
                src={checkoutUrl}
                className="w-full flex-1 border-0"
                style={{ minHeight: "580px" }}
                title="Güvenli Ödeme"
                sandbox="allow-scripts allow-same-origin allow-forms allow-top-navigation allow-popups"
              />
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
                <CreditCard className="h-10 w-10 text-[hsl(var(--muted-foreground)/0.4)]" />
                <p className="font-semibold">{sL.subCreated}</p>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">{sL.paySoon}</p>
              </div>
            )}

            {/* Alt bilgi */}
            <div className="border-t border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.3)] px-5 py-3 text-center text-xs text-[hsl(var(--muted-foreground))] shrink-0">
              {sL.payFooter}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
