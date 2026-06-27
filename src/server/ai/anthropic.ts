// =============================================================
//  YAPAY ZEKÂ İSTEMCİSİ (Anthropic)
//  Tüm AI modüllerinin (içerik, chatbot, yorum analizi) ortak girişi.
// =============================================================
import Anthropic from "@anthropic-ai/sdk";

export const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

/** Basit metin üretimi yardımcı fonksiyonu */
export async function generateText(opts: {
  system?: string;
  prompt: string;
  maxTokens?: number;
  model?: string;
}): Promise<string> {
  const res = await anthropic.messages.create({
    model: opts.model ?? "claude-sonnet-4-6",
    max_tokens: opts.maxTokens ?? 1024,
    system: opts.system,
    messages: [{ role: "user", content: opts.prompt }],
  });
  return res.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n");
}
