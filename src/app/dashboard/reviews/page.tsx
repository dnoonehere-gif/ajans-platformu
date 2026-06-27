"use client";
import { useState, useEffect, useCallback } from "react";
import { Star, Sparkles, Loader2, Plus, QrCode, TrendingUp, TrendingDown, Minus, RefreshCw } from "lucide-react";

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

export default function ReviewsPage() {
  const [brandId, setBrandId] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [tab, setTab] = useState<"reviews" | "stats" | "qr">("reviews");
  const [filter, setFilter] = useState<string>("ALL");
  const [analyzing, setAnalyzing] = useState(false);
  const [insightLoading, setInsightLoading] = useState(false);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [qrCodes, setQrCodes] = useState<{ id: string; slug: string; label?: string; scanCount: number }[]>([]);
  const [qrLabel, setQrLabel] = useState("");
  const [creatingQr, setCreatingQr] = useState(false);

  // Manuel yorum ekleme
  const [showAddForm, setShowAddForm] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newText, setNewText] = useState("");
  const [newAuthor, setNewAuthor] = useState("");
  const [addingReview, setAddingReview] = useState(false);

  const loadReviews = useCallback(async () => {
    setLoadingReviews(true);
    const sentiment = filter !== "ALL" ? `&sentiment=${filter}` : "";
    const res = await fetch(`/api/review/${brandId}?${sentiment}`);
    const data = await res.json();
    if (data.reviews) setReviews(data.reviews);
    setLoadingReviews(false);
  }, [brandId, filter]);

  const loadStats = useCallback(async () => {
    const res = await fetch(`/api/review/${brandId}/stats`);
    const data = await res.json();
    setStats(data);
  }, [brandId]);

  async function loadAll() {
    if (!brandId.trim()) return;
    setLoaded(true);
    await Promise.all([loadReviews(), loadStats()]);
  }

  useEffect(() => {
    if (loaded) loadReviews();
  }, [filter, loaded, loadReviews]);

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

  const sentimentIcon = (s?: Sentiment) => {
    if (s === "POSITIVE") return <TrendingUp className="h-3.5 w-3.5" />;
    if (s === "NEGATIVE") return <TrendingDown className="h-3.5 w-3.5" />;
    return <Minus className="h-3.5 w-3.5" />;
  };

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <div className="mb-8 flex items-center gap-3">
        <Star className="h-8 w-8 text-[hsl(var(--primary))]" />
        <div>
          <h1 className="text-2xl font-bold">Yorum Analizi</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">Müşteri yorumlarını topla, AI ile analiz et, içgörü kazan.</p>
        </div>
      </div>

      {!loaded && (
        <div className="glass flex gap-2 rounded-2xl p-5">
          <input
            type="text"
            placeholder="Marka ID gir..."
            value={brandId}
            onChange={(e) => setBrandId(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && loadAll()}
            className="flex-1 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.5)] px-4 py-2.5 text-sm outline-none focus:border-[hsl(var(--primary))] transition"
          />
          <button onClick={loadAll} className="rounded-xl bg-[hsl(var(--primary))] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90">
            Yükle
          </button>
        </div>
      )}

      {loaded && (
        <>
          {/* Tab bar */}
          <div className="mb-6 flex gap-1 rounded-xl bg-[hsl(var(--muted)/0.5)] p-1">
            {(["reviews", "stats", "qr"] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${tab === t ? "bg-[hsl(var(--background))] shadow-sm" : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"}`}>
                {t === "reviews" ? "Yorumlar" : t === "stats" ? "İstatistikler" : "QR Kodlar"}
              </button>
            ))}
          </div>

          {/* YORUMLAR */}
          {tab === "reviews" && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                {/* Filtreler */}
                {["ALL", "POSITIVE", "NEUTRAL", "NEGATIVE"].map((f) => (
                  <button key={f} onClick={() => setFilter(f)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${filter === f ? "bg-[hsl(var(--primary))] text-white" : "bg-[hsl(var(--muted))] hover:bg-[hsl(var(--border))]"}`}>
                    {f === "ALL" ? "Tümü" : SENTIMENT_LABEL[f]}
                  </button>
                ))}
                <div className="ml-auto flex gap-2">
                  <button onClick={() => setShowAddForm(!showAddForm)}
                    className="flex items-center gap-1.5 rounded-lg bg-[hsl(var(--muted))] px-3 py-1.5 text-xs font-medium transition hover:bg-[hsl(var(--border))]">
                    <Plus className="h-3.5 w-3.5" /> Manuel Ekle
                  </button>
                  <button onClick={runAnalysis} disabled={analyzing}
                    className="flex items-center gap-1.5 rounded-lg bg-[hsl(var(--primary))] px-3 py-1.5 text-xs font-semibold text-white transition hover:opacity-90 disabled:opacity-50">
                    {analyzing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                    AI Analiz Et
                  </button>
                </div>
              </div>

              {showAddForm && (
                <form onSubmit={addManualReview} className="glass rounded-2xl p-5 space-y-3">
                  <div className="flex gap-3">
                    <input type="text" placeholder="İsim (opsiyonel)" value={newAuthor} onChange={(e) => setNewAuthor(e.target.value)}
                      className="flex-1 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.5)] px-3 py-2 text-sm outline-none focus:border-[hsl(var(--primary))] transition" />
                    <select value={newRating} onChange={(e) => setNewRating(Number(e.target.value))}
                      className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.5)] px-3 py-2 text-sm outline-none focus:border-[hsl(var(--primary))] transition">
                      {[1,2,3,4,5].map((r) => <option key={r} value={r}>{r} ★</option>)}
                    </select>
                  </div>
                  <textarea required rows={3} placeholder="Yorum metni..." value={newText} onChange={(e) => setNewText(e.target.value)}
                    className="w-full resize-none rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.5)] px-3 py-2 text-sm outline-none focus:border-[hsl(var(--primary))] transition" />
                  <button type="submit" disabled={addingReview}
                    className="flex items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50">
                    {addingReview ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Ekle
                  </button>
                </form>
              )}

              {loadingReviews ? (
                <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--primary))]" /></div>
              ) : reviews.length === 0 ? (
                <p className="py-10 text-center text-sm text-[hsl(var(--muted-foreground))]">Yorum bulunamadı.</p>
              ) : (
                <div className="space-y-3">
                  {reviews.map((review) => (
                    <div key={review.id} className="glass rounded-2xl p-5">
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{review.authorName ?? "Anonim"}</span>
                          <span className="text-xs text-[hsl(var(--muted-foreground))]">• {SOURCE_LABEL[review.source]}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex">
                            {[1,2,3,4,5].map((s) => (
                              <Star key={s} className="h-3.5 w-3.5" fill={review.rating >= s ? "#f59e0b" : "none"} stroke={review.rating >= s ? "#f59e0b" : "currentColor"} />
                            ))}
                          </div>
                          {review.sentiment && (
                            <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${SENTIMENT_COLOR[review.sentiment]}`}>
                              {sentimentIcon(review.sentiment)} {SENTIMENT_LABEL[review.sentiment]}
                            </span>
                          )}
                        </div>
                      </div>
                      {review.text && <p className="text-sm text-[hsl(var(--foreground))]">{review.text}</p>}
                      {review.aiSummary && (
                        <p className="mt-2 text-xs text-[hsl(var(--muted-foreground))] italic">AI: {review.aiSummary}</p>
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

          {/* İSTATİSTİKLER */}
          {tab === "stats" && stats && (
            <div className="space-y-5">
              {/* Özet kartlar */}
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: "Toplam", value: stats.totalReviews, color: "text-[hsl(var(--foreground))]" },
                  { label: "Olumlu", value: stats.sentiment.POSITIVE, color: "text-green-400" },
                  { label: "Nötr", value: stats.sentiment.NEUTRAL, color: "text-yellow-400" },
                  { label: "Olumsuz", value: stats.sentiment.NEGATIVE, color: "text-red-400" },
                ].map((item) => (
                  <div key={item.label} className="glass rounded-2xl p-4 text-center">
                    <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">{item.label}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Puan dağılımı */}
                <div className="glass rounded-2xl p-5">
                  <p className="mb-3 text-sm font-semibold">Puan Dağılımı</p>
                  <div className="space-y-2">
                    {[...stats.ratingDist].reverse().map(({ rating, count }) => {
                      const max = Math.max(...stats.ratingDist.map((r) => r.count), 1);
                      return (
                        <div key={rating} className="flex items-center gap-2 text-xs">
                          <span className="w-6 text-right">{rating}★</span>
                          <div className="flex-1 rounded-full bg-[hsl(var(--muted))] h-2">
                            <div className="h-2 rounded-full bg-[hsl(var(--primary))]" style={{ width: `${(count / max) * 100}%` }} />
                          </div>
                          <span className="w-5 text-[hsl(var(--muted-foreground))]">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                  <p className="mt-3 text-center text-sm">
                    Ort: <span className="font-bold text-[hsl(var(--primary))]">{stats.avgRating?.toFixed(1) ?? "—"}</span> / 5
                  </p>
                </div>

                {/* En çok konular */}
                <div className="glass rounded-2xl p-5">
                  <p className="mb-3 text-sm font-semibold">Öne Çıkan Konular</p>
                  <div className="space-y-2">
                    {stats.topTopics.slice(0, 6).map(({ topic, count }) => {
                      const max = Math.max(...stats.topTopics.map((t) => t.count), 1);
                      return (
                        <div key={topic} className="flex items-center gap-2 text-xs">
                          <span className="flex-1 truncate">{topic}</span>
                          <div className="w-20 rounded-full bg-[hsl(var(--muted))] h-2">
                            <div className="h-2 rounded-full bg-[hsl(var(--primary)/0.7)]" style={{ width: `${(count / max) * 100}%` }} />
                          </div>
                          <span className="w-5 text-[hsl(var(--muted-foreground))]">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* AI İçgörü Raporu */}
              <div className="glass rounded-2xl p-5">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-semibold">AI İçgörü Raporu</p>
                  <button onClick={getInsightReport} disabled={insightLoading}
                    className="flex items-center gap-1.5 rounded-lg bg-[hsl(var(--primary))] px-3 py-1.5 text-xs font-semibold text-white transition hover:opacity-90 disabled:opacity-50">
                    {insightLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                    {stats.insightReport ? "Yenile" : "Rapor Oluştur"}
                  </button>
                </div>
                {stats.insightReport ? (
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-[hsl(var(--foreground))]">{stats.insightReport}</p>
                ) : (
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">
                    {stats.unanalyzed > 0
                      ? `${stats.unanalyzed} yorum henüz analiz edilmedi. "AI Analiz Et" butonunu kullan.`
                      : "Rapor oluşturmak için butona tıkla."}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* QR KODLAR */}
          {tab === "qr" && (
            <div className="space-y-4">
              <div className="glass flex gap-2 rounded-2xl p-5">
                <input type="text" placeholder="QR etiket (opsiyonel: Masa 1, Giriş kapısı...)" value={qrLabel}
                  onChange={(e) => setQrLabel(e.target.value)}
                  className="flex-1 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.5)] px-4 py-2.5 text-sm outline-none focus:border-[hsl(var(--primary))] transition" />
                <button onClick={createQr} disabled={creatingQr}
                  className="flex items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50">
                  {creatingQr ? <Loader2 className="h-4 w-4 animate-spin" /> : <QrCode className="h-4 w-4" />} Oluştur
                </button>
              </div>

              {qrCodes.length === 0 ? (
                <p className="py-8 text-center text-sm text-[hsl(var(--muted-foreground))]">Henüz QR kodu yok.</p>
              ) : (
                <div className="space-y-2">
                  {qrCodes.map((qr) => (
                    <div key={qr.id} className="glass flex items-center gap-4 rounded-xl px-5 py-4">
                      <QrCode className="h-8 w-8 text-[hsl(var(--primary))]" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{qr.label ?? "QR Kodu"}</p>
                        <p className="text-xs text-[hsl(var(--muted-foreground)]">/qr/{qr.slug}</p>
                      </div>
                      <span className="text-xs text-[hsl(var(--muted-foreground))]">{qr.scanCount} tarama</span>
                      <a href={`/qr/${qr.slug}`} target="_blank" rel="noreferrer"
                        className="rounded-lg bg-[hsl(var(--muted))] px-3 py-1.5 text-xs font-medium transition hover:bg-[hsl(var(--border))]">
                        Aç
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
