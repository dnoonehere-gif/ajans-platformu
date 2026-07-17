"use client";
import { useState, useEffect, useCallback } from "react";
import { LazySection, ChartSkeleton, Skeleton } from "@/components/ui/lazy-load";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie, Legend,
} from "recharts";
import {
  Star, MessageSquare, Globe, Sparkles, TrendingUp, TrendingDown,
  Loader2, RefreshCw, Bot, FileText, CheckCircle, AlertCircle,
  Plus, QrCode, MapPin, ArrowUpRight, ArrowDownRight, Minus,
  Users, CalendarCheck, Mail, Share2,
} from "lucide-react";
import { useBrand } from "@/components/dashboard/brand-provider";
import { useLang } from "@/components/language-provider";
import Link from "next/link";

interface KPIs {
  totalReviews: number; avgRating: number | null; prevAvgRating: number | null;
  sentiment: { positive: number; neutral: number; negative: number };
  chatbotConversations: number; contentItems: number; websitePublished: boolean;
  last30Count: number; reviewsPrev30Count: number;
  reviewsLast7Count: number; reviewsPrev7Count: number;
  weeklyChange: number | null; monthlyChange: number | null;
}
interface TrendPoint { date: string; shortDate: string; count: number; avgRating: number }
interface RatingDist { rating: number; count: number; label: string }
interface SourceDist { source: string; count: number }
interface RecentReview { id: string; authorName?: string | null; rating: number; text?: string | null; sentiment?: string | null; source: string; createdAt: string }
interface Summary { performance: { reviewScore: number; sentimentScore: number; engagementScore: number; overallScore: number }; negativeTrend: { isRising: boolean; percentage: number }; topComplaint: string | null; aiSuggestions: string[] }
interface Setup {
  hasBrand: boolean; hasChatbot: boolean; hasKnowledge: boolean;
  hasGoogle: boolean; websitePublished: boolean; hasReviews: boolean;
}
interface Extras {
  crm: { total: number; stages: Record<string, number> };
  reservations: { total: number; pending: number; confirmed: number };
  email: { campaignsSent: number; totalSent: number; totalOpened: number };
  social: { published: number; scheduled: number };
}
interface DashboardData {
  brand: { id: string; name: string; primaryColor: string | null };
  kpis: KPIs; trend: TrendPoint[]; ratingDist: RatingDist[]; sourceDist: SourceDist[];
  recentReviews: RecentReview[]; latestSummary: Summary | null;
  extras?: Extras;
  setup?: Setup;
}

const SENTIMENT_COLORS = { positive: "#22c55e", neutral: "#f59e0b", negative: "#ef4444" };
const SOURCE_COLORS = ["#6366f1", "#0ea5e9", "#f59e0b", "#22c55e", "#ec4899"];
const RATING_COLORS = ["#22c55e", "#84cc16", "#f59e0b", "#f97316", "#ef4444"];

function ScoreRing({ value, label, color }: { value: number; label: string; color: string }) {
  const r = 28; const circ = 2 * Math.PI * r; const dash = (value / 100) * circ;
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative">
        <svg width={72} height={72} className="-rotate-90">
          <circle cx={36} cy={36} r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth={6} />
          <circle cx={36} cy={36} r={r} fill="none" stroke={color} strokeWidth={6}
            strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" className="transition-all duration-700" />
        </svg>
        <p className="absolute inset-0 flex items-center justify-center text-base font-bold" style={{ color }}>{value}</p>
      </div>
      <p className="text-xs text-[hsl(var(--muted-foreground))]">{label}</p>
    </div>
  );
}

const ONBOARDING_L = {
  tr: {
    steps: [
      "Markanı oluştur",
      "AI chatbot'unu kur",
      "Bilgi tabanını doldur (SSS, saatler, fiyatlar)",
      "Google işletmeni bağla",
      "Web siteni yayınla",
      "İlk yorumunu topla (QR kod)",
    ],
    hide: "Gizle",
  },
  en: {
    steps: [
      "Create your brand",
      "Set up your AI chatbot",
      "Fill the knowledge base (FAQ, hours, prices)",
      "Connect your Google Business",
      "Publish your website",
      "Collect your first review (QR code)",
    ],
    hide: "Hide",
  },
};

