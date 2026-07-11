"use client";
import { useState } from "react";
import { useBrand } from "@/components/dashboard/brand-provider";
import { Loader2, FileBarChart, Download, Calendar } from "lucide-react";

interface ReportData {
  brand: string;
  period: string;
  dateRange: { from: string; to: string };
  metrics: {
    contentProduced: number;
    reviewsReceived: number;
    chatbotInteractions: number;
    qrScans: number;
    aiUsage: number;
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

  function downloadAsJson() {
    if (!report) return;
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rapor-${report.brand}-${report.period}.json`;
    a.click();
    URL.revokeObjectURL(url);
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

      {/* Rapor oluştur */}
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

      {/* Rapor sonucu */}
      {report && (
        <section className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-semibold">{report.brand} — Performans Raporu</h2>
              <p className="flex items-center gap-1.5 text-xs text-[hsl(var(--muted-foreground))]">
                <Calendar className="h-3.5 w-3.5" />
                {formatDate(report.dateRange.from)} – {formatDate(report.dateRange.to)}
              </p>
            </div>
            <button onClick={downloadAsJson}
              className="flex items-center gap-1.5 rounded-lg border border-[hsl(var(--border))] px-3 py-1.5 text-xs font-medium transition hover:bg-[hsl(var(--accent))]">
              <Download className="h-3.5 w-3.5" /> İndir
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { label: "Üretilen İçerik", value: report.metrics.contentProduced, color: "text-violet-500" },
              { label: "Alınan Yorum", value: report.metrics.reviewsReceived, color: "text-amber-500" },
              { label: "Chatbot Etkileşim", value: report.metrics.chatbotInteractions, color: "text-blue-500" },
              { label: "QR Tarama", value: report.metrics.qrScans, color: "text-emerald-500" },
              { label: "AI Kullanım", value: report.metrics.aiUsage, color: "text-pink-500" },
            ].map((m) => (
              <div key={m.label} className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-4 text-center">
                <p className={`text-2xl font-black ${m.color}`}>{m.value}</p>
                <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">{m.label}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
