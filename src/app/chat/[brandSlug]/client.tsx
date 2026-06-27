"use client";
import { ChatWidget } from "@/components/chatbot/chat-widget";

export function ChatWidgetClient({ brandId, botName, primaryColor }: {
  brandId: string;
  botName: string;
  primaryColor: string;
}) {
  return <ChatWidget brandId={brandId} botName={botName} primaryColor={primaryColor} embedded />;
}
