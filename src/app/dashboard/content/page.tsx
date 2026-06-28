"use client";
import { useState, useEffect, useCallback } from "react";
import {
  Sparkles, Loader2, Trash2, Copy, Check,
  ChevronDown, ChevronUp, Calendar, Search, X,
  Instagram, Facebook, Linkedin, Globe, FileText,
} from "lucide-react";
import type { ContentType } from "@prisma/client";
import { useBrand } from "@/components/dashboard/brand-provider";

// ─── Platform grupları ───────────────────────────────────────────
const PLATFORM_GROUPS = [
  {
    label: "Instagram",
    color: "from-pink-500 to-purple-600",
    icon: Instagram,
    types: [
      { value: "INSTAGRAM_POST" as ContentType, label: "Gönderi", icon: "📸", desc: "Akış için metin" },
      { value: "REELS_IDEA" as ContentType, label: "Reels", icon: "🎬", desc: "Video senaryosu" },
      { value: "STORY_IDEA" as ContentType, label: "Story", icon: "✨", desc: "5 story serisi" },
      { value: "HASHTAGS" as ContentType, label: "Hashtag", icon: "#️⃣", desc: "Niş + geniş set" },
    ],
  },
  {
    label: "Facebook",
    color: "from-blue-600 to-blue-500",
    icon: Facebook,
    types: [
      { value: "FACEBOOK_POST" as ContentType, label: "Gönderi", icon: "👥", desc: "Topluluk odaklı" },
      { value: "META_ADS" as ContentType, label: "Reklam", icon: "📣", desc: "FB/IG reklam metni" },
    ],
  },
  {
    label: "LinkedIn",
    color: "from-sky-700 to-blue-700",
    icon: Linkedin,
    types: [
      { value: "LINKEDIN_POST" as ContentType, label: "Gönderi", icon: "💼", desc: "Profesyonel içerik" },
    ],
  },
  {
    label: "Google",
    color: "from-green-500 to-teal-500",
    icon: Globe,
    types: [
      { value: "GOOGLE_ADS" as ContentType, label: "Arama Reklamı", icon: "🔍", desc: "Başlık + açıklama" },
      { value: "SEO_CONTENT" as ContentType, label: "SEO İçeriği", icon: "🔎", desc: "Meta + sayfa metni" },
    ],
  },
  {
    label: "Blog",
    color: "from-orange-500 to-amber-500",
    icon: FileText,
    types: [
      { value: "BLOG_POST" as ContentType, label: "Blog Yazısı", icon: "📝", desc: "SEO uyumlu makale" },
    ],
  },
];

const ALL_TYPES = PLATFORM_GROUPS.flatMap((g) => g.types);
const TONE_PRESETS = ["Samimi", "Profesyonel", "Eğlenceli", "Kurumsal", "İkna Edici", "Bilgilendirici"];

// ─── Tipler ─────────────────────────────────────────────────────
interface ContentItem {
  id: string; type: ContentType; title: string; body: string;
  meta: Record<string, unknown> | null; createdAt: string;
}
interface ContentPlanDay { day: number; date: string; type: string; topic: string; caption: string; }
interface ContentPlanWeek { week: number; days: ContentPlanDay[]; }

// ─── Yardımcı bileşenler ─────────────────────────────────────────
function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-[hsl(var(--muted-foreground))] transition hover:bg-[hsl(var(--muted))]"
    >
      {copied ? <><Check className="h-3.5 w-3.5 text-green-400" /> Kopyalandı</> : <><Copy className="h-3.5 w-3.5" /> Kopyala</>}
    </button>
  );
}

