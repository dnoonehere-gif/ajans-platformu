"use client";
import { useState, useEffect, useCallback } from "react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie,
} from "recharts";
import {
  Star, MessageSquare, Globe, Sparkles, TrendingUp, TrendingDown,
  Loader2, RefreshCw, Bot, FileText, CheckCircle, AlertCircle,
} from "lucide-react";

interface KPIs {
  totalReviews: number;
  avgRating: number | null;
  sentiment: { positive: number; neutral: number; negative: number };
  chatbotConversations: number;
  contentItems: number;
  websitePublished: boolean;
}

interface TrendPoint { date: string; count: number; avgRating: number }
interface RecentReview {
  id: string; authorName?: string | null; rating: number;
  text?: string | null; sentiment?: string | null; source: string; createdAt: string;
}
interface Summary {
  performance: { reviewScore: number; sentimentScore: number; engagementScore: number; overallScore: number };
  negativeTrend: { isRising: boolean; percentage: number };
  topComplaint: string | null;
  aiSuggestions: string[];
}

interface DashboardData {
  brand: { id: string; name: string; primaryColor: string | null };
  kpis: KPIs;
  trend: TrendPoint[];
  recentReviews: RecentReview[];
  latestSummary: Summary | null;
}

const SENTIMENT_COLORS = { positive: "#22c55e", neutral: "#f59e0b", negative: "#ef4444" };
const PIE_COLORS = ["#22c55e", "#f59e0b", "#ef4444"];

function ScoreRing({ value, label, color }: { value: number; label: string; color: string }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const dash = (value / 100) * circ;
  return (
    <div className="flex flex-col items-center gap-1.5">
      <svg width={72} height={72} className="-rotate-90">
        <circle cx={36} cy={36} r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth={6} />
        <circle cx={36} cy={36} r={r} fill="none" stroke={color} strokeWidth={6}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" className="transition-all duration-700" />
      </svg>
      <p className="text-lg font-bold" style={{ marginTop: -52, color }}>{value}</p>
      <p className="text-xs text-[hsl(var(--muted-foreground))]" style={{ marginTop: 28 }}>{label}</p>
    </div>
  );
}

