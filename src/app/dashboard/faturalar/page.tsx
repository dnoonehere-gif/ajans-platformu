"use client";
import { useState, useEffect, useCallback } from "react";
import {
  Receipt, Loader2, CheckCircle, Clock, XCircle, RotateCcw,
  ChevronLeft, ChevronRight, Filter, Download, CreditCard,
  TrendingUp, FileText,
} from "lucide-react";
import { useBrand } from "@/components/dashboard/brand-provider";

interface Invoice {
  id: string;
  amountCents: number;
  currency: string;
  status: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  provider: string;
  providerRef: string | null;
  paidAt: string | null;
  createdAt: string;
  brandName: string;
  planName: string;
}

interface Stats {
  [key: string]: { count: number; totalCents: number };
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ComponentType<{ className?: string }> }> = {
  PENDING: { label: "Beklemede", color: "text-yellow-400", bg: "bg-yellow-500/10", icon: Clock },
  PAID: { label: "Ödendi", color: "text-green-400", bg: "bg-green-500/10", icon: CheckCircle },
  FAILED: { label: "Başarısız", color: "text-red-400", bg: "bg-red-500/10", icon: XCircle },
  REFUNDED: { label: "İade", color: "text-blue-400", bg: "bg-blue-500/10", icon: RotateCcw },
};

const PROVIDER_LABELS: Record<string, string> = {
  SHOPIER: "Shopier",
  PAYTR: "PayTR",
  STRIPE: "Stripe",
  MANUAL: "Manuel",
};

function fmt(cents: number, currency = "TRY") {
  return (cents / 100).toLocaleString("tr-TR", { style: "currency", currency, minimumFractionDigits: 0 });
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("tr-TR", { day: "2-digit", month: "long", year: "numeric" });
}