function PlatformBadge({ type }: { type: ContentType }) {
  const group = PLATFORM_GROUPS.find((g) => g.types.some((t) => t.value === type));
  const typeInfo = ALL_TYPES.find((t) => t.value === type);
  if (!group) return null;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full bg-gradient-to-r ${group.color} px-2 py-0.5 text-[10px] font-semibold text-white`}>
      {typeInfo?.icon} {group.label} · {typeInfo?.label}
    </span>
  );
}

function HashtagsView({ meta }: { meta: Record<string, unknown> }) {
  const { niche = [], medium = [], broad = [], branded = [] } = meta as Record<string, string[]>;
  const all = [...(niche as string[]), ...(medium as string[]), ...(broad as string[]), ...(branded as string[])];
  return (
    <div className="mt-3 space-y-3">
      {([["Niş (hedefli)", niche], ["Orta", medium], ["Geniş", broad], ["Marka", branded]] as [string, string[]][]).map(([label, tags]) => (
        <div key={label}>
          <p className="mb-1.5 text-xs font-semibold text-[hsl(var(--muted-foreground))]">{label}</p>
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <span key={tag} onClick={() => navigator.clipboard.writeText(tag)}
                className="cursor-pointer rounded-full bg-[hsl(var(--primary)/0.1)] px-2.5 py-0.5 text-xs text-[hsl(var(--primary))] transition hover:bg-[hsl(var(--primary)/0.2)]">
                {tag}
              </span>
            ))}
          </div>
        </div>
      ))}
      <div className="flex justify-end"><CopyBtn text={all.join(" ")} /></div>
    </div>
  );
}

function ReelsView({ meta }: { meta: Record<string, unknown> }) {
  const { hook, script, cta, music, duration } = meta as { hook: string; script: string[]; cta: string; music: string; duration: string };
  return (
    <div className="mt-3 space-y-3 text-sm">
      <div className="rounded-xl bg-[hsl(var(--primary)/0.08)] p-3">
        <p className="mb-1 text-xs font-semibold text-[hsl(var(--primary))]">🎣 Hook (İlk 3 saniye)</p>
        <p>{hook}</p>
      </div>
      <div>
        <p className="mb-2 text-xs font-semibold text-[hsl(var(--muted-foreground))]">🎬 Senaryo</p>
        <div className="space-y-1.5">
          {(script ?? []).map((s, i) => (
            <div key={i} className="flex gap-2">
              <span className="shrink-0 font-mono text-xs text-[hsl(var(--muted-foreground))]">{i + 1}.</span>
              <p className="text-sm">{s}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap gap-2 text-xs">
        <span className="rounded-lg bg-[hsl(var(--muted))] px-3 py-1.5">📢 {cta}</span>
        <span className="rounded-lg bg-[hsl(var(--muted))] px-3 py-1.5">🎵 {music}</span>
        <span className="rounded-lg bg-[hsl(var(--muted))] px-3 py-1.5">⏱ {duration}</span>
      </div>
    </div>
  );
}

function StoryView({ meta }: { meta: Record<string, unknown> }) {
  const stories = (meta.stories as { slide: number; type: string; content: string; sticker: string }[]) ?? [];
  return (
    <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
      {stories.map((s) => (
        <div key={s.slide} className="flex min-w-[140px] flex-col gap-1.5 rounded-xl border border-[hsl(var(--border))] p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[hsl(var(--primary))]">Slide {s.slide}</span>
            <span className="rounded-full bg-[hsl(var(--muted))] px-1.5 py-0.5 text-[10px]">{s.type}</span>
          </div>
          <p className="text-xs leading-relaxed">{s.content}</p>
          {s.sticker && <p className="text-[10px] text-[hsl(var(--muted-foreground))]">🎯 {s.sticker}</p>}
        </div>
      ))}
    </div>
  );
}

function GoogleAdsView({ meta }: { meta: Record<string, unknown> }) {
  const { headlines = [], descriptions = [], displayUrl = "", keywords = [] } = meta as {
    headlines: string[]; descriptions: string[]; displayUrl: string; keywords: string[];
  };
  return (
    <div className="mt-3 space-y-3">
      <div className="rounded-xl border border-[hsl(var(--border))] p-4 text-sm">
        <p className="mb-1 text-xs text-green-600">{displayUrl}</p>
        <div className="space-y-0.5">
          {headlines.map((h, i) => <p key={i} className="font-semibold text-blue-500">{h}</p>)}
        </div>
        <div className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
          {descriptions.map((d, i) => <p key={i}>{d}</p>)}
        </div>
      </div>
      <div>
        <p className="mb-1.5 text-xs font-semibold text-[hsl(var(--muted-foreground))]">Anahtar Kelimeler</p>
        <div className="flex flex-wrap gap-1.5">
          {keywords.map((k) => <span key={k} className="rounded-lg bg-green-500/10 px-2.5 py-0.5 text-xs text-green-500">{k}</span>)}
        </div>
      </div>
    </div>
  );
}

function MetaAdsView({ meta }: { meta: Record<string, unknown> }) {
  const { primaryText = "", headline = "", description = "", cta = "", targetAudience = "" } = meta as Record<string, string>;
  return (
    <div className="mt-3 space-y-3 text-sm">
      <div className="rounded-xl border border-[hsl(var(--border))] overflow-hidden">
        <div className="bg-[hsl(var(--muted)/0.5)] px-4 py-2 text-xs text-[hsl(var(--muted-foreground))]">Reklam Önizleme</div>
        <div className="space-y-2 p-4">
          <p className="text-xs text-[hsl(var(--muted-foreground))]">Ana Metin</p>
          <p>{primaryText}</p>
          <div className="rounded-lg border border-[hsl(var(--border))] p-2.5">
            <p className="font-semibold">{headline}</p>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">{description}</p>
          </div>
          <span className="inline-block rounded-lg bg-[hsl(var(--primary))] px-3 py-1 text-xs font-semibold text-white">{cta}</span>
        </div>
      </div>
      <p className="text-xs text-[hsl(var(--muted-foreground))]">🎯 Hedef Kitle: {targetAudience}</p>
    </div>
  );
}

function SeoView({ meta }: { meta: Record<string, unknown> }) {
  const { metaTitle = "", metaDescription = "", h1 = "", content = "", lsiKeywords = [] } = meta as {
    metaTitle: string; metaDescription: string; h1: string; content: string; lsiKeywords: string[];
  };
  return (
    <div className="mt-3 space-y-3 text-sm">
      <div className="rounded-xl border border-[hsl(var(--border))] p-3 space-y-2">
        <div>
          <p className="text-xs font-semibold text-[hsl(var(--muted-foreground))]">Meta Başlık ({metaTitle.length}/60)</p>
          <p className="font-semibold text-blue-500">{metaTitle}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-[hsl(var(--muted-foreground))]">Meta Açıklama ({metaDescription.length}/155)</p>
          <p className="text-xs text-[hsl(var(--muted-foreground))]">{metaDescription}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-[hsl(var(--muted-foreground))]">H1</p>
          <p className="font-semibold">{h1}</p>
        </div>
      </div>
      <div>
        <p className="mb-1 text-xs font-semibold text-[hsl(var(--muted-foreground))]">Sayfa İçeriği</p>
        <p className="whitespace-pre-wrap text-xs leading-relaxed">{content}</p>
      </div>
      <div>
        <p className="mb-1.5 text-xs font-semibold text-[hsl(var(--muted-foreground))]">LSI Anahtar Kelimeler</p>
        <div className="flex flex-wrap gap-1.5">
          {lsiKeywords.map((k) => <span key={k} className="rounded-lg bg-teal-500/10 px-2.5 py-0.5 text-xs text-teal-500">{k}</span>)}
        </div>
      </div>
    </div>
  );
}

function ContentPlanView({ meta }: { meta: Record<string, unknown> }) {
  const [openWeek, setOpenWeek] = useState(1);
  const weeks = (meta.weeks as ContentPlanWeek[]) ?? [];
  const group = (t: string) => PLATFORM_GROUPS.find((g) => g.types.some((x) => x.value === t));
  const typeInfo = (t: string) => ALL_TYPES.find((x) => x.value === t);

  return (
    <div className="mt-3 space-y-2">
      {weeks.map((week) => (
        <div key={week.week} className="overflow-hidden rounded-xl border border-[hsl(var(--border))]">
          <button onClick={() => setOpenWeek(openWeek === week.week ? 0 : week.week)}
            className="flex w-full items-center justify-between bg-[hsl(var(--muted)/0.5)] px-4 py-2.5 text-sm font-semibold">
            <span>Hafta {week.week}</span>
            <div className="flex items-center gap-2">
              <span className="text-xs font-normal text-[hsl(var(--muted-foreground))]">{week.days?.length ?? 0} gün</span>
              {openWeek === week.week ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </div>
          </button>
          {openWeek === week.week && (
            <div className="divide-y divide-[hsl(var(--border))]">
              {(week.days ?? []).map((day) => {
                const g = group(day.type);
                const t = typeInfo(day.type);
                return (
                  <div key={day.day} className="flex items-start gap-3 px-4 py-3">
                    <div className="w-16 shrink-0 text-center">
                      <p className="text-xs font-semibold">{day.date}</p>
                      <p className="text-[10px] text-[hsl(var(--muted-foreground))]">Gün {day.day}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      {g && (
                        <span className={`mb-1 inline-flex items-center gap-1 rounded-full bg-gradient-to-r ${g.color} px-2 py-0.5 text-[10px] font-semibold text-white`}>
                          {t?.icon} {g.label}
                        </span>
                      )}
                      <p className="text-xs font-medium">{day.topic}</p>
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">{day.caption}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function MetaView({ meta, type }: { meta: Record<string, unknown>; type: ContentType }) {
  if (type === "CONTENT_PLAN") return <ContentPlanView meta={meta} />;
  if (type === "HASHTAGS") return <HashtagsView meta={meta} />;
  if (type === "REELS_IDEA") return <ReelsView meta={meta} />;
  if (type === "STORY_IDEA") return <StoryView meta={meta} />;
  if (type === "GOOGLE_ADS") return <GoogleAdsView meta={meta} />;
  if (type === "META_ADS") return <MetaAdsView meta={meta} />;
  if (type === "SEO_CONTENT") return <SeoView meta={meta} />;
  return <pre className="mt-2 overflow-x-auto rounded-xl bg-[hsl(var(--muted)/0.5)] p-4 text-xs">{JSON.stringify(meta, null, 2)}</pre>;
}

function ContentCard({ item, onDelete }: { item: ContentItem; onDelete: (id: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const hasJson = item.meta && Object.keys(item.meta).length > 0;

  return (
    <div className="glass overflow-hidden rounded-2xl">
      <div className="flex items-start gap-3 p-4">
        <div className="flex-1 min-w-0">
          <div className="mb-1.5 flex flex-wrap items-center gap-2">
            <PlatformBadge type={item.type} />
            <span className="text-xs text-[hsl(var(--muted-foreground))]">
              {new Date(item.createdAt).toLocaleDateString("tr-TR", { day: "2-digit", month: "short", year: "numeric" })}
            </span>
          </div>
          <p className="truncate text-sm font-semibold">{item.title}</p>
          {!hasJson && !expanded && (
            <p className="mt-1 line-clamp-2 text-xs text-[hsl(var(--muted-foreground))]">{item.body}</p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <CopyBtn text={item.body} />
          <button onClick={() => setExpanded(!expanded)}
            className="rounded-lg p-1.5 text-[hsl(var(--muted-foreground))] transition hover:bg-[hsl(var(--muted))]">
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          <button onClick={() => onDelete(item.id)}
            className="rounded-lg p-1.5 text-[hsl(var(--muted-foreground))] transition hover:bg-red-500/10 hover:text-red-400">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
      {expanded && (
        <div className="border-t border-[hsl(var(--border))] px-4 pb-4 pt-3">
          {hasJson ? <MetaView meta={item.meta!} type={item.type} /> : (
            <p className="whitespace-pre-wrap text-sm leading-relaxed">{item.body}</p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Ana Sayfa ───────────────────────────────────────────────────
type Tab = "generate" | "library" | "plan";

export default function ContentPage() {
  const { activeBrand } = useBrand();
  const brandId = activeBrand?.id ?? "";

  const [items, setItems] = useState<ContentItem[]>([]);
  const [tab, setTab] = useState<Tab>("generate");
  const [filterType, setFilterType] = useState<string>("ALL");
  const [libSearch, setLibSearch] = useState("");

  const [selectedType, setSelectedType] = useState<ContentType>("INSTAGRAM_POST");
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("");
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState("");
  const [lastGenerated, setLastGenerated] = useState<ContentItem | null>(null);

  const [planGenerating, setPlanGenerating] = useState(false);
  const [planTone, setPlanTone] = useState("");
  const [latestPlan, setLatestPlan] = useState<ContentItem | null>(null);

  const loadItems = useCallback(async () => {
    if (!brandId) return;
    const q = filterType !== "ALL" ? `?type=${filterType}` : "";
    const res = await fetch(`/api/content/${brandId}${q}`);
    const data = await res.json();
    if (data.items) setItems(data.items);
  }, [brandId, filterType]);

  useEffect(() => { loadItems(); }, [loadItems]);

  useEffect(() => {
    const plan = items.find((i) => i.type === "CONTENT_PLAN");
    if (plan && !latestPlan) setLatestPlan(plan);
  }, [items, latestPlan]);

  async function generate(e: React.FormEvent) {
    e.preventDefault();
    if (!brandId) return;
    setGenerating(true);
    setGenError("");
    setLastGenerated(null);
    const res = await fetch("/api/content/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        brandId,
        type: selectedType,
        sector: (activeBrand as { sector?: string })?.sector ?? "Genel",
        description: (activeBrand as { description?: string })?.description ?? activeBrand?.name ?? "",
        topic: topic || undefined,
        tone: tone || undefined,
      }),
    });
    const data = await res.json();
    if (data.item) {
      setItems((p) => [data.item, ...p]);
      setLastGenerated(data.item);
    } else {
      setGenError(data.error ?? "Hata oluştu");
    }
    setGenerating(false);
  }

  async function generatePlan(e: React.FormEvent) {
    e.preventDefault();
    if (!brandId) return;
    setPlanGenerating(true);
    const res = await fetch("/api/content/plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        brandId,
        sector: (activeBrand as { sector?: string })?.sector ?? "Genel",
        description: (activeBrand as { description?: string })?.description ?? activeBrand?.name ?? "",
        tone: planTone || undefined,
      }),
    });
    const data = await res.json();
    if (data.item) { setLatestPlan(data.item); setItems((p) => [data.item, ...p]); }
    setPlanGenerating(false);
  }

  async function deleteItem(id: string) {
    await fetch(`/api/content/${brandId}/${id}`, { method: "DELETE" });
    setItems((p) => p.filter((i) => i.id !== id));
    if (latestPlan?.id === id) setLatestPlan(null);
  }

  const filteredItems = items.filter((i) => {
    const matchType = filterType === "ALL" || i.type === filterType;
    const matchSearch = !libSearch || i.title.toLowerCase().includes(libSearch.toLowerCase());
    return matchType && matchSearch;
  });

  const primaryColor = activeBrand?.primaryColor ?? "#6366f1";

  if (!activeBrand) return (
    <div className="flex h-64 items-center justify-center text-[hsl(var(--muted-foreground))]">Önce bir marka seçin</div>
  );

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: `${primaryColor}22` }}>
            <Sparkles className="h-5 w-5" style={{ color: primaryColor }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">İçerik Üreticisi</h1>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">{activeBrand.name} · AI destekli içerik</p>
          </div>
        </div>
        <span className="rounded-full bg-[hsl(var(--muted))] px-3 py-1 text-xs font-medium">{items.length} içerik</span>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-xl bg-[hsl(var(--muted)/0.5)] p-1">
        {([
          { key: "generate", label: "İçerik Üret" },
          { key: "library", label: `Kütüphane (${items.length})` },
          { key: "plan", label: "30 Günlük Plan" },
        ] as { key: Tab; label: string }[]).map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${tab === t.key ? "bg-[hsl(var(--background))] shadow-sm" : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── İÇERİK ÜRET ─────────────────────────────────────────── */}
      {tab === "generate" && (
        <div className="grid gap-6 xl:grid-cols-2">
          {/* Platform seçici */}
          <div className="space-y-5">
            {PLATFORM_GROUPS.map((group) => (
              <div key={group.label}>
                <div className="mb-2 flex items-center gap-2">
                  <div className={`flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br ${group.color}`}>
                    <group.icon className="h-3.5 w-3.5 text-white" />
                  </div>
                  <p className="text-sm font-semibold">{group.label}</p>
                </div>
                <div className={`grid gap-2 ${group.types.length > 2 ? "grid-cols-2 sm:grid-cols-4 xl:grid-cols-2" : "grid-cols-2"}`}>
                  {group.types.map((t) => (
                    <button key={t.value} type="button" onClick={() => setSelectedType(t.value)}
                      className={`rounded-xl border p-3 text-left transition ${selectedType === t.value ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.08)] ring-1 ring-[hsl(var(--primary)/0.3)]" : "border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.4)]"}`}>
                      <span className="mb-1 block text-xl">{t.icon}</span>
                      <p className="text-xs font-semibold">{t.label}</p>
                      <p className="text-[10px] text-[hsl(var(--muted-foreground))]">{t.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Form */}
          <div>
            <form onSubmit={generate} className="glass sticky top-4 space-y-4 rounded-2xl p-6">
              <div className="mb-1 flex items-center gap-2">
                <PlatformBadge type={selectedType} />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">Konu <span className="text-[hsl(var(--muted-foreground))]">(opsiyonel)</span></label>
                <input value={topic} onChange={(e) => setTopic(e.target.value)}
                  placeholder="Yeni ürün lansmanı, Yaz kampanyası, Müşteri hikayesi..."
                  className="w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.5)] px-4 py-2.5 text-sm outline-none transition focus:border-[hsl(var(--primary))]" />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">Ton <span className="text-[hsl(var(--muted-foreground))]">(opsiyonel)</span></label>
                <div className="mb-2 flex flex-wrap gap-1.5">
                  {TONE_PRESETS.map((t) => (
                    <button key={t} type="button" onClick={() => setTone(tone === t ? "" : t)}
                      className={`rounded-lg px-2.5 py-1 text-xs transition ${tone === t ? "text-white" : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))]"}`}
                      style={tone === t ? { background: primaryColor } : {}}>
                      {t}
                    </button>
                  ))}
                </div>
                <input value={tone} onChange={(e) => setTone(e.target.value)}
                  placeholder="Veya kendiniz yazın..."
                  className="w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.5)] px-4 py-2 text-sm outline-none transition focus:border-[hsl(var(--primary))]" />
              </div>

              {genError && <p className="rounded-xl bg-red-500/10 px-4 py-2.5 text-sm text-red-400">{genError}</p>}

              <button type="submit" disabled={generating}
                className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
                style={{ background: primaryColor }}>
                {generating ? <><Loader2 className="h-4 w-4 animate-spin" /> Üretiliyor...</> : <><Sparkles className="h-4 w-4" /> Üret</>}
              </button>

              {lastGenerated && (
                <div className="rounded-xl border border-[hsl(var(--primary)/0.3)] bg-[hsl(var(--primary)/0.04)] p-4">
                  <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold" style={{ color: primaryColor }}>
                    <Check className="h-3.5 w-3.5" /> Üretildi!
                  </p>
                  {lastGenerated.meta && Object.keys(lastGenerated.meta).length > 0 ? (
                    <MetaView meta={lastGenerated.meta} type={lastGenerated.type} />
                  ) : (
                    <p className="whitespace-pre-wrap text-xs leading-relaxed">{lastGenerated.body}</p>
                  )}
                  <div className="mt-2 flex justify-end"><CopyBtn text={lastGenerated.body} /></div>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* ── KÜTÜPHANe ───────────────────────────────────────────── */}
      {tab === "library" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[200px] flex-1">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
              <input value={libSearch} onChange={(e) => setLibSearch(e.target.value)}
                placeholder="İçerik ara..."
                className="w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.5)] py-2 pl-9 pr-4 text-sm outline-none focus:border-[hsl(var(--primary))] transition" />
              {libSearch && <button onClick={() => setLibSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="h-3.5 w-3.5 text-[hsl(var(--muted-foreground))]" /></button>}
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button onClick={() => setFilterType("ALL")}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${filterType === "ALL" ? "text-white" : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]"}`}
                style={filterType === "ALL" ? { background: primaryColor } : {}}>
                Tümü
              </button>
              {PLATFORM_GROUPS.map((g) => g.types.map((t) => items.some((i) => i.type === t.value) && (
                <button key={t.value} onClick={() => setFilterType(t.value)}
                  className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${filterType === t.value ? "text-white" : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]"}`}
                  style={filterType === t.value ? { background: primaryColor } : {}}>
                  {t.icon} {t.label}
                </button>
              )))}
            </div>
          </div>

          {filteredItems.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-[hsl(var(--border))] py-16 text-center">
              <Sparkles className="h-10 w-10 text-[hsl(var(--muted-foreground)/0.3)]" />
              <p className="text-sm text-[hsl(var(--muted-foreground))]">{libSearch || filterType !== "ALL" ? "Eşleşen içerik yok" : "Henüz içerik yok"}</p>
              {!libSearch && filterType === "ALL" && (
                <button onClick={() => setTab("generate")} className="text-sm font-medium" style={{ color: primaryColor }}>İlk içeriği üret →</button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredItems.map((item) => <ContentCard key={item.id} item={item} onDelete={deleteItem} />)}
            </div>
          )}
        </div>
      )}

      {/* ── 30 GÜNLÜK PLAN ──────────────────────────────────────── */}
      {tab === "plan" && (
        <div className="space-y-5">
          <form onSubmit={generatePlan} className="glass rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="h-5 w-5" style={{ color: primaryColor }} />
              <p className="font-semibold">30 Günlük İçerik Takvimi</p>
            </div>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              {activeBrand.name} için Instagram, Facebook, LinkedIn ve Blog içeriklerini kapsayan tam aylık takvim.
            </p>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Ton <span className="text-[hsl(var(--muted-foreground))]">(opsiyonel)</span></label>
              <div className="flex flex-wrap gap-1.5">
                {TONE_PRESETS.map((t) => (
                  <button key={t} type="button" onClick={() => setPlanTone(planTone === t ? "" : t)}
                    className={`rounded-lg px-2.5 py-1 text-xs transition ${planTone === t ? "text-white" : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))]"}`}
                    style={planTone === t ? { background: primaryColor } : {}}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <button type="submit" disabled={planGenerating}
              className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
              style={{ background: primaryColor }}>
              {planGenerating ? <><Loader2 className="h-4 w-4 animate-spin" /> Plan Oluşturuluyor...</> : <><Calendar className="h-4 w-4" /> 30 Günlük Plan Oluştur</>}
            </button>
          </form>

          {latestPlan?.meta && (
            <div className="glass rounded-2xl p-5">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-semibold">📅 {latestPlan.title}</p>
                <CopyBtn text={latestPlan.body} />
              </div>
              <ContentPlanView meta={latestPlan.meta as Record<string, unknown>} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
