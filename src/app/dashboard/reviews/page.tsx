"use client";
import { useState, useEffect, useCallback } from "react";
import {
  Star, Sparkles, Loader2, Plus, QrCode,
  TrendingUp, TrendingDown, Minus, RefreshCw,
  BarChart3, MessageSquare, FileText, AlertCircle,
  CheckCircle2, XCircle, MinusCircle,
} from "lucide-react";
import { useBrand } from "@/components/dashboard/brand-provider";
import { useLang } from "@/components/language-provider";

const L = {
  tr: {
    selectBrand: "Önce bir marka seçin",
    sentiment: { POSITIVE: "Olumlu", NEUTRAL: "Nötr", NEGATIVE: "Olumsuz" } as Record<string, string>,
    reportFail: "Rapor oluşturulamadı",
    analyzing: "AI yorumları analiz ediyor", extracting: "Temalar çıkarılıyor...", takesTime: "20–40 saniye sürebilir",
    themeReport: "AI Tema Raporu",
    themeReportDesc1: "Tüm yorumlarınızı tarayarak öne çıkan temaları",
    themeReportDesc2: "ve yüzdelik dağılımları çıkarır.",
    createReport: "Rapor Oluştur",
    analyzed: "yorum analiz edildi", refresh: "Yenile",
    overall: "Genel Değerlendirme",
    strengths: "Güçlü Yönler", weaknesses: "Gelişim Alanları",
    topThemes: "ÖNE ÇIKAN TEMALAR",
    posLow: "olumlu", negLow: "olumsuz", neuLow: "nötr",
    title: "Yorum Analizi", reviewsWord: "yorum",
    tabs: { reviews: "Yorumlar", stats: "İstatistikler", rapor: "AI Raporu", qr: "QR Kodlar" },
    all: "Tümü", manualAdd: "Manuel Ekle", aiAnalyze: "AI Analiz Et",
    namePh: "İsim (opsiyonel)", reviewPh: "Yorum metni...", add: "Ekle",
    noReviews: "Yorum bulunamadı", anonymous: "Anonim",
    statTotal: "Toplam",
    ratingDist: "Puan Dağılımı", avg: "Ort:",
    topTopics: "Öne Çıkan Konular",
    insight: "AI İçgörü Özeti", regenerate: "Yenile", create: "Oluştur",
    unanalyzedMsg: (n: number) => `${n} yorum henüz analiz edilmedi. "AI Analiz Et" butonunu kullan.`,
    clickToCreate: "Rapor oluşturmak için butona tıkla.",
    qrLabelPh: "QR etiket (opsiyonel: Masa 1, Giriş...)",
    createBtn: "Oluştur", noQr: "Henüz QR kodu yok.", qrCodeWord: "QR Kodu",
    scans: "tarama", open: "Aç",
  },
  en: {
    selectBrand: "Select a brand first",
    sentiment: { POSITIVE: "Positive", NEUTRAL: "Neutral", NEGATIVE: "Negative" } as Record<string, string>,
    reportFail: "Could not generate the report",
    analyzing: "AI is analyzing your reviews", extracting: "Extracting themes...", takesTime: "May take 20–40 seconds",
    themeReport: "AI Theme Report",
    themeReportDesc1: "Scans all your reviews and extracts the top themes",
    themeReportDesc2: "with percentage breakdowns.",
    createReport: "Generate Report",
    analyzed: "reviews analyzed", refresh: "Refresh",
    overall: "Overall Assessment",
    strengths: "Strengths", weaknesses: "Areas to Improve",
    topThemes: "TOP THEMES",
    posLow: "positive", negLow: "negative", neuLow: "neutral",
    title: "Review Analysis", reviewsWord: "reviews",
    tabs: { reviews: "Reviews", stats: "Statistics", rapor: "AI Report", qr: "QR Codes" },
    all: "All", manualAdd: "Add Manually", aiAnalyze: "Analyze with AI",
    namePh: "Name (optional)", reviewPh: "Review text...", add: "Add",
    noReviews: "No reviews found", anonymous: "Anonymous",
    statTotal: "Total",
    ratingDist: "Rating Distribution", avg: "Avg:",
    topTopics: "Top Topics",
    insight: "AI Insight Summary", regenerate: "Refresh", create: "Generate",
    unanalyzedMsg: (n: number) => `${n} reviews are not analyzed yet. Use the "Analyze with AI" button.`,
    clickToCreate: "Click the button to generate a report.",
    qrLabelPh: "QR label (optional: Table 1, Entrance...)",
    createBtn: "Create", noQr: "No QR codes yet.", qrCodeWord: "QR Code",
    scans: "scans", open: "Open",
  },
};

