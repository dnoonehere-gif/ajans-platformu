"use client";
import { useState } from "react";
import { useBrand } from "@/components/dashboard/brand-provider";
import { Loader2, Sparkles, Plus, Trash2, Copy, Check, Layers, Download, Wand2, Edit3, Save } from "lucide-react";
import type { ContentType } from "@prisma/client";
import { useLang } from "@/components/language-provider";

const L = {
  tr: {
    genericError: "Bir hata oluştu", connFail: "Bağlantı hatası",
    title: "Toplu İçerik Üretimi",
    subtitle: "Tek seferde 20'ye kadar içerik üretin — şablonlarla hızlı başlayın",
    templates: "Hazır Şablonlar", itemsWord: "içerik",
    tplNames: ["1 Haftalık Instagram", "Lansman Paketi", "Blog + SEO", "Reklam Kampanyası"],
    brandInfo: "Marka Bilgileri",
    sector: "Sektör", sectorPh: "Kafe, restoran, güzellik salonu...",
    desc: "Marka Açıklaması", descPh: "Markanızı kısaca tanımlayın",
    contents: "İçerikler", add: "Ekle",
    topicPh: "Konu (opsiyonel)", tonePh: "Ton",
    generating: (n: number) => `Üretiliyor... (${n} içerik)`,
    generate: (n: number) => `${n} İçerik Üret`,
    results: "Sonuçlar",
    copied: "Kopyalandı", copyAll: "Tümünü Kopyala", csv: "CSV İndir",
    save: "Kaydet", edit: "Düzenle", copy: "Kopyala",
    types: {
      INSTAGRAM_POST: "Instagram Gönderi", REELS_IDEA: "Reels Senaryosu", STORY_IDEA: "Story Serisi",
      FACEBOOK_POST: "Facebook Gönderi", LINKEDIN_POST: "LinkedIn Gönderi", BLOG_POST: "Blog Yazısı",
      GOOGLE_ADS: "Google Reklam", META_ADS: "Meta Reklam", SEO_CONTENT: "SEO İçeriği",
      HASHTAGS: "Hashtag Seti", CONTENT_PLAN: "İçerik Planı",
    } as Record<string, string>,
    csvHeader: "Tür,Başlık,İçerik",
  },
  en: {
    genericError: "Something went wrong", connFail: "Connection error",
    title: "Batch Content Generation",
    subtitle: "Generate up to 20 pieces of content at once — start fast with templates",
    templates: "Ready Templates", itemsWord: "items",
    tplNames: ["1-Week Instagram", "Launch Pack", "Blog + SEO", "Ad Campaign"],
    brandInfo: "Brand Details",
    sector: "Industry", sectorPh: "Cafe, restaurant, beauty salon...",
    desc: "Brand Description", descPh: "Describe your brand briefly",
    contents: "Contents", add: "Add",
    topicPh: "Topic (optional)", tonePh: "Tone",
    generating: (n: number) => `Generating... (${n} items)`,
    generate: (n: number) => `Generate ${n} Items`,
    results: "Results",
    copied: "Copied", copyAll: "Copy All", csv: "Download CSV",
    save: "Save", edit: "Edit", copy: "Copy",
    types: {
      INSTAGRAM_POST: "Instagram Post", REELS_IDEA: "Reels Script", STORY_IDEA: "Story Series",
      FACEBOOK_POST: "Facebook Post", LINKEDIN_POST: "LinkedIn Post", BLOG_POST: "Blog Article",
      GOOGLE_ADS: "Google Ad", META_ADS: "Meta Ad", SEO_CONTENT: "SEO Content",
      HASHTAGS: "Hashtag Set", CONTENT_PLAN: "Content Plan",
    } as Record<string, string>,
    csvHeader: "Type,Title,Content",
  },
};

