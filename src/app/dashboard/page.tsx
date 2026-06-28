"use client";
import { useState, useEffect, useCallback } from "react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie,
} from "recharts";
import {
  Star, MessageSquare, Globe, Sparkles, TrendingUp, TrendingDown,
  Loader2, RefreshCw, Bot, FileText, CheckCircle, AlertCircle, Plus,
} from "lucide-react";
import { useBrand } from "@/components/dashboard/brand-provider";
import Link from "next/link";

interface KPIs {
  totalReviews: number; avgRating: number | null;
  sentiment: { positive: number; neutral: number; negative: number };
  chatbotConversations: number; contentItems: number; websitePublished: boolean;
}
interface TrendPoint { date: string; count: number; avgRating: number }
interface RecentReview { id: string; authorName?: string | null; rating: number; text?: string | null; sentiment?: string | null; source: string; createdAt: string }
interface Summary { performance: { reviewScore: number; sentimentScore: number; engagementScore: number; overallScore: number }; negativeTrend: { isRising: boolean; percentage: number }; topComplaint: string | null; aiSuggestions: string[] }
interface DashboardData { brand: { id: string; name: string; primaryColor: string | null }; kpis: KPIs; trend: TrendPoint[]; recentReviews: RecentReview[]; latestSummary: Summary | null }

const PIE_COLORS = ["#22c55e", "#f59e0b", "#ef4444"];

function ScoreRing({ value, label, color }: { value: number; label: string; color: string }) {
  const r = 28; const circ = 2 * Math.PI * r; const dash = (value / 100) * circ;
  return (
    <div className="flex flex-col items-center gap-1.5">
      <svg width={72} height={72} className="-rotate-90">
        <circle cx={36} cy={36} r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth={6} />
        <circle cx={36} cy={36} r={r} fill="none" stroke={color} strokeWidth={6} strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" className="transition-all duration-700" />
      </svg>
      <p className="text-lg font-bold" style={{ marginTop: -52, color }}>{value}</p>
      <p className="text-xs text-[hsl(var(--muted-foreground))]" style={{ marginTop: 28 }}>{label}</p>
    </div>
  );
}

