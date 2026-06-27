"use client";
import { useState, useEffect } from "react";
import { Bot, Plus, Trash2, Save, MessageSquare, Loader2, ChevronDown, ChevronUp } from "lucide-react";

const CATEGORIES = ["ürün", "hizmet", "menü", "sss", "saat", "adres", "kampanya", "diğer"];

interface KnowledgeEntry {
  id: string;
  category: string;
  question?: string | null;
  content: string;
}

interface Chatbot {
  id: string;
  brandId: string;
  name: string;
  systemPrompt?: string | null;
  isActive: boolean;
  knowledgeBase: KnowledgeEntry[];
}

interface Conversation {
  id: string;
  createdAt: string;
  messages: { role: string; content: string; createdAt: string }[];
}

export default function ChatbotPage() {
  const [brandId, setBrandId] = useState("");
  const [chatbot, setChatbot] = useState<Chatbot | null>(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<"settings" | "knowledge" | "conversations">("settings");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [openConv, setOpenConv] = useState<string | null>(null);

  // Ayar formu
  const [name, setName] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [isActive, setIsActive] = useState(true);

  // Bilgi girişi
  const [kCategory, setKCategory] = useState("sss");
  const [kQuestion, setKQuestion] = useState("");
  const [kContent, setKContent] = useState("");
  const [kLoading, setKLoading] = useState(false);

  async function loadChatbot() {
    if (!brandId.trim()) return;
    setLoading(true);
    const res = await fetch(`/api/chatbot/${brandId}`);
    const data = await res.json();
    if (data.chatbot) {
      setChatbot(data.chatbot);
      setName(data.chatbot.name);
      setSystemPrompt(data.chatbot.systemPrompt ?? "");
      setIsActive(data.chatbot.isActive);
    }
    setLoading(false);
  }

  async function saveSettings(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/chatbot/setup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ brandId, name, systemPrompt, isActive }),
    });
    const data = await res.json();
    if (data.chatbot) setChatbot((c) => c ? { ...c, ...data.chatbot } : data.chatbot);
    setLoading(false);
  }

  async function addKnowledge(e: React.FormEvent) {
    e.preventDefault();
    if (!chatbot) return;
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

  async function loadConversations() {
    const res = await fetch(`/api/chatbot/${brandId}/conversations`);
    const data = await res.json();
    if (data.conversations) setConversations(data.conversations);
  }

  useEffect(() => {
    if (tab === "conversations" && chatbot) loadConversations();
  }, [tab, chatbot]);

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <div className="mb-8 flex items-center gap-3">
        <Bot className="h-8 w-8 text-[hsl(var(--primary))]" />
        <div>
          <h1 className="text-2xl font-bold">AI Chatbot</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">Markana özel chatbot kur, bilgi tabanı ekle, konuşmaları izle.</p>
        </div>
      </div>

      {/* Marka ID girişi */}
      {!chatbot && (
        <div className="glass mb-6 flex gap-2 rounded-2xl p-5">
          <input
            type="text"
            placeholder="Marka ID gir..."
            value={brandId}
            onChange={(e) => setBrandId(e.target.value)}
            className="flex-1 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.5)] px-4 py-2.5 text-sm outline-none focus:border-[hsl(var(--primary))] transition"
          />
          <button
            onClick={loadChatbot}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Yükle"}
          </button>
        </div>
      )}

      {chatbot && (
        <>
          {/* Tab bar */}
          <div className="mb-6 flex gap-1 rounded-xl bg-[hsl(var(--muted)/0.5)] p-1">
            {(["settings", "knowledge", "conversations"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${tab === t ? "bg-[hsl(var(--background))] shadow-sm" : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"}`}
              >
                {t === "settings" ? "Ayarlar" : t === "knowledge" ? "Bilgi Tabanı" : "Konuşmalar"}
              </button>
            ))}
          </div>

          {/* AYARLAR */}
          {tab === "settings" && (
            <form onSubmit={saveSettings} className="glass rounded-2xl p-6 space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium">Bot Adı</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.5)] px-4 py-2.5 text-sm outline-none focus:border-[hsl(var(--primary))] transition"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Özel Sistem Talimatı</label>
                <textarea
                  rows={5}
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  placeholder="Botun nasıl davranmasını istiyorsun? Tonlama, kısıtlamalar, özel talimatlar..."
                  className="w-full resize-none rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.5)] px-4 py-2.5 text-sm outline-none focus:border-[hsl(var(--primary))] transition"
                />
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsActive(!isActive)}
                  className={`relative h-6 w-11 rounded-full transition ${isActive ? "bg-[hsl(var(--primary))]" : "bg-[hsl(var(--muted))]"}`}
                >
                  <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${isActive ? "left-5" : "left-0.5"}`} />
                </button>
                <span className="text-sm">{isActive ? "Aktif" : "Pasif"}</span>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Kaydet
              </button>
            </form>
          )}

          {/* BİLGİ TABANI */}
          {tab === "knowledge" && (
            <div className="space-y-4">
              <form onSubmit={addKnowledge} className="glass rounded-2xl p-6 space-y-3">
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
                      type="text"
                      value={kQuestion}
                      onChange={(e) => setKQuestion(e.target.value)}
                      placeholder="Fiyatlarınız nedir?"
                      className="w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.5)] px-3 py-2 text-sm outline-none focus:border-[hsl(var(--primary))] transition"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-[hsl(var(--muted-foreground))]">İçerik</label>
                  <textarea
                    rows={3}
                    required
                    value={kContent}
                    onChange={(e) => setKContent(e.target.value)}
                    placeholder="Bu sorunun cevabı veya bilgi içeriği..."
                    className="w-full resize-none rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.5)] px-3 py-2 text-sm outline-none focus:border-[hsl(var(--primary))] transition"
                  />
                </div>
                <button
                  type="submit"
                  disabled={kLoading}
                  className="flex items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
                >
                  {kLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  Ekle
                </button>
              </form>

              <div className="space-y-2">
                {chatbot.knowledgeBase.length === 0 && (
                  <p className="py-8 text-center text-sm text-[hsl(var(--muted-foreground))]">Henüz bilgi eklenmedi.</p>
                )}
                {chatbot.knowledgeBase.map((k) => (
                  <div key={k.id} className="glass flex items-start gap-3 rounded-xl p-4">
                    <span className="rounded-lg bg-[hsl(var(--primary)/0.15)] px-2 py-0.5 text-xs font-medium text-[hsl(var(--primary))]">{k.category}</span>
                    <div className="flex-1 min-w-0">
                      {k.question && <p className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-0.5">{k.question}</p>}
                      <p className="text-sm truncate">{k.content}</p>
                    </div>
                    <button
                      onClick={() => deleteKnowledge(k.id)}
                      className="shrink-0 rounded-lg p-1.5 text-[hsl(var(--muted-foreground))] hover:bg-red-500/10 hover:text-red-400 transition"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* KONUŞMALAR */}
          {tab === "conversations" && (
            <div className="space-y-2">
              {conversations.length === 0 && (
                <p className="py-8 text-center text-sm text-[hsl(var(--muted-foreground))]">Henüz konuşma yok.</p>
              )}
              {conversations.map((conv) => (
                <div key={conv.id} className="glass rounded-xl overflow-hidden">
                  <button
                    onClick={() => setOpenConv(openConv === conv.id ? null : conv.id)}
                    className="flex w-full items-center justify-between px-4 py-3 text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-[hsl(var(--primary))]" />
                      <span className="font-medium">{conv.messages.length} mesaj</span>
                      <span className="text-[hsl(var(--muted-foreground))]">— {new Date(conv.createdAt).toLocaleDateString("tr-TR")}</span>
                    </div>
                    {openConv === conv.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                  {openConv === conv.id && (
                    <div className="border-t border-[hsl(var(--border))] px-4 py-3 space-y-2 max-h-64 overflow-y-auto">
                      {conv.messages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                          <div className={`max-w-[80%] rounded-xl px-3 py-2 text-xs ${msg.role === "user" ? "bg-[hsl(var(--primary))] text-white" : "bg-[hsl(var(--muted))]"}`}>
                            {msg.content}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
