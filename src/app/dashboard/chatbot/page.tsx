"use client";
import { useState, useEffect, useCallback } from "react";
import {
  Bot, Plus, Trash2, Save, MessageSquare, Loader2,
  ChevronDown, ChevronUp, Sparkles, Settings, BookOpen,
  Copy, Check, Code2, Search, X, ZapIcon, CalendarCheck,
  Upload, FileText, FileSpreadsheet, AlertCircle,
} from "lucide-react";
import { useBrand } from "@/components/dashboard/brand-provider";
import { ChatWidget } from "@/components/chatbot/chat-widget";

const CATEGORIES = ["sss", "ürün", "hizmet", "menü", "saat", "adres", "kampanya", "fiyat", "iletişim", "diğer"];
const CAT_COLORS: Record<string, string> = {
  sss: "bg-blue-500/10 text-blue-400",
  ürün: "bg-purple-500/10 text-purple-400",
  hizmet: "bg-teal-500/10 text-teal-400",
  menü: "bg-orange-500/10 text-orange-400",
  saat: "bg-yellow-500/10 text-yellow-400",
  adres: "bg-green-500/10 text-green-400",
  kampanya: "bg-pink-500/10 text-pink-400",
  fiyat: "bg-indigo-500/10 text-indigo-400",
  iletişim: "bg-cyan-500/10 text-cyan-400",
  diğer: "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]",
};

interface KnowledgeEntry {
  id: string; category: string; question?: string | null; content: string;
}
interface Message {
  id: string; role: string; content: string; createdAt: string;
}
interface Conversation {
  id: string; createdAt: string; visitorId?: string | null; messages: Message[];
}
interface Chatbot {
  id: string; name: string; systemPrompt?: string | null; isActive: boolean;
  reservationEnabled: boolean;
  knowledgeBase: KnowledgeEntry[];
}

interface Reservation {
  id: string; name: string; phone: string | null; email: string | null;
  date: string; time: string; partySize: number; notes: string | null;
  status: string; source: string; createdAt: string;
}

type Tab = "settings" | "knowledge" | "conversations" | "embed" | "reservations";