function OnboardingCard({ setup, brandId }: { setup: Setup; brandId: string }) {
  const [dismissed, setDismissed] = useState(false);
  const { t, lang } = useLang();
  const oL = ONBOARDING_L[lang];

  useEffect(() => {
    setDismissed(localStorage.getItem(`nv-onboarding-${brandId}`) === "1");
  }, [brandId]);

  const steps = [
    { done: setup.hasBrand, label: oL.steps[0], href: "/dashboard/marka-olustur" },
    { done: setup.hasChatbot, label: oL.steps[1], href: "/dashboard/chatbot" },
    { done: setup.hasKnowledge, label: oL.steps[2], href: "/dashboard/chatbot" },
    { done: setup.hasGoogle, label: oL.steps[3], href: "/dashboard/google" },
    { done: setup.websitePublished, label: oL.steps[4], href: "/dashboard/website" },
    { done: setup.hasReviews, label: oL.steps[5], href: "/dashboard/qr" },
  ];
  const doneCount = steps.filter((s) => s.done).length;
  const allDone = doneCount === steps.length;

  if (dismissed || allDone) return null;

  function dismiss() {
    localStorage.setItem(`nv-onboarding-${brandId}`, "1");
    setDismissed(true);
  }

  return (
    <div className="glass relative overflow-hidden rounded-2xl p-5 ring-1 ring-[hsl(var(--primary)/0.25)]">
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[hsl(var(--primary)/0.08)] blur-2xl" />
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 font-bold">
            <Sparkles className="h-4 w-4 text-[hsl(var(--primary))]" />
            {t("dashboard.setupGuide")}
          </p>
          <p className="mt-0.5 text-xs text-[hsl(var(--muted-foreground))]">
            {doneCount}/{steps.length} {t("dashboard.setupProgress")}
          </p>
        </div>
        <button onClick={dismiss} title={oL.hide}
          className="rounded-lg p-1.5 text-[hsl(var(--muted-foreground))] transition hover:bg-[hsl(var(--accent))]">
          <Minus className="h-4 w-4" />
        </button>
      </div>

      <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-[hsl(var(--muted))]">
        <div className="h-full rounded-full bg-[hsl(var(--primary))] transition-all duration-700"
          style={{ width: `${(doneCount / steps.length) * 100}%` }} />
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {steps.map((s) => (
          <Link key={s.label} href={s.href}
            className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm transition ${
              s.done
                ? "text-[hsl(var(--muted-foreground))] line-through opacity-60"
                : "bg-[hsl(var(--muted)/0.4)] hover:bg-[hsl(var(--accent))] font-medium"
            }`}>
            {s.done
              ? <CheckCircle className="h-4 w-4 shrink-0 text-green-400" />
              : <ArrowUpRight className="h-4 w-4 shrink-0 text-[hsl(var(--primary))]" />}
            <span className="min-w-0 truncate">{s.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

function ChangeChip({ value }: { value: number | null }) {
  if (value === null) return <span className="text-xs text-[hsl(var(--muted-foreground))]">—</span>;
  if (value === 0) return (
    <span className="flex items-center gap-0.5 text-xs text-[hsl(var(--muted-foreground))]">
      <Minus className="h-3 w-3" /> 0%
    </span>
  );
  const up = value > 0;
  return (
    <span className={`flex items-center gap-0.5 text-xs font-semibold ${up ? "text-green-400" : "text-red-400"}`}>
      {up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
      {Math.abs(value)}%
    </span>
  );
}

function sourceLabel(s: string) {
  const map: Record<string, string> = { GOOGLE: "Google", QR: "QR Kod", MANUAL: "Manuel", MAPS: "Haritalar" };
  return map[s] ?? s;
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number; dataKey: string }[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-2 shadow-lg text-xs">
      <p className="mb-1 font-semibold text-[hsl(var(--foreground))]">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-[hsl(var(--muted-foreground))]">
          {p.dataKey === "count" ? "Yorum" : "Ort. Puan"}: <span className="font-bold text-[hsl(var(--foreground))]">{p.value}</span>
        </p>
      ))}
    </div>
  );
};

export default function DashboardPage() {
  const { activeBrand, brands } = useBrand();
  const { t } = useLang();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [briefing, setBriefing] = useState<string | null>(null);

  const loadDashboard = useCallback(async (brandId: string) => {
    setLoading(true);
    setData(null);
    const res = await fetch(`/api/dashboard/${brandId}`);
    const json = await res.json();
    if (!json.error) setData(json);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (activeBrand?.id) loadDashboard(activeBrand.id);
  }, [activeBrand?.id, loadDashboard]);

  async function generateSummary() {
    if (!activeBrand) return;
    setSummaryLoading(true);
    const res = await fetch(`/api/dashboard/${activeBrand.id}/summary`, { method: "POST" });
    const json = await res.json();
    if (json.summary) { setData((d) => d ? { ...d, latestSummary: json.summary } : d); setBriefing(json.briefing); }
    setSummaryLoading(false);
  }

  if (!loading && brands.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[hsl(var(--primary)/0.15)]">
          <Globe className="h-8 w-8 text-[hsl(var(--primary))]" />
        </div>
        <h2 className="text-xl font-bold">{t("dashboard.noBrandTitle")}</h2>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">{t("dashboard.noBrandDesc")}</p>
        <Link href="/dashboard/marka-olustur" className="flex items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition">
          <Plus className="h-4 w-4" /> {t("dashboard.createBrand")}
        </Link>
      </div>
    );
  }

  const kpis = data?.kpis;
  const perf = data?.latestSummary?.performance;
  const extras = data?.extras;

  const sentimentTotal = kpis ? kpis.sentiment.positive + kpis.sentiment.neutral + kpis.sentiment.negative : 0;
  const pieData = kpis ? [
    { name: t("dashboard.positive"), value: kpis.sentiment.positive, color: SENTIMENT_COLORS.positive },
    { name: t("dashboard.neutral"), value: kpis.sentiment.neutral, color: SENTIMENT_COLORS.neutral },
    { name: t("dashboard.negative"), value: kpis.sentiment.negative, color: SENTIMENT_COLORS.negative },
  ].filter(d => d.value > 0) : [];

  const maxRatingCount = Math.max(...(data?.ratingDist.map(r => r.count) ?? [1]), 1);

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            {activeBrand ? `${activeBrand.name}` : "Dashboard"}
          </h1>
          <p className="flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))]"><span className="nv-live-dot" />{t("dashboard.summary")}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => activeBrand && loadDashboard(activeBrand.id)} disabled={loading}
            className="flex items-center gap-2 rounded-xl border border-[hsl(var(--border))] px-3 py-2 text-sm transition hover:bg-[hsl(var(--accent))] disabled:opacity-50">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> {t("dashboard.refresh")}
          </button>
          <button onClick={generateSummary} disabled={summaryLoading || !activeBrand}
            className="flex items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-3 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50">
            {summaryLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {t("dashboard.aiSummary")}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-[hsl(var(--primary))]" />
        </div>
      ) : !data ? null : (
        <div className="space-y-5">

          {/* Onboarding */}
          {data.setup && activeBrand && <OnboardingCard setup={data.setup} brandId={activeBrand.id} />}

          {/* KPI Cards */}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {/* Toplam Yorum */}
            <div className="glass nv-enter nv-enter-1 nv-card-hover rounded-2xl p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-medium text-[hsl(var(--muted-foreground))]">{t("dashboard.totalReviews")}</span>
                <Star className="h-4 w-4 text-yellow-400" />
              </div>
              <p className="text-3xl font-bold">{kpis!.totalReviews}</p>
              <div className="mt-1.5 flex items-center gap-1.5">
                <ChangeChip value={kpis!.monthlyChange} />
                <span className="text-xs text-[hsl(var(--muted-foreground))]">{t("dashboard.last30Days")}</span>
              </div>
            </div>

            {/* Ortalama Puan */}
            <div className="glass nv-enter nv-enter-2 nv-card-hover rounded-2xl p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-medium text-[hsl(var(--muted-foreground))]">{t("dashboard.avgRating")}</span>
                <TrendingUp className="h-4 w-4 text-green-400" />
              </div>
              <div className="flex items-end gap-2">
                <p className="text-3xl font-bold">{kpis!.avgRating?.toFixed(1) ?? "—"}</p>
                <p className="mb-1 text-sm text-[hsl(var(--muted-foreground))]">/ 5</p>
              </div>
              <div className="mt-1.5 flex">
                {[1,2,3,4,5].map(i => (
                  <span key={i} style={{ fontSize: 12, color: i <= Math.round(kpis!.avgRating ?? 0) ? "#f59e0b" : "hsl(var(--muted))" }}>★</span>
                ))}
              </div>
            </div>

            {/* Bu Hafta */}
            <div className="glass nv-enter nv-enter-3 nv-card-hover rounded-2xl p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-medium text-[hsl(var(--muted-foreground))]">{t("dashboard.thisWeek")}</span>
                <TrendingUp className="h-4 w-4 text-blue-400" />
              </div>
              <p className="text-3xl font-bold">{kpis!.reviewsLast7Count}</p>
              <div className="mt-1.5 flex items-center gap-1.5">
                <ChangeChip value={kpis!.weeklyChange} />
                <span className="text-xs text-[hsl(var(--muted-foreground))]">{t("dashboard.vsLastWeek")}</span>
              </div>
            </div>

            {/* Olumlu Oran */}
            <div className="glass nv-enter nv-enter-4 nv-card-hover rounded-2xl p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-medium text-[hsl(var(--muted-foreground))]">{t("dashboard.positiveRate")}</span>
                <CheckCircle className="h-4 w-4 text-green-400" />
              </div>
              <p className="text-3xl font-bold">
                {sentimentTotal > 0 ? Math.round((kpis!.sentiment.positive / sentimentTotal) * 100) : 0}%
              </p>
              <div className="mt-2 h-1.5 w-full rounded-full bg-[hsl(var(--muted))]">
                <div
                  className="h-full rounded-full bg-green-400 transition-all duration-700"
                  style={{ width: sentimentTotal > 0 ? `${(kpis!.sentiment.positive / sentimentTotal) * 100}%` : "0%" }}
                />
              </div>
            </div>
          </div>

          {/* Secondary KPI row */}
          <div className="nv-enter nv-enter-5 grid grid-cols-3 gap-3 md:grid-cols-6">
            {[
              { label: t("dashboard.positive"), value: kpis!.sentiment.positive, color: "text-green-400 bg-green-500/10" },
              { label: t("dashboard.neutral"), value: kpis!.sentiment.neutral, color: "text-yellow-400 bg-yellow-500/10" },
              { label: t("dashboard.negative"), value: kpis!.sentiment.negative, color: "text-red-400 bg-red-500/10" },
              { label: t("dashboard.chatbot"), value: kpis!.chatbotConversations, color: "text-teal-400 bg-teal-500/10" },
              { label: t("dashboard.content"), value: kpis!.contentItems, color: "text-purple-400 bg-purple-500/10" },
              { label: t("dashboard.website"), value: kpis!.websitePublished ? t("dashboard.published") : t("dashboard.draft"), color: kpis!.websitePublished ? "text-green-400 bg-green-500/10" : "text-[hsl(var(--muted-foreground))] bg-[hsl(var(--muted))]" },
            ].map((k) => (
              <div key={k.label} className={`rounded-xl px-4 py-3 ${k.color.split(" ")[1]}`}>
                <p className={`text-lg font-bold ${k.color.split(" ")[0]}`}>{k.value}</p>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">{k.label}</p>
              </div>
            ))}
          </div>

          {/* Module Stats */}
          {extras && (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {/* CRM */}
              <Link href="/dashboard/crm" className="glass nv-card-hover rounded-2xl p-4 transition hover:ring-1 hover:ring-[hsl(var(--primary)/0.3)]">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-medium text-[hsl(var(--muted-foreground))]">{t("dashboard.crmPipeline")}</span>
                  <Users className="h-4 w-4 text-indigo-400" />
                </div>
                <p className="text-2xl font-bold">{extras.crm.total}</p>
                <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                  {extras.crm.stages.WON ?? 0} {t("dashboard.won")} · {extras.crm.stages.NEW ?? 0} {t("dashboard.new")}
                </p>
              </Link>

              {/* Reservations */}
              <Link href="/dashboard/chatbot" className="glass nv-card-hover rounded-2xl p-4 transition hover:ring-1 hover:ring-[hsl(var(--primary)/0.3)]">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-medium text-[hsl(var(--muted-foreground))]">{t("dashboard.reservations")}</span>
                  <CalendarCheck className="h-4 w-4 text-cyan-400" />
                </div>
                <p className="text-2xl font-bold">{extras.reservations.total}</p>
                <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                  {extras.reservations.pending} {t("dashboard.pending")} · {extras.reservations.confirmed} {t("dashboard.confirmed")}
                </p>
              </Link>

              {/* Email */}
              <Link href="/dashboard/email-kampanya" className="glass nv-card-hover rounded-2xl p-4 transition hover:ring-1 hover:ring-[hsl(var(--primary)/0.3)]">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-medium text-[hsl(var(--muted-foreground))]">{t("dashboard.email")}</span>
                  <Mail className="h-4 w-4 text-amber-400" />
                </div>
                <p className="text-2xl font-bold">{extras.email.totalSent}</p>
                <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                  {extras.email.campaignsSent} {t("dashboard.campaigns")} · %{extras.email.totalSent > 0 ? Math.round((extras.email.totalOpened / extras.email.totalSent) * 100) : 0} {t("dashboard.openRate")}
                </p>
              </Link>

              {/* Social */}
              <Link href="/dashboard/sosyal-medya" className="glass nv-card-hover rounded-2xl p-4 transition hover:ring-1 hover:ring-[hsl(var(--primary)/0.3)]">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-medium text-[hsl(var(--muted-foreground))]">{t("dashboard.socialMedia")}</span>
                  <Share2 className="h-4 w-4 text-pink-400" />
                </div>
                <p className="text-2xl font-bold">{extras.social.published}</p>
                <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                  {t("dashboard.publishedPosts")} · {extras.social.scheduled} {t("dashboard.scheduled")}
                </p>
              </Link>
            </div>
          )}

          {/* CRM Pipeline Mini Chart */}
          {extras && extras.crm.total > 0 && (
            <div className="glass nv-card-hover rounded-2xl p-5">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-semibold">CRM Pipeline Durumu</p>
                <Link href="/dashboard/crm" className="text-xs text-[hsl(var(--primary))] hover:underline">Detay →</Link>
              </div>
              <div className="flex gap-1 h-6 rounded-full overflow-hidden bg-[hsl(var(--muted))]">
                {[
                  { key: "NEW", label: "Yeni", color: "#6366f1" },
                  { key: "CONTACTED", label: "İletişim", color: "#0ea5e9" },
                  { key: "QUALIFIED", label: "Nitelikli", color: "#f59e0b" },
                  { key: "PROPOSAL", label: "Teklif", color: "#f97316" },
                  { key: "WON", label: "Kazanılan", color: "#22c55e" },
                  { key: "LOST", label: "Kaybedilen", color: "#ef4444" },
                ].map((s) => {
                  const count = extras.crm.stages[s.key] ?? 0;
                  if (count === 0) return null;
                  const pct = (count / extras.crm.total) * 100;
                  return (
                    <div key={s.key} className="relative group" style={{ width: `${pct}%`, backgroundColor: s.color }}>
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:block whitespace-nowrap rounded bg-[hsl(var(--card))] px-2 py-1 text-xs shadow border border-[hsl(var(--border))]">
                        {s.label}: {count}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                {[
                  { key: "NEW", label: "Yeni", color: "#6366f1" },
                  { key: "CONTACTED", label: "İletişim", color: "#0ea5e9" },
                  { key: "QUALIFIED", label: "Nitelikli", color: "#f59e0b" },
                  { key: "PROPOSAL", label: "Teklif", color: "#f97316" },
                  { key: "WON", label: "Kazanılan", color: "#22c55e" },
                  { key: "LOST", label: "Kaybedilen", color: "#ef4444" },
                ].filter((s) => (extras.crm.stages[s.key] ?? 0) > 0).map((s) => (
                  <div key={s.key} className="flex items-center gap-1.5 text-xs">
                    <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                    <span className="text-[hsl(var(--muted-foreground))]">{s.label}</span>
                    <span className="font-semibold">{extras.crm.stages[s.key]}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 30-Day Trend Chart */}
          <LazySection fallback={<ChartSkeleton height="h-64" />}>
          <div className="glass nv-enter nv-enter-6 nv-card-hover rounded-2xl p-5">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-semibold">{t("dashboard.trendTitle")}</p>
              <span className="text-xs text-[hsl(var(--muted-foreground))]">{kpis!.last30Count} {t("dashboard.reviewsInLast30")}</span>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={data.trend} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="shortDate" tick={{ fontSize: 10 }} interval={4} />
                <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={2}
                  fill="url(#areaGrad)" dot={false} activeDot={{ r: 4 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          </LazySection>

          {/* Rating Dist + Sentiment Donut + Source */}
          <LazySection fallback={<div className="grid grid-cols-1 gap-4 xl:grid-cols-3"><ChartSkeleton /><ChartSkeleton /><ChartSkeleton /></div>}>
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">

            {/* Rating Distribution */}
            <div className="glass nv-card-hover rounded-2xl p-5">
              <p className="mb-4 text-sm font-semibold">{t("dashboard.ratingDist")}</p>
              <div className="space-y-2.5">
                {data.ratingDist.map((r, i) => (
                  <div key={r.rating} className="flex items-center gap-3">
                    <span className="w-5 shrink-0 text-right text-xs font-semibold">{r.rating}★</span>
                    <div className="flex-1 h-3 rounded-full bg-[hsl(var(--muted))] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${(r.count / maxRatingCount) * 100}%`,
                          backgroundColor: RATING_COLORS[4 - i],
                        }}
                      />
                    </div>
                    <span className="w-8 shrink-0 text-xs text-[hsl(var(--muted-foreground))]">{r.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Sentiment Donut */}
            <div className="glass nv-card-hover rounded-2xl p-5">
              <p className="mb-2 text-sm font-semibold">{t("dashboard.sentimentDist")}</p>
              {pieData.length === 0 ? (
                <div className="flex h-40 items-center justify-center text-sm text-[hsl(var(--muted-foreground))]">{t("dashboard.noData")}</div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={140}>
                    <PieChart>
                      <Pie data={pieData} dataKey="value" cx="50%" cy="50%"
                        innerRadius={38} outerRadius={60} paddingAngle={3}>
                        {pieData.map((d, i) => <Cell key={i} fill={d.color} />)}
                      </Pie>
                      <Tooltip formatter={(v: number) => [`${v} yorum`, ""]} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-1 flex flex-wrap justify-center gap-3">
                    {pieData.map((d) => (
                      <div key={d.name} className="flex items-center gap-1.5 text-xs">
                        <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                        <span className="text-[hsl(var(--muted-foreground))]">{d.name}</span>
                        <span className="font-semibold">{sentimentTotal > 0 ? Math.round((d.value / sentimentTotal) * 100) : 0}%</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Source Breakdown */}
            <div className="glass nv-card-hover rounded-2xl p-5">
              <p className="mb-4 text-sm font-semibold">{t("dashboard.sourceDist")}</p>
              {data.sourceDist.length === 0 ? (
                <div className="flex h-40 items-center justify-center text-sm text-[hsl(var(--muted-foreground))]">{t("dashboard.noData")}</div>
              ) : (
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={data.sourceDist} layout="vertical" margin={{ left: 8, right: 16 }}>
                    <XAxis type="number" tick={{ fontSize: 10 }} allowDecimals={false} />
                    <YAxis dataKey="source" type="category" tick={{ fontSize: 11 }} width={64}
                      tickFormatter={sourceLabel} />
                    <Tooltip formatter={(v: number) => [v, "Yorum"]} labelFormatter={sourceLabel} />
                    <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                      {data.sourceDist.map((_, i) => (
                        <Cell key={i} fill={SOURCE_COLORS[i % SOURCE_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
          </LazySection>

          {/* AI Performance */}
          {perf && (
            <div className="glass nv-card-hover rounded-2xl p-5">
              <p className="mb-5 text-sm font-semibold">{t("dashboard.aiPerformance")}</p>
              <div className="flex flex-wrap items-start gap-8">
                <ScoreRing value={perf.overallScore} label={t("dashboard.ringOverall")} color="#6366f1" />
                <ScoreRing value={perf.reviewScore} label={t("dashboard.ringReview")} color="#22c55e" />
                <ScoreRing value={perf.sentimentScore} label={t("dashboard.ringSentiment")} color="#f59e0b" />
                <ScoreRing value={perf.engagementScore} label={t("dashboard.ringEngagement")} color="#0ea5e9" />
                {data.latestSummary!.aiSuggestions.length > 0 && (
                  <div className="flex-1 min-w-[200px] space-y-2.5">
                    <p className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">{t("dashboard.suggestions")}</p>
                    {data.latestSummary!.aiSuggestions.map((s, i) => (
                      <div key={i} className="flex gap-2 text-sm">
                        <span className="mt-0.5 shrink-0 text-[hsl(var(--primary))]">→</span>
                        <span className="text-[hsl(var(--muted-foreground))]">{s}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* AI Briefing */}
          {(briefing ?? data.latestSummary?.topComplaint) && (
            <div className="glass rounded-2xl p-5">
              <p className="mb-3 flex items-center gap-2 text-sm font-semibold">
                <Sparkles className="h-4 w-4 text-[hsl(var(--primary))]" /> {t("dashboard.aiBriefing")}
              </p>
              {data.latestSummary?.topComplaint && (
                <div className="mb-3 flex items-center gap-2 rounded-xl bg-red-500/8 px-4 py-2.5">
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                  <p className="text-sm text-red-400">{t("dashboard.topComplaint")} <strong>{data.latestSummary.topComplaint}</strong></p>
                </div>
              )}
              {briefing && <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">{briefing}</p>}
            </div>
          )}

          {/* Recent Reviews + Module Shortcuts */}
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
            {/* Recent Reviews */}
            <div className="glass nv-card-hover col-span-2 overflow-hidden rounded-2xl">
              <div className="flex items-center justify-between border-b border-[hsl(var(--border))] px-5 py-3">
                <p className="text-sm font-semibold">{t("dashboard.recentReviews")}</p>
                <Link href="/dashboard/reviews" className="text-xs text-[hsl(var(--primary))] hover:underline">{t("dashboard.seeAll")}</Link>
              </div>
              <div className="divide-y divide-[hsl(var(--border))]">
                {data.recentReviews.slice(0, 5).map((r) => (
                  <div key={r.id} className="flex items-start gap-3 px-5 py-3.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--muted))] text-xs font-bold">
                      {(r.authorName ?? "?").slice(0, 1).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <p className="text-sm font-medium">{r.authorName ?? "Anonim"}</p>
                        <div className="flex">
                          {[1,2,3,4,5].map(i => (
                            <span key={i} style={{ fontSize: 11, color: i <= r.rating ? "#f59e0b" : "hsl(var(--muted))" }}>★</span>
                          ))}
                        </div>
                        <span className="text-xs text-[hsl(var(--muted-foreground))]">{sourceLabel(r.source)}</span>
                      </div>
                      {r.text && r.text !== "—" && <p className="text-xs text-[hsl(var(--muted-foreground))] line-clamp-1">{r.text}</p>}
                    </div>
                    {r.sentiment && (
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        r.sentiment === "POSITIVE" ? "bg-green-500/10 text-green-400" :
                        r.sentiment === "NEGATIVE" ? "bg-red-500/10 text-red-400" :
                        "bg-yellow-500/10 text-yellow-400"
                      }`}>
                        {r.sentiment === "POSITIVE" ? "Olumlu" : r.sentiment === "NEGATIVE" ? "Olumsuz" : "Nötr"}
                      </span>
                    )}
                  </div>
                ))}
                {data.recentReviews.length === 0 && (
                  <p className="px-5 py-8 text-center text-sm text-[hsl(var(--muted-foreground))]">{t("dashboard.noReviewsYet")}</p>
                )}
              </div>
            </div>

            {/* Module Shortcuts */}
            <div className="space-y-2">
              <p className="px-1 text-sm font-semibold">{t("dashboard.modules")}</p>
              {[
                { label: "Website", desc: kpis!.websitePublished ? "Yayında" : "Taslak", href: "/dashboard/website", icon: Globe, color: "text-blue-400", bg: "bg-blue-500/10" },
                { label: "Chatbot", desc: `${kpis!.chatbotConversations} konuşma`, href: "/dashboard/chatbot", icon: Bot, color: "text-teal-400", bg: "bg-teal-500/10" },
                { label: "Yorumlar", desc: `${kpis!.totalReviews} yorum`, href: "/dashboard/reviews", icon: Star, color: "text-yellow-400", bg: "bg-yellow-500/10" },
                { label: "Google Business", desc: "Bağlantı & Senkronizasyon", href: "/dashboard/google", icon: MapPin, color: "text-red-400", bg: "bg-red-500/10" },
                { label: "QR Kod", desc: "Geri bildirim topla", href: "/dashboard/qr", icon: QrCode, color: "text-orange-400", bg: "bg-orange-500/10" },
                { label: "İçerik", desc: `${kpis!.contentItems} içerik`, href: "/dashboard/content", icon: Sparkles, color: "text-purple-400", bg: "bg-purple-500/10" },
                { label: "CRM", desc: `${extras?.crm.total ?? 0} müşteri adayı`, href: "/dashboard/crm", icon: Users, color: "text-indigo-400", bg: "bg-indigo-500/10" },
                { label: "E-posta", desc: `${extras?.email.campaignsSent ?? 0} kampanya`, href: "/dashboard/email-kampanya", icon: Mail, color: "text-amber-400", bg: "bg-amber-500/10" },
              ].map((m) => (
                <Link key={m.href} href={m.href}
                  className="glass flex items-center gap-3 rounded-xl px-4 py-3 transition hover:ring-1 hover:ring-[hsl(var(--primary)/0.3)]">
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${m.bg}`}>
                    <m.icon className={`h-4 w-4 ${m.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">{m.label}</p>
                    <p className="text-xs text-[hsl(var(--muted-foreground))] truncate">{m.desc}</p>
                  </div>
                  <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-[hsl(var(--muted-foreground))]" />
                </Link>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
