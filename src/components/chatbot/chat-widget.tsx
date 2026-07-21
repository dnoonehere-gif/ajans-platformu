"use client";
import { useState, useRef, useEffect } from "react";
import { Send, Bot, Loader2, X } from "lucide-react";
import { useLang } from "@/components/language-provider";

const L = {
  tr: {
    greeting: (bot: string) => `Merhaba! Ben ${bot}. Size nasıl yardımcı olabilirim?`,
    online: "Çevrimiçi",
    placeholder: "Mesajınızı yazın...",
    genericError: "Bir hata oluştu. Lütfen tekrar deneyin.",
    connError: "Bağlantı hatası.",
    close: "Kapat",
  },
  en: {
    greeting: (bot: string) => `Hi! I'm ${bot}. How can I help you?`,
    online: "Online",
    placeholder: "Type your message...",
    genericError: "Something went wrong. Please try again.",
    connError: "Connection error.",
    close: "Close",
  },
};

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatWidgetProps {
  brandId: string;
  botName?: string;
  primaryColor?: string;
  onClose?: () => void;
  embedded?: boolean;
}

export function ChatWidget({ brandId, botName = "Asistan", primaryColor = "#6366f1", onClose, embedded = false }: ChatWidgetProps) {
  const { lang } = useLang();
  const sL = L[lang];
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: L[lang].greeting(botName) },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [visitorId] = useState(() => `v_${Math.random().toString(36).slice(2)}`);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    setInput("");
    setMessages((m) => [...m, { role: "user", content: text }]);
    setLoading(true);

    try {
      const res = await fetch(`/api/chatbot/${brandId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, conversationId, visitorId }),
      });

      if (!res.ok || !res.body) {
        setMessages((m) => [...m, { role: "assistant", content: sL.genericError }]);
        setLoading(false);
        return;
      }

      const newConvId = res.headers.get("X-Conversation-Id");
      if (newConvId) setConversationId(newConvId);

      // Streaming okuma
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let assistantText = "";

      setMessages((m) => [...m, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        assistantText += decoder.decode(value, { stream: true });
        setMessages((m) => {
          const updated = [...m];
          updated[updated.length - 1] = { role: "assistant", content: assistantText };
          return updated;
        });
      }
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: sL.connError }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className={`flex flex-col bg-[hsl(var(--background))] ${embedded ? "h-full" : "h-[560px] w-[380px] rounded-2xl shadow-2xl border border-[hsl(var(--border))]"}`}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between rounded-t-2xl px-4 py-3"
        style={{ background: primaryColor }}
      >
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
            <Bot className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{botName}</p>
            <p className="text-xs text-white/70">{sL.online}</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="rounded-lg p-1 text-white/70 hover:bg-white/10 transition">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Mesajlar */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "assistant" && (
              <div className="mr-2 mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full" style={{ background: primaryColor }}>
                <Bot className="h-3 w-3 text-white" />
              </div>
            )}
            <div
              className={`max-w-[75%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === "user"
                  ? "rounded-br-sm text-white"
                  : "rounded-bl-sm bg-[hsl(var(--muted))] text-[hsl(var(--foreground))]"
              }`}
              style={msg.role === "user" ? { background: primaryColor } : {}}
            >
              {msg.content || (loading && i === messages.length - 1 ? <span className="animate-pulse">...</span> : "")}
            </div>
          </div>
        ))}
        {loading && messages[messages.length - 1]?.role !== "assistant" && (
          <div className="flex justify-start">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full mr-2" style={{ background: primaryColor }}>
              <Bot className="h-3 w-3 text-white" />
            </div>
            <div className="rounded-2xl rounded-bl-sm bg-[hsl(var(--muted))] px-4 py-3">
              <Loader2 className="h-4 w-4 animate-spin text-[hsl(var(--muted-foreground))]" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="border-t border-[hsl(var(--border))] px-3 py-3 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={sL.placeholder}
          disabled={loading}
          className="flex-1 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.5)] px-3.5 py-2 text-sm outline-none focus:border-[hsl(var(--primary))] transition disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white transition disabled:opacity-40"
          style={{ background: primaryColor }}
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
