"use client";
import { useState, useEffect, useCallback } from "react";
import {
  Sparkles, Loader2, Trash2, Copy, Check,
  ChevronDown, ChevronUp, Calendar, Search, X,
  Instagram, Facebook, Linkedin, Globe, FileText, Youtube, Languages, AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import type { ContentType } from "@prisma/client";
import { useBrand } from "@/components/dashboard/brand-provider";
import { useLang } from "@/components/language-provider";

const L = {
  tr: {
    copied: "Kopyalandı", copy: "Kopyala",
    typeLabels: {
      INSTAGRAM_POST: "Gönderi", REELS_IDEA: "Reels", STORY_IDEA: "Story", HASHTAGS: "Hashtag",
      FACEBOOK_POST: "Gönderi", META_ADS: "Reklam", LINKEDIN_POST: "Gönderi",
      GOOGLE_ADS: "Arama Reklamı", SEO_CONTENT: "SEO İçeriği", BLOG_POST: "Blog Yazısı",
    } as Record<string, string>,
    typeDescs: {
      INSTAGRAM_POST: "Akış için metin", REELS_IDEA: "Video senaryosu", STORY_IDEA: "5 story serisi", HASHTAGS: "Niş + geniş set",
      FACEBOOK_POST: "Topluluk odaklı", META_ADS: "FB/IG reklam metni", LINKEDIN_POST: "Profesyonel içerik",
      GOOGLE_ADS: "Başlık + açıklama", SEO_CONTENT: "Meta + sayfa metni", BLOG_POST: "SEO uyumlu makale",
    } as Record<string, string>,
    tones: ["Samimi", "Profesyonel", "Eğlenceli", "Kurumsal", "İkna Edici", "Bilgilendirici"],
    hashtagCats: ["Niş (hedefli)", "Orta", "Geniş", "Marka"],
    hook: "🎣 Hook (İlk 3 saniye)", scenario: "🎬 Senaryo",
    adPreview: "Reklam Önizleme", mainText: "Ana Metin", targetAudience: "🎯 Hedef Kitle:",
    metaTitle: "Meta Başlık", metaDesc: "Meta Açıklama", pageContent: "Sayfa İçeriği", lsi: "LSI Anahtar Kelimeler",
    keywords: "Anahtar Kelimeler",
    week: "Hafta", days: "gün", day: "Gün",
    selectBrand: "Önce bir marka seçin",
    title: "İçerik Üreticisi", subtitle: "AI destekli içerik",
    itemsWord: "içerik",
    tabGenerate: "İçerik Üret", tabLibrary: "Kütüphane", tabPlan: "30 Günlük Plan",
    topicLabel: "Konu", optional: "(opsiyonel)",
    topicPh: "Yeni ürün lansmanı, Yaz kampanyası, Müşteri hikayesi...",
    toneLabel: "Ton", tonePh: "Veya kendiniz yazın...",
    langLabel: "İçerik Dili", langHint: "Global kitleye yayın yapıyorsanız İngilizce seçin",
    noDescWarn: "Markanızın açıklaması boş. İçerikler jenerik çıkar — daha isabetli sonuç için marka açıklamanızı doldurun.",
    noDescAction: "Marka ayarlarına git",
    shortsScenes: "Sahneler", shortsLoop: "Döngü taktiği", shortsBest: "Önerilen", shortsWhy: "Neden",
    genericError: "Hata oluştu",
    generatingBtn: "Üretiliyor...", generateBtn: "Üret", generated: "Üretildi!",
    searchPh: "İçerik ara...", all: "Tümü",
    noMatch: "Eşleşen içerik yok", noContent: "Henüz içerik yok", firstContent: "İlk içeriği üret →",
    planTitle: "30 Günlük İçerik Takvimi",
    planDesc: (b: string) => `${b} için Instagram, Facebook, LinkedIn ve Blog içeriklerini kapsayan tam aylık takvim.`,
    planGenerating: "Plan Oluşturuluyor...", planGenerate: "30 Günlük Plan Oluştur",
  },
  en: {
    copied: "Copied", copy: "Copy",
    typeLabels: {
      INSTAGRAM_POST: "Post", REELS_IDEA: "Reels", STORY_IDEA: "Story", HASHTAGS: "Hashtags",
      FACEBOOK_POST: "Post", META_ADS: "Ad", LINKEDIN_POST: "Post",
      GOOGLE_ADS: "Search Ad", SEO_CONTENT: "SEO Content", BLOG_POST: "Blog Article",
    } as Record<string, string>,
    typeDescs: {
      INSTAGRAM_POST: "Feed caption", REELS_IDEA: "Video script", STORY_IDEA: "5-story series", HASHTAGS: "Niche + broad set",
      FACEBOOK_POST: "Community focused", META_ADS: "FB/IG ad copy", LINKEDIN_POST: "Professional content",
      GOOGLE_ADS: "Headline + description", SEO_CONTENT: "Meta + page copy", BLOG_POST: "SEO-friendly article",
    } as Record<string, string>,
    tones: ["Friendly", "Professional", "Fun", "Corporate", "Persuasive", "Informative"],
    hashtagCats: ["Niche (targeted)", "Medium", "Broad", "Branded"],
    hook: "🎣 Hook (First 3 seconds)", scenario: "🎬 Script",
    adPreview: "Ad Preview", mainText: "Primary Text", targetAudience: "🎯 Target Audience:",
    metaTitle: "Meta Title", metaDesc: "Meta Description", pageContent: "Page Content", lsi: "LSI Keywords",
    keywords: "Keywords",
    week: "Week", days: "days", day: "Day",
    selectBrand: "Select a brand first",
    title: "Content Generator", subtitle: "AI-powered content",
    itemsWord: "items",
    tabGenerate: "Generate", tabLibrary: "Library", tabPlan: "30-Day Plan",
    topicLabel: "Topic", optional: "(optional)",
    topicPh: "New product launch, Summer campaign, Customer story...",
    toneLabel: "Tone", tonePh: "Or write your own...",
    langLabel: "Content Language", langHint: "Choose English if you target a global audience",
    noDescWarn: "Your brand description is empty. Content will be generic — fill it in for sharper results.",
    noDescAction: "Go to brand settings",
    shortsScenes: "Scenes", shortsLoop: "Loop tip", shortsBest: "Best pick", shortsWhy: "Why",
    genericError: "Something went wrong",
    generatingBtn: "Generating...", generateBtn: "Generate", generated: "Generated!",
    searchPh: "Search content...", all: "All",
    noMatch: "No matching content", noContent: "No content yet", firstContent: "Generate your first content →",
    planTitle: "30-Day Content Calendar",
    planDesc: (b: string) => `A full monthly calendar for ${b} covering Instagram, Facebook, LinkedIn and Blog content.`,
    planGenerating: "Creating Plan...", planGenerate: "Create 30-Day Plan",
  },
};

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
    label: "YouTube",
    color: "from-red-600 to-rose-600",
    icon: Youtube,
    types: [
      { value: "YOUTUBE_SHORTS" as ContentType, label: "Shorts", icon: "⚡", desc: "Dikey kısa video senaryosu" },
      { value: "YOUTUBE_TITLE" as ContentType, label: "Başlık", icon: "🎯", desc: "CTR odaklı 8 başlık" },
      { value: "YOUTUBE_SCRIPT" as ContentType, label: "Senaryo", icon: "🎥", desc: "Uzun video, izlenme süresi" },
      { value: "YOUTUBE_DESCRIPTION" as ContentType, label: "Açıklama", icon: "📄", desc: "SEO + bölümler" },
      { value: "YOUTUBE_TAGS" as ContentType, label: "Etiketler", icon: "🏷️", desc: "20-25 tag" },
      { value: "THUMBNAIL_TEXT" as ContentType, label: "Kapak", icon: "🖼️", desc: "Thumbnail metni" },
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
const LANGUAGES = [
  { code: "tr", label: "Türkçe", flag: "🇹🇷" },
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "ar", label: "العربية", flag: "🇸🇦" },
  { code: "ru", label: "Русский", flag: "🇷🇺" },
];

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
  const { lang } = useLang();
  const sL = L[lang];
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-[hsl(var(--muted-foreground))] transition hover:bg-[hsl(var(--muted))]"
    >
      {copied ? <><Check className="h-3.5 w-3.5 text-green-400" /> {sL.copied}</> : <><Copy className="h-3.5 w-3.5" /> {sL.copy}</>}
    </button>
  );
}

