"use client";
import { useEffect, useState } from "react";
import { useBrand } from "@/components/dashboard/brand-provider";
import { Loader2, Search, Copy, Check, TrendingUp, Tag, FileText, Lightbulb, Globe, History, Target, ArrowRight, ChevronDown, ChevronUp } from "lucide-react";

interface CompetitorKeyword {
  keyword: string;
  difficulty: string;
  volume: string;
  tip: string;
}

interface SeoAnalysis {
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  h1Suggestion: string;
  contentTips: string[];
  score: number;
  improvements: string[];
  competitorKeywords?: CompetitorKeyword[];
}

interface HistoryItem {
  id: string;
  url: string | null;
  keywords: string | null;
  score: number;
  result: SeoAnalysis;
  createdAt: string;
}

export default function SeoPage() {
  const { activeBrand } = useBrand();
  const [url, setUrl] = useState("");
  const [keywords, setKeywords] = useState("");
  const [pageTitle, setPageTitle] = useState("");
  const [pageDescription, setPageDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<SeoAnalysis | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    if (!activeBrand) return;
    setLoadingHistory(true);
    fetch(`/api/seo?brandId=${activeBrand.id}`)
      .then(async (r) => {
        if (r.ok) {
          const d = await r.json();
          setHistory(d.history ?? []);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingHistory(false));
  }, [activeBrand?.id]);

  async function handleAnalyze() {
    if (!activeBrand || (!keywords && !url)) return;
    setLoading(true);
    setError("");
    setAnalysis(null);
    try {
      const res = await fetch("/api/seo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandId: activeBrand.id, url: url || undefined, keywords, pageTitle, pageDescription }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error ?? "Analiz başarısız");
      else {
        setAnalysis(data.analysis);
        setHistory((prev) => [{ id: Date.now().toString(), url: url || null, keywords: keywords || null, score: data.analysis.score, result: data.analysis, createdAt: new Date().toISOString() }, ...prev]);
      }
    } catch {
      setError("Bağlantı hatası");
    }
    setLoading(false);
  }

  function loadFromHistory(item: HistoryItem) {
    setAnalysis(item.result);
    setShowHistory(false);
  }

  function copy(key: string, text: string) {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }

  const inp = "w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2.5 text-sm outline-none transition focus:border-[hsl(var(--primary))] focus:ring-2 focus:ring-[hsl(var(--primary)/0.2)]";
  const scoreColor = (s: number) => s >= 80 ? "text-emerald-500" : s >= 50 ? "text-amber-500" : "text-red-500";
  const scoreBg = (s: number) => s >= 80 ? "bg-emerald-500" : s >= 50 ? "bg-amber-500" : "bg-red-500";
  const diffColor = (d: string) => d.includes("Düşük") ? "text-emerald-500 bg-emerald-500/10" : d.includes("Orta") ? "text-amber-500 bg-amber-500/10" : "text-red-500 bg-red-500/10";
  const formatDate = (iso: string) => new Date(iso).toLocaleDateString("tr-TR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/10">
            <Search className="h-5 w-5 text-green-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold">SEO Araçları</h1>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">AI destekli SEO analizi, rakip anahtar kelimeler ve site tarama</p>
          </div>
        </div>
        {history.length > 0 && (
          <button onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-1.5 rounded-xl border border-[hsl(var(--border))] px-3 py-2 text-xs font-medium transition hover:bg-[hsl(var(--accent))]">
            <History className="h-3.5 w-3.5" />
            Geçmiş ({history.length})
            {showHistory ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
        )}
      </div>

      {error && <div className="rounded-lg border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-500">{error}</div>}

      {/* Geçmiş analizler */}
      {showHistory && (
        <section className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
          <h3 className="mb-3 text-sm font-semibold">Geçmiş Analizler</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {history.map((item) => (
              <button key={item.id} onClick={() => loadFromHistory(item)}
                className="flex w-full items-center gap-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-3 text-left transition hover:border-[hsl(var(--primary)/0.5)]">
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-black ${scoreBg(item.score)}/10 ${scoreColor(item.score)}`}>
                  {item.score}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.url ?? item.keywords ?? "Analiz"}</p>
                  <p className="text-[11px] text-[hsl(var(--muted-foreground))]">{formatDate(item.createdAt)}</p>
                </div>
                <ArrowRight className="h-3.5 w-3.5 shrink-0 text-[hsl(var(--muted-foreground))]" />
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Giriş formu */}
      <section className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
        <h2 className="mb-4 font-semibold">Sayfa Bilgileri</h2>
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-[hsl(var(--muted-foreground))]">
              <Globe className="h-3.5 w-3.5" /> Site URL (opsiyonel — girilirse sayfa taranır)
            </label>
            <input className={inp} placeholder="https://example.com" value={url}
              onChange={(e) => setUrl(e.target.value)} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[hsl(var(--muted-foreground))]">Hedef Anahtar Kelimeler</label>
            <input className={inp} placeholder="kafe istanbul, organik kahve, brunch mekanı..." value={keywords}
              onChange={(e) => setKeywords(e.target.value)} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[hsl(var(--muted-foreground))]">Mevcut Sayfa Başlığı (opsiyonel)</label>
              <input className={inp} placeholder="Sayfanızın başlığı" value={pageTitle}
                onChange={(e) => setPageTitle(e.target.value)} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[hsl(var(--muted-foreground))]">Mevcut Meta Açıklaması (opsiyonel)</label>
              <input className={inp} placeholder="Sayfanızın meta açıklaması" value={pageDescription}
                onChange={(e) => setPageDescription(e.target.value)} />
            </div>
          </div>
        </div>
        <button onClick={handleAnalyze} disabled={loading || (!keywords && !url)}
          className="mt-4 flex items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          {loading ? (url ? "Sayfa taranıyor ve analiz ediliyor..." : "Analiz ediliyor...") : "SEO Analizi Yap"}
        </button>
      </section>

      {/* Sonuçlar */}
      {analysis && (
        <>
          {/* Skor */}
          <section className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
            <div className="flex items-center gap-6">
              <div className="relative flex h-20 w-20 items-center justify-center">
                <svg className="h-20 w-20 -rotate-90" viewBox="0 0 36 36">
                  <path d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831a 15.9155 15.9155 0 0 1 0 -31.831" fill="none"
                    stroke="currentColor" strokeWidth="2" className="text-[hsl(var(--border))]" />
                  <path d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831a 15.9155 15.9155 0 0 1 0 -31.831" fill="none"
                    strokeWidth="2" strokeDasharray={`${analysis.score}, 100`}
                    className={scoreBg(analysis.score)} strokeLinecap="round" />
                </svg>
                <span className={`absolute text-xl font-black ${scoreColor(analysis.score)}`}>{analysis.score}</span>
              </div>
              <div>
                <h2 className="text-lg font-bold">SEO Skoru</h2>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                  {analysis.score >= 80 ? "Harika! Sayfanız SEO açısından güçlü." :
                   analysis.score >= 50 ? "İyi ama iyileştirme alanı var." :
                   "Önemli iyileştirmeler gerekiyor."}
                </p>
              </div>
            </div>
          </section>

          {/* Meta önerileri */}
          <section className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
            <div className="mb-4 flex items-center gap-2">
              <FileText className="h-4 w-4 text-[hsl(var(--primary))]" />
              <h2 className="font-semibold">Meta Tag Önerileri</h2>
            </div>
            <div className="space-y-4">
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <label className="text-xs font-medium text-[hsl(var(--muted-foreground))]">Önerilen Başlık ({analysis.metaTitle.length} karakter)</label>
                  <button onClick={() => copy("title", analysis.metaTitle)}
                    className="flex items-center gap-1 text-xs text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">
                    {copied === "title" ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                  </button>
                </div>
                <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2.5 text-sm">{analysis.metaTitle}</div>
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <label className="text-xs font-medium text-[hsl(var(--muted-foreground))]">Önerilen Açıklama ({analysis.metaDescription.length} karakter)</label>
                  <button onClick={() => copy("desc", analysis.metaDescription)}
                    className="flex items-center gap-1 text-xs text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">
                    {copied === "desc" ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                  </button>
                </div>
                <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2.5 text-sm">{analysis.metaDescription}</div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-[hsl(var(--muted-foreground))]">Önerilen H1</label>
                <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2.5 text-sm font-semibold">{analysis.h1Suggestion}</div>
              </div>
            </div>
          </section>

          {/* Anahtar kelimeler */}
          <section className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
            <div className="mb-4 flex items-center gap-2">
              <Tag className="h-4 w-4 text-[hsl(var(--primary))]" />
              <h2 className="font-semibold">Önerilen Anahtar Kelimeler</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {analysis.keywords.map((kw) => (
                <button key={kw} onClick={() => copy(`kw-${kw}`, kw)}
                  className="rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-1.5 text-xs font-medium transition hover:border-[hsl(var(--primary)/0.5)]">
                  {kw} {copied === `kw-${kw}` && <Check className="ml-1 inline h-3 w-3 text-emerald-500" />}
                </button>
              ))}
            </div>
          </section>

          {/* Rakip Anahtar Kelimeler */}
          {analysis.competitorKeywords && analysis.competitorKeywords.length > 0 && (
            <section className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
              <div className="mb-4 flex items-center gap-2">
                <Target className="h-4 w-4 text-red-500" />
                <h2 className="font-semibold">Rakip Anahtar Kelime Önerileri</h2>
              </div>
              <div className="space-y-3">
                {analysis.competitorKeywords.map((ck, i) => (
                  <div key={i} className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-4">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-sm font-bold">{ck.keyword}</span>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${diffColor(ck.difficulty)}`}>{ck.difficulty}</span>
                      <span className="text-[11px] text-[hsl(var(--muted-foreground))]">~{ck.volume} arama/ay</span>
                    </div>
                    <p className="mt-1.5 text-xs text-[hsl(var(--muted-foreground))]">{ck.tip}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* İpuçları & İyileştirmeler */}
          <div className="grid gap-4 sm:grid-cols-2">
            <section className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
              <div className="mb-3 flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-amber-500" />
                <h2 className="font-semibold">SEO İpuçları</h2>
              </div>
              <ul className="space-y-2">
                {analysis.contentTips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-[hsl(var(--muted-foreground))]">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--primary)/0.1)] text-[10px] font-bold text-[hsl(var(--primary))]">{i + 1}</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </section>
            <section className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
              <div className="mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-500" />
                <h2 className="font-semibold">İyileştirmeler</h2>
              </div>
              <ul className="space-y-2">
                {analysis.improvements.map((imp, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-[hsl(var(--muted-foreground))]">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-[10px] font-bold text-emerald-500">{i + 1}</span>
                    {imp}
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </>
      )}
    </div>
  );
}
