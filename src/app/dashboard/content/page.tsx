"use client";
import { useState, useEffect, useCallback } from "react";
import { Sparkles, Loader2, Trash2, Copy, Check, ChevronDown, ChevronUp, Calendar } from "lucide-react";
import type { ContentType } from "@prisma/client";

const TYPES: { value: ContentType; label: string; icon: string; desc: string }[] = [
  { value: "INSTAGRAM_POST", label: "Instagram Gönderisi", icon: "📸", desc: "Akış için etkileyici metin" },
  { value: "REELS_IDEA", label: "Reels Fikri", icon: "🎬", desc: "Viral video senaryosu" },
  { value: "STORY_IDEA", label: "Story Serisi", icon: "✨", desc: "5 ardışık story planı" },
  { value: "BLOG_POST", label: "Blog Yazısı", icon: "📝", desc: "SEO uyumlu uzun içerik" },
  { value: "GOOGLE_ADS", label: "Google Reklamı", icon: "🔍", desc: "Başlık + açıklama seti" },
  { value: "META_ADS", label: "Meta Reklamı", icon: "📣", desc: "Facebook/Instagram reklam" },
  { value: "SEO_CONTENT", label: "SEO İçeriği", icon: "🔎", desc: "Meta + sayfa içeriği" },
  { value: "HASHTAGS", label: "Hashtag Seti", icon: "#️⃣", desc: "Niş + geniş hashtag paketi" },
  { value: "CONTENT_PLAN", label: "30 Günlük Plan", icon: "📅", desc: "Tam aylık içerik takvimi" },
];

interface ContentItem {
  id: string;
  type: ContentType;
  title: string;
  body: string;
  meta: Record<string, unknown> | null;
  createdAt: string;
}

interface ContentPlanDay {
  day: number;
  date: string;
  type: string;
  topic: string;
  caption: string;
}

interface ContentPlanWeek {
  week: number;
  days: ContentPlanDay[];
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <button onClick={copy} className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] transition">
      {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? "Kopyalandı" : "Kopyala"}
    </button>
  );
}