function formatDateTime(d: string) {
  return new Date(d).toLocaleDateString("tr-TR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function FaturalarPage() {
  const { activeBrand } = useBrand();
  const brandId = activeBrand?.id ?? "";

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState<string>("");

  const load = useCallback(async () => {
    if (!brandId) return;
    setLoading(true);
    const params = new URLSearchParams({ brandId, page: String(page) });
    if (filter) params.set("status", filter);
    const res = await fetch(`/api/invoices?${params}`);
    const data = await res.json();
    setInvoices(data.invoices ?? []);
    setTotal(data.total ?? 0);
    setPages(data.pages ?? 1);
    if (data.stats) setStats(data.stats);
    setLoading(false);
  }, [brandId, page, filter]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [filter, brandId]);

  const totalPaid = stats?.PAID?.totalCents ?? 0;
  const totalPending = stats?.PENDING?.totalCents ?? 0;
  const paidCount = stats?.PAID?.count ?? 0;
  const allCount = Object.values(stats ?? {}).reduce((a, s) => a + s.count, 0);

  function downloadInvoicePdf(inv: Invoice) {
    const sc = STATUS_CONFIG[inv.status];
    const html = `<!DOCTYPE html>
<html lang="tr">
<head><meta charset="UTF-8"><title>Fatura ${inv.id.slice(-8).toUpperCase()}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',Arial,sans-serif;background:#fff;color:#1a1a2e;padding:48px;max-width:800px;margin:0 auto}
.header{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #6366f1;padding-bottom:24px;margin-bottom:32px}
.brand{font-size:28px;font-weight:800;color:#6366f1}
.brand small{display:block;font-size:12px;font-weight:400;color:#888;margin-top:2px}
.inv-no{text-align:right}
.inv-no .no{font-size:20px;font-weight:700}
.inv-no .date{font-size:13px;color:#888;margin-top:4px}
table{width:100%;border-collapse:collapse;margin:24px 0}
th{text-align:left;font-size:12px;text-transform:uppercase;color:#888;padding:10px 12px;border-bottom:2px solid #e5e7eb}
td{padding:14px 12px;border-bottom:1px solid #f0f0f0;font-size:14px}
.total-row{display:flex;justify-content:flex-end;margin-top:16px}
.total-box{background:#f8f8fc;border-radius:12px;padding:20px 32px;text-align:right}
.total-box .label{font-size:12px;color:#888}
.total-box .amount{font-size:30px;font-weight:900;color:#6366f1}
.status{display:inline-block;padding:4px 14px;border-radius:99px;font-size:12px;font-weight:700}
.status.paid{background:#dcfce7;color:#16a34a}
.status.pending{background:#fef9c3;color:#ca8a04}
.status.failed{background:#fee2e2;color:#dc2626}
.status.refunded{background:#dbeafe;color:#2563eb}
.footer{margin-top:48px;padding-top:20px;border-top:1px solid #e5e7eb;font-size:11px;color:#999;text-align:center}
@media print{body{padding:24px}}
</style></head>
<body>
<div class="header">
  <div class="brand">Novelya<small>novelya.com.tr</small></div>
  <div class="inv-no">
    <div class="no">Fatura #${inv.id.slice(-8).toUpperCase()}</div>
    <div class="date">${formatDate(inv.createdAt)}</div>
  </div>
</div>
<table>
  <thead><tr><th>Açıklama</th><th>Marka</th><th>Ödeme Yöntemi</th><th>Durum</th><th style="text-align:right">Tutar</th></tr></thead>
  <tbody><tr>
    <td><strong>${inv.planName}</strong> aboneliği</td>
    <td>${inv.brandName}</td>
    <td>${PROVIDER_LABELS[inv.provider] ?? inv.provider}${inv.providerRef ? `<br><span style="font-size:11px;color:#999">Ref: ${inv.providerRef}</span>` : ""}</td>
    <td><span class="status ${inv.status.toLowerCase()}">${sc?.label ?? inv.status}</span></td>
    <td style="text-align:right;font-weight:700">${fmt(inv.amountCents, inv.currency)}</td>
  </tr></tbody>
</table>
<div class="total-row"><div class="total-box">
  <div class="label">TOPLAM</div>
  <div class="amount">${fmt(inv.amountCents, inv.currency)}</div>
  ${inv.paidAt ? `<div class="label" style="margin-top:6px">Ödeme: ${formatDateTime(inv.paidAt)}</div>` : ""}
</div></div>
<div class="footer">Bu belge Novelya platformu tarafından oluşturulmuştur. Resmi e-fatura yerine geçmez.</div>
<script>window.onload=function(){setTimeout(function(){window.print()},400)}</script>
</body></html>`;

    const w = window.open("", "_blank");
    if (w) { w.document.write(html); w.document.close(); }
  }

  function exportCSV() {
    if (invoices.length === 0) return;
    const header = "Tarih,Plan,Tutar,Durum,Ödeme Yöntemi,Referans\n";
    const rows = invoices.map((inv) =>
      `${formatDate(inv.createdAt)},${inv.planName},${(inv.amountCents / 100).toFixed(2)},${STATUS_CONFIG[inv.status]?.label ?? inv.status},${PROVIDER_LABELS[inv.provider] ?? inv.provider},${inv.providerRef ?? "-"}`
    ).join("\n");
    const blob = new Blob(["﻿" + header + rows], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `faturalar-${brandId.slice(0, 8)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Faturalar & Ödeme Geçmişi</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">Tüm ödeme ve fatura kayıtlarınız</p>
        </div>
        <button
          onClick={exportCSV}
          disabled={invoices.length === 0}
          className="flex items-center gap-2 rounded-xl border border-[hsl(var(--border))] px-3 py-2 text-sm transition hover:bg-[hsl(var(--accent))] disabled:opacity-50"
        >
          <Download className="h-4 w-4" /> CSV İndir
        </button>
      </div>

      {/* Stats Cards */}
      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="glass nv-card-hover rounded-2xl p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-[hsl(var(--muted-foreground))]">Toplam Ödenen</span>
            <CreditCard className="h-4 w-4 text-green-400" />
          </div>
          <p className="text-2xl font-bold text-green-400">{fmt(totalPaid)}</p>
          <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">{paidCount} fatura</p>
        </div>

        <div className="glass nv-card-hover rounded-2xl p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-[hsl(var(--muted-foreground))]">Bekleyen</span>
            <Clock className="h-4 w-4 text-yellow-400" />
          </div>
          <p className="text-2xl font-bold text-yellow-400">{fmt(totalPending)}</p>
          <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">{stats?.PENDING?.count ?? 0} fatura</p>
        </div>

        <div className="glass nv-card-hover rounded-2xl p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-[hsl(var(--muted-foreground))]">Toplam Fatura</span>
            <Receipt className="h-4 w-4 text-[hsl(var(--primary))]" />
          </div>
          <p className="text-2xl font-bold">{allCount}</p>
          <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">tüm zamanlar</p>
        </div>

        <div className="glass nv-card-hover rounded-2xl p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-[hsl(var(--muted-foreground))]">Ort. Fatura</span>
            <TrendingUp className="h-4 w-4 text-indigo-400" />
          </div>
          <p className="text-2xl font-bold">{paidCount > 0 ? fmt(Math.round(totalPaid / paidCount)) : "—"}</p>
          <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">ödenen başına</p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4 flex items-center gap-2 flex-wrap">
        <Filter className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
        {[
          { value: "", label: "Tümü" },
          { value: "PAID", label: "Ödenen" },
          { value: "PENDING", label: "Bekleyen" },
          { value: "FAILED", label: "Başarısız" },
          { value: "REFUNDED", label: "İade" },
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              filter === f.value
                ? "bg-[hsl(var(--primary))] text-white"
                : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))]"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Invoice Table */}
      <div className="glass rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--primary))]" />
          </div>
        ) : invoices.length === 0 ? (
          <div className="flex h-48 flex-col items-center justify-center gap-3">
            <Receipt className="h-12 w-12 text-[hsl(var(--muted-foreground)/0.3)]" />
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              {filter ? "Bu filtreyle fatura bulunamadı" : "Henüz fatura yok"}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[hsl(var(--border))] text-left text-xs text-[hsl(var(--muted-foreground))]">
                    <th className="px-5 py-3 font-medium">Tarih</th>
                    <th className="px-5 py-3 font-medium">Plan</th>
                    <th className="px-5 py-3 font-medium">Tutar</th>
                    <th className="px-5 py-3 font-medium">Durum</th>
                    <th className="px-5 py-3 font-medium">Ödeme</th>
                    <th className="px-5 py-3 font-medium">Referans</th>
                    <th className="px-5 py-3 font-medium"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[hsl(var(--border))]">
                  {invoices.map((inv) => {
                    const sc = STATUS_CONFIG[inv.status] ?? STATUS_CONFIG.PENDING;
                    const Icon = sc.icon;
                    return (
                      <tr key={inv.id} className="transition hover:bg-[hsl(var(--accent)/0.5)]">
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <p className="font-medium">{formatDate(inv.createdAt)}</p>
                          {inv.paidAt && <p className="text-[10px] text-[hsl(var(--muted-foreground))]">Ödeme: {formatDateTime(inv.paidAt)}</p>}
                        </td>
                        <td className="px-5 py-3.5">
                          <p className="font-medium">{inv.planName}</p>
                          <p className="text-xs text-[hsl(var(--muted-foreground))]">{inv.brandName}</p>
                        </td>
                        <td className="px-5 py-3.5 font-semibold tabular-nums">{fmt(inv.amountCents, inv.currency)}</td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${sc.bg} ${sc.color}`}>
                            <Icon className="h-3 w-3" /> {sc.label}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-[hsl(var(--muted-foreground))]">{PROVIDER_LABELS[inv.provider] ?? inv.provider}</td>
                        <td className="px-5 py-3.5 font-mono text-xs text-[hsl(var(--muted-foreground))]">{inv.providerRef ?? "—"}</td>
                        <td className="px-5 py-3.5">
                          <button
                            onClick={() => downloadInvoicePdf(inv)}
                            title="PDF indir"
                            className="flex items-center gap-1 rounded-lg border border-[hsl(var(--border))] px-2.5 py-1.5 text-xs text-[hsl(var(--muted-foreground))] transition hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--primary))]"
                          >
                            <FileText className="h-3.5 w-3.5" /> PDF
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-[hsl(var(--border))]">
              {invoices.map((inv) => {
                const sc = STATUS_CONFIG[inv.status] ?? STATUS_CONFIG.PENDING;
                const Icon = sc.icon;
                return (
                  <div key={inv.id} className="px-4 py-3.5">
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-sm font-semibold">{fmt(inv.amountCents, inv.currency)}</p>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${sc.bg} ${sc.color}`}>
                        <Icon className="h-3 w-3" /> {sc.label}
                      </span>
                    </div>
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">{inv.planName} · {inv.brandName}</p>
                    <div className="mt-1 flex items-center gap-3 text-[10px] text-[hsl(var(--muted-foreground))]">
                      <span>{formatDate(inv.createdAt)}</span>
                      <span>{PROVIDER_LABELS[inv.provider] ?? inv.provider}</span>
                      {inv.providerRef && <span className="font-mono">{inv.providerRef}</span>}
                      <button
                        onClick={() => downloadInvoicePdf(inv)}
                        className="ml-auto flex items-center gap-1 text-[hsl(var(--primary))]"
                      >
                        <FileText className="h-3 w-3" /> PDF
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-xs text-[hsl(var(--muted-foreground))]">
            {total} faturadan {(page - 1) * 20 + 1}–{Math.min(page * 20, total)} gösteriliyor
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="rounded-lg p-1.5 transition hover:bg-[hsl(var(--accent))] disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-2 text-sm font-medium">{page} / {pages}</span>
            <button
              onClick={() => setPage((p) => Math.min(pages, p + 1))}
              disabled={page >= pages}
              className="rounded-lg p-1.5 transition hover:bg-[hsl(var(--accent))] disabled:opacity-30"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
