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
    pdfReportTitle: "Performans Raporu",
    pdfMetricsHeading: "Genel Metrikler",
    pdfGeneratedLabel: "Oluşturulma",
    pdfFooter: "Bu rapor Novelya platformu tarafından otomatik oluşturulmuştur.",
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
    pdfReportTitle: "Performance Report",
    pdfMetricsHeading: "Overview Metrics",
    pdfGeneratedLabel: "Generated",
    pdfFooter: "This report was generated automatically by the Novelya platform.",
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

  function downloadPdf() {
    if (!report) return;
    const locale = lang === "en" ? "en-GB" : "tr-TR";
    const fmt = (iso: string) => new Date(iso).toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric" });
    const m = report.metrics;

    const html = `<!DOCTYPE html>
<html lang="${lang}">
<head><meta charset="UTF-8"><title>${report.brand} — ${periodLabel} ${sL.reportWord}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',Arial,sans-serif;background:#fff;color:#1a1a2e;padding:40px}
.header{display:flex;justify-content:space-between;align-items:center;border-bottom:3px solid #6366f1;padding-bottom:20px;margin-bottom:30px}
.brand{font-size:28px;font-weight:800;color:#6366f1}
.period{font-size:14px;color:#666}
.date{font-size:13px;color:#888;margin-top:4px}
h2{font-size:18px;font-weight:700;margin:24px 0 12px;color:#1a1a2e}
.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:24px}
.card{border:1px solid #e5e7eb;border-radius:12px;padding:20px;text-align:center}
.card .value{font-size:32px;font-weight:900;color:#6366f1}
.card .label{font-size:12px;color:#888;margin-top:4px}
.card.green .value{color:#22c55e}
.card.amber .value{color:#f59e0b}
.card.blue .value{color:#3b82f6}
.card.pink .value{color:#ec4899}
.card.red .value{color:#ef4444}
.card.emerald .value{color:#10b981}
.sentiment{display:flex;gap:12px;margin-bottom:24px}
.sentiment .bar{flex:1;border-radius:8px;padding:12px;text-align:center;font-size:13px;font-weight:600}
.sentiment .pos{background:#dcfce7;color:#16a34a}
.sentiment .neu{background:#fef9c3;color:#a16207}
.sentiment .neg{background:#fecaca;color:#dc2626}
.footer{margin-top:40px;padding-top:16px;border-top:1px solid #e5e7eb;text-align:center;font-size:11px;color:#aaa}
.stars{color:#f59e0b;font-size:14px}
@media print{body{padding:20px}.grid{grid-template-columns:repeat(3,1fr)}}
</style></head>
<body>
<div class="header">
  <div>
    <div class="brand">${report.brand}</div>
    <div class="period">${periodLabel} ${sL.pdfReportTitle}</div>
    <div class="date">${fmt(report.dateRange.from)} – ${fmt(report.dateRange.to)}</div>
  </div>
  <div style="text-align:right">
    <div style="font-size:12px;color:#aaa">${sL.pdfGeneratedLabel}</div>
    <div style="font-size:13px;color:#666">${fmt(report.generatedAt)}</div>
  </div>
</div>

<h2>${sL.pdfMetricsHeading}</h2>
<div class="grid">
  <div class="card"><div class="value">${m.contentProduced}</div><div class="label">${sL.metrics[0]}</div></div>
  <div class="card amber"><div class="value">${m.reviewsReceived}</div><div class="label">${sL.metrics[1]}</div></div>
  <div class="card"><div class="value">${m.avgRating > 0 ? m.avgRating + " ⭐" : "—"}</div><div class="label">${sL.metrics[2]}</div></div>
  <div class="card blue"><div class="value">${m.chatbotInteractions}</div><div class="label">${sL.metrics[3]}</div></div>
  <div class="card emerald"><div class="value">${m.qrScans}</div><div class="label">${sL.metrics[4]}</div></div>
  <div class="card pink"><div class="value">${m.aiUsage}</div><div class="label">${sL.metrics[5]}</div></div>
  <div class="card green"><div class="value">${m.emailsSent}</div><div class="label">${sL.metrics[6]}</div></div>
  <div class="card"><div class="value">${m.crmLeads}</div><div class="label">${sL.metrics[7]}</div></div>
  <div class="card blue"><div class="value">${m.socialPosts}</div><div class="label">${sL.metrics[8]}</div></div>
</div>

${m.reviewsReceived > 0 ? `
<h2>${sL.sentiment}</h2>
<div class="sentiment">
  <div class="bar pos">😊 ${sL.positive}: ${m.sentimentBreakdown.positive}</div>
  <div class="bar neu">😐 ${sL.neutral}: ${m.sentimentBreakdown.neutral}</div>
  <div class="bar neg">😞 ${sL.negative}: ${m.sentimentBreakdown.negative}</div>
</div>` : ""}

<div class="footer">${sL.pdfFooter} · ${fmt(report.generatedAt)}</div>
</body></html>`;

    const w = window.open("", "_blank");
    if (w) {
      w.document.write(html);
      w.document.close();
      setTimeout(() => w.print(), 500);
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
            <button onClick={downloadPdf}
              className="flex items-center gap-1.5 rounded-lg bg-[hsl(var(--primary))] px-4 py-2 text-xs font-semibold text-white transition hover:opacity-90">
              <Download className="h-3.5 w-3.5" /> {sL.pdf}
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
