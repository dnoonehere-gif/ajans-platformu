"use client";
import { useState, useEffect, useCallback } from "react";
import {
  QrCode, Plus, Trash2, Download, ToggleLeft, ToggleRight,
  Loader2, Star, TrendingUp, TrendingDown, Minus, ExternalLink, Copy, Check,
} from "lucide-react";
import { generateQrDataUrl } from "@/lib/qr-image";

interface QrEntry {
  id: string;
  slug: string;
  label: string | null;
  isActive: boolean;
  scanCount: number;
  reviewCount: number;
  avgRating: number | null;
  sentimentCounts: { positive: number; neutral: number; negative: number };
  createdAt: string;
}

function MiniQr({ slug }: { slug: string }) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    const url = `${window.location.origin}/qr/${slug}`;
    generateQrDataUrl(url).then(setDataUrl);
  }, [slug]);

  if (!dataUrl) return <div className="h-24 w-24 animate-pulse rounded-xl bg-[hsl(var(--muted))]" />;
  return <img src={dataUrl} alt="QR" className="h-24 w-24 rounded-xl border border-[hsl(var(--border))]" />;
}

function CopyLinkButton({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(`${window.location.origin}/qr/${slug}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <button onClick={copy}
      className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium bg-[hsl(var(--muted))] hover:bg-[hsl(var(--border))] transition">
      {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? "Kopyalandı" : "Link Kopyala"}
    </button>
  );
}

function SentimentBar({ positive, neutral, negative }: { positive: number; neutral: number; negative: number }) {
  const total = positive + neutral + negative;
  if (total === 0) return <div className="h-1.5 w-full rounded-full bg-[hsl(var(--muted))]" />;
  return (
    <div className="flex h-1.5 w-full overflow-hidden rounded-full">
      <div className="bg-green-500" style={{ width: `${(positive / total) * 100}%` }} />
      <div className="bg-yellow-400" style={{ width: `${(neutral / total) * 100}%` }} />
      <div className="bg-red-500" style={{ width: `${(negative / total) * 100}%` }} />
    </div>
  );
}

export default function QrDashboardPage() {
  const [brandId, setBrandId] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [qrCodes, setQrCodes] = useState<QrEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [label, setLabel] = useState("");
  const [creating, setCreating] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/qr/${brandId}/list`);
    const data = await res.json();
    if (data.qrCodes) setQrCodes(data.qrCodes);
    setLoading(false);
  }, [brandId]);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    const res = await fetch("/api/qr/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ brandId, label: label || undefined }),
    });
    const data = await res.json();
    if (data.qrCode) {
      const enriched: QrEntry = {
        ...data.qrCode,
        reviewCount: 0,
        avgRating: null,
        sentimentCounts: { positive: 0, neutral: 0, negative: 0 },
      };
      setQrCodes((q) => [enriched, ...q]);
      setLabel("");
    }
    setCreating(false);
  }

  async function toggle(id: string) {
    setTogglingId(id);
    const res = await fetch(`/api/qr/${brandId}/${id}`, { method: "PATCH" });
    const data = await res.json();
    if (typeof data.isActive === "boolean") {
      setQrCodes((q) => q.map((qr) => qr.id === id ? { ...qr, isActive: data.isActive } : qr));
    }
    setTogglingId(null);
  }

  async function remove(id: string) {
    setDeletingId(id);
    await fetch(`/api/qr/${brandId}/${id}`, { method: "DELETE" });
    setQrCodes((q) => q.filter((qr) => qr.id !== id));
    setDeletingId(null);
  }

  async function download(id: string, slug: string) {
    setDownloadingId(id);
    const res = await fetch(`/api/qr/${brandId}/${id}/image`);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `qr-${slug}.png`;
    a.click();
    URL.revokeObjectURL(url);
    setDownloadingId(null);
  }

  const totalScans = qrCodes.reduce((a, q) => a + q.scanCount, 0);
  const totalReviews = qrCodes.reduce((a, q) => a + q.reviewCount, 0);
  const activeCount = qrCodes.filter((q) => q.isActive).length;

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      {/* Başlık */}
      <div className="mb-8 flex items-center gap-3">
        <QrCode className="h-8 w-8 text-[hsl(var(--primary))]" />
        <div>
          <h1 className="text-2xl font-bold">QR Geri Bildirim</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">QR kodlar oluştur, tarama ve geri bildirim analizlerini takip et.</p>
        </div>
      </div>

      {/* Marka ID */}
      {!loaded && (
        <div className="glass mb-8 flex gap-2 rounded-2xl p-5">
          <input type="text" placeholder="Marka ID gir..." value={brandId}
            onChange={(e) => setBrandId(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && brandId.trim()) { setLoaded(true); load(); } }}
            className="flex-1 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.5)] px-4 py-2.5 text-sm outline-none focus:border-[hsl(var(--primary))] transition" />
          <button onClick={() => { if (brandId.trim()) { setLoaded(true); load(); } }}
            className="rounded-xl bg-[hsl(var(--primary))] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90">
            Yükle
          </button>
        </div>
      )}

      {loaded && (
        <div className="space-y-5">
          {/* Özet KPI'lar */}
          {qrCodes.length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Toplam Tarama", value: totalScans, icon: QrCode, color: "#6366f1" },
                { label: "Toplam Geri Bildirim", value: totalReviews, icon: Star, color: "#f59e0b" },
                { label: "Aktif QR Kodu", value: activeCount, icon: TrendingUp, color: "#22c55e" },
              ].map((item) => (
                <div key={item.label} className="glass rounded-2xl p-5">
                  <div className="mb-2 flex items-center gap-2">
                    <item.icon className="h-4 w-4" style={{ color: item.color }} />
                    <span className="text-xs text-[hsl(var(--muted-foreground))]">{item.label}</span>
                  </div>
                  <p className="text-2xl font-bold">{item.value}</p>
                </div>
              ))}
            </div>
          )}

          {/* Yeni QR oluştur */}
          <form onSubmit={create} className="glass flex gap-2 rounded-2xl p-5">
            <input type="text" placeholder="Etiket: Masa 1, Kasa önü, Giriş..." value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="flex-1 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.5)] px-4 py-2.5 text-sm outline-none focus:border-[hsl(var(--primary))] transition" />
            <button type="submit" disabled={creating}
              className="flex items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50">
              {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              QR Oluştur
            </button>
          </form>

          {/* QR listesi */}
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--primary))]" />
            </div>
          ) : qrCodes.length === 0 ? (
            <div className="glass rounded-2xl py-16 text-center">
              <QrCode className="mx-auto mb-3 h-12 w-12 text-[hsl(var(--muted-foreground))]" />
              <p className="text-sm text-[hsl(var(--muted-foreground))]">Henüz QR kodu yok. Yukarıdan oluştur.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {qrCodes.map((qr) => (
                <div key={qr.id} className={`glass rounded-2xl p-5 transition ${!qr.isActive ? "opacity-60" : ""}`}>
                  <div className="flex gap-5">
                    {/* QR görsel */}
                    <div className="shrink-0">
                      <MiniQr slug={qr.slug} />
                    </div>

                    {/* Bilgiler */}
                    <div className="flex-1 min-w-0">
                      <div className="mb-2 flex items-center gap-2">
                        <h3 className="font-semibold">{qr.label ?? "QR Kodu"}</h3>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${qr.isActive ? "bg-green-500/15 text-green-400" : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]"}`}>
                          {qr.isActive ? "Aktif" : "Pasif"}
                        </span>
                      </div>

                      <p className="mb-3 text-xs text-[hsl(var(--muted-foreground))] font-mono">/qr/{qr.slug}</p>

                      {/* İstatistikler */}
                      <div className="mb-3 grid grid-cols-3 gap-3">
                        <div className="rounded-xl bg-[hsl(var(--muted)/0.5)] p-2.5 text-center">
                          <p className="text-lg font-bold">{qr.scanCount}</p>
                          <p className="text-xs text-[hsl(var(--muted-foreground))]">Tarama</p>
                        </div>
                        <div className="rounded-xl bg-[hsl(var(--muted)/0.5)] p-2.5 text-center">
                          <p className="text-lg font-bold">{qr.reviewCount}</p>
                          <p className="text-xs text-[hsl(var(--muted-foreground))]">Geri Bildirim</p>
                        </div>
                        <div className="rounded-xl bg-[hsl(var(--muted)/0.5)] p-2.5 text-center">
                          <p className="text-lg font-bold">
                            {qr.avgRating ? qr.avgRating.toFixed(1) : "—"}
                          </p>
                          <p className="text-xs text-[hsl(var(--muted-foreground))]">Ort. Puan</p>
                        </div>
                      </div>

                      {/* Sentiment bar */}
                      {qr.reviewCount > 0 && (
                        <div className="mb-2">
                          <SentimentBar {...qr.sentimentCounts} />
                          <div className="mt-1.5 flex gap-3 text-xs text-[hsl(var(--muted-foreground))]">
                            <span className="flex items-center gap-1"><TrendingUp className="h-3 w-3 text-green-400" />{qr.sentimentCounts.positive}</span>
                            <span className="flex items-center gap-1"><Minus className="h-3 w-3 text-yellow-400" />{qr.sentimentCounts.neutral}</span>
                            <span className="flex items-center gap-1"><TrendingDown className="h-3 w-3 text-red-400" />{qr.sentimentCounts.negative}</span>
                          </div>
                        </div>
                      )}

                      {/* Aksiyonlar */}
                      <div className="flex flex-wrap gap-2 mt-2">
                        <CopyLinkButton slug={qr.slug} />
                        <a href={`/qr/${qr.slug}`} target="_blank" rel="noreferrer"
                          className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium bg-[hsl(var(--muted))] hover:bg-[hsl(var(--border))] transition">
                          <ExternalLink className="h-3.5 w-3.5" /> Formu Aç
                        </a>
                        <button onClick={() => download(qr.id, qr.slug)} disabled={downloadingId === qr.id}
                          className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium bg-[hsl(var(--muted))] hover:bg-[hsl(var(--border))] transition disabled:opacity-50">
                          {downloadingId === qr.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
                          PNG İndir
                        </button>
                        <button onClick={() => toggle(qr.id)} disabled={togglingId === qr.id}
                          className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium bg-[hsl(var(--muted))] hover:bg-[hsl(var(--border))] transition disabled:opacity-50">
                          {togglingId === qr.id
                            ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            : qr.isActive
                              ? <ToggleRight className="h-3.5 w-3.5 text-green-400" />
                              : <ToggleLeft className="h-3.5 w-3.5" />}
                          {qr.isActive ? "Pasife Al" : "Aktif Et"}
                        </button>
                        <button onClick={() => remove(qr.id)} disabled={deletingId === qr.id}
                          className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium hover:bg-red-500/10 hover:text-red-400 transition disabled:opacity-50">
                          {deletingId === qr.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                          Sil
                        </button>
                      </div>
                    </div>
                  </div>

                  <p className="mt-3 text-right text-xs text-[hsl(var(--muted-foreground))]">
                    Oluşturuldu: {new Date(qr.createdAt).toLocaleDateString("tr-TR")}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