export default function ChatbotPage() {
  const { activeBrand } = useBrand();
  const brandId = activeBrand?.id ?? "";

  const [chatbot, setChatbot] = useState<Chatbot | null>(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<Tab>("settings");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [convLoading, setConvLoading] = useState(false);
  const [openConv, setOpenConv] = useState<string | null>(null);
  const [kSearch, setKSearch] = useState("");
  const [kCatFilter, setKCatFilter] = useState("all");
  const [copied, setCopied] = useState<string | null>(null);
  const [previewKey, setPreviewKey] = useState(0);

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [resLoading, setResLoading] = useState(false);

  // Form state
  const [name, setName] = useState("Asistan");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [reservationEnabled, setReservationEnabled] = useState(false);
  const [saving, setSaving] = useState(false);

  // Knowledge form
  const [kCategory, setKCategory] = useState("sss");
  const [kQuestion, setKQuestion] = useState("");
  const [kContent, setKContent] = useState("");
  const [kLoading, setKLoading] = useState(false);

  const loadChatbot = useCallback(async () => {
    if (!brandId) return;
    setLoading(true);
    const res = await fetch(`/api/chatbot/${brandId}`);
    const data = await res.json();
    if (data.chatbot) {
      setChatbot(data.chatbot);
      setName(data.chatbot.name);
      setSystemPrompt(data.chatbot.systemPrompt ?? "");
      setIsActive(data.chatbot.isActive);
      setReservationEnabled(data.chatbot.reservationEnabled ?? false);
    } else {
      setChatbot(null);
    }
    setLoading(false);
  }, [brandId]);

  useEffect(() => { loadChatbot(); }, [loadChatbot]);

  const loadConversations = useCallback(async () => {
    if (!brandId) return;
    setConvLoading(true);
    const res = await fetch(`/api/chatbot/${brandId}/conversations`);
    const data = await res.json();
    if (data.conversations) setConversations(data.conversations);
    setConvLoading(false);
  }, [brandId]);

  useEffect(() => {
    if (tab === "conversations" && chatbot) loadConversations();
  }, [tab, chatbot, loadConversations]);

  const loadReservations = useCallback(async () => {
    if (!brandId) return;
    setResLoading(true);
    try {
      const res = await fetch(`/api/reservations?brandId=${brandId}`);
      const data = await res.json();
      if (data.reservations) setReservations(data.reservations);
    } catch { /* ignore */ }
    setResLoading(false);
  }, [brandId]);

  useEffect(() => {
    if (tab === "reservations" && chatbot) loadReservations();
  }, [tab, chatbot, loadReservations]);

  async function saveSettings(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/chatbot/setup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ brandId, name, systemPrompt, isActive, reservationEnabled }),
    });
    const data = await res.json();
    if (data.chatbot) {
      await loadChatbot();
      setPreviewKey((k) => k + 1);
    }
    setSaving(false);
  }

  async function addKnowledge(e: React.FormEvent) {
    e.preventDefault();
    if (!chatbot || !kContent.trim()) return;
    setKLoading(true);
    const res = await fetch(`/api/chatbot/${brandId}/knowledge`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category: kCategory, question: kQuestion || undefined, content: kContent }),
    });
    const data = await res.json();
    if (data.entry) {
      setChatbot((c) => c ? { ...c, knowledgeBase: [data.entry, ...c.knowledgeBase] } : c);
      setKQuestion("");
      setKContent("");
    }
    setKLoading(false);
  }

  async function deleteKnowledge(id: string) {
    await fetch(`/api/chatbot/${brandId}/knowledge/${id}`, { method: "DELETE" });
    setChatbot((c) => c ? { ...c, knowledgeBase: c.knowledgeBase.filter((k) => k.id !== id) } : c);
  }

  const [importMode, setImportMode] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [importResult, setImportResult] = useState<{ count: number; error?: string } | null>(null);

  function parseCSV(text: string): { category: string; question?: string; content: string }[] {
    const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
    if (lines.length < 2) return [];
    const header = lines[0].toLowerCase();
    const hasCategory = header.includes("kategori") || header.includes("category");
    const hasQuestion = header.includes("soru") || header.includes("question");

    return lines.slice(1).map((line) => {
      const cols = line.split(/[,;\t]/).map((c) => c.replace(/^["']|["']$/g, "").trim());
      if (hasCategory && hasQuestion) {
        return { category: cols[0] || "sss", question: cols[1] || undefined, content: cols[2] || "" };
      } else if (hasCategory) {
        return { category: cols[0] || "sss", content: cols[1] || "" };
      } else if (hasQuestion) {
        return { category: "sss", question: cols[0] || undefined, content: cols[1] || "" };
      }
      return { category: "sss", question: cols[0] || undefined, content: cols[1] || cols[0] || "" };
    }).filter((e) => e.content);
  }

  function parseTXT(text: string): { category: string; question?: string; content: string }[] {
    const blocks = text.split(/\n{2,}/).map((b) => b.trim()).filter(Boolean);
    return blocks.map((block) => {
      const lines = block.split("\n");
      if (lines.length >= 2 && lines[0].endsWith("?")) {
        return { category: "sss", question: lines[0], content: lines.slice(1).join("\n") };
      }
      return { category: "diğer", content: block };
    });
  }

  function parseJSON(text: string): { category: string; question?: string; content: string }[] {
    try {
      const data = JSON.parse(text);
      const arr = Array.isArray(data) ? data : data.entries ?? data.faqs ?? data.knowledge ?? [];
      return arr.map((item: Record<string, string>) => ({
        category: item.category || item.kategori || "sss",
        question: item.question || item.soru || undefined,
        content: item.content || item.answer || item.cevap || item.yanit || "",
      })).filter((e: { content: string }) => e.content);
    } catch { return []; }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !chatbot) return;
    e.target.value = "";

    setImportLoading(true);
    setImportResult(null);

    try {
      const text = await file.text();
      let entries: { category: string; question?: string; content: string }[] = [];

      const ext = file.name.split(".").pop()?.toLowerCase();
      if (ext === "csv" || ext === "tsv") {
        entries = parseCSV(text);
      } else if (ext === "json") {
        entries = parseJSON(text);
      } else {
        entries = parseTXT(text);
      }

      if (entries.length === 0) {
        setImportResult({ count: 0, error: "Dosyadan bilgi çıkarılamadı. Format kontrolü yapın." });
        setImportLoading(false);
        return;
      }

      if (entries.length > 200) entries = entries.slice(0, 200);

      const res = await fetch(`/api/chatbot/${brandId}/knowledge/import`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entries }),
      });
      const data = await res.json();

      if (res.ok) {
        setImportResult({ count: data.count });
        await loadChatbot();
      } else {
        setImportResult({ count: 0, error: data.error ?? "İçe aktarma başarısız" });
      }
    } catch {
      setImportResult({ count: 0, error: "Dosya okunamadı" });
    }
    setImportLoading(false);
  }

  async function handleSSSSampleImport() {
    if (!chatbot) return;
    setImportLoading(true);
    setImportResult(null);

    const sampleFAQs = [
      { category: "saat", question: "Çalışma saatleriniz nedir?", content: "Hafta içi 09:00-18:00, Cumartesi 10:00-14:00 arası hizmet vermekteyiz. Pazar günleri kapalıyız." },
      { category: "iletişim", question: "Size nasıl ulaşabilirim?", content: "Bize telefon, e-posta veya web sitemizdeki iletişim formu üzerinden ulaşabilirsiniz." },
      { category: "fiyat", question: "Fiyatlarınız hakkında bilgi alabilir miyim?", content: "Fiyatlarımız hizmet türüne göre değişmektedir. Detaylı fiyat bilgisi için bizimle iletişime geçebilirsiniz." },
      { category: "sss", question: "İade politikanız nedir?", content: "Satın alma tarihinden itibaren 14 gün içinde iade yapılabilir. Ürün kullanılmamış ve orijinal ambalajında olmalıdır." },
      { category: "sss", question: "Kargo ne kadar sürede gelir?", content: "Siparişler genellikle 2-3 iş günü içinde teslim edilir. Yoğun dönemlerde bu süre uzayabilir." },
      { category: "kampanya", question: "Aktif kampanyalarınız var mı?", content: "Güncel kampanya ve indirimlerimiz için web sitemizi ve sosyal medya hesaplarımızı takip edebilirsiniz." },
    ];

    try {
      const res = await fetch(`/api/chatbot/${brandId}/knowledge/import`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entries: sampleFAQs }),
      });
      const data = await res.json();
      if (res.ok) {
        setImportResult({ count: data.count });
        await loadChatbot();
      } else {
        setImportResult({ count: 0, error: data.error ?? "Başarısız" });
      }
    } catch {
      setImportResult({ count: 0, error: "Bağlantı hatası" });
    }
    setImportLoading(false);
  }

  function copyText(text: string, key: string) {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }

  const filteredKnowledge = chatbot?.knowledgeBase.filter((k) => {
    const matchCat = kCatFilter === "all" || k.category === kCatFilter;
    const matchSearch = !kSearch || k.content.toLowerCase().includes(kSearch.toLowerCase()) || k.question?.toLowerCase().includes(kSearch.toLowerCase());
    return matchCat && matchSearch;
  }) ?? [];

  const totalMessages = conversations.reduce((sum, c) => sum + c.messages.length, 0);
  const avgMessages = conversations.length ? Math.round(totalMessages / conversations.length) : 0;
  const primaryColor = activeBrand?.primaryColor ?? "#6366f1";
  const origin = typeof window !== "undefined" ? window.location.origin : "";

  if (!activeBrand) return (
    <div className="flex h-64 items-center justify-center text-[hsl(var(--muted-foreground))]">
      Önce bir marka seçin
    </div>
  );

  const brandSlug = activeBrand.slug;
  const embedIframe = `<iframe\n  src="${origin}/chat/${brandSlug}"\n  width="400"\n  height="600"\n  frameborder="0"\n  style="border-radius:16px;box-shadow:0 8px 32px rgba(0,0,0,0.15)"\n></iframe>`;
  const embedScript = `<script>\n(function() {\n  var btn = document.createElement('button');\n  btn.innerHTML = '💬';\n  btn.style.cssText = 'position:fixed;bottom:24px;right:24px;width:56px;height:56px;border-radius:50%;background:${primaryColor};color:white;font-size:24px;border:none;cursor:pointer;box-shadow:0 4px 20px rgba(0,0,0,0.2);z-index:9999';\n  var frame = document.createElement('iframe');\n  frame.src = '${origin}/chat/${brandSlug}';\n  frame.style.cssText = 'position:fixed;bottom:96px;right:24px;width:380px;height:560px;border:none;border-radius:16px;box-shadow:0 8px 40px rgba(0,0,0,0.2);z-index:9998;display:none';\n  var open = false;\n  btn.onclick = function() { open=!open; frame.style.display=open?'block':'none'; };\n  document.body.appendChild(btn);\n  document.body.appendChild(frame);\n})();\n<\/script>`;

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">

      {/* Sol Panel */}
      <div className="flex w-full flex-col overflow-y-auto xl:w-[calc(100%-400px)]">
        <div className="flex-1 space-y-5 p-6 lg:p-8">

          {/* Header */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: `${primaryColor}22` }}>
                <Bot className="h-5 w-5" style={{ color: primaryColor }} />
              </div>
              <div>
                <h1 className="text-2xl font-bold">AI Chatbot</h1>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">{activeBrand.name} · {chatbot ? chatbot.name : "Kurulum gerekli"}</p>
              </div>
            </div>
            {chatbot && (
              <span className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                chatbot.isActive ? "bg-green-500/10 text-green-400" : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]"
              }`}>
                <span className={`h-1.5 w-1.5 rounded-full ${chatbot.isActive ? "bg-green-400" : "bg-[hsl(var(--muted-foreground))]"}`} />
                {chatbot.isActive ? "Aktif" : "Pasif"}
              </span>
            )}
          </div>

          {/* Stats */}
          {chatbot && (
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Konuşma", value: conversations.length || chatbot.id ? "—" : "0", icon: MessageSquare, color: "text-blue-400" },
                { label: "Bilgi Girişi", value: chatbot.knowledgeBase.length, icon: BookOpen, color: "text-teal-400" },
                { label: "Ort. Mesaj", value: avgMessages || "—", icon: ZapIcon, color: "text-purple-400" },
              ].map((s) => (
                <div key={s.label} className="glass rounded-xl p-4">
                  <s.icon className={`mb-1.5 h-4 w-4 ${s.color}`} />
                  <p className="text-xl font-bold">{s.value}</p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">{s.label}</p>
                </div>
              ))}
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-1 rounded-xl bg-[hsl(var(--muted)/0.5)] p-1">
            {([
              { key: "settings", label: "Ayarlar", icon: Settings },
              { key: "knowledge", label: "Bilgi Tabanı", icon: BookOpen },
              { key: "conversations", label: "Konuşmalar", icon: MessageSquare },
              { key: "reservations", label: "Rezervasyonlar", icon: CalendarCheck },
              { key: "embed", label: "Entegrasyon", icon: Code2 },
            ] as { key: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[]).map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-medium transition ${
                  tab === t.key ? "bg-[hsl(var(--background))] shadow-sm text-[hsl(var(--foreground))]" : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                }`}
              >
                <t.icon className="h-3.5 w-3.5" />{t.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex h-32 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-[hsl(var(--primary))]" />
            </div>
          ) : (
            <>
              {/* AYARLAR */}
              {tab === "settings" && (
                <form onSubmit={saveSettings} className="glass space-y-5 rounded-2xl p-6">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">Bot Adı</label>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Asistan, Yardımcı, Mia..."
                      className="w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.5)] px-4 py-2.5 text-sm outline-none transition focus:border-[hsl(var(--primary))]"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium">Sistem Talimatı</label>
                    <p className="mb-2 text-xs text-[hsl(var(--muted-foreground))]">
                      Botun kişiliğini, tonunu ve davranışını özelleştir. Marka bilgi tabanı otomatik eklenir.
                    </p>
                    <textarea
                      rows={5}
                      value={systemPrompt}
                      onChange={(e) => setSystemPrompt(e.target.value)}
                      placeholder={`Örnek: Samimi ve arkadaşça bir ton kullan. Ürün fiyatlarını asla söyleme, müşteriyi kasaya yönlendir. Şikayet geldiğinde özür dile ve müdür ile görüşmesini öner.`}
                      className="w-full resize-none rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.5)] px-4 py-3 text-sm outline-none transition focus:border-[hsl(var(--primary))] placeholder:text-[hsl(var(--muted-foreground))]"
                    />
                  </div>

                  <div>
                    <label className="mb-3 block text-sm font-medium">Chatbot Durumu</label>
                    <button
                      type="button"
                      onClick={() => setIsActive(!isActive)}
                      className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition ${
                        isActive ? "border-green-500/30 bg-green-500/5" : "border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.3)]"
                      }`}
                    >
                      <div className={`relative h-5 w-9 rounded-full transition ${isActive ? "bg-green-500" : "bg-[hsl(var(--muted))]"}`}>
                        <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${isActive ? "left-[18px]" : "left-0.5"}`} />
                      </div>
                      <span className="text-sm font-medium">{isActive ? "Aktif — ziyaretçiler chatbot'u kullanabilir" : "Pasif — chatbot devre dışı"}</span>
                    </button>
                  </div>

                  <div>
                    <label className="mb-3 block text-sm font-medium">Chatbot ile Rezervasyon</label>
                    <button
                      type="button"
                      onClick={() => setReservationEnabled(!reservationEnabled)}
                      className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition ${
                        reservationEnabled ? "border-blue-500/30 bg-blue-500/5" : "border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.3)]"
                      }`}
                    >
                      <div className={`relative h-5 w-9 rounded-full transition ${reservationEnabled ? "bg-blue-500" : "bg-[hsl(var(--muted))]"}`}>
                        <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${reservationEnabled ? "left-[18px]" : "left-0.5"}`} />
                      </div>
                      <div>
                        <span className="text-sm font-medium">{reservationEnabled ? "Aktif — müşteriler chatbot üzerinden rezervasyon yapabilir" : "Pasif — rezervasyon özelliği kapalı"}</span>
                        <p className="text-xs text-[hsl(var(--muted-foreground))]">Açıldığında chatbot otomatik olarak müşteriden ad, tarih, saat ve kişi bilgisi toplar</p>
                      </div>
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
                    style={{ background: primaryColor }}
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    {chatbot ? "Kaydet" : "Chatbot Oluştur"}
                  </button>
                </form>
              )}

              {/* BİLGİ TABANI */}
              {tab === "knowledge" && (
                <div className="space-y-4">
                  {!chatbot ? (
                    <div className="rounded-xl border border-dashed border-[hsl(var(--border))] p-6 text-center text-sm text-[hsl(var(--muted-foreground))]">
                      Önce Ayarlar sekmesinden chatbot oluşturun.
                    </div>
                  ) : (
                    <>
                      <form onSubmit={addKnowledge} className="glass rounded-2xl p-5 space-y-3">
                        <p className="text-sm font-semibold">Yeni Bilgi Ekle</p>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="mb-1 block text-xs text-[hsl(var(--muted-foreground))]">Kategori</label>
                            <select
                              value={kCategory}
                              onChange={(e) => setKCategory(e.target.value)}
                              className="w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.5)] px-3 py-2 text-sm outline-none focus:border-[hsl(var(--primary))] transition"
                            >
                              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="mb-1 block text-xs text-[hsl(var(--muted-foreground))]">Soru (opsiyonel)</label>
                            <input
                              value={kQuestion}
                              onChange={(e) => setKQuestion(e.target.value)}
                              placeholder="Çalışma saatleriniz nedir?"
                              className="w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.5)] px-3 py-2 text-sm outline-none focus:border-[hsl(var(--primary))] transition"
                            />
                          </div>
                        </div>
                        <textarea
                          rows={3}
                          required
                          value={kContent}
                          onChange={(e) => setKContent(e.target.value)}
                          placeholder="Hafta içi 09:00 – 22:00, Cumartesi-Pazar 10:00 – 23:00 arası açığız."
                          className="w-full resize-none rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.5)] px-3 py-2.5 text-sm outline-none focus:border-[hsl(var(--primary))] transition placeholder:text-[hsl(var(--muted-foreground))]"
                        />
                        <button
                          type="submit"
                          disabled={kLoading}
                          className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
                          style={{ background: primaryColor }}
                        >
                          {kLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                          Ekle
                        </button>
                      </form>

                      {/* Import Section */}
                      <div className="glass rounded-2xl p-5">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-sm font-semibold">Toplu İçe Aktar</p>
                          <button
                            onClick={() => setImportMode(!importMode)}
                            className="text-xs text-[hsl(var(--primary))] hover:underline"
                          >
                            {importMode ? "Kapat" : "Seçenekleri göster"}
                          </button>
                        </div>

                        {importMode && (
                          <div className="space-y-3">
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                              {/* File Upload */}
                              <label className="group flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-[hsl(var(--border))] p-4 transition hover:border-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/0.03)]">
                                <Upload className="h-6 w-6 text-[hsl(var(--muted-foreground))] group-hover:text-[hsl(var(--primary))]" />
                                <span className="text-xs font-medium text-center">Dosya Yükle</span>
                                <span className="text-[10px] text-[hsl(var(--muted-foreground))]">CSV, JSON, TXT</span>
                                <input
                                  type="file"
                                  accept=".csv,.tsv,.json,.txt"
                                  onChange={handleFileUpload}
                                  className="hidden"
                                  disabled={importLoading}
                                />
                              </label>

                              {/* Sample FAQ */}
                              <button
                                onClick={handleSSSSampleImport}
                                disabled={importLoading}
                                className="flex flex-col items-center gap-2 rounded-xl border-2 border-dashed border-[hsl(var(--border))] p-4 transition hover:border-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/0.03)] disabled:opacity-50"
                              >
                                <FileText className="h-6 w-6 text-[hsl(var(--muted-foreground))]" />
                                <span className="text-xs font-medium">Örnek SSS</span>
                                <span className="text-[10px] text-[hsl(var(--muted-foreground))]">6 hazır soru-cevap</span>
                              </button>

                              {/* Format Info */}
                              <div className="flex flex-col gap-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.3)] p-4">
                                <FileSpreadsheet className="h-5 w-5 text-[hsl(var(--muted-foreground))]" />
                                <p className="text-[10px] leading-relaxed text-[hsl(var(--muted-foreground))]">
                                  <strong>CSV:</strong> kategori, soru, cevap<br />
                                  <strong>JSON:</strong> [{`{question, content}`}]<br />
                                  <strong>TXT:</strong> boş satırla ayrılmış bloklar
                                </p>
                              </div>
                            </div>

                            {importLoading && (
                              <div className="flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))]">
                                <Loader2 className="h-4 w-4 animate-spin" /> İçe aktarılıyor...
                              </div>
                            )}

                            {importResult && (
                              <div className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm ${
                                importResult.error ? "bg-red-500/10 text-red-400" : "bg-green-500/10 text-green-400"
                              }`}>
                                {importResult.error ? (
                                  <><AlertCircle className="h-4 w-4 shrink-0" /> {importResult.error}</>
                                ) : (
                                  <><Check className="h-4 w-4 shrink-0" /> {importResult.count} bilgi başarıyla eklendi</>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {chatbot.knowledgeBase.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="relative flex-1 min-w-[180px]">
                            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
                            <input
                              value={kSearch}
                              onChange={(e) => setKSearch(e.target.value)}
                              placeholder="Bilgi ara..."
                              className="w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.5)] py-2 pl-9 pr-4 text-sm outline-none focus:border-[hsl(var(--primary))] transition"
                            />
                            {kSearch && (
                              <button onClick={() => setKSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                                <X className="h-3.5 w-3.5 text-[hsl(var(--muted-foreground))]" />
                              </button>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            <button
                              onClick={() => setKCatFilter("all")}
                              className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${kCatFilter === "all" ? "text-white" : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))]"}`}
                              style={kCatFilter === "all" ? { background: primaryColor } : {}}
                            >
                              Tümü ({chatbot.knowledgeBase.length})
                            </button>
                            {CATEGORIES.filter((c) => chatbot.knowledgeBase.some((k) => k.category === c)).map((c) => (
                              <button
                                key={c}
                                onClick={() => setKCatFilter(c)}
                                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${kCatFilter === c ? "text-white" : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))]"}`}
                                style={kCatFilter === c ? { background: primaryColor } : {}}
                              >{c}</button>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="space-y-2">
                        {filteredKnowledge.length === 0 && (
                          <div className="flex flex-col items-center gap-2 py-10 text-center">
                            <BookOpen className="h-8 w-8 text-[hsl(var(--muted-foreground)/0.3)]" />
                            <p className="text-sm text-[hsl(var(--muted-foreground))]">
                              {kSearch || kCatFilter !== "all" ? "Eşleşen kayıt yok" : "Henüz bilgi eklenmedi"}
                            </p>
                          </div>
                        )}
                        {filteredKnowledge.map((k) => (
                          <div key={k.id} className="glass group flex items-start gap-3 rounded-xl p-4">
                            <span className={`mt-0.5 shrink-0 rounded-lg px-2 py-0.5 text-xs font-medium ${CAT_COLORS[k.category] ?? CAT_COLORS["diğer"]}`}>
                              {k.category}
                            </span>
                            <div className="flex-1 min-w-0">
                              {k.question && (
                                <p className="mb-0.5 text-xs font-medium text-[hsl(var(--muted-foreground))]">S: {k.question}</p>
                              )}
                              <p className="text-sm leading-relaxed">{k.content}</p>
                            </div>
                            <button
                              onClick={() => deleteKnowledge(k.id)}
                              className="shrink-0 rounded-lg p-1.5 opacity-0 text-[hsl(var(--muted-foreground))] transition group-hover:opacity-100 hover:bg-red-500/10 hover:text-red-400"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* KONUŞMALAR */}
              {tab === "conversations" && (
                <div className="space-y-3">
                  {conversations.length > 0 && (
                    <div className="flex gap-6 rounded-xl border border-[hsl(var(--border))] px-5 py-3">
                      <div>
                        <span className="text-lg font-bold">{conversations.length}</span>
                        <span className="ml-1.5 text-xs text-[hsl(var(--muted-foreground))]">Konuşma</span>
                      </div>
                      <div className="w-px bg-[hsl(var(--border))]" />
                      <div>
                        <span className="text-lg font-bold">{totalMessages}</span>
                        <span className="ml-1.5 text-xs text-[hsl(var(--muted-foreground))]">Mesaj</span>
                      </div>
                      <div className="w-px bg-[hsl(var(--border))]" />
                      <div>
                        <span className="text-lg font-bold">{avgMessages}</span>
                        <span className="ml-1.5 text-xs text-[hsl(var(--muted-foreground))]">Ort. Mesaj/Konuşma</span>
                      </div>
                    </div>
                  )}

                  {convLoading ? (
                    <div className="flex h-32 items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-[hsl(var(--primary))]" />
                    </div>
                  ) : conversations.length === 0 ? (
                    <div className="flex flex-col items-center gap-3 py-16 text-center">
                      <MessageSquare className="h-10 w-10 text-[hsl(var(--muted-foreground)/0.3)]" />
                      <p className="text-sm font-semibold">Henüz konuşma yok</p>
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">Chatbot'u sitenize ekleyin, konuşmalar burada görünür</p>
                    </div>
                  ) : (
                    conversations.map((conv) => {
                      const firstMsg = conv.messages.find((m) => m.role === "user");
                      const date = new Date(conv.createdAt).toLocaleDateString("tr-TR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
                      return (
                        <div key={conv.id} className="glass overflow-hidden rounded-xl">
                          <button
                            onClick={() => setOpenConv(openConv === conv.id ? null : conv.id)}
                            className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-[hsl(var(--accent)/0.5)]"
                          >
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full" style={{ background: `${primaryColor}18` }}>
                              <MessageSquare className="h-4 w-4" style={{ color: primaryColor }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="truncate text-sm font-medium">{firstMsg?.content ?? "Konuşma"}</p>
                              <p className="text-xs text-[hsl(var(--muted-foreground))]">{date} · {conv.messages.length} mesaj</p>
                            </div>
                            {openConv === conv.id ? <ChevronUp className="h-4 w-4 shrink-0 text-[hsl(var(--muted-foreground))]" /> : <ChevronDown className="h-4 w-4 shrink-0 text-[hsl(var(--muted-foreground))]" />}
                          </button>
                          {openConv === conv.id && (
                            <div className="max-h-72 space-y-2 overflow-y-auto border-t border-[hsl(var(--border))] px-4 py-4">
                              {conv.messages.map((msg, i) => (
                                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                                  <div
                                    className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed ${
                                      msg.role === "user" ? "text-white rounded-br-sm" : "bg-[hsl(var(--muted))] rounded-bl-sm"
                                    }`}
                                    style={msg.role === "user" ? { background: primaryColor } : {}}
                                  >
                                    {msg.content}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* REZERVASYONLAR */}
              {tab === "reservations" && (
                <div className="space-y-3">
                  {resLoading ? (
                    <div className="flex h-32 items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-[hsl(var(--primary))]" />
                    </div>
                  ) : !chatbot?.reservationEnabled ? (
                    <div className="flex flex-col items-center gap-3 py-16 text-center">
                      <CalendarCheck className="h-10 w-10 text-[hsl(var(--muted-foreground)/0.3)]" />
                      <p className="text-sm font-semibold">Rezervasyon özelliği kapalı</p>
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">Ayarlar sekmesinden "Chatbot ile Rezervasyon" özelliğini aktif edin</p>
                    </div>
                  ) : reservations.length === 0 ? (
                    <div className="flex flex-col items-center gap-3 py-16 text-center">
                      <CalendarCheck className="h-10 w-10 text-[hsl(var(--muted-foreground)/0.3)]" />
                      <p className="text-sm font-semibold">Henüz rezervasyon yok</p>
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">Müşteriler chatbot üzerinden rezervasyon yaptığında burada görünür</p>
                    </div>
                  ) : (
                    <>
                      <div className="flex gap-6 rounded-xl border border-[hsl(var(--border))] px-5 py-3">
                        <div>
                          <span className="text-lg font-bold">{reservations.length}</span>
                          <span className="ml-1.5 text-xs text-[hsl(var(--muted-foreground))]">Toplam</span>
                        </div>
                        <div className="w-px bg-[hsl(var(--border))]" />
                        <div>
                          <span className="text-lg font-bold text-amber-500">{reservations.filter((r) => r.status === "PENDING").length}</span>
                          <span className="ml-1.5 text-xs text-[hsl(var(--muted-foreground))]">Bekleyen</span>
                        </div>
                        <div className="w-px bg-[hsl(var(--border))]" />
                        <div>
                          <span className="text-lg font-bold text-emerald-500">{reservations.filter((r) => r.status === "CONFIRMED").length}</span>
                          <span className="ml-1.5 text-xs text-[hsl(var(--muted-foreground))]">Onaylı</span>
                        </div>
                      </div>

                      {reservations.map((res) => {
                        const dateStr = new Date(res.date).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });
                        const statusCls = res.status === "CONFIRMED" ? "bg-emerald-500/10 text-emerald-500" : res.status === "CANCELLED" ? "bg-red-500/10 text-red-500" : "bg-amber-500/10 text-amber-500";
                        const statusLabel = res.status === "CONFIRMED" ? "Onaylandı" : res.status === "CANCELLED" ? "İptal" : "Bekliyor";
                        return (
                          <div key={res.id} className="glass rounded-xl p-4">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-sm font-semibold">{res.name}</span>
                                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${statusCls}`}>{statusLabel}</span>
                                  {res.source === "chatbot" && <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold text-blue-500">Chatbot</span>}
                                </div>
                                <div className="mt-1.5 flex flex-wrap gap-3 text-xs text-[hsl(var(--muted-foreground))]">
                                  <span>📅 {dateStr}</span>
                                  <span>🕐 {res.time}</span>
                                  <span>👥 {res.partySize} kişi</span>
                                  {res.phone && <span>📞 {res.phone}</span>}
                                  {res.email && <span>✉️ {res.email}</span>}
                                </div>
                                {res.notes && <p className="mt-1.5 text-xs text-[hsl(var(--muted-foreground))] italic">"{res.notes}"</p>}
                              </div>
                              {res.status === "PENDING" && (
                                <div className="flex shrink-0 gap-1.5">
                                  <button
                                    onClick={async () => {
                                      await fetch("/api/reservations", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: res.id, status: "CONFIRMED" }) });
                                      setReservations((prev) => prev.map((r) => r.id === res.id ? { ...r, status: "CONFIRMED" } : r));
                                    }}
                                    className="rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-500 transition hover:bg-emerald-500/20"
                                  >
                                    Onayla
                                  </button>
                                  <button
                                    onClick={async () => {
                                      await fetch("/api/reservations", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: res.id, status: "CANCELLED" }) });
                                      setReservations((prev) => prev.map((r) => r.id === res.id ? { ...r, status: "CANCELLED" } : r));
                                    }}
                                    className="rounded-lg bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-500 transition hover:bg-red-500/20"
                                  >
                                    İptal
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </>
                  )}
                </div>
              )}

              {/* ENTEGRASYON */}
              {tab === "embed" && (
                <div className="space-y-4">
                  {!chatbot ? (
                    <div className="rounded-xl border border-dashed border-[hsl(var(--border))] p-6 text-center text-sm text-[hsl(var(--muted-foreground))]">
                      Önce Ayarlar sekmesinden chatbot oluşturun.
                    </div>
                  ) : (
                    <>
                      {/* Direkt link */}
                      <div className="glass rounded-2xl p-5 space-y-3">
                        <p className="text-sm font-semibold">Direkt Bağlantı</p>
                        <p className="text-xs text-[hsl(var(--muted-foreground))]">
                          WhatsApp, sosyal medya veya QR kod olarak paylaşın.
                        </p>
                        <div className="flex items-center gap-2 rounded-xl bg-[hsl(var(--muted)/0.5)] px-4 py-3">
                          <code className="flex-1 truncate text-xs">{origin}/chat/{brandSlug}</code>
                          <button
                            onClick={() => copyText(`${origin}/chat/${brandId}`, "link")}
                            className="shrink-0 flex items-center gap-1 rounded-lg border border-[hsl(var(--border))] px-2.5 py-1.5 text-xs transition hover:bg-[hsl(var(--accent))]"
                          >
                            {copied === "link" ? <><Check className="h-3 w-3 text-green-400" /> Kopyalandı</> : <><Copy className="h-3 w-3" /> Kopyala</>}
                          </button>
                        </div>
                      </div>

                      {/* iFrame */}
                      <div className="glass rounded-2xl p-5 space-y-3">
                        <p className="text-sm font-semibold">iFrame ile Göm</p>
                        <p className="text-xs text-[hsl(var(--muted-foreground))]">Web sitenizin HTML'ine yapıştırın.</p>
                        <div className="relative rounded-xl bg-[hsl(var(--muted)/0.5)] p-4">
                          <pre className="overflow-x-auto text-xs leading-relaxed">{embedIframe}</pre>
                          <button
                            onClick={() => copyText(embedIframe, "iframe")}
                            className="absolute right-3 top-3 flex items-center gap-1.5 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-2.5 py-1.5 text-xs font-medium transition hover:bg-[hsl(var(--accent))]"
                          >
                            {copied === "iframe" ? <><Check className="h-3 w-3 text-green-400" /> Kopyalandı</> : <><Copy className="h-3 w-3" /> Kopyala</>}
                          </button>
                        </div>
                      </div>

                      {/* Floating script */}
                      <div className="glass rounded-2xl p-5 space-y-3">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold">Yüzen Buton</p>
                          <span className="rounded-full bg-[hsl(var(--primary)/0.15)] px-2 py-0.5 text-[10px] font-semibold text-[hsl(var(--primary))]">Tavsiye</span>
                        </div>
                        <p className="text-xs text-[hsl(var(--muted-foreground))]">
                          Sağ alt köşede sohbet balonu. &lt;/body&gt; etiketinden önce yapıştırın.
                        </p>
                        <div className="relative rounded-xl bg-[hsl(var(--muted)/0.5)] p-4">
                          <pre className="overflow-x-auto whitespace-pre-wrap text-xs leading-relaxed">{embedScript}</pre>
                          <button
                            onClick={() => copyText(embedScript, "script")}
                            className="absolute right-3 top-3 flex items-center gap-1.5 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-2.5 py-1.5 text-xs font-medium transition hover:bg-[hsl(var(--accent))]"
                          >
                            {copied === "script" ? <><Check className="h-3 w-3 text-green-400" /> Kopyalandı</> : <><Copy className="h-3 w-3" /> Kopyala</>}
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Sağ Panel — Live Preview */}
      <div className="hidden xl:flex xl:w-[400px] xl:flex-col xl:border-l xl:border-[hsl(var(--border))]">
        <div className="flex items-center justify-between border-b border-[hsl(var(--border))] px-5 py-3">
          <p className="text-sm font-semibold">Canlı Önizleme</p>
          <button
            onClick={() => setPreviewKey((k) => k + 1)}
            className="flex items-center gap-1.5 rounded-lg border border-[hsl(var(--border))] px-2.5 py-1.5 text-xs text-[hsl(var(--muted-foreground))] transition hover:bg-[hsl(var(--accent))]"
          >
            <Sparkles className="h-3 w-3" /> Sıfırla
          </button>
        </div>
        <div className="flex flex-1 flex-col overflow-hidden">
          {chatbot && chatbot.isActive ? (
            <ChatWidget
              key={previewKey}
              brandId={brandId}
              botName={chatbot.name}
              primaryColor={primaryColor}
              embedded
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl" style={{ background: `${primaryColor}15` }}>
                <Bot className="h-8 w-8" style={{ color: primaryColor }} />
              </div>
              <p className="text-sm font-semibold">{chatbot ? "Chatbot pasif" : "Chatbot kurulmadı"}</p>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                {chatbot ? "Ayarlar sekmesinden aktif hale getirin" : "Ayarlar sekmesinden chatbot oluşturun"}
              </p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