function ContentPlanView({ meta }: { meta: Record<string, unknown> }) {
  const [openWeek, setOpenWeek] = useState<number>(1);
  const weeks = (meta.weeks as ContentPlanWeek[]) ?? [];

  return (
    <div className="space-y-2 mt-2">
      {weeks.map((week) => (
        <div key={week.week} className="rounded-xl border border-[hsl(var(--border))] overflow-hidden">
          <button onClick={() => setOpenWeek(openWeek === week.week ? 0 : week.week)}
            className="flex w-full items-center justify-between bg-[hsl(var(--muted)/0.5)] px-4 py-2.5 text-sm font-medium">
            <span>Hafta {week.week}</span>
            {openWeek === week.week ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          {openWeek === week.week && (
            <div className="divide-y divide-[hsl(var(--border))]">
              {week.days.map((day) => (
                <div key={day.day} className="flex items-start gap-3 px-4 py-3 text-sm">
                  <div className="w-20 shrink-0">
                    <p className="font-medium text-xs">{day.date}</p>
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">Gün {day.day}</p>
                  </div>
                  <div className="flex-1">
                    <span className="inline-block rounded-full bg-[hsl(var(--primary)/0.12)] px-2 py-0.5 text-xs text-[hsl(var(--primary))] mb-1">
                      {TYPES.find((t) => t.value === day.type)?.icon} {TYPES.find((t) => t.value === day.type)?.label ?? day.type}
                    </span>
                    <p className="font-medium text-xs">{day.topic}</p>
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">{day.caption}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function JsonView({ meta, type }: { meta: Record<string, unknown>; type: ContentType }) {
  if (type === "CONTENT_PLAN") return <ContentPlanView meta={meta} />;

  if (type === "HASHTAGS") {
    const { niche = [], medium = [], broad = [], branded = [] } = meta as Record<string, string[]>;
    return (
      <div className="mt-2 space-y-2">
        {[["Niş", niche], ["Orta", medium], ["Geniş", broad], ["Marka", branded]].map(([label, tags]) => (
          <div key={label as string}>
            <p className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1">{label as string}</p>
            <div className="flex flex-wrap gap-1.5">
              {(tags as string[]).map((tag) => (
                <span key={tag} className="rounded-full bg-[hsl(var(--primary)/0.1)] px-2.5 py-0.5 text-xs text-[hsl(var(--primary))]">{tag}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <pre className="mt-2 overflow-x-auto rounded-xl bg-[hsl(var(--muted)/0.5)] p-4 text-xs leading-relaxed">
      {JSON.stringify(meta, null, 2)}
    </pre>
  );
}

function ContentCard({ item, onDelete }: { item: ContentItem; onDelete: (id: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const typeInfo = TYPES.find((t) => t.value === item.type);
  const hasJson = item.meta && Object.keys(item.meta).length > 0;

  return (
    <div className="glass rounded-2xl overflow-hidden">
      <div className="flex items-start gap-3 p-4">
        <span className="text-2xl">{typeInfo?.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="text-xs font-medium text-[hsl(var(--primary))]">{typeInfo?.label}</span>
              <p className="text-sm font-semibold mt-0.5 truncate">{item.title}</p>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <CopyButton text={item.body} />
              <button onClick={() => setExpanded(!expanded)}
                className="rounded-lg p-1.5 text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] transition">
                {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
              <button onClick={() => onDelete(item.id)}
                className="rounded-lg p-1.5 text-[hsl(var(--muted-foreground))] hover:bg-red-500/10 hover:text-red-400 transition">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
          <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
            {new Date(item.createdAt).toLocaleDateString("tr-TR")}
          </p>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-[hsl(var(--border))] px-4 pb-4 pt-3">
          {hasJson ? (
            <JsonView meta={item.meta!} type={item.type} />
          ) : (
            <p className="whitespace-pre-wrap text-sm leading-relaxed">{item.body}</p>
          )}
        </div>
      )}
    </div>
  );
}

export default function ContentPage() {
  const [brandId, setBrandId] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [items, setItems] = useState<ContentItem[]>([]);
  const [tab, setTab] = useState<"generate" | "library" | "plan">("generate");
  const [filterType, setFilterType] = useState<string>("ALL");

  // Form
  const [selectedType, setSelectedType] = useState<ContentType>("INSTAGRAM_POST");
  const [sector, setSector] = useState("");
  const [description, setDescription] = useState("");
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  // 30 günlük plan
  const [planGenerating, setPlanGenerating] = useState(false);
  const [planTone, setPlanTone] = useState("");
  const [latestPlan, setLatestPlan] = useState<ContentItem | null>(null);

  const loadItems = useCallback(async () => {
    const type = filterType !== "ALL" ? `?type=${filterType}` : "";
    const res = await fetch(`/api/content/${brandId}${type}`);
    const data = await res.json();
    if (data.items) setItems(data.items);
  }, [brandId, filterType]);

  useEffect(() => {
    if (loaded) loadItems();
  }, [filterType, loaded, loadItems]);

  async function generate(e: React.FormEvent) {
    e.preventDefault();
    setGenerating(true);
    setError("");
    const res = await fetch("/api/content/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ brandId, type: selectedType, sector, description, topic: topic || undefined, tone: tone || undefined }),
    });
    const data = await res.json();
    if (data.item) {
      setItems((prev) => [data.item, ...prev]);
      setTab("library");
    } else {
      setError(data.error ?? "Hata oluştu");
    }
    setGenerating(false);
  }

  async function generatePlan(e: React.FormEvent) {
    e.preventDefault();
    setPlanGenerating(true);
    setError("");
    const res = await fetch("/api/content/plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ brandId, sector, description, tone: planTone || undefined }),
    });
    const data = await res.json();
    if (data.item) {
      setLatestPlan(data.item);
      setItems((prev) => [data.item, ...prev]);
    } else {
      setError(data.error ?? "Hata oluştu");
    }
    setPlanGenerating(false);
  }

  async function deleteItem(id: string) {
    await fetch(`/api/content/${brandId}/${id}`, { method: "DELETE" });
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  const filteredItems = filterType === "ALL" ? items : items.filter((i) => i.type === filterType);

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      {/* Başlık */}
      <div className="mb-8 flex items-center gap-3">
        <Sparkles className="h-8 w-8 text-[hsl(var(--primary))]" />
        <div>
          <h1 className="text-2xl font-bold">AI İçerik Üreticisi</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">Instagram, blog, reklam, SEO — hepsi tek yerden.</p>
        </div>
      </div>

      {/* Marka ID */}
      {!loaded && (
        <div className="glass mb-8 flex gap-2 rounded-2xl p-5">
          <input type="text" placeholder="Marka ID gir..." value={brandId}
            onChange={(e) => setBrandId(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && brandId.trim()) { setLoaded(true); loadItems(); } }}
            className="flex-1 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.5)] px-4 py-2.5 text-sm outline-none focus:border-[hsl(var(--primary))] transition" />
          <button onClick={() => { if (brandId.trim()) { setLoaded(true); loadItems(); } }}
            className="rounded-xl bg-[hsl(var(--primary))] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90">
            Yükle
          </button>
        </div>
      )}

      {loaded && (
        <>
          {/* Tab bar */}
          <div className="mb-6 flex gap-1 rounded-xl bg-[hsl(var(--muted)/0.5)] p-1">
            {(["generate", "library", "plan"] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${tab === t ? "bg-[hsl(var(--background))] shadow-sm" : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"}`}>
                {t === "generate" ? "İçerik Üret" : t === "library" ? `Kütüphane (${items.length})` : "30 Günlük Plan"}
              </button>
            ))}
          </div>

          {/* İÇERİK ÜRET */}
          {tab === "generate" && (
            <form onSubmit={generate} className="space-y-5">
              {/* Tür seçici */}
              <div className="grid grid-cols-3 gap-2">
                {TYPES.filter((t) => t.value !== "CONTENT_PLAN").map((t) => (
                  <button key={t.value} type="button" onClick={() => setSelectedType(t.value)}
                    className={`rounded-xl border p-3 text-left transition ${selectedType === t.value ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.08)]" : "border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.4)]"}`}>
                    <div className="mb-1 text-xl">{t.icon}</div>
                    <p className="text-xs font-semibold">{t.label}</p>
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">{t.desc}</p>
                  </button>
                ))}
              </div>

              <div className="glass rounded-2xl p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">Sektör</label>
                    <input required type="text" placeholder="Restoran, E-ticaret, Hukuk..." value={sector}
                      onChange={(e) => setSector(e.target.value)}
                      className="w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.5)] px-4 py-2.5 text-sm outline-none focus:border-[hsl(var(--primary))] transition" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">Konu <span className="text-[hsl(var(--muted-foreground))]">(opsiyonel)</span></label>
                    <input type="text" placeholder="Yeni ürün lansmanı, kampanya..." value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      className="w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.5)] px-4 py-2.5 text-sm outline-none focus:border-[hsl(var(--primary))] transition" />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Marka Açıklaması</label>
                  <textarea required rows={3} placeholder="Markanız, hedef kitleniz ve öne çıkan değerlerinizi kısaca anlatın..."
                    value={description} onChange={(e) => setDescription(e.target.value)}
                    className="w-full resize-none rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.5)] px-4 py-2.5 text-sm outline-none focus:border-[hsl(var(--primary))] transition" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Ton <span className="text-[hsl(var(--muted-foreground))]">(opsiyonel)</span></label>
                  <input type="text" placeholder="Samimi, profesyonel, eğlenceli, kurumsal..." value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    className="w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.5)] px-4 py-2.5 text-sm outline-none focus:border-[hsl(var(--primary))] transition" />
                </div>
                {error && <p className="rounded-xl bg-red-500/10 px-4 py-2.5 text-sm text-red-400">{error}</p>}
                <button type="submit" disabled={generating}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[hsl(var(--primary))] py-3 font-semibold text-white transition hover:opacity-90 disabled:opacity-50">
                  {generating ? <><Loader2 className="h-4 w-4 animate-spin" /> Üretiliyor...</> : <><Sparkles className="h-4 w-4" /> {TYPES.find(t => t.value === selectedType)?.label} Üret</>}
                </button>
              </div>
            </form>
          )}

          {/* KÜTÜPHANe */}
          {tab === "library" && (
            <div className="space-y-4">
              {/* Filtre */}
              <div className="flex flex-wrap gap-2">
                <button onClick={() => setFilterType("ALL")}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${filterType === "ALL" ? "bg-[hsl(var(--primary))] text-white" : "bg-[hsl(var(--muted))] hover:bg-[hsl(var(--border))]"}`}>
                  Tümü
                </button>
                {TYPES.map((t) => (
                  <button key={t.value} onClick={() => setFilterType(t.value)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${filterType === t.value ? "bg-[hsl(var(--primary))] text-white" : "bg-[hsl(var(--muted))] hover:bg-[hsl(var(--border))]"}`}>
                    {t.icon} {t.label}
                  </button>
                ))}
              </div>

              {filteredItems.length === 0 ? (
                <div className="glass rounded-2xl py-16 text-center">
                  <p className="text-[hsl(var(--muted-foreground))]">Henüz içerik yok.</p>
                  <button onClick={() => setTab("generate")} className="mt-3 text-sm text-[hsl(var(--primary))] hover:underline">
                    İlk içeriği oluştur →
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredItems.map((item) => (
                    <ContentCard key={item.id} item={item} onDelete={deleteItem} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 30 GÜNLÜK PLAN */}
          {tab === "plan" && (
            <div className="space-y-5">
              <form onSubmit={generatePlan} className="glass rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="h-5 w-5 text-[hsl(var(--primary))]" />
                  <p className="font-semibold">30 Günlük İçerik Takvimi Oluştur</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">Sektör</label>
                    <input required type="text" placeholder="Restoran, Güzellik Merkezi..." value={sector}
                      onChange={(e) => setSector(e.target.value)}
                      className="w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.5)] px-4 py-2.5 text-sm outline-none focus:border-[hsl(var(--primary))] transition" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">Ton</label>
                    <input type="text" placeholder="Profesyonel ve samimi..." value={planTone}
                      onChange={(e) => setPlanTone(e.target.value)}
                      className="w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.5)] px-4 py-2.5 text-sm outline-none focus:border-[hsl(var(--primary))] transition" />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Marka Açıklaması</label>
                  <textarea required rows={2} value={description} onChange={(e) => setDescription(e.target.value)}
                    placeholder="Markanızı kısaca anlatın..."
                    className="w-full resize-none rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.5)] px-4 py-2.5 text-sm outline-none focus:border-[hsl(var(--primary))] transition" />
                </div>
                {error && <p className="rounded-xl bg-red-500/10 px-4 py-2.5 text-sm text-red-400">{error}</p>}
                <button type="submit" disabled={planGenerating}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[hsl(var(--primary))] py-3 font-semibold text-white transition hover:opacity-90 disabled:opacity-50">
                  {planGenerating ? <><Loader2 className="h-4 w-4 animate-spin" /> Plan Oluşturuluyor...</> : <><Calendar className="h-4 w-4" /> 30 Günlük Plan Oluştur</>}
                </button>
              </form>

              {latestPlan?.meta && (
                <div className="glass rounded-2xl p-5">
                  <p className="mb-3 text-sm font-semibold">📅 {latestPlan.title}</p>
                  <ContentPlanView meta={latestPlan.meta as Record<string, unknown>} />
                </div>
              )}

              {!latestPlan && items.filter((i) => i.type === "CONTENT_PLAN").length > 0 && (
                <div className="glass rounded-2xl p-5">
                  <p className="mb-3 text-sm font-semibold">Son Plan</p>
                  <ContentPlanView meta={items.find((i) => i.type === "CONTENT_PLAN")!.meta as Record<string, unknown>} />
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
