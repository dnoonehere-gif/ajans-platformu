import { anthropic } from "./anthropic";
import type { ChatbotKnowledge } from "@prisma/client";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

function buildSystemPrompt(
  botName: string,
  brandName: string,
  customPrompt: string | null,
  knowledge: ChatbotKnowledge[]
): string {
  const knowledgeText = knowledge.length
    ? knowledge
        .map((k) => `[${k.category.toUpperCase()}]${k.question ? ` S: ${k.question}` : ""}\n${k.content}`)
        .join("\n\n")
    : "";

  return `Sen ${brandName} markasının yapay zekâ destekli müşteri asistanısın. Adın: ${botName}.

Görevin: Müşterilerin sorularını Türkçe, samimi ve profesyonel bir şekilde yanıtlamak.

Temel kurallar:
- Her zaman Türkçe yanıt ver.
- Kısa, net ve yardımsever ol.
- Bilmediğin bir konuda "Bu konuda size en iyi şekilde yardımcı olmak için sizi yetkili personelinizle bağlantı kurmanızı öneririm." de.
- Asla başka bir marka veya rakip hakkında yorum yapma.
${customPrompt ? `\nÖzel Talimatlar:\n${customPrompt}` : ""}
${knowledgeText ? `\nMarka Bilgi Tabanı:\n${knowledgeText}` : ""}`;
}

export async function streamChatResponse(opts: {
  botName: string;
  brandName: string;
  systemPrompt: string | null;
  knowledge: ChatbotKnowledge[];
  history: ChatMessage[];
  userMessage: string;
}): Promise<ReadableStream<Uint8Array>> {
  const system = buildSystemPrompt(
    opts.botName,
    opts.brandName,
    opts.systemPrompt,
    opts.knowledge
  );

  const messages = [
    ...opts.history.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
    { role: "user" as const, content: opts.userMessage },
  ];

  const stream = anthropic.messages.stream({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 512,
    system,
    messages,
  });

  const encoder = new TextEncoder();

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      for await (const event of stream) {
        if (
          event.type === "content_block_delta" &&
          event.delta.type === "text_delta"
        ) {
          controller.enqueue(encoder.encode(event.delta.text));
        }
      }
      controller.close();
    },
  });
}