type Sentiment = "POSITIVE" | "NEUTRAL" | "NEGATIVE" | null;

interface Review {
  id: string;
  authorName?: string | null;
  rating: number;
  text?: string | null;
  sentiment?: Sentiment;
  topics: string[];
  aiSummary?: string | null;
  source: string;
  createdAt: string;
}

interface Stats {
  sentiment: { POSITIVE: number; NEUTRAL: number; NEGATIVE: number };
  topTopics: { topic: string; count: number }[];
  ratingDist: { rating: number; count: number }[];
  avgRating: number | null;
  totalReviews: number;
  unanalyzed: number;
  insightReport: string | null;
}

interface ThemeItem {
  theme: string;
  percentage: number;
  sentiment: "POSITIVE" | "NEGATIVE" | "NEUTRAL";
  exampleQuote: string;
}

interface ReviewReport {
  themes: ThemeItem[];
  overallSentiment: "POSITIVE" | "NEGATIVE" | "NEUTRAL";
  summary: string;
  strongPoints: string[];
  weakPoints: string[];
  totalAnalyzed: number;
}

const SENTIMENT_LABEL: Record<string, string> = {
  POSITIVE: "Olumlu", NEUTRAL: "Nötr", NEGATIVE: "Olumsuz",
};
const SENTIMENT_COLOR: Record<string, string> = {
  POSITIVE: "text-green-400 bg-green-500/10",
  NEUTRAL: "text-yellow-400 bg-yellow-500/10",
  NEGATIVE: "text-red-400 bg-red-500/10",
};
const SOURCE_LABEL: Record<string, string> = {
  GOOGLE: "Google", QR: "QR", MANUAL: "Manuel", CHATBOT: "Chatbot",
};

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} className="h-3.5 w-3.5" fill={rating >= n ? "#f59e0b" : "none"} stroke={rating >= n ? "#f59e0b" : "currentColor"} />
      ))}
    </div>
  );
}

function SentimentIcon({ s }: { s?: Sentiment }) {
  if (s === "POSITIVE") return <TrendingUp className="h-3.5 w-3.5" />;
  if (s === "NEGATIVE") return <TrendingDown className="h-3.5 w-3.5" />;
  return <Minus className="h-3.5 w-3.5" />;
}