function PlatformBadge({ type }: { type: ContentType }) {
  const { lang } = useLang();
  const sL = L[lang];
  const group = PLATFORM_GROUPS.find((g) => g.types.some((t) => t.value === type));
  const typeInfo = ALL_TYPES.find((t) => t.value === type);
  if (!group) return null;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full bg-gradient-to-r ${group.color} px-2 py-0.5 text-[10px] font-semibold text-white`}>
      {typeInfo?.icon} {group.label} · {sL.typeLabels[type] ?? typeInfo?.label}
    </span>
  );
}

function HashtagsView({ meta }: { meta: Record<string, unknown> }) {
  const { lang } = useLang();
  const sL = L[lang];
  const { niche = [], medium = [], broad = [], branded = [] } = meta as Record<string, string[]>;
  const all = [...(niche as string[]), ...(medium as string[]), ...(broad as string[]), ...(branded as string[])];
  return (
    <div className="mt-3 space-y-3">
      {([[sL.hashtagCats[0], niche], [sL.hashtagCats[1], medium], [sL.hashtagCats[2], broad], [sL.hashtagCats[3], branded]] as [string, string[]][]).map(([label, tags]) => (
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
  const { lang } = useLang();
  const sL = L[lang];
  const { hook, script, cta, music, duration } = meta as { hook: string; script: string[]; cta: string; music: string; duration: string };
  return (
    <div className="mt-3 space-y-3 text-sm">
      <div className="rounded-xl bg-[hsl(var(--primary)/0.08)] p-3">
        <p className="mb-1 text-xs font-semibold text-[hsl(var(--primary))]">{sL.hook}</p>
        <p>{hook}</p>
      </div>
      <div>
        <p className="mb-2 text-xs font-semibold text-[hsl(var(--muted-foreground))]">{sL.scenario}</p>
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
  const { lang } = useLang();
  const sL = L[lang];
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
        <p className="mb-1.5 text-xs font-semibold text-[hsl(var(--muted-foreground))]">{sL.keywords}</p>
        <div className="flex flex-wrap gap-1.5">
          {keywords.map((k) => <span key={k} className="rounded-lg bg-green-500/10 px-2.5 py-0.5 text-xs text-green-500">{k}</span>)}
        </div>
      </div>
    </div>
  );
}

function MetaAdsView({ meta }: { meta: Record<string, unknown> }) {
  const { lang } = useLang();
  const sL = L[lang];
  const { primaryText = "", headline = "", description = "", cta = "", targetAudience = "" } = meta as Record<string, string>;
  return (
    <div className="mt-3 space-y-3 text-sm">
      <div className="rounded-xl border border-[hsl(var(--border))] overflow-hidden">
        <div className="bg-[hsl(var(--muted)/0.5)] px-4 py-2 text-xs text-[hsl(var(--muted-foreground))]">{sL.adPreview}</div>
        <div className="space-y-2 p-4">
          <p className="text-xs text-[hsl(var(--muted-foreground))]">{sL.mainText}</p>
          <p>{primaryText}</p>
          <div className="rounded-lg border border-[hsl(var(--border))] p-2.5">
            <p className="font-semibold">{headline}</p>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">{description}</p>
          </div>
          <span className="inline-block rounded-lg bg-[hsl(var(--primary))] px-3 py-1 text-xs font-semibold text-white">{cta}</span>
        </div>
      </div>
      <p className="text-xs text-[hsl(var(--muted-foreground))]">{sL.targetAudience} {targetAudience}</p>
    </div>
  );
}

function SeoView({ meta }: { meta: Record<string, unknown> }) {
  const { lang } = useLang();
  const sL = L[lang];
  const { metaTitle = "", metaDescription = "", h1 = "", content = "", lsiKeywords = [] } = meta as {
    metaTitle: string; metaDescription: string; h1: string; content: string; lsiKeywords: string[];
  };
  return (
    <div className="mt-3 space-y-3 text-sm">
      <div className="rounded-xl border border-[hsl(var(--border))] p-3 space-y-2">
        <div>
          <p className="text-xs font-semibold text-[hsl(var(--muted-foreground))]">{sL.metaTitle} ({metaTitle.length}/60)</p>
          <p className="font-semibold text-blue-500">{metaTitle}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-[hsl(var(--muted-foreground))]">{sL.metaDesc} ({metaDescription.length}/155)</p>
          <p className="text-xs text-[hsl(var(--muted-foreground))]">{metaDescription}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-[hsl(var(--muted-foreground))]">H1</p>
          <p className="font-semibold">{h1}</p>
        </div>
      </div>
      <div>
        <p className="mb-1 text-xs font-semibold text-[hsl(var(--muted-foreground))]">{sL.pageContent}</p>
        <p className="whitespace-pre-wrap text-xs leading-relaxed">{content}</p>
      </div>
      <div>
        <p className="mb-1.5 text-xs font-semibold text-[hsl(var(--muted-foreground))]">{sL.lsi}</p>
        <div className="flex flex-wrap gap-1.5">
          {lsiKeywords.map((k) => <span key={k} className="rounded-lg bg-teal-500/10 px-2.5 py-0.5 text-xs text-teal-500">{k}</span>)}
        </div>
      </div>
    </div>
  );
}

function ContentPlanView({ meta }: { meta: Record<string, unknown> }) {
  const { lang } = useLang();
  const sL = L[lang];
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
            <span>{sL.week} {week.week}</span>
            <div className="flex items-center gap-2">
              <span className="text-xs font-normal text-[hsl(var(--muted-foreground))]">{week.days?.length ?? 0} {sL.days}</span>
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
                      <p className="text-[10px] text-[hsl(var(--muted-foreground))]">{sL.day} {day.day}</p>
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


function ShortsView({ meta }: { meta: Record<string, unknown> }) {
  const { lang } = useLang();
  const sL = L[lang];
  const { hook, scenes, cta, loopTip, hashtags, duration } = meta as {
    hook: string;
    scenes: { time: string; visual: string; voiceover: string; text: string }[];
    cta: string; loopTip: string; hashtags: string[]; duration: string;
  };
  return (
    <div className="mt-3 space-y-3 text-sm">
      <div className="rounded-xl bg-[hsl(var(--primary)/0.08)] p-3">
        <p className="mb-1 text-xs font-semibold text-[hsl(var(--primary))]">{sL.hook}</p>
        <p>{hook}</p>
      </div>
      <div>
        <p className="mb-2 text-xs font-semibold text-[hsl(var(--muted-foreground))]">{sL.shortsScenes}</p>
        <div className="space-y-2">
          {(scenes ?? []).map((sc, i) => (
            <div key={i} className="rounded-xl border border-[hsl(var(--border))] p-3">
              <span className="mb-1.5 inline-block rounded-md bg-[hsl(var(--muted))] px-2 py-0.5 font-mono text-[11px]">{sc.time}</span>
              {sc.visual && <p className="text-xs text-[hsl(var(--muted-foreground))]">🎬 {sc.visual}</p>}
              {sc.voiceover && <p className="mt-1 text-sm">🎙 {sc.voiceover}</p>}
              {sc.text && <p className="mt-1 text-xs font-medium">💬 {sc.text}</p>}
            </div>
          ))}
        </div>
      </div>
      {loopTip && (
        <div className="rounded-xl bg-[hsl(var(--muted)/0.5)] p-3">
          <p className="mb-1 text-xs font-semibold text-[hsl(var(--muted-foreground))]">{sL.shortsLoop}</p>
          <p className="text-xs">{loopTip}</p>
        </div>
      )}
      <div className="flex flex-wrap gap-2 text-xs">
        {cta && <span className="rounded-lg bg-[hsl(var(--muted))] px-3 py-1.5">📢 {cta}</span>}
        {duration && <span className="rounded-lg bg-[hsl(var(--muted))] px-3 py-1.5">⏱ {duration}</span>}
      </div>
      {hashtags?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {hashtags.map((h, i) => (
            <span key={i} className="rounded-lg bg-[hsl(var(--primary)/0.1)] px-2 py-1 text-xs text-[hsl(var(--primary))]">{h}</span>
          ))}
        </div>
      )}
    </div>
  );
}

function TitlesView({ meta }: { meta: Record<string, unknown> }) {
  const { lang } = useLang();
  const sL = L[lang];
  const { titles, bestPick, tip } = meta as {
    titles: { title: string; style: string; why: string }[]; bestPick: string; tip: string;
  };
  return (
    <div className="mt-3 space-y-2 text-sm">
      {bestPick && (
        <div className="rounded-xl bg-[hsl(var(--primary)/0.08)] p-3">
          <p className="mb-1 text-xs font-semibold text-[hsl(var(--primary))]">⭐ {sL.shortsBest}</p>
          <p className="font-medium">{bestPick}</p>
        </div>
      )}
      <div className="space-y-1.5">
        {(titles ?? []).map((t, i) => (
          <div key={i} className="rounded-xl border border-[hsl(var(--border))] p-3">
            <p className="font-medium">{t.title}</p>
            <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-[hsl(var(--muted-foreground))]">
              {t.style && <span className="rounded bg-[hsl(var(--muted))] px-1.5 py-0.5">{t.style}</span>}
              <span>{t.title?.length ?? 0}/60</span>
            </div>
            {t.why && <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">{sL.shortsWhy}: {t.why}</p>}
          </div>
        ))}
      </div>
      {tip && <p className="text-xs text-[hsl(var(--muted-foreground))]">💡 {tip}</p>}
    </div>
  );
}

/** Özel görünümü olmayan JSON tipleri için okunabilir genel gösterim. */
function GenericMetaView({ meta }: { meta: Record<string, unknown> }) {
  return (
    <div className="mt-3 space-y-2.5 text-sm">
      {Object.entries(meta).map(([key, val]) => (
        <div key={key}>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">{key}</p>
          {Array.isArray(val) ? (
            <div className="space-y-1">
              {val.map((v, i) =>
                typeof v === "object" && v !== null ? (
                  <div key={i} className="rounded-lg border border-[hsl(var(--border))] p-2.5 text-xs">
                    {Object.entries(v as Record<string, unknown>).map(([k2, v2]) => (
                      <p key={k2}><span className="text-[hsl(var(--muted-foreground))]">{k2}:</span> {String(v2)}</p>
                    ))}
                  </div>
                ) : (
                  <span key={i} className="mr-1.5 inline-block rounded-lg bg-[hsl(var(--muted))] px-2 py-1 text-xs">{String(v)}</span>
                )
              )}
            </div>
          ) : (
            <p className="whitespace-pre-wrap text-sm">{String(val)}</p>
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
  if (type === "YOUTUBE_SHORTS") return <ShortsView meta={meta} />;
  if (type === "YOUTUBE_TITLE") return <TitlesView meta={meta} />;
  if (type === "YOUTUBE_DESCRIPTION" || type === "YOUTUBE_SCRIPT" || type === "YOUTUBE_TAGS" || type === "THUMBNAIL_TEXT")
    return <GenericMetaView meta={meta} />;
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
  const { lang } = useLang();
  const sL = L[lang];
  const brandId = activeBrand?.id ?? "";

  const [items, setItems] = useState<ContentItem[]>([]);
  const [tab, setTab] = useState<Tab>("generate");
  const [filterType, setFilterType] = useState<string>("ALL");
  const [libSearch, setLibSearch] = useState("");

  const [selectedType, setSelectedType] = useState<ContentType>("INSTAGRAM_POST");
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("");
  const [contentLang, setContentLang] = useState("tr");
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
        sector: activeBrand?.sector || "Genel",
        description: activeBrand?.description || activeBrand?.name || "",
        topic: topic || undefined,
        tone: tone || undefined,
        language: contentLang,
      }),
    });
    const data = await res.json();
    if (data.item) {
      setItems((p) => [data.item, ...p]);
      setLastGenerated(data.item);
    } else {
      setGenError(data.error ?? sL.genericError);
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
        sector: activeBrand?.sector || "Genel",
        description: activeBrand?.description || activeBrand?.name || "",
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
    <div className="flex h-64 items-center justify-center text-[hsl(var(--muted-foreground))]">{sL.selectBrand}</div>
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
            <h1 className="text-2xl font-bold">{sL.title}</h1>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">{activeBrand.name} · {sL.subtitle}</p>
          </div>
        </div>
        <span className="rounded-full bg-[hsl(var(--muted))] px-3 py-1 text-xs font-medium">{items.length} {sL.itemsWord}</span>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-xl bg-[hsl(var(--muted)/0.5)] p-1">
        {([
          { key: "generate", label: sL.tabGenerate },
          { key: "library", label: `${sL.tabLibrary} (${items.length})` },
          { key: "plan", label: sL.tabPlan },
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
                      <p className="text-xs font-semibold">{sL.typeLabels[t.value] ?? t.label}</p>
                      <p className="text-[10px] text-[hsl(var(--muted-foreground))]">{sL.typeDescs[t.value] ?? t.desc}</p>
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
                <label className="mb-1.5 block text-sm font-medium">{sL.topicLabel} <span className="text-[hsl(var(--muted-foreground))]">{sL.optional}</span></label>
                <input value={topic} onChange={(e) => setTopic(e.target.value)}
                  placeholder={sL.topicPh}
                  className="w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.5)] px-4 py-2.5 text-sm outline-none transition focus:border-[hsl(var(--primary))]" />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">{sL.toneLabel} <span className="text-[hsl(var(--muted-foreground))]">{sL.optional}</span></label>
                <div className="mb-2 flex flex-wrap gap-1.5">
                  {sL.tones.map((t) => (
                    <button key={t} type="button" onClick={() => setTone(tone === t ? "" : t)}
                      className={`rounded-lg px-2.5 py-1 text-xs transition ${tone === t ? "text-white" : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))]"}`}
                      style={tone === t ? { background: primaryColor } : {}}>
                      {t}
                    </button>
                  ))}
                </div>
                <input value={tone} onChange={(e) => setTone(e.target.value)}
                  placeholder={sL.tonePh}
                  className="w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.5)] px-4 py-2 text-sm outline-none transition focus:border-[hsl(var(--primary))]" />
              </div>

              {/* Marka açıklaması boşsa uyar — içerik kalitesini doğrudan etkiliyor */}
              {activeBrand && !activeBrand.description?.trim() && (
                <div className="flex items-start gap-2 rounded-xl border border-amber-500/25 bg-amber-500/10 px-3.5 py-2.5 text-xs text-amber-300">
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span>
                    {sL.noDescWarn}{" "}
                    <Link href="/dashboard/ayarlar" className="font-semibold underline underline-offset-2 hover:text-amber-200">
                      {sL.noDescAction}
                    </Link>
                  </span>
                </div>
              )}

              {/* İçerik dili */}
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium">
                  <Languages className="h-3.5 w-3.5" /> {sL.langLabel}
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {LANGUAGES.map((l) => (
                    <button key={l.code} type="button" onClick={() => setContentLang(l.code)}
                      className={`rounded-lg px-2.5 py-1 text-xs transition ${contentLang === l.code ? "text-white" : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))]"}`}
                      style={contentLang === l.code ? { background: primaryColor } : {}}>
                      {l.flag} {l.label}
                    </button>
                  ))}
                </div>
                <p className="mt-1.5 text-xs text-[hsl(var(--muted-foreground))]">{sL.langHint}</p>
              </div>

              {genError && <p className="rounded-xl bg-red-500/10 px-4 py-2.5 text-sm text-red-400">{genError}</p>}

              <button type="submit" disabled={generating}
                className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
                style={{ background: primaryColor }}>
                {generating ? <><Loader2 className="h-4 w-4 animate-spin" /> {sL.generatingBtn}</> : <><Sparkles className="h-4 w-4" /> {sL.generateBtn}</>}
              </button>

              {lastGenerated && (
                <div className="rounded-xl border border-[hsl(var(--primary)/0.3)] bg-[hsl(var(--primary)/0.04)] p-4">
                  <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold" style={{ color: primaryColor }}>
                    <Check className="h-3.5 w-3.5" /> {sL.generated}
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
                placeholder={sL.searchPh}
                className="w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.5)] py-2 pl-9 pr-4 text-sm outline-none focus:border-[hsl(var(--primary))] transition" />
              {libSearch && <button onClick={() => setLibSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="h-3.5 w-3.5 text-[hsl(var(--muted-foreground))]" /></button>}
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button onClick={() => setFilterType("ALL")}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${filterType === "ALL" ? "text-white" : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]"}`}
                style={filterType === "ALL" ? { background: primaryColor } : {}}>
                {sL.all}
              </button>
              {PLATFORM_GROUPS.map((g) => g.types.map((t) => items.some((i) => i.type === t.value) && (
                <button key={t.value} onClick={() => setFilterType(t.value)}
                  className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${filterType === t.value ? "text-white" : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]"}`}
                  style={filterType === t.value ? { background: primaryColor } : {}}>
                  {t.icon} {sL.typeLabels[t.value] ?? t.label}
                </button>
              )))}
            </div>
          </div>

          {filteredItems.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-[hsl(var(--border))] py-16 text-center">
              <Sparkles className="h-10 w-10 text-[hsl(var(--muted-foreground)/0.3)]" />
              <p className="text-sm text-[hsl(var(--muted-foreground))]">{libSearch || filterType !== "ALL" ? sL.noMatch : sL.noContent}</p>
              {!libSearch && filterType === "ALL" && (
                <button onClick={() => setTab("generate")} className="text-sm font-medium" style={{ color: primaryColor }}>{sL.firstContent}</button>
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
              <p className="font-semibold">{sL.planTitle}</p>
            </div>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              {sL.planDesc(activeBrand.name)}
            </p>
            <div>
              <label className="mb-1.5 block text-sm font-medium">{sL.toneLabel} <span className="text-[hsl(var(--muted-foreground))]">{sL.optional}</span></label>
              <div className="flex flex-wrap gap-1.5">
                {sL.tones.map((t) => (
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
              {planGenerating ? <><Loader2 className="h-4 w-4 animate-spin" /> {sL.planGenerating}</> : <><Calendar className="h-4 w-4" /> {sL.planGenerate}</>}
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
