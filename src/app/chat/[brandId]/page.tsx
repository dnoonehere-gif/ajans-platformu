"use client";
import { useState, useEffect, use } from "react";
import { Loader2 } from "lucide-react";
import { ChatWidget } from "@/components/chatbot/chat-widget";

interface PublicInfo {
  botName: string;
  brandName: string;
  primaryColor: string;
  logoUrl: string | null;
}

export default function PublicChatPage({ params }: { params: Promise<{ brandId: string }> }) {
  const { brandId } = use(params);
  const [info, setInfo] = useState<PublicInfo | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/chatbot/${brandId}/public`)
      .then((r) => r.json())
      .then((d) => { if (d.error) setNotFound(true); else setInfo(d); });
  }, [brandId]);

  if (notFound) return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-sm text-[hsl(var(--muted-foreground))]">Chatbot bulunamadı.</p>
    </div>
  );

  if (!info) return (
    <div className="flex min-h-screen items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin" style={{ color: "#6366f1" }} />
    </div>
  );

  return (
    <div
      className="flex min-h-screen items-center justify-center p-4"
      style={{ background: `linear-gradient(135deg, ${info.primaryColor}12 0%, transparent 60%)` }}
    >
      <ChatWidget
        brandId={brandId}
        botName={info.botName}
        primaryColor={info.primaryColor}
        embedded={false}
      />
    </div>
  );
}
