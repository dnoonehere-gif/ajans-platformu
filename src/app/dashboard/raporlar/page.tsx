"use client";
import { useState } from "react";
import { useBrand } from "@/components/dashboard/brand-provider";
import { Loader2, FileBarChart, Download, Calendar, Star } from "lucide-react";
import { useLang } from "@/components/language-provider";

const L = {
  tr: {
    title: "Müşteri Raporları",
    subtitle: "Müşterilerinize sunabileceğiniz performans raporları",
    createTitle: "Rapor Oluştur",
    period: "Dönem", week: "Son 7 gün", month: "Son 30 gün",
    creating: "Oluşturuluyor...", createBtn: "Rapor Oluştur",
    reportWord: "Rapor", pdf: "PDF İndir",
    metrics: ["Üretilen İçerik", "Alınan Yorum", "Ortalama Puan", "Chatbot Mesaj", "QR Tarama", "AI Kullanım", "Gönderilen E-posta", "Yeni Lead (CRM)", "Sosyal Medya Post"],
    sentiment: "Yorum Duygu Analizi", connErr: "Bağlantı hatası", genErr: "Rapor oluşturulamadı",
    positive: "Olumlu", neutral: "Nötr", negative: "Olumsuz",
  },
  en: {
    title: "Client Reports",
    subtitle: "Performance reports you can present to your clients",
    createTitle: "Generate Report",
    period: "Period", week: "Last 7 days", month: "Last 30 days",
    creating: "Generating...", createBtn: "Generate Report",
    reportWord: "Report", pdf: "Download PDF",
    metrics: ["Content Produced", "Reviews Received", "Average Rating", "Chatbot Messages", "QR Scans", "AI Usage", "Emails Sent", "New Leads (CRM)", "Social Media Posts"],
    sentiment: "Review Sentiment Analysis", connErr: "Connection error", genErr: "Report could not be generated",
    positive: "Positive", neutral: "Neutral", negative: "Negative",
  },
};

interface ReportData {
  brand: string;
  period: string;
  periodKey?: "week" | "month";
  dateRange: { from: string; to: string };
  metrics: {
    contentProduced: number;
    reviewsReceived: number;
    avgRating: number;
    sentimentBreakdown: { positive: number; neutral: number; negative: number };
    chatbotInteractions: number;
    qrScans: number;
    aiUsage: number;
    emailsSent: number;
    crmLeads: number;
    socialPosts: number;
  };
  generatedAt: string;
}

