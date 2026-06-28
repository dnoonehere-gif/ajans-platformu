"use client";
import { useState, useEffect, useCallback } from "react";
import {
  QrCode, Plus, Loader2, Copy, Download, Trash2,
  Check, ExternalLink, ToggleLeft, ToggleRight, ScanLine,
} from "lucide-react";
import Image from "next/image";
import { useBrand } from "@/components/dashboard/brand-provider";

interface QrCodeItem {
  id: string;
  slug: string;
  label: string | null;
  scanCount: number;
  isActive: boolean;
  createdAt: string;
}

function qrImageUrl(slug: string) {
  const url = `${window.location.origin}/qr/${slug}`;
  return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}&margin=10`;
}

function feedbackUrl(slug: string) {
  return `${window.location.origin}/qr/${slug}`;
}

export default function QrPage() {
  const { activeBrand } = useBrand();
  const [codes, setCodes] = useState<QrCodeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [label, setLabel] = useState("");
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [selected, setSelected] = useState<QrCodeItem | null>(null);

  const loadCodes = useCallback(async () => {
    if (!activeBrand) return;
    setLoading(true);
    const res = await fetch(`/api/qr/list?brandId=${activeBrand.id}`);
    const data = await res.json();
    setCodes(data.codes ?? []);
    if (data.codes?.length) setSelected(data.codes[0]);
    setLoading(false);
  }, [activeBrand?.id]);

  useEffect(() => { loadCodes(); }, [loadCodes]);

  async function createCode() {
    if (!activeBrand) return;
    setCreating(true);
    const res = await fetch("/api/qr/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ brandId: activeBrand.id, label: label || undefined }),
    });
    const data = await res.json();
    if (data.qrCode) {
      setCodes((c) => [data.qrCode, ...c]);
      setSelected(data.qrCode);
      setLabel("");
    }
    setCreating(false);
  }

  async function toggleCode(id: string, isActive: boolean) {
    setToggling(id);
    await fetch("/api/qr/toggle", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isActive: !isActive }),
    });
    setCodes((c) => c.map((x) => x.id === id ? { ...x, isActive: !x.isActive } : x));
    setSelected((s) => s?.id === id ? { ...s, isActive: !s.isActive } : s);
    setToggling(null);
  }

  async function deleteCode(id: string) {
    if (!confirm("Bu QR kodu silmek istediğinizden emin misiniz?")) return;
    setDeleting(id);
    await fetch("/api/qr/delete", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setCodes((c) => c.filter((x) => x.id !== id));
    if (selected?.id === id) setSelected(codes.find((x) => x.id !== id) ?? null);
    setDeleting(null);
  }

  function copyLink(slug: string) {
    navigator.clipboard.writeText(feedbackUrl(slug));
    setCopied(slug);
    setTimeout(() => setCopied(null), 2000);
  }

  function downloadQr(slug: string, name: string) {
    const link = document.createElement("a");
    link.href = qrImageUrl(slug);
    link.download = `qr-${name || slug}.png`;
    link.target = "_blank";
    link.click();
  }

  if (!activeBrand) return (
    <div className="flex h-64 items-center justify-center text-[hsl(var(--muted-foreground))]">
      Önce bir marka seçin
    </div>
  );

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(var(--primary)/0.12)]">
          <QrCode className="h-5 w-5 text-[hsl(var(--primary))]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">QR Geri Bildirim</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            {activeBrand.name} · QR okut, müşteri yorum bıraksın
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Sol */}
        <div className="space-y-4 lg:col-span-1">
          {/* Yeni */}
          <div className="glass rounded-2xl p-5">
            <p className="mb-3 text-sm font-semibold">Yeni QR Kodu</p>
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && createCode()}
              placeholder="Masa 1, Giriş, Kasa..."
              className="mb-3 w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.5)] px-4 py-2.5 text-sm outline-none transition focus:border-[hsl(var(--primary))] placeholder:text-[hsl(var(--muted-foreground))]"
            />
            <button
              onClick={createCode}
              disabled={creating}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[hsl(var(--primary))] py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
            >
              {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Oluştur
            </button>
          </div>

          {/* Liste */}
          {loading ? (
            <div className="flex h-32 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-[hsl(var(--primary))]" />
            </div>
          ) : codes.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-[hsl(var(--border))] py-10 text-center">
              <QrCode className="h-10 w-10 text-[hsl(var(--muted-foreground)/0.3)]" />
              <p className="text-sm text-[hsl(var(--muted-foreground))]">Henüz QR kodu yok</p>
            </div>
          ) : (
            <div className="space-y-2">
              {codes.map((code) => (
                <button
                  key={code.id}
                  onClick={() => setSelected(code)}
                  className={`glass w-full rounded-2xl p-4 text-left transition hover:ring-1 hover:ring-[hsl(var(--primary)/0.3)] ${
                    selected?.id === code.id ? "ring-2 ring-[hsl(var(--primary))]" : ""
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="truncate text-sm font-medium">{code.label ?? `QR ${code.slug}`}</p>
                    <span className={`ml-2 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      code.isActive ? "bg-green-500/15 text-green-400" : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]"
                    }`}>
                      {code.isActive ? "Aktif" : "Pasif"}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-1 text-xs text-[hsl(var(--muted-foreground))]">
                    <ScanLine className="h-3 w-3" /> {code.scanCount} tarama
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Sağ: Detay */}
        <div className="lg:col-span-2">
          {!selected ? (
            <div className="flex h-full min-h-64 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-[hsl(var(--border))] text-center">
              <QrCode className="h-12 w-12 text-[hsl(var(--muted-foreground)/0.3)]" />
              <p className="text-sm text-[hsl(var(--muted-foreground))]">Bir QR kodu seçin veya oluşturun</p>
            </div>
          ) : (
            <div className="glass space-y-6 rounded-2xl p-6">
              {/* Başlık + Aksiyonlar */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-bold">{selected.label ?? `QR ${selected.slug}`}</p>
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">
                    {selected.scanCount} tarama · {selected.isActive ? "Aktif" : "Pasif"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleCode(selected.id, selected.isActive)}
                    disabled={toggling === selected.id}
                    className="flex items-center gap-1.5 rounded-lg border border-[hsl(var(--border))] px-3 py-2 text-xs font-medium transition hover:bg-[hsl(var(--accent))]"
                  >
                    {toggling === selected.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : selected.isActive ? (
                      <ToggleRight className="h-4 w-4 text-green-400" />
                    ) : (
                      <ToggleLeft className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                    )}
                    {selected.isActive ? "Pasife Al" : "Aktife Al"}
                  </button>
                  <button
                    onClick={() => deleteCode(selected.id)}
                    disabled={deleting === selected.id}
                    className="rounded-lg border border-[hsl(var(--border))] p-2 text-[hsl(var(--muted-foreground))] transition hover:border-red-400 hover:text-red-400"
                  >
                    {deleting === selected.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* QR Görsel */}
              <div className="flex flex-col items-center gap-4 rounded-2xl bg-white p-8">
                <Image
                  src={qrImageUrl(selected.slug)}
                  alt="QR Kod"
                  width={200}
                  height={200}
                  className="rounded-xl"
                  unoptimized
                />
                <p className="text-center text-sm font-bold text-gray-800">
                  {selected.label ?? activeBrand.name}
                </p>
              </div>

              {/* Link */}
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                  Geri Bildirim Linki
                </p>
                <div className="flex items-center gap-2 rounded-xl bg-[hsl(var(--muted)/0.5)] px-4 py-3">
                  <p className="flex-1 truncate font-mono text-sm">/qr/{selected.slug}</p>
                  <a
                    href={feedbackUrl(selected.slug)}
                    target="_blank"
                    rel="noreferrer"
                    className="shrink-0 rounded-lg p-1.5 text-[hsl(var(--muted-foreground))] transition hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--foreground))]"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>

              {/* Butonlar */}
              <div className="flex gap-3">
                <button
                  onClick={() => copyLink(selected.slug)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[hsl(var(--border))] py-2.5 text-sm font-medium transition hover:bg-[hsl(var(--accent))]"
                >
                  {copied === selected.slug ? (
                    <><Check className="h-4 w-4 text-green-400" /> Kopyalandı!</>
                  ) : (
                    <><Copy className="h-4 w-4" /> Linki Kopyala</>
                  )}
                </button>
                <button
                  onClick={() => downloadQr(selected.slug, selected.label ?? "")}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[hsl(var(--primary))] py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
                >
                  <Download className="h-4 w-4" /> QR İndir
                </button>
              </div>

              {/* İpucu */}
              <div className="rounded-xl bg-[hsl(var(--primary)/0.06)] p-4">
                <p className="mb-1 text-xs font-semibold text-[hsl(var(--primary))]">Nasıl Kullanılır?</p>
                <p className="text-xs leading-relaxed text-[hsl(var(--muted-foreground))]">
                  QR kodu indirip masalara, fişlere veya kapıya yapıştırın.
                  Müşteri telefonu ile okuttuğunda yorum sayfasına gider.
                  Yorumlar otomatik olarak Yorum Analizi sayfanıza düşer.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