const TYPE_OPTIONS: { value: ContentType; label: string }[] = [
  { value: "INSTAGRAM_POST", label: "Instagram Gönderi" },
  { value: "REELS_IDEA", label: "Reels Senaryosu" },
  { value: "STORY_IDEA", label: "Story Serisi" },
  { value: "FACEBOOK_POST", label: "Facebook Gönderi" },
  { value: "LINKEDIN_POST", label: "LinkedIn Gönderi" },
  { value: "BLOG_POST", label: "Blog Yazısı" },
  { value: "GOOGLE_ADS", label: "Google Reklam" },
  { value: "META_ADS", label: "Meta Reklam" },
  { value: "SEO_CONTENT", label: "SEO İçeriği" },
  { value: "HASHTAGS", label: "Hashtag Seti" },
  { value: "CONTENT_PLAN", label: "İçerik Planı" },
];

const TEMPLATES = [
  {
    label: "1 Haftalık Instagram",
    icon: "📅",
    items: [
      { type: "INSTAGRAM_POST" as ContentType, topic: "Pazartesi motivasyon", tone: "ilham verici" },
      { type: "INSTAGRAM_POST" as ContentType, topic: "Ürün/hizmet tanıtım", tone: "profesyonel" },
      { type: "REELS_IDEA" as ContentType, topic: "Sahne arkası", tone: "samimi" },
      { type: "INSTAGRAM_POST" as ContentType, topic: "Müşteri yorumu/başarı hikayesi", tone: "güven verici" },
      { type: "STORY_IDEA" as ContentType, topic: "Soru-cevap / anket", tone: "eğlenceli" },
      { type: "INSTAGRAM_POST" as ContentType, topic: "Bilgilendirici / ipucu", tone: "eğitici" },
      { type: "REELS_IDEA" as ContentType, topic: "Hafta sonu planı / kapanış", tone: "enerjik" },
    ],
  },
  {
    label: "Lansman Paketi",
    icon: "🚀",
    items: [
      { type: "INSTAGRAM_POST" as ContentType, topic: "Teaser / yakında", tone: "merak uyandırıcı" },
      { type: "INSTAGRAM_POST" as ContentType, topic: "Lansman duyurusu", tone: "heyecanlı" },
      { type: "REELS_IDEA" as ContentType, topic: "Ürün/hizmet tanıtım videosu", tone: "profesyonel" },
      { type: "STORY_IDEA" as ContentType, topic: "Lansman geri sayım", tone: "enerjik" },
      { type: "FACEBOOK_POST" as ContentType, topic: "Lansman duyurusu", tone: "resmi" },
      { type: "LINKEDIN_POST" as ContentType, topic: "İş ortaklarına duyuru", tone: "kurumsal" },
      { type: "HASHTAGS" as ContentType, topic: "Lansman kampanyası", tone: "" },
      { type: "META_ADS" as ContentType, topic: "Lansman reklamı", tone: "ikna edici" },
    ],
  },
  {
    label: "Blog + SEO",
    icon: "✍️",
    items: [
      { type: "BLOG_POST" as ContentType, topic: "Sektör rehberi", tone: "eğitici" },
      { type: "BLOG_POST" as ContentType, topic: "Sık sorulan sorular", tone: "bilgilendirici" },
      { type: "SEO_CONTENT" as ContentType, topic: "Ana sayfa SEO içeriği", tone: "profesyonel" },
      { type: "SEO_CONTENT" as ContentType, topic: "Hizmet sayfası", tone: "ikna edici" },
      { type: "HASHTAGS" as ContentType, topic: "Blog ve SEO", tone: "" },
    ],
  },
  {
    label: "Reklam Kampanyası",
    icon: "📣",
    items: [
      { type: "GOOGLE_ADS" as ContentType, topic: "Arama reklamı", tone: "ikna edici" },
      { type: "GOOGLE_ADS" as ContentType, topic: "Arama reklamı varyant", tone: "acil" },
      { type: "META_ADS" as ContentType, topic: "Facebook/Instagram reklamı", tone: "dikkat çekici" },
      { type: "META_ADS" as ContentType, topic: "Retargeting reklamı", tone: "samimi" },
      { type: "INSTAGRAM_POST" as ContentType, topic: "Organik tanıtım", tone: "doğal" },
    ],
  },
];

interface BatchItem {
  type: ContentType;
  topic: string;
  tone: string;
}

interface ResultItem {
  index: number;
  type: string;
  title: string | null;
  body: string | null;
  error?: string;
}