export default function RaporlarPage() {
  const { lang } = useLang();
  const sL = L[lang];
  const { activeBrand } = useBrand();
  const [period, setPeriod] = useState<"week" | "month">("month");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<ReportData | null>(null);
  const [error, setError] = useState("");

  async function generateReport() {
    if (!activeBrand) return;
    setLoading(true);
    setError("");
    setReport(null);
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandId: activeBrand.id, period }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error ?? sL.genErr);
      else setReport(data.report);
    } catch {
      setError(sL.connErr);
    }
    setLoading(false);
  }

  // API geriye dönük uyumluluk için sabit Türkçe etiket dönüyor; gösterilecek
  // etiket periodKey'den dile göre üretilir.
  const periodLabel = report
    ? report.periodKey
      ? sL[report.periodKey]
      : report.period
    : "";

  const [downloading, setDownloading] = useState(false);

  async function downloadPdf() {
    if (!report || !activeBrand) return;
    setDownloading(true);
    setError("");
    try {
      const res = await fetch(
        `/api/reports/pdf?brandId=${activeBrand.id}&period=${period}&lang=${lang}`
      );
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? sL.genErr);
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${report.brand}-${periodLabel}-${sL.reportWord}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      setError(sL.connErr);
    } finally {
      setDownloading(false);
    }
  }

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString(lang === "en" ? "en-GB" : "tr-TR", { day: "numeric", month: "long", year: "numeric" });

  const inp = "rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2.5 text-sm outline-none transition focus:border-[hsl(var(--primary))]";

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
          <FileBarChart className="h-5 w-5 text-emerald-500" />
        </div>
        <div>
          <h1 className="text-xl font-bold">{sL.title}</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            {sL.subtitle}
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-500">{error}</div>
      )}

      <section className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
        <h2 className="mb-4 font-semibold">{sL.createTitle}</h2>
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[hsl(var(--muted-foreground))]">{sL.period}</label>
            <select className={inp} value={period} onChange={(e) => setPeriod(e.target.value as "week" | "month")}>
              <option value="week">{sL.week}</option>
              <option value="month">{sL.month}</option>
            </select>
          </div>
          <button onClick={generateReport} disabled={loading}
            className="flex items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileBarChart className="h-4 w-4" />}
            {loading ? sL.creating : sL.createBtn}
          </button>
        </div>
      </section>

      {report && (
        <section className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="font-semibold">{report.brand} — {periodLabel} {sL.reportWord}</h2>
              <p className="flex items-center gap-1.5 text-xs text-[hsl(var(--muted-foreground))]">
                <Calendar className="h-3.5 w-3.5" />
                {formatDate(report.dateRange.from)} – {formatDate(report.dateRange.to)}
              </p>
            </div>
            <button onClick={downloadPdf} disabled={downloading}
              className="flex items-center gap-1.5 rounded-lg bg-[hsl(var(--primary))] px-4 py-2 text-xs font-semibold text-white transition hover:opacity-90 disabled:opacity-60">
              {downloading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
              {downloading ? sL.creating : sL.pdf}
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { label: sL.metrics[0], value: report.metrics.contentProduced, color: "text-violet-500" },
              { label: sL.metrics[1], value: report.metrics.reviewsReceived, color: "text-amber-500" },
              { label: sL.metrics[2], value: report.metrics.avgRating > 0 ? `${report.metrics.avgRating} ⭐` : "—", color: "text-yellow-500" },
              { label: sL.metrics[3], value: report.metrics.chatbotInteractions, color: "text-blue-500" },
              { label: sL.metrics[4], value: report.metrics.qrScans, color: "text-emerald-500" },
              { label: sL.metrics[5], value: report.metrics.aiUsage, color: "text-pink-500" },
              { label: sL.metrics[6], value: report.metrics.emailsSent, color: "text-green-500" },
              { label: sL.metrics[7], value: report.metrics.crmLeads, color: "text-indigo-500" },
              { label: sL.metrics[8], value: report.metrics.socialPosts, color: "text-cyan-500" },
            ].map((m) => (
              <div key={m.label} className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-4 text-center">
                <p className={`text-2xl font-black ${m.color}`}>{m.value}</p>
                <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">{m.label}</p>
              </div>
            ))}
          </div>

          {report.metrics.reviewsReceived > 0 && (
            <div className="mt-6">
              <h3 className="mb-3 text-sm font-semibold">{sL.sentiment}</h3>
              <div className="flex gap-3">
                <div className="flex-1 rounded-lg bg-emerald-500/10 p-3 text-center">
                  <p className="text-lg font-bold text-emerald-500">{report.metrics.sentimentBreakdown.positive}</p>
                  <p className="text-[11px] text-[hsl(var(--muted-foreground))]">{sL.positive}</p>
                </div>
                <div className="flex-1 rounded-lg bg-amber-500/10 p-3 text-center">
                  <p className="text-lg font-bold text-amber-500">{report.metrics.sentimentBreakdown.neutral}</p>
                  <p className="text-[11px] text-[hsl(var(--muted-foreground))]">{sL.neutral}</p>
                </div>
                <div className="flex-1 rounded-lg bg-red-500/10 p-3 text-center">
                  <p className="text-lg font-bold text-red-500">{report.metrics.sentimentBreakdown.negative}</p>
                  <p className="text-[11px] text-[hsl(var(--muted-foreground))]">{sL.negative}</p>
                </div>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
