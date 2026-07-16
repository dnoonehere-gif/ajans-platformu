import { anthropic } from "./anthropic";
import { queryKnowledge } from "@/lib/pinecone";
import type { ChatbotKnowledge } from "@prisma/client";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

function buildSystemPrompt(
  botName: string,
  brandName: string,
  customPrompt: string | null,
  relevantKnowledge: string,
  reservationEnabled: boolean
): string {
  const reservationInstructions = reservationEnabled ? `

REZERVASYON ÖZELLİĞİ:
Müşteri rezervasyon, randevu veya masa ayırtmak istediğinde aşağıdaki bilgileri sırayla topla:
1. Ad Soyad (zorunlu)
2. Tarih (zorunlu — örn: "yarın", "cuma", "15 Temmuz")
3. Saat (zorunlu — örn: "19:00", "akşam 7")
4. Kişi sayısı (varsayılan 1)
5. Telefon numarası (onay SMS'i gönderebilmek için iste)
6. E-posta adresi (onay e-postası için sor, vermek istemezse ısrar etme)
7. Özel not (opsiyonel)

TELEFON KURALLARI:
- Her formatı kabul et: "+90 531 732 17 44", "0531 732 17 44", "5317321744" hepsi geçerlidir.
- Numarayı JSON'a yazarken 05xxxxxxxxx formatına çevir (+90'ı 0 yap, boşlukları kaldır).
- Müşteri bir bilgiyi verdiyse ASLA tekrar sorma. "Kaydedildi" dediysen o bilgi tamamdır, sonraki adıma geç.
- Format beğenmediğin için verilmiş bilgiyi reddetme.
- "yok", "hayır", "istemiyorum", "geç" gibi cevaplar opsiyonel bir soruyu ATLAMAK demektir — o soruyu bir daha SORMA, o alanı boş bırak ve devam et. Aynı soruyu iki kez sormak yasak.
- Son adımda (not sorusu) "yok" denirse rezervasyon tamamlanmıştır: onay mesajını ver ve JSON bloğunu ekle.

Tüm bilgileri topladıktan sonra, yanıtının SONUNA şu JSON bloğunu ekle (kullanıcıya gösterme, sadece sisteme):
:::RESERVATION:::
{"name":"Ad Soyad","date":"YYYY-MM-DD","time":"HH:MM","partySize":N,"phone":"05xx","email":"varsa@email.com","notes":"varsa not"}
:::END_RESERVATION:::

Tarihleri bugünün tarihine göre hesapla. "Yarın" denmişse yarının tarihini yaz. Geçmiş tarih kabul etme.
Zorunlu bilgiler (ad, tarih, saat) eksikse sormaya devam et; opsiyonel bilgiler (telefon, e-posta, not) atlanabilir, onlar için JSON'u bekletme.
Rezervasyonu onayladıktan sonra "Rezervasyonunuz alındı, en kısa sürede onaylanacaktır" de.` : "";

  return `Sen ${brandName} markasının yapay zekâ destekli müşteri asistanısın. Adın: ${botName}.

Görevin: Müşterilerin sorularını Türkçe, samimi ve profesyonel bir şekilde yanıtlamak.

Temel kurallar:
- DİL: Müşteri hangi dilde yazıyorsa O DİLDE yanıt ver (Türkçe yazana Türkçe, İngilizce yazana İngilizce vb.). Varsayılan dil Türkçe'dir; selamlama ve ilk mesajlar Türkçe başlar, müşteri başka dile geçerse sen de geç.
- Kısa, net ve yardımsever ol.
- DÜZ METİN yaz — markdown KULLANMA. **kalın**, *italik*, başlık (#), liste işareti (-) gibi biçimlendirmeler kullanıcıya olduğu gibi görünür. Vurgu gerekiyorsa büyük harf veya emoji kullan.
- Bilmediğin bir konuda, müşterinin dilinde "Bu konuda size en iyi şekilde yardımcı olabilmesi için yetkili personelimizle iletişime geçmenizi öneririm." anlamında bir yanıt ver.
- Asla başka bir marka veya rakip hakkında yorum yapma.
${customPrompt ? `\nÖzel Talimatlar:\n${customPrompt}` : ""}
${relevantKnowledge ? `\nİlgili Bilgi Tabanı:\n${relevantKnowledge}` : ""}${reservationInstructions}`;
}

export async function streamChatResponse(opts: {
  botName: string;
  brandName: string;
  brandId: string;
  systemPrompt: string | null;
  fallbackKnowledge: ChatbotKnowledge[];
  history: ChatMessage[];
  userMessage: string;
  reservationEnabled?: boolean;
}): Promise<ReadableStream<Uint8Array>> {
  // Pinecone'dan semantik arama — yoksa DB'deki knowledge'ı kullan
  let relevantKnowledge = "";

  try {
    const hits = await queryKnowledge(opts.brandId, opts.userMessage, 5);
    if (hits.length > 0) {
      relevantKnowledge = hits.map((h) => h.text).join("\n\n");
    }
  } catch {
    // Pinecone erişilemez → fallback
  }

  // Pinecone boşsa veya erişilemezse DB knowledge'ını kullan
  if (!relevantKnowledge && opts.fallbackKnowledge.length > 0) {
    relevantKnowledge = opts.fallbackKnowledge
      .map((k) => `[${k.category.toUpperCase()}]${k.question ? ` S: ${k.question}` : ""}\n${k.content}`)
      .join("\n\n");
  }

  const system = buildSystemPrompt(
    opts.botName,
    opts.brandName,
    opts.systemPrompt,
    relevantKnowledge,
    opts.reservationEnabled ?? false
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
