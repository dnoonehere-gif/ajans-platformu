"use client";
import { useEffect, useState, use } from "react";
import { Eye, EyeOff, Save, Loader2, Globe, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { BlockRenderer } from "@/components/website/block-renderer";
import type { Block } from "@/server/ai/website-generator";

interface WebsitePage {
  id: string;
  slug: string;
  title: string;
  blocks: Block[];
}

interface Website {
  id: string;
  brandId: string;
  title: string;
  isPublished: boolean;
  pages: WebsitePage[];
}

export default function WebsiteEditorPage({
  params,
}: {
  params: Promise<{ websiteId: string }>;
}) {
  const { websiteId } = use(params);
  const [website, setWebsite] = useState<Website | null>(null);
  const [activePageIndex, setActivePageIndex] = useState(0);
  const [editingBlock, setEditingBlock] = useState<Block | null>(null);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [view, setView] = useState<"preview" | "edit">("preview");

  useEffect(() => {
    fetch(`/api/website/${websiteId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.website) setWebsite(d.website);
      });
  }, [websiteId]);

  const activePage = website?.pages[activePageIndex];

  async function saveBlocks(blocks: Block[]) {
    if (!website || !activePage) return;
    setSaving(true);
    const res = await fetch(`/api/website/${website.brandId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pageId: activePage.id, blocks }),
    });
    const data = await res.json();
    if (data.website) setWebsite(data.website);
    setSaving(false);
  }

  async function togglePublish() {
    if (!website) return;
    setPublishing(true);
    const res = await fetch(`/api/website/${website.brandId}/publish`, { method: "POST" });
    const data = await res.json();
    if (typeof data.isPublished === "boolean") {
      setWebsite((w) => w ? { ...w, isPublished: data.isPublished } : w);
    }
    setPublishing(false);
  }

  function updateBlockField(blockId: string, field: string, value: unknown) {
    if (!activePage) return;
    const updated = activePage.blocks.map((b) =>
      b.id === blockId ? { ...b, data: { ...b.data, [field]: value } } : b
    );
    setWebsite((w) =>
      w
        ? {
            ...w,
            pages: w.pages.map((p, i) =>
              i === activePageIndex ? { ...p, blocks: updated } : p
            ),
          }
        : w
    );
  }

  if (!website) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--primary))]" />
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      {/* Üst araç çubuğu */}
      <header className="flex items-center justify-between border-b border-[hsl(var(--border))] bg-[hsl(var(--background))] px-5 py-3">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/website" className="rounded-lg p-1.5 hover:bg-[hsl(var(--muted))] transition">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <Globe className="h-5 w-5 text-[hsl(var(--primary))]" />
          <span className="font-semibold">{website.title}</span>
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${website.isPublished ? "bg-green-500/15 text-green-400" : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]"}`}>
            {website.isPublished ? "Yayında" : "Taslak"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setView(view === "preview" ? "edit" : "preview")}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium hover:bg-[hsl(var(--muted))] transition"
          >
            {view === "preview" ? <><Eye className="h-4 w-4" /> Önizleme</> : <><EyeOff className="h-4 w-4" /> Düzenle</>}
          </button>

          <button
            onClick={() => activePage && saveBlocks(activePage.blocks)}
            disabled={saving}
            className="flex items-center gap-1.5 rounded-lg bg-[hsl(var(--muted))] px-3 py-1.5 text-sm font-medium transition hover:bg-[hsl(var(--border))] disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Kaydet
          </button>

          <button
            onClick={togglePublish}
            disabled={publishing}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold text-white transition disabled:opacity-50 ${website.isPublished ? "bg-red-500 hover:bg-red-600" : "bg-[hsl(var(--primary))] hover:opacity-90"}`}
          >
            {publishing ? <Loader2 className="h-4 w-4 animate-spin" /> : website.isPublished ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {website.isPublished ? "Yayından Kaldır" : "Yayınla"}
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sol panel — blok listesi (edit modunda) */}
        {view === "edit" && (
          <aside className="w-64 shrink-0 overflow-y-auto border-r border-[hsl(var(--border))] bg-[hsl(var(--background))] p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
              Bloklar
            </p>
            <div className="space-y-1.5">
              {activePage?.blocks.map((block) => (
                <button
                  key={block.id}
                  onClick={() => setEditingBlock(editingBlock?.id === block.id ? null : block)}
                  className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm transition ${editingBlock?.id === block.id ? "bg-[hsl(var(--primary)/0.15)] text-[hsl(var(--primary))]" : "hover:bg-[hsl(var(--muted))]"}`}
                >
                  <span>{blockIcon(block.type)}</span>
                  <span className="capitalize">{blockLabel(block.type)}</span>
                </button>
              ))}
            </div>

            {/* Blok düzenleyici */}
            {editingBlock && (
              <div className="mt-5 space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                  Düzenle — {blockLabel(editingBlock.type)}
                </p>
                {Object.entries(editingBlock.data).map(([key, val]) => {
                  if (typeof val !== "string") return null;
                  return (
                    <div key={key}>
                      <label className="mb-1 block text-xs text-[hsl(var(--muted-foreground))]">{key}</label>
                      <textarea
                        rows={2}
                        value={val}
                        onChange={(e) => {
                          updateBlockField(editingBlock.id, key, e.target.value);
                          setEditingBlock({ ...editingBlock, data: { ...editingBlock.data, [key]: e.target.value } });
                        }}
                        className="w-full resize-none rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.5)] px-3 py-2 text-xs outline-none focus:border-[hsl(var(--primary))] transition"
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </aside>
        )}

        {/* Sağ panel — önizleme */}
        <main className="flex-1 overflow-y-auto bg-[hsl(var(--background))]">
          {activePage ? (
            <BlockRenderer blocks={activePage.blocks} />
          ) : (
            <div className="flex h-full items-center justify-center text-[hsl(var(--muted-foreground))]">
              Sayfa bulunamadı
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function blockIcon(type: string) {
  const icons: Record<string, string> = {
    hero: "🦸", features: "⚡", about: "ℹ️",
    services: "🛠️", cta: "📣", contact: "📞",
  };
  return icons[type] ?? "📄";
}

function blockLabel(type: string) {
  const labels: Record<string, string> = {
    hero: "Hero", features: "Özellikler", about: "Hakkımızda",
    services: "Hizmetler", cta: "Çağrı", contact: "İletişim",
  };
  return labels[type] ?? type;
}