export default function DashboardPage() {
  const [brandId, setBrandId] = useState("");
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [briefing, setBriefing] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    if (!brandId.trim()) return;
    setLoading(true);
    const res = await fetch(`/api/dashboard/${brandId}`);
    const json = await res.json();
    if (!json.error) setData(json);
    setLoading(false);
  }, [brandId]);

  async function generateSummary() {
    if (!brandId) return;
    setSummaryLoading(true);
    const res = await fetch(`/api/dashboard/${brandId}/summary`, { method: "POST" });
    const json = await res.json();
    if (json.summary) {
      setData((d) => d ? { ...d, latestSummary: json.summary } : d);
      setBriefing(json.briefing);
    }
    setSummaryLoading(false);
  }

  const kpis = data?.kpis;
  const pieData = kpis
    ? [
        { name: "Olumlu", value: kpis.sentiment.positive },
        { name: "Nötr", value: kpis.sentiment.neutral },
        { name: "Olumsuz", value: kpis.sentiment.negative },
      ]
    : [];

  const perf = data?.latestSummary?.performance;

  const formatDate = (d: string) => {
    const date = new Date(d);
    return `${date.getDate()}/${date.getMonth() + 1}`;
  };

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      {/* Başlık */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <TrendingUp className="h-8 w-8 text-[hsl(var(--primary))]" />
          <div>
            <h1 className="text-2xl font-bold">AI Dashboard</h1>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">Günlük performans özeti ve AI önerileri</p>
          </div>
        </div>
        {data && (
          <button onClick={loadDashboard} disabled={loading}
            className="flex items-center gap-1.5 rounded-lg bg-[hsl(var(--muted))] px-3 py-2 text-sm font-medium transition hover:bg-[hsl(var(--border))]">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Yenile
          </button>
        )}
      </div>

      {/* Marka seçici */}
      {!data && (
        <div className="glass mb-8 flex gap-2 rounded-2xl p-5">
          <input type="text" placeholder="Marka ID gir..." value={brandId}
            onChange={(e) => setBrandId(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && loadDashboard()}
            className="flex-1 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.5)] px-4 py-2.5 text-sm outline-none focus:border-[hsl(var(--primary))] transition" />
          <button onClick={loadDashboard} disabled={loading}
            className="flex items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Yükle"}
          </button>
        </div>
      )}

      {loading && !data && (
        <div className="flex justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-[hsl(var(--primary))]" />
        </div>
      )}

      {data && (
        <div className="space-y-5">
          {/* KPI Kartlar */}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {[
              { icon: Star, label: "Ort. Puan", value: kpis?.avgRating?.toFixed(1) ?? "—", sub: `${kpis?.totalReviews} yorum`, color: "#f59e0b" },
              { icon: TrendingUp, label: "Olumlu Yorum", value: kpis?.sentiment.positive ?? 0, sub: `${kpis?.totalReviews ? Math.round((kpis.sentiment.positive / kpis.totalReviews) * 100) : 0}%`, color: "#22c55e" },
              { icon: Bot, label: "Chatbot", value: kpis?.chatbotConversations ?? 0, sub: "konuşma", color: "#6366f1" },
              { icon: FileText, label: "İçerik", value: kpis?.contentItems ?? 0, sub: "üretilen", color: "#8b5cf6" },
            ].map((item) => (
              <div key={item.label} className="glass rounded-2xl p-5">
                <div className="mb-3 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl" style={{ background: `${item.color}22` }}>
                    <item.icon className="h-4 w-4" style={{ color: item.color }} />
                  </div>
                  <span className="text-xs text-[hsl(var(--muted-foreground))]">{item.label}</span>
                </div>
                <p className="text-2xl font-bold">{item.value}</p>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">{item.sub}</p>
              </div>
            ))}
          </div>

          {/* Durum kartları */}
          <div className="grid grid-cols-2 gap-3">
            <div className="glass flex items-center gap-3 rounded-2xl px-5 py-4">
              <Globe className="h-5 w-5 text-[hsl(var(--primary))]" />
              <span className="text-sm">Web Sitesi</span>
              {kpis?.websitePublished
                ? <><CheckCircle className="ml-auto h-4 w-4 text-green-400" /><span className="text-xs text-green-400">Yayında</span></>
                : <><AlertCircle className="ml-auto h-4 w-4 text-yellow-400" /><span className="text-xs text-yellow-400">Taslak</span></>
              }
            </div>
            <div className="glass flex items-center gap-3 rounded-2xl px-5 py-4">
              <MessageSquare className="h-5 w-5 text-[hsl(var(--primary))]" />
              <span className="text-sm">Analiz Bekleyen</span>
              <span className="ml-auto text-sm font-bold">
                {(kpis?.totalReviews ?? 0) - kpis!.sentiment.positive - kpis!.sentiment.neutral - kpis!.sentiment.negative}
              </span>
            </div>
          </div>

          {/* Grafikler */}
          <div className="grid grid-cols-3 gap-4">
            {/* Yorum trendi */}
            <div className="glass col-span-2 rounded-2xl p-5">
              <p className="mb-4 text-sm font-semibold">Yorum Trendi (14 Gün)</p>
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={data.trend} margin={{ top: 0, right: 0, bottom: 0, left: -30 }}>
                  <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                  <Tooltip
                    formatter={(v: number) => [v, "Yorum"]}
                    labelFormatter={formatDate}
                    contentStyle={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                  />
                  <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Sentiment dağılımı */}
            <div className="glass rounded-2xl p-5">
              <p className="mb-4 text-sm font-semibold">Duygu Dağılımı</p>
              <ResponsiveContainer width="100%" height={120}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={35} outerRadius={55} paddingAngle={3} dataKey="value">
                    {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                  </Pie>
                  <Tooltip
                    formatter={(v: number) => [v, ""]}
                    contentStyle={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-2 space-y-1">
                {[["Olumlu", kpis!.sentiment.positive, "#22c55e"], ["Nötr", kpis!.sentiment.neutral, "#f59e0b"], ["Olumsuz", kpis!.sentiment.negative, "#ef4444"]].map(([label, val, color]) => (
                  <div key={label as string} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full" style={{ background: color as string }} />
                      <span className="text-[hsl(var(--muted-foreground))]">{label}</span>
                    </div>
                    <span className="font-medium">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Puan dağılımı bar */}
          <div className="glass rounded-2xl p-5">
            <p className="mb-4 text-sm font-semibold">Puan Bazlı Günlük Ortalama</p>
            <ResponsiveContainer width="100%" height={100}>
              <BarChart data={data.trend} margin={{ top: 0, right: 0, bottom: 0, left: -30 }}>
                <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis domain={[0, 5]} ticks={[0, 1, 2, 3, 4, 5]} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip
                  formatter={(v: number) => [v.toFixed(1), "Ort. Puan"]}
                  labelFormatter={formatDate}
                  contentStyle={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                />
                <Bar dataKey="avgRating" radius={[4, 4, 0, 0]}>
                  {data.trend.map((entry, i) => (
                    <Cell key={i} fill={entry.avgRating >= 4 ? "#22c55e" : entry.avgRating >= 3 ? "#f59e0b" : "#ef4444"} fillOpacity={0.8} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* AI Performans Skorları */}
          {perf && (
            <div className="glass rounded-2xl p-6">
              <p className="mb-5 text-sm font-semibold">AI Performans Skorları</p>
              <div className="flex justify-around">
                <ScoreRing value={perf.overallScore} label="Genel" color="#6366f1" />
                <ScoreRing value={perf.reviewScore} label="Yorum" color="#22c55e" />
                <ScoreRing value={perf.sentimentScore} label="Duygu" color="#f59e0b" />
                <ScoreRing value={perf.engagementScore} label="Etkileşim" color="#8b5cf6" />
              </div>
            </div>
          )}

          {/* AI Günlük Brifing & Öneriler */}
          <div className="glass rounded-2xl p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-[hsl(var(--primary))]" />
                <p className="text-sm font-semibold">AI Günlük Brifing</p>
              </div>
              <button onClick={generateSummary} disabled={summaryLoading}
                className="flex items-center gap-1.5 rounded-lg bg-[hsl(var(--primary))] px-3 py-1.5 text-xs font-semibold text-white transition hover:opacity-90 disabled:opacity-50">
                {summaryLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                {data.latestSummary ? "Yenile" : "Oluştur"}
              </button>
            </div>

            {briefing && (
              <p className="mb-4 rounded-xl bg-[hsl(var(--primary)/0.08)] px-4 py-3 text-sm leading-relaxed">{briefing}</p>
            )}

            {data.latestSummary ? (
              <>
                {data.latestSummary.topComplaint && (
                  <div className="mb-3 flex items-center gap-2 rounded-xl bg-red-500/10 px-4 py-2.5">
                    <TrendingDown className="h-4 w-4 text-red-400 shrink-0" />
                    <p className="text-sm"><span className="font-medium text-red-400">Kritik:</span> {data.latestSummary.topComplaint}</p>
                  </div>
                )}
                <div className="space-y-2">
                  {data.latestSummary.aiSuggestions.map((s, i) => (
                    <div key={i} className="flex items-start gap-2.5 rounded-xl bg-[hsl(var(--muted)/0.5)] px-4 py-2.5">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--primary)/0.2)] text-xs font-bold text-[hsl(var(--primary))]">{i + 1}</span>
                      <p className="text-sm">{s}</p>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-sm text-[hsl(var(--muted-foreground))]">Günlük brifing oluşturmak için butona tıkla.</p>
            )}
          </div>

          {/* Son Yorumlar */}
          <div className="glass rounded-2xl p-5">
            <p className="mb-4 text-sm font-semibold">Son Yorumlar</p>
            {data.recentReviews.length === 0 ? (
              <p className="text-sm text-[hsl(var(--muted-foreground))]">Henüz yorum yok.</p>
            ) : (
              <div className="space-y-3">
                {data.recentReviews.map((r) => (
                  <div key={r.id} className="flex items-start gap-3 rounded-xl bg-[hsl(var(--muted)/0.4)] px-4 py-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium">{r.authorName ?? "Anonim"}</span>
                        <div className="flex">
                          {[1,2,3,4,5].map((s) => (
                            <Star key={s} className="h-3 w-3" fill={r.rating >= s ? "#f59e0b" : "none"} stroke={r.rating >= s ? "#f59e0b" : "currentColor"} />
                          ))}
                        </div>
                        {r.sentiment && (
                          <span className={`text-xs rounded-full px-1.5 py-0.5 ${r.sentiment === "POSITIVE" ? "bg-green-500/10 text-green-400" : r.sentiment === "NEGATIVE" ? "bg-red-500/10 text-red-400" : "bg-yellow-500/10 text-yellow-400"}`}>
                            {r.sentiment === "POSITIVE" ? "+" : r.sentiment === "NEGATIVE" ? "−" : "~"}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[hsl(var(--muted-foreground))] truncate">{r.text}</p>
                    </div>
                    <span className="shrink-0 text-xs text-[hsl(var(--muted-foreground))]">
                      {new Date(r.createdAt).toLocaleDateString("tr-TR")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