export default function DashboardPage() {
  const { activeBrand, brands } = useBrand();
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

  const formatDate = (d: string) => new Date(d).toLocaleDateString("tr-TR", { day: "2-digit", month: "short" });

  // Marka yok → marka oluştur
  if (!loading && brands.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[hsl(var(--primary)/0.15)]">
          <Globe className="h-8 w-8 text-[hsl(var(--primary))]" />
        </div>
        <h2 className="text-xl font-bold">Henüz marka yok</h2>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">İlk markanızı oluşturarak başlayın.</p>
        <Link href="/dashboard/marka-olustur" className="flex items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition">
          <Plus className="h-4 w-4" /> Marka Oluştur
        </Link>
      </div>
    );
  }

  const kpis = data?.kpis;
  const perf = data?.latestSummary?.performance;
  const pieData = kpis ? [
    { name: "Olumlu", value: kpis.sentiment.positive },
    { name: "Nötr", value: kpis.sentiment.neutral },
    { name: "Olumsuz", value: kpis.sentiment.negative },
  ] : [];

  return (
    <div className="p-8">
      {/* Başlık */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {activeBrand ? `Merhaba, ${activeBrand.name} 👋` : "Dashboard"}
          </h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">Markanızın genel durumu</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => activeBrand && loadDashboard(activeBrand.id)} disabled={loading}
            className="flex items-center gap-2 rounded-xl border border-[hsl(var(--border))] px-3 py-2 text-sm transition hover:bg-[hsl(var(--accent))] disabled:opacity-50">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Yenile
          </button>
          <button onClick={generateSummary} disabled={summaryLoading || !activeBrand}
            className="flex items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-3 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50">
            {summaryLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            AI Özet Üret
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-[hsl(var(--primary))]" />
        </div>
      ) : !data ? null : (
        <div className="space-y-6">
          {/* KPI Kartları */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
            {[
              { label: "Toplam Yorum", value: kpis!.totalReviews, icon: Star, color: "text-yellow-400" },
              { label: "Ort. Puan", value: kpis!.avgRating?.toFixed(1) ?? "—", icon: TrendingUp, color: "text-green-400" },
              { label: "Olumlu", value: kpis!.sentiment.positive, icon: CheckCircle, color: "text-green-400" },
              { label: "Olumsuz", value: kpis!.sentiment.negative, icon: AlertCircle, color: "text-red-400" },
              { label: "Chatbot", value: kpis!.chatbotConversations, icon: MessageSquare, color: "text-teal-400" },
              { label: "İçerik", value: kpis!.contentItems, icon: FileText, color: "text-blue-400" },
            ].map((k) => (
              <div key={k.label} className="glass rounded-2xl p-4">
                <k.icon className={`mb-2 h-5 w-5 ${k.color}`} />
                <p className="text-2xl font-bold">{k.value}</p>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">{k.label}</p>
              </div>
            ))}
          </div>

          {/* Grafik + Pasta */}
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
            <div className="glass col-span-2 rounded-2xl p-5">
              <p className="mb-4 text-sm font-semibold">14 Günlük Yorum Trendi</p>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={data.trend}>
                  <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip labelFormatter={formatDate} formatter={(v: number) => [v, "Yorum"]} />
                  <Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="glass rounded-2xl p-5">
              <p className="mb-4 text-sm font-semibold">Duygu Dağılımı</p>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" cx="50%" cy="50%" outerRadius={60} label={({ name, value }) => `${name}: ${value}`} labelLine={false} fontSize={10}>
                    {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* AI Performans + Öneriler */}
          {perf && (
            <div className="glass rounded-2xl p-5">
              <p className="mb-4 text-sm font-semibold">AI Performans Analizi</p>
              <div className="flex flex-wrap items-center gap-8">
                <ScoreRing value={perf.overallScore} label="Genel" color="#6366f1" />
                <ScoreRing value={perf.reviewScore} label="Yorum" color="#22c55e" />
                <ScoreRing value={perf.sentimentScore} label="Duygu" color="#f59e0b" />
                <ScoreRing value={perf.engagementScore} label="Etkileşim" color="#0ea5e9" />
                {data.latestSummary!.aiSuggestions.length > 0 && (
                  <div className="flex-1 min-w-0 space-y-2">
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

          {/* AI Brifing */}
          {(briefing ?? data.latestSummary?.topComplaint) && (
            <div className="glass rounded-2xl p-5">
              <p className="mb-2 text-sm font-semibold flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[hsl(var(--primary))]" /> AI Brifing
              </p>
              {data.latestSummary?.topComplaint && (
                <p className="mb-2 text-sm text-red-400">
                  🔴 En çok şikayet: <strong>{data.latestSummary.topComplaint}</strong>
                </p>
              )}
              {briefing && <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">{briefing}</p>}
            </div>
          )}

          {/* Son Yorumlar */}
          <div className="glass rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-[hsl(var(--border))] px-5 py-3">
              <p className="text-sm font-semibold">Son Yorumlar</p>
              <Link href="/dashboard/reviews" className="text-xs text-[hsl(var(--primary))] hover:underline">Tümünü gör →</Link>
            </div>
            <div className="divide-y divide-[hsl(var(--border))]">
              {data.recentReviews.slice(0, 5).map((r) => (
                <div key={r.id} className="flex items-start gap-3 px-5 py-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--muted))] text-xs font-bold">
                    {(r.authorName ?? "?").slice(0, 1).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-medium">{r.authorName ?? "Anonim"}</p>
                      <div className="flex">{"★".repeat(r.rating).padEnd(5, "☆").split("").map((s, i) => (
                        <span key={i} className={s === "★" ? "text-yellow-400" : "text-[hsl(var(--muted))]"} style={{ fontSize: 11 }}>{s}</span>
                      ))}</div>
                    </div>
                    {r.text && <p className="text-xs text-[hsl(var(--muted-foreground))] truncate">{r.text}</p>}
                  </div>
                  {r.sentiment && (
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
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
                <p className="px-5 py-8 text-center text-sm text-[hsl(var(--muted-foreground))]">Henüz yorum yok</p>
              )}
            </div>
          </div>

          {/* Modül kısayolları */}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
            {[
              { label: "Website", href: "/dashboard/website", icon: Globe, color: "text-blue-400 bg-blue-500/10" },
              { label: "Chatbot", href: "/dashboard/chatbot", icon: Bot, color: "text-teal-400 bg-teal-500/10" },
              { label: "Yorumlar", href: "/dashboard/reviews", icon: Star, color: "text-yellow-400 bg-yellow-500/10" },
              { label: "İçerik", href: "/dashboard/content", icon: Sparkles, color: "text-purple-400 bg-purple-500/10" },
              { label: "QR Kod", href: "/dashboard/qr", icon: FileText, color: "text-orange-400 bg-orange-500/10" },
              { label: "Takım", href: "/dashboard/team", icon: MessageSquare, color: "text-green-400 bg-green-500/10" },
            ].map((m) => (
              <Link key={m.href} href={m.href}
                className="glass flex flex-col items-center gap-2 rounded-2xl p-4 transition hover:scale-[1.02]">
                <div className={`rounded-xl p-2.5 ${m.color.split(" ")[1]}`}>
                  <m.icon className={`h-5 w-5 ${m.color.split(" ")[0]}`} />
                </div>
                <span className="text-xs font-semibold">{m.label}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
