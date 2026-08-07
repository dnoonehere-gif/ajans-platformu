"use client";
import { useEffect, useState, use, useRef } from "react";
import {
  Eye, EyeOff, Save, Loader2, Globe, ChevronLeft,
  Sparkles, Send, RotateCcw, Check, Pencil, Bot, ExternalLink,
  Download, HelpCircle, ChevronDown, Plus, ArrowUp, ArrowDown, Trash2,
} from "lucide-react";
import Link from "next/link";
import { BlockRenderer } from "@/components/website/block-renderer";
import { setByPath, type TextFormat } from "@/components/website/editable";
import { BLOCK_PRESETS } from "@/components/website/block-presets";
import { DomainRequestButton } from "@/components/website/domain-request-button";
import type { SiteTheme } from "@/server/ai/website-generator";
import type { Block } from "@/server/ai/website-generator";
import { useLang } from "@/components/language-provider";
import { PageLoading } from "@/components/ui/page-loading";

const L = {
  tr: {
    suggestions: [
      "Butonları kırmızı yap",
      "Hero arka planını lacivert yap",
      "Başlığı daha etkileyici yaz",
      "Hizmetlere bir tane daha ekle",
      "İletişim bölümüne e-posta ekle",
      "Butonları yeşil yap",
      "Özellikleri 4'e çıkar",
      "CTA metnini değiştir",
    ],
    greeting: "Merhaba! Web sitenizi düzenlememe yardımcı olabilirim. Ne değiştirmek istersiniz?",
    applied: "✅ Değişiklik uygulandı! Önizlemede görebilirsiniz.",
    problem: "Bir sorun oluştu",
    undone: "↩️ Son değişiklik geri alındı.",
    live: "Yayında", draft: "Taslak",
    viewSite: "Siteyi Görüntüle",
    export: "Dışa Aktar", exportTitle: "HTML olarak indir",
    domain: "Domain", undo: "Geri Al",
    save: "Kaydet", saved: "Kaydedildi",
    color: "Renk", resetFmt: "Sıfırla",
    editHint: "Metne tıklayıp doğrudan düzenleyebilirsin",
    sections: "Bölümler", addSection: "Bölüm Ekle", moveUp: "Yukarı", moveDown: "Aşağı", removeSection: "Kaldır",
    unpublish: "Yayından Kaldır", publish: "Yayınla",
    unpublishShort: "Kaldır", publishShort: "Yayınla",
    novelyaAddr: "Novelya Adresi",
    novelyaAddrNote: "Site yayında olunca bu adres hemen çalışır.",
    ownDomain: "Kendi Domainin ile Bağla",
    dnsAdd: "DNS ayarlarına şu kaydı ekle:",
    dnsHint: (u: string) => `Cloudflare, GoDaddy veya domainin kayıtlı olduğu panelde DNS > Add Record > Type: CNAME, Name: www, Target: ${u}`,
    aiEditor: "AI Editör", aiEditorSub: "Doğal dille düzenle",
    hints: "Öneriler",
    inputPlaceholder: "Butonları kırmızı yap...",
    enterHint: "Enter ile gönder · Shift+Enter yeni satır",
    livePreview: "Canlı Önizleme",
    aiWorking: "AI düzenleniyor...", editing: "Düzenleniyor...",
    preview: "Önizleme", fullscreen: "Tam Ekran", editorTab: "Düzenleyici",
  },
  en: {
    suggestions: [
      "Make the buttons red",
      "Make the hero background navy",
      "Write a more compelling headline",
      "Add one more service",
      "Add an email to the contact section",
      "Make the buttons green",
      "Increase features to 4",
      "Change the CTA text",
    ],
    greeting: "Hi! I can help you edit your website. What would you like to change?",
    applied: "✅ Change applied! You can see it in the preview.",
    problem: "Something went wrong",
    undone: "↩️ Last change was undone.",
    live: "Live", draft: "Draft",
    viewSite: "View Site",
    export: "Export", exportTitle: "Download as HTML",
    domain: "Domain", undo: "Undo",
    save: "Save", saved: "Saved",
    color: "Color", resetFmt: "Reset",
    editHint: "Click any text to edit it directly",
    sections: "Sections", addSection: "Add Section", moveUp: "Up", moveDown: "Down", removeSection: "Remove",
    unpublish: "Unpublish", publish: "Publish",
    unpublishShort: "Unpublish", publishShort: "Publish",
    novelyaAddr: "Novelya Address",
    novelyaAddrNote: "This address works as soon as the site is published.",
    ownDomain: "Connect Your Own Domain",
    dnsAdd: "Add this record to your DNS settings:",
    dnsHint: (u: string) => `In Cloudflare, GoDaddy or wherever your domain is registered: DNS > Add Record > Type: CNAME, Name: www, Target: ${u}`,
    aiEditor: "AI Editor", aiEditorSub: "Edit with natural language",
    hints: "Suggestions",
    inputPlaceholder: "Make the buttons red...",
    enterHint: "Enter to send · Shift+Enter for a new line",
    livePreview: "Live Preview",
    aiWorking: "AI is editing...", editing: "Editing...",
    preview: "Preview", fullscreen: "Fullscreen", editorTab: "Editor",
  },
};