// ── AI Tema Raporu Bileşeni ──
function ThemeReport({ brandId, brandName }: { brandId: string; brandName: string }) {
  const { lang } = useLang();
  const sL = L[lang];
  const [report, setReport] = useState<ReviewReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function generate() {
    setLoading(true);
    setError("");
    const res = await fetch(`/api/review/${brandId}/report`, { method: "POST" });
    const data = await res.json();
    if (!res.ok) setError(data.error ?? sL.reportFail);
    else setReport(data.report);
    setLoading(false);
  }

  const sentimentBg = {
    POSITIVE: "from-green-500/10 to-green-500/5 border-green-500/20",
    NEGATIVE: "from-red-500/10 to-red-500/5 border-red-500/20",
    NEUTRAL: "from-yellow-500/10 to-yellow-500/5 border-yellow-500/20",
  };
  const sentimentText = {
    POSITIVE: "text-green-400",
    NEGATIVE: "text-red-400",
    NEUTRAL: "text-yellow-400",
  };
  const sentimentBar = {
    POSITIVE: "bg-green-500",
    NEGATIVE: "bg-red-500",
    NEUTRAL: "bg-yellow-400",
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center gap-5 py-20">
      <div className="relative flex h-20 w-20 items-center justify-center">
        <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-[hsl(var(--primary))]" />
        <Sparkles className="h-8 w-8 text-[hsl(var(--primary))]" />
      </div>
      <div className="text-center">
        <p className="font-semibold">{sL.analyzing}</p>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">{brandName} · {sL.extracting}</p>
        <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">{sL.takesTime}</p>
      </div>
    </div>
  );

  if (!report) return (
    <div className="flex flex-col items-center justify-center gap-6 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[hsl(var(--primary)/0.12)]">
        <BarChart3 className="h-8 w-8 text-[hsl(var(--primary))]" />
      </div>
      <div>
        <p className="text-lg font-bold">{sL.themeReport}</p>
        <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
          {sL.themeReportDesc1}<br />{sL.themeReportDesc2}
        </p>
      </div>
      {error && (
        <p className="flex items-center gap-1.5 text-sm text-red-400">
          <AlertCircle className="h-4 w-4" /> {error}
        </p>
      )}
      <button
        onClick={generate}
        className="flex items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-7 py-3 font-semibold text-white transition hover:opacity-90"
      >
        <Sparkles className="h-4 w-4" />
        {sL.createReport}
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Başlık + Yenile */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-lg font-bold">{sL.themeReport}</p>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            {report.totalAnalyzed} {sL.analyzed}
          </p>
        </div>
        <button
          onClick={generate}
          className="flex items-center gap-1.5 rounded-xl border border-[hsl(var(--border))] px-4 py-2 text-sm font-medium transition hover:bg-[hsl(var(--accent))]"
        >
          <RefreshCw className="h-3.5 w-3.5" /> {sL.refresh}
        </button>
      </div>

      {/* Genel özet */}
      <div className="glass rounded-2xl p-6">
        <div className="mb-3 flex items-center gap-2">
          <FileText className="h-4 w-4 text-[hsl(var(--primary))]" />
          <p className="font-semibold">{sL.overall}</p>
          <span className={`ml-auto rounded-full px-2.5 py-0.5 text-xs font-semibold ${
            report.overallSentiment === "POSITIVE" ? "bg-green-500/15 text-green-400"
            : report.overallSentiment === "NEGATIVE" ? "bg-red-500/15 text-red-400"
            : "bg-yellow-500/15 text-yellow-400"
          }`}>
            {sL.sentiment[report.overallSentiment]}
          </span>
        </div>
        <p className="text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">{report.summary}</p>

        <div className="mt-5 grid grid-cols-2 gap-4">
          <div className="rounded-xl bg-green-500/8 p-4">
            <div className="mb-2 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-400" />
              <p className="text-sm font-semibold text-green-400">{sL.strengths}</p>
            </div>
            <ul className="space-y-1">
              {report.strongPoints.map((p, i) => (
                <li key={i} className="flex items-start gap-1.5 text-xs text-[hsl(var(--foreground))]">
                  <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-green-400" />
                  {p}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl bg-red-500/8 p-4">
            <div className="mb-2 flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-400" />
              <p className="text-sm font-semibold text-red-400">{sL.weaknesses}</p>
            </div>
            <ul className="space-y-1">
              {report.weakPoints.map((p, i) => (
                <li key={i} className="flex items-start gap-1.5 text-xs text-[hsl(var(--foreground))]">
                  <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-400" />
                  {p}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Tema kartları */}
      <div>
        <p className="mb-3 text-sm font-semibold text-[hsl(var(--muted-foreground))]">
          {sL.topThemes}
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {report.themes.map((theme, i) => (
            <div
              key={i}
              className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br p-5 ${sentimentBg[theme.sentiment]}`}
            >
              {/* Yüzde */}
              <div className="mb-3 flex items-start justify-between">
                <p className={`text-4xl font-black ${sentimentText[theme.sentiment]}`}>
                  %{theme.percentage}
                </p>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                  theme.sentiment === "POSITIVE" ? "bg-green-500/20 text-green-400"
                  : theme.sentiment === "NEGATIVE" ? "bg-red-500/20 text-red-400"
                  : "bg-yellow-500/20 text-yellow-400"
                }`}>
                  {theme.sentiment === "POSITIVE" ? sL.posLow : theme.sentiment === "NEGATIVE" ? sL.negLow : sL.neuLow}
                </span>
              </div>

              {/* Tema adı */}
              <p className="mb-2 text-base font-bold">{theme.theme}</p>

              {/* Bar */}
              <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-[hsl(var(--muted)/0.4)]">
                <div
                  className={`h-full rounded-full transition-all ${sentimentBar[theme.sentiment]}`}
                  style={{ width: `${Math.min(theme.percentage, 100)}%` }}
                />
              </div>

              {/* Alıntı */}
              {theme.exampleQuote && (
                <p className="text-xs italic text-[hsl(var(--muted-foreground))]">
                  &ldquo;{theme.exampleQuote}&rdquo;
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ReviewsPage() {
  const { activeBrand } = useBrand();
  const { lang } = useLang();
  const sL = L[lang];
  const brandId = activeBrand?.id ?? "";

  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [tab, setTab] = useState<"reviews" | "stats" | "rapor" | "qr">("reviews");
  const [filter, setFilter] = useState<string>("ALL");
  const [analyzing, setAnalyzing] = useState(false);
  const [insightLoading, setInsightLoading] = useState(false);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [qrCodes, setQrCodes] = useState<{ id: string; slug: string; label?: string; scanCount: number }[]>([]);
  const [qrLabel, setQrLabel] = useState("");
  const [creatingQr, setCreatingQr] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newText, setNewText] = useState("");
  const [newAuthor, setNewAuthor] = useState("");
  const [addingReview, setAddingReview] = useState(false);

  const loadReviews = useCallback(async () => {
    if (!brandId) return;
    setLoadingReviews(true);
    const sentiment = filter !== "ALL" ? `&sentiment=${filter}` : "";
    const res = await fetch(`/api/review/${brandId}?${sentiment}`);
    const data = await res.json();
    if (data.reviews) setReviews(data.reviews);
    setLoadingReviews(false);
  }, [brandId, filter]);

  const loadStats = useCallback(async () => {
    if (!brandId) return;
    const res = await fetch(`/api/review/${brandId}/stats`);
    const data = await res.json();
    setStats(data);
  }, [brandId]);

  useEffect(() => {
    loadReviews();
    loadStats();
  }, [loadReviews, loadStats]);

  useEffect(() => { if (brandId) loadReviews(); }, [filter, brandId, loadReviews]);

  async function runAnalysis() {
    setAnalyzing(true);
    await fetch(`/api/review/${brandId}/analyze`, { method: "POST" });
    await Promise.all([loadReviews(), loadStats()]);
    setAnalyzing(false);
  }

  async function getInsightReport() {
    setInsightLoading(true);
    const res = await fetch(`/api/review/${brandId}/stats?insight=1`);
    const data = await res.json();
    setStats((s) => s ? { ...s, insightReport: data.insightReport } : s);
    setInsightLoading(false);
  }

  async function createQr() {
    setCreatingQr(true);
    const res = await fetch("/api/qr/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ brandId, label: qrLabel || undefined }),
    });
    const data = await res.json();
    if (data.qrCode) setQrCodes((q) => [data.qrCode, ...q]);
    setQrLabel("");
    setCreatingQr(false);
  }

  async function addManualReview(e: React.FormEvent) {
    e.preventDefault();
    setAddingReview(true);
    const res = await fetch(`/api/review/${brandId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating: newRating, text: newText, authorName: newAuthor || undefined, source: "MANUAL" }),
    });
    const data = await res.json();
    if (data.review) {
      setReviews((r) => [data.review, ...r]);
      setNewText(""); setNewAuthor(""); setNewRating(5); setShowAddForm(false);
    }
    setAddingReview(false);
  }

  if (!activeBrand) return (
    <div className="flex h-64 items-center justify-center text-[hsl(var(--muted-foreground))]">
      {sL.selectBrand}
    </div>
  );

  const TABS = [
    { key: "reviews", label: sL.tabs.reviews, icon: MessageSquare },
    { key: "stats", label: sL.tabs.stats, icon: BarChart3 },
    { key: "rapor", label: sL.tabs.rapor, icon: Sparkles },
    { key: "qr", label: sL.tabs.qr, icon: QrCode },
  ] as const;

  return (
    <div className="p-8">
      {/* Başlık */}
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(var(--primary)/0.12)]">
          <Star className="h-5 w-5 text-[hsl(var(--primary))]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">{sL.title}</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            {activeBrand.name} · {stats?.totalReviews ?? 0} {sL.reviewsWord}
          </p>
        </div>
      </div>

      {/* Sekmeler */}
      <div className="mb-6 flex gap-1 rounded-xl bg-[hsl(var(--muted)/0.5)] p-1 w-fit">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition ${
              tab === key
                ? "bg-[hsl(var(--background))] shadow-sm text-[hsl(var(--foreground))]"
                : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* ── YORUMLAR ── */}
      {tab === "reviews" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            {["ALL", "POSITIVE", "NEUTRAL", "NEGATIVE"].map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  filter === f ? "bg-[hsl(var(--primary))] text-white" : "bg-[hsl(var(--muted))] hover:bg-[hsl(var(--border))]"
                }`}>
                {f === "ALL" ? sL.all : sL.sentiment[f]}
              </button>
            ))}
            <div className="ml-auto flex gap-2">
              <button onClick={() => setShowAddForm(!showAddForm)}
                className="flex items-center gap-1.5 rounded-lg bg-[hsl(var(--muted))] px-3 py-1.5 text-xs font-medium transition hover:bg-[hsl(var(--border))]">
                <Plus className="h-3.5 w-3.5" /> {sL.manualAdd}
              </button>
              <button onClick={runAnalysis} disabled={analyzing}
                className="flex items-center gap-1.5 rounded-lg bg-[hsl(var(--primary))] px-3 py-1.5 text-xs font-semibold text-white transition hover:opacity-90 disabled:opacity-50">
                {analyzing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                {sL.aiAnalyze}
              </button>
            </div>
          </div>

          {showAddForm && (
            <form onSubmit={addManualReview} className="glass space-y-3 rounded-2xl p-5">
              <div className="flex gap-3">
                <input type="text" placeholder={sL.namePh} value={newAuthor}
                  onChange={(e) => setNewAuthor(e.target.value)}
                  className="flex-1 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.5)] px-3 py-2 text-sm outline-none focus:border-[hsl(var(--primary))] transition" />
                <select value={newRating} onChange={(e) => setNewRating(Number(e.target.value))}
                  className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.5)] px-3 py-2 text-sm outline-none focus:border-[hsl(var(--primary))] transition">
                  {[1, 2, 3, 4, 5].map((r) => <option key={r} value={r}>{r} ★</option>)}
                </select>
              </div>
              <textarea required rows={3} placeholder={sL.reviewPh} value={newText}
                onChange={(e) => setNewText(e.target.value)}
                className="w-full resize-none rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.5)] px-3 py-2 text-sm outline-none focus:border-[hsl(var(--primary))] transition" />
              <button type="submit" disabled={addingReview}
                className="flex items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50">
                {addingReview ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} {sL.add}
              </button>
            </form>
          )}

          {loadingReviews ? (
            <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--primary))]" /></div>
          ) : reviews.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <MessageSquare className="h-10 w-10 text-[hsl(var(--muted-foreground)/0.3)]" />
              <p className="text-sm text-[hsl(var(--muted-foreground))]">{sL.noReviews}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reviews.map((review) => (
                <div key={review.id} className="glass rounded-2xl p-5">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[hsl(var(--primary)/0.1)] text-xs font-bold text-[hsl(var(--primary))]">
                        {(review.authorName ?? "?").slice(0, 1).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{review.authorName ?? sL.anonymous}</p>
                        <p className="text-[10px] text-[hsl(var(--muted-foreground))]">{SOURCE_LABEL[review.source]}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <StarRow rating={review.rating} />
                      {review.sentiment && (
                        <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${SENTIMENT_COLOR[review.sentiment]}`}>
                          <SentimentIcon s={review.sentiment} /> {sL.sentiment[review.sentiment]}
                        </span>
                      )}
                    </div>
                  </div>
                  {review.text && <p className="text-sm text-[hsl(var(--foreground))]">{review.text}</p>}
                  {review.aiSummary && (
                    <p className="mt-2 text-xs italic text-[hsl(var(--muted-foreground))]">✦ {review.aiSummary}</p>
                  )}
                  {review.topics.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {review.topics.map((t) => (
                        <span key={t} className="rounded-full bg-[hsl(var(--primary)/0.12)] px-2 py-0.5 text-xs text-[hsl(var(--primary))]">{t}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── İSTATİSTİKLER ── */}
      {tab === "stats" && stats && (
        <div className="space-y-5">
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: sL.statTotal, value: stats.totalReviews, cls: "" },
              { label: sL.sentiment.POSITIVE, value: stats.sentiment.POSITIVE, cls: "text-green-400" },
              { label: sL.sentiment.NEUTRAL, value: stats.sentiment.NEUTRAL, cls: "text-yellow-400" },
              { label: sL.sentiment.NEGATIVE, value: stats.sentiment.NEGATIVE, cls: "text-red-400" },
            ].map((item) => (
              <div key={item.label} className="glass rounded-2xl p-4 text-center">
                <p className={`text-2xl font-bold ${item.cls}`}>{item.value}</p>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">{item.label}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="glass rounded-2xl p-5">
              <p className="mb-3 text-sm font-semibold">{sL.ratingDist}</p>
              <div className="space-y-2">
                {[...stats.ratingDist].reverse().map(({ rating, count }) => {
                  const max = Math.max(...stats.ratingDist.map((r) => r.count), 1);
                  return (
                    <div key={rating} className="flex items-center gap-2 text-xs">
                      <span className="w-6 text-right">{rating}★</span>
                      <div className="flex-1 h-2 rounded-full bg-[hsl(var(--muted))]">
                        <div className="h-2 rounded-full bg-amber-400" style={{ width: `${(count / max) * 100}%` }} />
                      </div>
                      <span className="w-5 text-[hsl(var(--muted-foreground))]">{count}</span>
                    </div>
                  );
                })}
              </div>
              <p className="mt-3 text-center text-sm">
                {sL.avg} <span className="font-bold text-amber-400">{stats.avgRating?.toFixed(1) ?? "—"}</span> / 5
              </p>
            </div>

            <div className="glass rounded-2xl p-5">
              <p className="mb-3 text-sm font-semibold">{sL.topTopics}</p>
              <div className="space-y-2">
                {stats.topTopics.slice(0, 6).map(({ topic, count }) => {
                  const max = Math.max(...stats.topTopics.map((t) => t.count), 1);
                  return (
                    <div key={topic} className="flex items-center gap-2 text-xs">
                      <span className="flex-1 truncate">{topic}</span>
                      <div className="w-20 h-2 rounded-full bg-[hsl(var(--muted))]">
                        <div className="h-2 rounded-full bg-[hsl(var(--primary)/0.7)]" style={{ width: `${(count / max) * 100}%` }} />
                      </div>
                      <span className="w-5 text-[hsl(var(--muted-foreground))]">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="glass rounded-2xl p-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold">{sL.insight}</p>
              <button onClick={getInsightReport} disabled={insightLoading}
                className="flex items-center gap-1.5 rounded-lg bg-[hsl(var(--primary))] px-3 py-1.5 text-xs font-semibold text-white transition hover:opacity-90 disabled:opacity-50">
                {insightLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                {stats.insightReport ? sL.regenerate : sL.create}
              </button>
            </div>
            {stats.insightReport ? (
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{stats.insightReport}</p>
            ) : (
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                {stats.unanalyzed > 0
                  ? sL.unanalyzedMsg(stats.unanalyzed)
                  : sL.clickToCreate}
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── AI RAPORU ── */}
      {tab === "rapor" && (
        <ThemeReport brandId={brandId} brandName={activeBrand.name} />
      )}

      {/* ── QR KODLAR ── */}
      {tab === "qr" && (
        <div className="space-y-4">
          <div className="glass flex gap-2 rounded-2xl p-5">
            <input type="text" placeholder={sL.qrLabelPh} value={qrLabel}
              onChange={(e) => setQrLabel(e.target.value)}
              className="flex-1 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.5)] px-4 py-2.5 text-sm outline-none focus:border-[hsl(var(--primary))] transition" />
            <button onClick={createQr} disabled={creatingQr}
              className="flex items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50">
              {creatingQr ? <Loader2 className="h-4 w-4 animate-spin" /> : <QrCode className="h-4 w-4" />} {sL.createBtn}
            </button>
          </div>
          {qrCodes.length === 0 ? (
            <p className="py-8 text-center text-sm text-[hsl(var(--muted-foreground))]">{sL.noQr}</p>
          ) : (
            <div className="space-y-2">
              {qrCodes.map((qr) => (
                <div key={qr.id} className="glass flex items-center gap-4 rounded-xl px-5 py-4">
                  <QrCode className="h-8 w-8 text-[hsl(var(--primary))]" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{qr.label ?? sL.qrCodeWord}</p>
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">/qr/{qr.slug}</p>
                  </div>
                  <span className="text-xs text-[hsl(var(--muted-foreground))]">{qr.scanCount} {sL.scans}</span>
                  <a href={`/qr/${qr.slug}`} target="_blank" rel="noreferrer"
                    className="rounded-lg bg-[hsl(var(--muted))] px-3 py-1.5 text-xs font-medium transition hover:bg-[hsl(var(--border))]">
                    {sL.open}
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