export default function BatchContentPage() {
  const { activeBrand } = useBrand();
  const { lang } = useLang();
  const sL = L[lang];
  const typeLabel = (t: string) => sL.types[t] ?? t;
  const [sector, setSector] = useState("");
  const [description, setDescription] = useState("");
  const [items, setItems] = useState<BatchItem[]>([{ type: "INSTAGRAM_POST", topic: "", tone: "" }]);
  const [generating, setGenerating] = useState(false);
  const [results, setResults] = useState<ResultItem[] | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState("");

  function addItem() {
    if (items.length >= 20) return;
    setItems([...items, { type: "INSTAGRAM_POST", topic: "", tone: "" }]);
  }

  function removeItem(i: number) {
    setItems(items.filter((_, idx) => idx !== i));
  }

  function updateItem(i: number, key: keyof BatchItem, value: string) {
    setItems(items.map((item, idx) => (idx === i ? { ...item, [key]: value } : item)));
  }

  function applyTemplate(tpl: typeof TEMPLATES[number]) {
    setItems(tpl.items.map((i) => ({ ...i })));
  }

  async function handleGenerate() {
    if (!activeBrand || !sector || !description) return;
    setGenerating(true);
    setError("");
    setResults(null);
    try {
      const res = await fetch("/api/batch-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandId: activeBrand.id, sector, description, items }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? sL.genericError); }
      else { setResults(data.results); }
    } catch {
      setError(sL.connFail);
    }
    setGenerating(false);
  }

  function copyContent(idx: number, r: ResultItem) {
    navigator.clipboard.writeText(`${r.title ?? ""}\n\n${r.body ?? ""}`);
    setCopied(idx);
    setTimeout(() => setCopied(null), 2000);
  }

  function copyAll() {
    if (!results) return;
    const text = results
      .filter((r) => r.body)
      .map((r) => {
        const label = typeLabel(r.type);
        return `--- ${label} ---\n${r.title ? r.title + "\n\n" : ""}${r.body}`;
      })
      .join("\n\n\n");
    navigator.clipboard.writeText(text);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  }

  function downloadCsv() {
    if (!results) return;
    const header = sL.csvHeader + "\n";
    const rows = results
      .filter((r) => r.body)
      .map((r) => {
        const label = typeLabel(r.type);
        const esc = (s: string) => `"${s.replace(/"/g, '""')}"`;
        return `${esc(label)},${esc(r.title ?? "")},${esc(r.body ?? "")}`;
      })
      .join("\n");
    const blob = new Blob(["﻿" + header + rows], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `toplu-icerik-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function startEdit(idx: number, body: string) {
    setEditingIdx(idx);
    setEditDraft(body);
  }

  function saveEdit(idx: number) {
    if (!results) return;
    setResults(results.map((r) => (r.index === idx ? { ...r, body: editDraft } : r)));
    setEditingIdx(null);
  }

  const inp = "w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2.5 text-sm outline-none transition focus:border-[hsl(var(--primary))] focus:ring-2 focus:ring-[hsl(var(--primary)/0.2)]";

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10">
          <Layers className="h-5 w-5 text-violet-500" />
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

      {/* Hazır şablonlar */}
      <section className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
        <div className="mb-3 flex items-center gap-2">
          <Wand2 className="h-4 w-4 text-violet-500" />
          <h2 className="font-semibold">{sL.templates}</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {TEMPLATES.map((tpl, ti) => (
            <button key={tpl.label} onClick={() => applyTemplate(tpl)}
              className="flex items-center gap-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-3 text-left transition hover:border-[hsl(var(--primary)/0.5)] hover:bg-[hsl(var(--accent))]">
              <span className="text-2xl">{tpl.icon}</span>
              <div>
                <p className="text-sm font-semibold">{sL.tplNames[ti] ?? tpl.label}</p>
                <p className="text-[11px] text-[hsl(var(--muted-foreground))]">{tpl.items.length} {sL.itemsWord}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Genel bilgiler */}
      <section className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
        <h2 className="mb-4 font-semibold">{sL.brandInfo}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[hsl(var(--muted-foreground))]">{sL.sector}</label>
            <input className={inp} placeholder={sL.sectorPh} value={sector}
              onChange={(e) => setSector(e.target.value)} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[hsl(var(--muted-foreground))]">{sL.desc}</label>
            <input className={inp} placeholder={sL.descPh} value={description}
              onChange={(e) => setDescription(e.target.value)} />
          </div>
        </div>
      </section>

      {/* İçerik listesi */}
      <section className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold">{sL.contents} ({items.length}/20)</h2>
          <button onClick={addItem} disabled={items.length >= 20}
            className="flex items-center gap-1.5 rounded-lg bg-[hsl(var(--primary))] px-3 py-1.5 text-xs font-semibold text-white transition hover:opacity-90 disabled:opacity-50">
            <Plus className="h-3.5 w-3.5" /> {sL.add}
          </button>
        </div>
        <div className="space-y-3">
          {items.map((item, i) => (
            <div key={i} className="flex items-center gap-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--primary)/0.1)] text-xs font-bold text-[hsl(var(--primary))]">{i + 1}</span>
              <select className={inp + " max-w-[180px]"} value={item.type}
                onChange={(e) => updateItem(i, "type", e.target.value)}>
                {TYPE_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{typeLabel(opt.value)}</option>)}
              </select>
              <input className={inp} placeholder={sL.topicPh} value={item.topic}
                onChange={(e) => updateItem(i, "topic", e.target.value)} />
              <input className={inp + " max-w-[120px]"} placeholder={sL.tonePh} value={item.tone}
                onChange={(e) => updateItem(i, "tone", e.target.value)} />
              {items.length > 1 && (
                <button onClick={() => removeItem(i)} className="text-red-400 transition hover:text-red-500">
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Üret butonu */}
      <button onClick={handleGenerate} disabled={generating || !sector || !description}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-3.5 text-sm font-bold text-white shadow-lg transition hover:opacity-90 disabled:opacity-50">
        {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
        {generating ? sL.generating(items.length) : sL.generate(items.length)}
      </button>

      {/* Sonuçlar */}
      {results && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">{sL.results} ({results.filter((r) => r.body).length}/{results.length})</h2>
            <div className="flex items-center gap-2">
              <button onClick={copyAll}
                className="flex items-center gap-1.5 rounded-lg border border-[hsl(var(--border))] px-3 py-1.5 text-xs font-medium transition hover:bg-[hsl(var(--accent))]">
                {copiedAll ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                {copiedAll ? sL.copied : sL.copyAll}
              </button>
              <button onClick={downloadCsv}
                className="flex items-center gap-1.5 rounded-lg border border-[hsl(var(--border))] px-3 py-1.5 text-xs font-medium transition hover:bg-[hsl(var(--accent))]">
                <Download className="h-3.5 w-3.5" /> {sL.csv}
              </button>
            </div>
          </div>
          {results.map((r) => (
            <div key={r.index} className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold text-[hsl(var(--primary))]">
                  {typeLabel(r.type)}
                </span>
                {r.body && (
                  <div className="flex items-center gap-2">
                    <button onClick={() => editingIdx === r.index ? saveEdit(r.index) : startEdit(r.index, r.body!)}
                      className="flex items-center gap-1 text-xs text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">
                      {editingIdx === r.index ? <Save className="h-3.5 w-3.5 text-emerald-500" /> : <Edit3 className="h-3.5 w-3.5" />}
                      {editingIdx === r.index ? sL.save : sL.edit}
                    </button>
                    <button onClick={() => copyContent(r.index, r)}
                      className="flex items-center gap-1 text-xs text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">
                      {copied === r.index ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                      {copied === r.index ? sL.copied : sL.copy}
                    </button>
                  </div>
                )}
              </div>
              {r.body ? (
                <>
                  {r.title && <p className="mb-1 text-sm font-semibold text-[hsl(var(--foreground))]">{r.title}</p>}
                  {editingIdx === r.index ? (
                    <textarea className={inp + " h-32 resize-y font-mono text-xs"} value={editDraft}
                      onChange={(e) => setEditDraft(e.target.value)} />
                  ) : (
                    <p className="whitespace-pre-wrap text-sm text-[hsl(var(--foreground))]">{r.body}</p>
                  )}
                </>
              ) : (
                <p className="text-sm text-red-400">{r.error}</p>
              )}
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
