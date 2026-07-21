"use client";
import { useEffect, useState, use, useRef } from "react";
import {
  Eye, EyeOff, Save, Loader2, Globe, ChevronLeft,
  Sparkles, Send, RotateCcw, Check, Pencil, Bot, ExternalLink,
  Download, HelpCircle, ChevronDown,
} from "lucide-react";
import Link from "next/link";
import { BlockRenderer } from "@/components/website/block-renderer";
import type { Block } from "@/server/ai/website-generator";
import { useLang } from "@/components/language-provider";

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

      // Otomatik kaydet
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
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--primary))]" />
      </div>
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
            <BlockRenderer blocks={blocks} />
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
