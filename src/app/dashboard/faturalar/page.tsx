"use client";
import { useState, useEffect, useCallback } from "react";
import {
  Receipt, Loader2, CheckCircle, Clock, XCircle, RotateCcw,
  ChevronLeft, ChevronRight, Filter, Download, CreditCard,
  TrendingUp,
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
