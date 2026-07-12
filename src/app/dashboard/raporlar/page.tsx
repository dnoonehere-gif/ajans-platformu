"use client";
import { useState } from "react";
import { useBrand } from "@/components/dashboard/brand-provider";
import { Loader2, FileBarChart, Download, Calendar, Star } from "lucide-react";

interface ReportData {
  brand: string;
  period: string;
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
      if (!res.ok) setError(data.error ?? "Rapor oluşturulamadı");
      else setReport(data.report);
    } catch {
      setError("Bağlantı hatası");
    }
    setLoading(false);
  }

  function downloadPdf() {
    if (!report) return;
    const fmt = (iso: string) => new Date(iso).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });
    const m = report.metrics;

    const html = `<!DOCTYPE html>
<html lang="tr">
<head><meta charset="UTF-8"><title>${report.brand} — ${report.period} Rapor</title>
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
    <div class="period">${report.period} Performans Raporu</div>
    <div class="date">${fmt(report.dateRange.from)} – ${fmt(report.dateRange.to)}</div>
  </div>
  <div style="text-align:right">
    <div style="font-size:12px;color:#aaa">Oluşturulma</div>
    <div style="font-size:13px;color:#666">${fmt(report.generatedAt)}</div>
  </div>
</div>

<h2>Genel Metrikler</h2>
<div class="grid">
  <div class="card"><div class="value">${m.contentProduced}</div><div class="label">Üretilen İçerik</div></div>
  <div class="card amber"><div class="value">${m.reviewsReceived}</div><div class="label">Alınan Yorum</div></div>
  <div class="card"><div class="value">${m.avgRating > 0 ? m.avgRating + " ⭐" : "—"}</div><div class="label">Ortalama Puan</div></div>
  <div class="card blue"><div class="value">${m.chatbotInteractions}</div><div class="label">Chatbot Mesaj</div></div>
  <div class="card emerald"><div class="value">${m.qrScans}</div><div class="label">QR Tarama</div></div>
  <div class="card pink"><div class="value">${m.aiUsage}</div><div class="label">AI Kullanım</div></div>
  <div class="card green"><div class="value">${m.emailsSent}</div><div class="label">Gönderilen E-posta</div></div>
  <div class="card"><div class="value">${m.crmLeads}</div><div class="label">Yeni Lead (CRM)</div></div>
  <div class="card blue"><div class="value">${m.socialPosts}</div><div class="label">Sosyal Medya Post</div></div>
</div>

${m.reviewsReceived > 0 ? `
<h2>Yorum Duygu Analizi</h2>
<div class="sentiment">
  <div class="bar pos">😊 Olumlu: ${m.sentimentBreakdown.positive}</div>
  <div class="bar neu">😐 Nötr: ${m.sentimentBreakdown.neutral}</div>
  <div class="bar neg">😞 Olumsuz: ${m.sentimentBreakdown.negative}</div>
</div>` : ""}

<div class="footer">Bu rapor Novelya platformu tarafından otomatik oluşturulmuştur. · ${fmt(report.generatedAt)}</div>
</body></html>`;

    const w = window.open("", "_blank");
    if (w) {
      w.document.write(html);
      w.document.close();
      setTimeout(() => w.print(), 500);
    }
  }

  const formatDate = (iso: string) => new Date(iso).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });

  const inp = "rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2.5 text-sm outline-none transition focus:border-[hsl(var(--primary))]";

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
          <FileBarChart className="h-5 w-5 text-emerald-500" />
        </div>
        <div>
          <h1 className="text-xl font-bold">Müşteri Raporları</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            Müşterilerinize sunabileceğiniz performans raporları
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-500">{error}</div>
      )}

      <section className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
        <h2 className="mb-4 font-semibold">Rapor Oluştur</h2>
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[hsl(var(--muted-foreground))]">Dönem</label>
            <select className={inp} value={period} onChange={(e) => setPeriod(e.target.value as "week" | "month")}>
              <option value="week">Son 7 gün</option>
              <option value="month">Son 30 gün</option>
            </select>
          </div>
          <button onClick={generateReport} disabled={loading}
            className="flex items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileBarChart className="h-4 w-4" />}
            {loading ? "Oluşturuluyor..." : "Rapor Oluştur"}
          </button>
        </div>
      </section>

      {report && (
        <section className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="font-semibold">{report.brand} — {report.period} Rapor</h2>
              <p className="flex items-center gap-1.5 text-xs text-[hsl(var(--muted-foreground))]">
                <Calendar className="h-3.5 w-3.5" />
                {formatDate(report.dateRange.from)} – {formatDate(report.dateRange.to)}
              </p>
            </div>
            <button onClick={downloadPdf}
              className="flex items-center gap-1.5 rounded-lg bg-[hsl(var(--primary))] px-4 py-2 text-xs font-semibold text-white transition hover:opacity-90">
              <Download className="h-3.5 w-3.5" /> PDF İndir
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { label: "Üretilen İçerik", value: report.metrics.contentProduced, color: "text-violet-500" },
              { label: "Alınan Yorum", value: report.metrics.reviewsReceived, color: "text-amber-500" },
              { label: "Ortalama Puan", value: report.metrics.avgRating > 0 ? `${report.metrics.avgRating} ⭐` : "—", color: "text-yellow-500" },
              { label: "Chatbot Mesaj", value: report.metrics.chatbotInteractions, color: "text-blue-500" },
              { label: "QR Tarama", value: report.metrics.qrScans, color: "text-emerald-500" },
              { label: "AI Kullanım", value: report.metrics.aiUsage, color: "text-pink-500" },
              { label: "Gönderilen E-posta", value: report.metrics.emailsSent, color: "text-green-500" },
              { label: "Yeni Lead (CRM)", value: report.metrics.crmLeads, color: "text-indigo-500" },
              { label: "Sosyal Medya Post", value: report.metrics.socialPosts, color: "text-cyan-500" },
            ].map((m) => (
              <div key={m.label} className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-4 text-center">
                <p className={`text-2xl font-black ${m.color}`}>{m.value}</p>
                <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">{m.label}</p>
              </div>
            ))}
          </div>

          {report.metrics.reviewsReceived > 0 && (
            <div className="mt-6">
              <h3 className="mb-3 text-sm font-semibold">Yorum Duygu Analizi</h3>
              <div className="flex gap-3">
                <div className="flex-1 rounded-lg bg-emerald-500/10 p-3 text-center">
                  <p className="text-lg font-bold text-emerald-500">{report.metrics.sentimentBreakdown.positive}</p>
                  <p className="text-[11px] text-[hsl(var(--muted-foreground))]">Olumlu</p>
                </div>
                <div className="flex-1 rounded-lg bg-amber-500/10 p-3 text-center">
                  <p className="text-lg font-bold text-amber-500">{report.metrics.sentimentBreakdown.neutral}</p>
                  <p className="text-[11px] text-[hsl(var(--muted-foreground))]">Nötr</p>
                </div>
                <div className="flex-1 rounded-lg bg-red-500/10 p-3 text-center">
                  <p className="text-lg font-bold text-red-500">{report.metrics.sentimentBreakdown.negative}</p>
                  <p className="text-[11px] text-[hsl(var(--muted-foreground))]">Olumsuz</p>
                </div>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