/** Biçim çubuğu seçenekleri. Değer boşsa tema fontu/boyutu geçerli kalır. */
const FONTS = [
  { label: "Tema fontu", value: "" },
  { label: "Inter", value: "'Inter', system-ui, sans-serif" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Arial Black", value: "'Arial Black', Impact, sans-serif" },
  { label: "Trebuchet", value: "'Trebuchet MS', sans-serif" },
  { label: "Courier", value: "'Courier New', monospace" },
];

const SIZES = [
  { label: "Boyut", value: "" },
  { label: "Çok küçük", value: "0.75rem" },
  { label: "Küçük", value: "0.875rem" },
  { label: "Normal", value: "1rem" },
  { label: "Büyük", value: "1.25rem" },
  { label: "Çok büyük", value: "2rem" },
  { label: "Dev", value: "3.5rem" },
];

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
  subdomain?: string;
  /** Palet/tipografi/düzen — üreticinin seçtiği görsel kimlik */
  theme?: SiteTheme | null;
  pages: WebsitePage[];
  brand?: { slug: string };
}

interface ChatMessage {
  role: "user" | "ai";
  content: string;
  loading?: boolean;
}

export default function WebsiteEditorPage({
  params,
}: {
  params: Promise<{ websiteId: string }>;
}) {
  const { websiteId } = use(params);
  const { lang } = useLang();
  const sL = L[lang];
  const SUGGESTIONS = sL.suggestions;
  const [website, setWebsite] = useState<Website | null>(null);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [view, setView] = useState<"split" | "preview">("split");
  const [domainHelpOpen, setDomainHelpOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<"chat" | "preview">("chat");

  // AI Chat
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "ai", content: L[lang].greeting },
  ]);
  const [input, setInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [history, setHistory] = useState<Block[][]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`/api/website/${websiteId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.website) {
          setWebsite(d.website);
          setBlocks(d.website.pages[0]?.blocks ?? []);
        }
      });
  }, [websiteId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const activePage = website?.pages[0];

  // Otomatik kayıt: blocks değiştikten 2 saniye sonra kaydeder. Kullanıcı
  // yazmaya devam ederse sayaç sıfırlanır, böylece her tuşta istek gitmez.
  // İlk yüklemede ve AI düzenlemesinin kendi kaydından sonra tetiklenmemesi
  // için son kaydedilen içerik referansta tutulur.
  // Önizlemede tıklanan metin — biçim çubuğu bunun üzerinde çalışır.
  const [odak, setOdak] = useState<{ blockId: string; path: string } | null>(null);

  /** Yerinde düzenlenen metni blok ağacına yazar. */
  function metniGuncelle(blockId: string, path: string, value: string) {
    setBlocks((prev) => prev.map((b) => (b.id === blockId ? { ...b, data: setByPath(b.data, path, value) } : b)));
  }

  /** Seçilen dosyayı yükler, herkese açık URL döndürür. */
  async function medyaYukle(file: File): Promise<string | null> {
    if (!website) return null;
    const fd = new FormData();
    fd.append("file", file);
    fd.append("brandId", website.brandId);
    try {
      const res = await fetch("/api/media/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setMessages((m) => [...m, { role: "ai", content: `❌ ${data.error ?? sL.problem}` }]);
        return null;
      }
      return data.url as string;
    } catch {
      setMessages((m) => [...m, { role: "ai", content: `❌ ${sL.problem}` }]);
      return null;
    }
  }

  /** Odaktaki alanın biçimini (font/boyut/renk/kalınlık) değiştirir. */
  function bicimUygula(yama: Partial<TextFormat>) {
    if (!odak) return;
    setBlocks((prev) => prev.map((b) => {
      if (b.id !== odak.blockId) return b;
      const fmt = { ...((b.data._fmt as Record<string, TextFormat>) ?? {}) };
      fmt[odak.path] = { ...(fmt[odak.path] ?? {}), ...yama };
      return { ...b, data: { ...b.data, _fmt: fmt } };
    }));
  }

  const odakBicimi: TextFormat = (() => {
    if (!odak) return {};
    const b = blocks.find((x) => x.id === odak.blockId);
    return ((b?.data._fmt as Record<string, TextFormat>) ?? {})[odak.path] ?? {};
  })();

  const [bolumMenusu, setBolumMenusu] = useState(false);

  /** Yeni bölümü iletişim bloğunun ÜSTÜNE ekler — iletişim en sonda kalmalı. */
  function bolumEkle(yap: () => Block) {
    setHistory((h) => [...h, blocks]);
    setBlocks((prev) => {
      const yeni = yap();
      const iletisim = prev.findIndex((b) => b.type === "contact");
      if (iletisim === -1) return [...prev, yeni];
      return [...prev.slice(0, iletisim), yeni, ...prev.slice(iletisim)];
    });
    setBolumMenusu(false);
  }

  function bolumSil(id: string) {
    setHistory((h) => [...h, blocks]);
    setBlocks((prev) => prev.filter((b) => b.id !== id));
  }

  function bolumTasi(id: string, yon: -1 | 1) {
    setBlocks((prev) => {
      const i = prev.findIndex((b) => b.id === id);
      const j = i + yon;
      if (i === -1 || j < 0 || j >= prev.length) return prev;
      const kopya = [...prev];
      [kopya[i], kopya[j]] = [kopya[j], kopya[i]];
      return kopya;
    });
  }

  const sonKayitRef = useRef<string>("");
  useEffect(() => {
    if (!website || !activePage || blocks.length === 0) return;
    const imza = JSON.stringify(blocks);
    if (sonKayitRef.current === "") { sonKayitRef.current = imza; return; }
    if (sonKayitRef.current === imza) return;
    const zamanlayici = setTimeout(() => {
      sonKayitRef.current = imza;
      void saveBlocks(blocks);
    }, 2000);
    return () => clearTimeout(zamanlayici);
    // saveBlocks kimliği her renderda değişse de etkiyi yeniden kurmamak için
    // kasıtlı olarak bağımlılığa alınmadı.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blocks, website, activePage]);

  async function saveBlocks(b: Block[]) {
    if (!website || !activePage) return;
    setSaving(true);
    setSaved(false);
    await fetch(`/api/website/${website.brandId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pageId: activePage.id, blocks: b }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function togglePublish() {
    if (!website) return;
    setPublishing(true);
    const res = await fetch(`/api/website/${website.brandId}/publish`, { method: "POST" });
    const data = await res.json();
    if (typeof data.isPublished === "boolean") {
      setWebsite((w) => (w ? { ...w, isPublished: data.isPublished } : w));
    }
    setPublishing(false);
  }

  async function sendInstruction(instruction: string) {
    if (!instruction.trim() || aiLoading || !website) return;

    setHistory((h) => [...h, blocks]);
    setMessages((m) => [
      ...m,
      { role: "user", content: instruction },
      { role: "ai", content: "", loading: true },
    ]);
    setInput("");
    setAiLoading(true);

    try {
      const chatHistory = messages
        .filter((m) => !m.loading && m.content)
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await fetch("/api/website/ai-edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ websiteId, instruction, blocks, history: chatHistory }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error ?? "Hata");

      setBlocks(data.blocks);
      setMessages((m) => [
        ...m.slice(0, -1),
        { role: "ai", content: sL.applied },
      ]);

      // AI değişikliğini hemen kaydet; imza güncellenerek otomatik
      // kaydın aynı içeriği ikinci kez göndermesi engellenir.
      sonKayitRef.current = JSON.stringify(data.blocks);
      await saveBlocks(data.blocks);
    } catch (e) {
      setMessages((m) => [
        ...m.slice(0, -1),
        { role: "ai", content: `❌ Hata: ${e instanceof Error ? e.message : sL.problem}` },
      ]);
    } finally {
      setAiLoading(false);
    }
  }

  function undo() {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setBlocks(prev);
    setHistory((h) => h.slice(0, -1));
    setMessages((m) => [...m, { role: "ai", content: sL.undone }]);
  }

  if (!website) {
    return (
      <PageLoading />
    );
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[hsl(var(--background))]">
      {/* ── Üst Araç Çubuğu ── */}
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-y-2 border-b border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-2.5 lg:px-5 lg:py-3">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/website"
            className="rounded-lg p-1.5 text-[hsl(var(--muted-foreground))] transition hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <Globe className="hidden h-5 w-5 text-[hsl(var(--primary))] sm:block" />
          <span className="max-w-[120px] truncate font-semibold sm:max-w-none">{website.title}</span>
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
              website.isPublished
                ? "bg-green-500/15 text-green-400"
                : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]"
            }`}
          >
            {website.isPublished ? sL.live : sL.draft}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Siteyi Görüntüle */}
          {website.isPublished && (
            <a
              href={`/site/${website.brand?.slug ?? website.brandId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-green-400 transition hover:bg-green-500/10"
            >
              <ExternalLink className="h-4 w-4" />
              <span className="hidden sm:inline">{sL.viewSite}</span>
            </a>
          )}

          {/* Dışa Aktar */}
          <a
            href={`/api/website/${website.brandId}/export`}
            download
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-[hsl(var(--muted-foreground))] transition hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]"
            title={sL.exportTitle}
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">{sL.export}</span>
          </a>

          {/* Domain Yardım */}
          <button
            onClick={() => setDomainHelpOpen((v) => !v)}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-[hsl(var(--muted-foreground))] transition hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]"
          >
            <HelpCircle className="h-4 w-4" />
            <span className="hidden sm:inline">{sL.domain}</span>
            <ChevronDown className={`h-3 w-3 transition ${domainHelpOpen ? "rotate-180" : ""}`} />
          </button>

          {/* Geri al */}
          <button
            onClick={undo}
            disabled={history.length === 0}
            title={sL.undo}
            className="rounded-lg p-2 text-[hsl(var(--muted-foreground))] transition hover:bg-[hsl(var(--muted))] disabled:opacity-30"
          >
            <RotateCcw className="h-4 w-4" />
          </button>

          {/* Görünüm */}
          <button
            onClick={() => setView(view === "split" ? "preview" : "split")}
            className="hidden items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-[hsl(var(--muted-foreground))] transition hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))] lg:flex"
          >
            {view === "split" ? (
              <><Eye className="h-4 w-4" /> {sL.fullscreen}</>
            ) : (
              <><Pencil className="h-4 w-4" /> {sL.editorTab}</>
            )}
          </button>

          {/* Kaydet */}
          <button
            onClick={() => saveBlocks(blocks)}
            disabled={saving}
            className="flex items-center gap-1.5 rounded-lg bg-[hsl(var(--muted))] px-3 py-1.5 text-sm font-medium transition hover:bg-[hsl(var(--border))] disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : saved ? (
              <Check className="h-4 w-4 text-green-400" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">{saved ? sL.saved : sL.save}</span>
          </button>

          {/* Yayınla */}
          <button
            onClick={togglePublish}
            disabled={publishing}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold text-white transition disabled:opacity-50 ${
              website.isPublished
                ? "bg-red-500 hover:bg-red-600"
                : "bg-[hsl(var(--primary))] hover:opacity-90"
            }`}
          >
            {publishing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : website.isPublished ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">{website.isPublished ? sL.unpublish : sL.publish}</span>
            <span className="sm:hidden">{website.isPublished ? sL.unpublishShort : sL.publishShort}</span>
          </button>
        </div>
      </header>

      {/* ── Domain Yardım Paneli ── */}
      {domainHelpOpen && (
        <div className="shrink-0 border-b border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.4)] px-6 py-4">
          {(() => {
            const sub = website.subdomain ?? website.brand?.slug ?? website.brandId;
            const subUrl = `https://${sub}.novelya.com.tr`;
            const siteUrl = `https://novelya.com.tr/site/${sub}`;
            return (
              <div className="mx-auto max-w-4xl space-y-4">
                {/* Ekibe gönderme: DNS ile uğraşmak istemeyen kullanıcı için
                    tek tuşluk yol. Aşağıdaki elle kurulum anlatımı, kendi
                    yapmak isteyenler için duruyor. */}
                <DomainRequestButton websiteId={websiteId} />

                <div className="flex flex-wrap items-start gap-6">
                  {/* Novelya Subdomain */}
                  <div className="flex-1 min-w-56">
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                      {sL.novelyaAddr}
                    </p>
                    <div className="flex items-center gap-2">
                      <code className="rounded-lg bg-[hsl(var(--card))] border border-[hsl(var(--border))] px-3 py-1.5 text-sm font-mono text-[hsl(var(--primary))]">
                        {siteUrl}
                      </code>
                      <a href={siteUrl} target="_blank" rel="noopener noreferrer" className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                    <p className="mt-1 text-[11px] text-[hsl(var(--muted-foreground))]">{sL.novelyaAddrNote}</p>
                  </div>

                  {/* Kendi Domain */}
                  <div className="flex-1 min-w-72">
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                      {sL.ownDomain}
                    </p>
                    <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3 space-y-2 text-sm">
                      <p className="font-medium">{sL.dnsAdd}</p>
                      <div className="rounded-lg bg-[hsl(var(--muted))] px-3 py-2 font-mono text-xs">
                        <span className="text-blue-400">CNAME</span>{" "}
                        <span className="text-yellow-400">www</span>{" "}
                        <span className="text-green-400">→ {subUrl}</span>
                      </div>
                      <p className="text-[11px] text-[hsl(var(--muted-foreground))]">
                        {sL.dnsHint(subUrl)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* ── Ana İçerik ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* ── Sol Panel: AI Chat ── */}
        {view === "split" && (
          <aside className={`${mobileTab === "chat" ? "flex" : "hidden"} w-full shrink-0 flex-col border-r border-[hsl(var(--border))] bg-[hsl(var(--card))] lg:flex lg:w-80`}>
            {/* Başlık */}
            <div className="flex items-center gap-2 border-b border-[hsl(var(--border))] px-4 py-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[hsl(var(--primary)/0.12)]">
                <Bot className="h-4 w-4 text-[hsl(var(--primary))]" />
              </div>
              <div>
                <p className="text-sm font-semibold">{sL.aiEditor}</p>
                <p className="text-[10px] text-[hsl(var(--muted-foreground))]">{sL.aiEditorSub}</p>
              </div>
            </div>

            {/* Mesajlar */}
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  {msg.role === "ai" && (
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--primary)/0.12)]">
                      <Sparkles className="h-3.5 w-3.5 text-[hsl(var(--primary))]" />
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm ${
                      msg.role === "user"
                        ? "rounded-tr-sm bg-[hsl(var(--primary))] text-white"
                        : "rounded-tl-sm bg-[hsl(var(--muted)/0.7)] text-[hsl(var(--foreground))]"
                    }`}
                  >
                    {msg.loading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <span>{sL.editing}</span>
                      </div>
                    ) : (
                      msg.content
                    )}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Öneriler */}
            {messages.length <= 2 && (
              <div className="border-t border-[hsl(var(--border))] px-4 py-3">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                  {sL.hints}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {SUGGESTIONS.slice(0, 4).map((s) => (
                    <button
                      key={s}
                      onClick={() => sendInstruction(s)}
                      disabled={aiLoading}
                      className="rounded-lg border border-[hsl(var(--border))] px-2.5 py-1 text-xs transition hover:border-[hsl(var(--primary)/0.5)] hover:bg-[hsl(var(--accent))] disabled:opacity-50"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="border-t border-[hsl(var(--border))] p-4">
              <div className="flex items-end gap-2">
                <textarea
                  rows={2}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendInstruction(input);
                    }
                  }}
                  placeholder={sL.inputPlaceholder}
                  disabled={aiLoading}
                  className="flex-1 resize-none rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.5)] px-3 py-2.5 text-sm outline-none transition focus:border-[hsl(var(--primary))] focus:ring-2 focus:ring-[hsl(var(--primary)/0.15)] placeholder:text-[hsl(var(--muted-foreground))] disabled:opacity-50"
                />
                <button
                  onClick={() => sendInstruction(input)}
                  disabled={!input.trim() || aiLoading}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--primary))] text-white transition hover:opacity-90 disabled:opacity-40"
                >
                  {aiLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </button>
              </div>
              <p className="mt-1.5 text-[10px] text-[hsl(var(--muted-foreground))]">
                {sL.enterHint}
              </p>
            </div>
          </aside>
        )}

        {/* ── Sağ Panel: Önizleme ── */}
        <main className={`${view === "split" && mobileTab === "chat" ? "hidden" : "block"} flex-1 overflow-y-auto lg:block`}>
          {/* Önizleme şeridi */}
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[hsl(var(--border))] bg-[hsl(var(--background)/0.9)] px-5 py-2 backdrop-blur">
            <span className="text-xs text-[hsl(var(--muted-foreground))]">
              {sL.livePreview}
            </span>
            {aiLoading && (
              <span className="flex items-center gap-1.5 text-xs text-[hsl(var(--primary))]">
                <Loader2 className="h-3 w-3 animate-spin" />
                {sL.aiWorking}
              </span>
            )}
          </div>

          <div className={`transition-opacity duration-300 ${aiLoading ? "opacity-60" : "opacity-100"}`}>
            {/* Biçim çubuğu — bir metne tıklandığında beliriyor. Font,
                boyut, renk ve kalınlık yalnızca o alana uygulanır ve blok
                verisiyle birlikte kaydedilir. */}
            {odak && (
              <div className="sticky top-0 z-20 mb-3 flex flex-wrap items-center gap-2 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-2 shadow-lg">
                <select
                  value={odakBicimi.fontFamily ?? ""}
                  onChange={(e) => bicimUygula({ fontFamily: e.target.value || undefined })}
                  className="h-8 rounded-lg border border-[hsl(var(--border))] bg-transparent px-2 text-xs outline-none"
                >
                  {FONTS.map((f) => <option key={f.label} value={f.value}>{f.label}</option>)}
                </select>

                <select
                  value={odakBicimi.fontSize ?? ""}
                  onChange={(e) => bicimUygula({ fontSize: e.target.value || undefined })}
                  className="h-8 rounded-lg border border-[hsl(var(--border))] bg-transparent px-2 text-xs outline-none"
                >
                  {SIZES.map((sz) => <option key={sz.label} value={sz.value}>{sz.label}</option>)}
                </select>

                <label className="flex h-8 cursor-pointer items-center gap-1.5 rounded-lg border border-[hsl(var(--border))] px-2 text-xs">
                  <span className="h-4 w-4 rounded border border-[hsl(var(--border))]"
                    style={{ background: odakBicimi.color ?? "transparent" }} />
                  {sL.color}
                  <input type="color" value={odakBicimi.color ?? "#000000"}
                    onChange={(e) => bicimUygula({ color: e.target.value })}
                    className="h-0 w-0 opacity-0" />
                </label>

                <button
                  onClick={() => bicimUygula({ bold: !odakBicimi.bold })}
                  className={`h-8 w-8 rounded-lg border text-xs font-black transition ${odakBicimi.bold
                    ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.12)] text-[hsl(var(--primary))]"
                    : "border-[hsl(var(--border))]"}`}
                >B</button>

                <button
                  onClick={() => bicimUygula({ fontFamily: undefined, fontSize: undefined, color: undefined, bold: false })}
                  className="h-8 rounded-lg border border-[hsl(var(--border))] px-2.5 text-xs transition hover:bg-[hsl(var(--accent))]"
                >{sL.resetFmt}</button>

                <span className="ml-auto pr-1 text-[10px] text-[hsl(var(--muted-foreground))]">{sL.editHint}</span>
              </div>
            )}

            <BlockRenderer
              blocks={blocks}
              theme={website?.theme ?? null}
              editable
              onUpdate={metniGuncelle}
              onFocusField={(blockId, path) => setOdak({ blockId, path })}
              uploadMedia={medyaYukle}
            />

            {/* ── Bölüm yönetimi ──
                Site üretilirken brief'e göre blok seçiliyor; "fotoğrafım var"
                işaretlemeyen kullanıcı galeriyi hiç alamıyor ve sonradan da
                ekleyemiyordu. Buradan her bölüm eklenip sırası değiştirilebilir. */}
            <div className="mt-6 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-sm font-semibold">{sL.sections}</p>
                <div className="relative">
                  <button
                    onClick={() => setBolumMenusu((a) => !a)}
                    className="flex items-center gap-1.5 rounded-xl bg-[hsl(var(--primary))] px-3.5 py-2 text-xs font-semibold text-white transition hover:opacity-90"
                  >
                    <Plus className="h-3.5 w-3.5" /> {sL.addSection}
                  </button>

                  {bolumMenusu && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setBolumMenusu(false)} />
                      <div className="absolute right-0 top-full z-50 mt-1.5 max-h-80 w-64 overflow-y-auto rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-1.5 shadow-xl">
                        {BLOCK_PRESETS.map((pr) => (
                          <button
                            key={pr.type}
                            onClick={() => bolumEkle(pr.make)}
                            className="w-full rounded-xl px-3 py-2 text-left transition hover:bg-[hsl(var(--accent))]"
                          >
                            <span className="block text-sm font-medium">{pr.label[lang]}</span>
                            <span className="block text-[11px] text-[hsl(var(--muted-foreground))]">{pr.hint[lang]}</span>
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                {blocks.map((b, i) => (
                  <div key={b.id} className="flex items-center gap-2 rounded-xl bg-[hsl(var(--muted)/0.4)] px-3 py-2">
                    <span className="flex-1 truncate text-xs font-medium">
                      {BLOCK_PRESETS.find((pr) => pr.type === b.type)?.label[lang] ?? b.type}
                    </span>
                    <button onClick={() => bolumTasi(b.id, -1)} disabled={i === 0} title={sL.moveUp}
                      className="rounded-lg p-1 text-[hsl(var(--muted-foreground))] transition hover:bg-[hsl(var(--accent))] disabled:opacity-30">
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => bolumTasi(b.id, 1)} disabled={i === blocks.length - 1} title={sL.moveDown}
                      className="rounded-lg p-1 text-[hsl(var(--muted-foreground))] transition hover:bg-[hsl(var(--accent))] disabled:opacity-30">
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                    {/* Hero ve iletişim silinemez: sayfanın açılışı ve kapanışı */}
                    {b.type !== "hero" && b.type !== "contact" && (
                      <button onClick={() => bolumSil(b.id)} title={sL.removeSection}
                        className="rounded-lg p-1 text-red-400 transition hover:bg-red-500/10">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* ── Mobil Sekme Çubuğu ── */}
      {view === "split" && (
        <div className="flex shrink-0 border-t border-[hsl(var(--border))] bg-[hsl(var(--card))] pb-[env(safe-area-inset-bottom,0px)] lg:hidden">
          <button
            onClick={() => setMobileTab("chat")}
            className={`flex flex-1 items-center justify-center gap-2 py-3 text-sm font-semibold transition ${
              mobileTab === "chat"
                ? "text-[hsl(var(--primary))] border-t-2 border-[hsl(var(--primary))] -mt-px"
                : "text-[hsl(var(--muted-foreground))]"
            }`}
          >
            <Bot className="h-4 w-4" />
            {sL.aiEditor}
          </button>
          <button
            onClick={() => setMobileTab("preview")}
            className={`flex flex-1 items-center justify-center gap-2 py-3 text-sm font-semibold transition ${
              mobileTab === "preview"
                ? "text-[hsl(var(--primary))] border-t-2 border-[hsl(var(--primary))] -mt-px"
                : "text-[hsl(var(--muted-foreground))]"
            }`}
          >
            <Eye className="h-4 w-4" />
            {sL.preview}
          </button>
        </div>
      )}
    </div>
  );
}
