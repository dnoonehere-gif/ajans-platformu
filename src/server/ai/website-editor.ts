import { generateText } from "./anthropic";
import type { Block } from "./website-generator";

export async function editWebsiteWithAI(
  blocks: Block[],
  instruction: string,
  brandName: string
): Promise<Block[]> {
  const prompt = `Sen bir web sitesi düzenleme asistanısın. Kullanıcının doğal dil komutuna göre JSON bloklarını düzenliyorsun.

Marka: ${brandName}
Kullanıcı Komutu: "${instruction}"

Mevcut Bloklar (JSON):
${JSON.stringify(blocks, null, 2)}

GÖREV:
Kullanıcının komutunu uygula ve YALNIZCA güncellenmiş JSON array'ini döndür.
- Tüm metinleri Türkçe yaz
- Renk komutları için hex renk kodlarını kullan (örn: "kırmızı" → "#ef4444", "mavi" → "#3b82f6", "yeşil" → "#22c55e", "mor" → "#8b5cf6", "turuncu" → "#f97316", "sarı" → "#eab308", "pembe" → "#ec4899")
- "bgColor" hero bloğunun arka plan rengini değiştirir
- Buton rengi hero'da "bgColor", CTA blokta butonun arka plan rengini temsil eder — CTA bloku için "buttonColor" alanı ekle
- İçerik değişikliklerinde mevcut yapıyı koru
- Sadece JSON döndür, başka hiçbir şey yazma

Güncellenmiş JSON:`;

  const raw = await generateText({ prompt, maxTokens: 4096 });
  const match = raw.match(/\[[\s\S]*\]/);
  if (!match) throw new Error("AI geçerli JSON üretmedi");
  return JSON.parse(match[0]) as Block[];
}
