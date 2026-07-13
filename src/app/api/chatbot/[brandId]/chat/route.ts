import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { streamChatResponse } from "@/server/ai/chatbot-engine";
import { z } from "zod";
import { notifyBrandOwner } from "@/server/notifications/send";

const schema = z.object({
  message: z.string().min(1).max(1000),
  conversationId: z.string().nullish(),
  visitorId: z.string().nullish(),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ brandId: string }> }) {
  const { brandId } = await params;

  const chatbot = await prisma.chatbot.findFirst({
    where: { brandId, isActive: true },
    include: { knowledgeBase: true, brand: true },
  });
  if (!chatbot) return NextResponse.json({ error: "Chatbot bulunamadı" }, { status: 404 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Geçersiz veri" }, { status: 400 });

  const { message, visitorId } = parsed.data;
  let { conversationId } = parsed.data;

  // Konuşma oturumu bul veya oluştur
  let conversation = conversationId
    ? await prisma.chatbotConversation.findFirst({ where: { id: conversationId, chatbotId: chatbot.id } })
    : null;

  if (!conversation) {
    conversation = await prisma.chatbotConversation.create({
      data: { chatbotId: chatbot.id, visitorId },
    });
    conversationId = conversation.id;
  }

  // Önceki mesajları al (son 20 — desc çekip ters çevir, yoksa İLK mesajlar gelir)
  const historyDesc = await prisma.chatbotMessage.findMany({
    where: { conversationId: conversation.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  const history = historyDesc.reverse();

  // Kullanıcı mesajını kaydet
  await prisma.chatbotMessage.create({
    data: { conversationId: conversation.id, role: "user", content: message },
  });

  // Streaming yanıt oluştur
  const stream = await streamChatResponse({
    botName: chatbot.name,
    brandName: chatbot.brand.name,
    brandId,
    systemPrompt: chatbot.systemPrompt,
    fallbackKnowledge: chatbot.knowledgeBase,
    history: history.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
    userMessage: message,
    reservationEnabled: chatbot.reservationEnabled,
  });

  // Yanıtı DB'ye kaydetmek ve rezervasyon algılamak için arka planda oku
  const [streamForClient, streamForDB] = stream.tee();

  (async () => {
    const reader = streamForDB.getReader();
    let fullText = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      fullText += new TextDecoder().decode(value);
    }

    const cleanText = fullText.replace(/:::RESERVATION:::[\s\S]*?:::END_RESERVATION:::/g, "").trim();
    await prisma.chatbotMessage.create({
      data: { conversationId: conversation!.id, role: "assistant", content: cleanText },
    });

    if (chatbot.reservationEnabled) {
      const resMatch = fullText.match(/:::RESERVATION:::\s*(\{[\s\S]*?\})\s*:::END_RESERVATION:::/);
      if (resMatch) {
        try {
          const resData = JSON.parse(resMatch[1]);
          if (resData.name && resData.date && resData.time) {
            const newRes = await prisma.reservation.create({
              data: {
                brandId,
                name: resData.name,
                phone: resData.phone || null,
                email: resData.email || null,
                date: new Date(resData.date),
                time: resData.time,
                partySize: resData.partySize || 1,
                notes: resData.notes || null,
                source: "chatbot",
                conversationId: conversation!.id,
              },
            });
            notifyBrandOwner(brandId, {
              type: "reservation_new",
              title: `Chatbot rezervasyonu: ${resData.name}`,
              body: `${resData.date} ${resData.time} — ${resData.partySize || 1} kişi`,
              data: { reservationId: newRes.id, source: "chatbot" },
            }).catch(() => {});

            // CRM'e lead olarak ekle (telefon veya e-posta varsa, tekrar yoksa)
            if (resData.phone || resData.email) {
              const existingLead = await prisma.crmLead.findFirst({
                where: {
                  brandId,
                  OR: [
                    ...(resData.phone ? [{ phone: resData.phone }] : []),
                    ...(resData.email ? [{ email: resData.email }] : []),
                  ],
                },
              });
              if (!existingLead) {
                await prisma.crmLead.create({
                  data: {
                    brandId,
                    name: resData.name,
                    phone: resData.phone || null,
                    email: resData.email || null,
                    source: "chatbot-rezervasyon",
                    stage: "NEW",
                    notes: `Chatbot rezervasyonundan otomatik eklendi (${resData.date} ${resData.time}, ${resData.partySize || 1} kişi)`,
                  },
                }).catch(() => null);
              }
            }
          }
        } catch { /* invalid JSON — skip */ }
      }
    }
  })();

  const filteredStream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = streamForClient.getReader();
      const encoder = new TextEncoder();
      const decoder = new TextDecoder();
      let buffer = "";
      let inBlock = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          if (buffer && !inBlock) controller.enqueue(encoder.encode(buffer));
          controller.close();
          break;
        }
        buffer += decoder.decode(value, { stream: true });

        while (buffer.length > 0) {
          if (inBlock) {
            const endIdx = buffer.indexOf(":::END_RESERVATION:::");
            if (endIdx === -1) break;
            buffer = buffer.slice(endIdx + ":::END_RESERVATION:::".length);
            inBlock = false;
          } else {
            const startIdx = buffer.indexOf(":::RESERVATION:::");
            if (startIdx === -1) {
              const safe = buffer.slice(0, Math.max(0, buffer.length - 20));
              if (safe) {
                controller.enqueue(encoder.encode(safe));
                buffer = buffer.slice(safe.length);
              }
              break;
            }
            if (startIdx > 0) controller.enqueue(encoder.encode(buffer.slice(0, startIdx)));
            buffer = buffer.slice(startIdx + ":::RESERVATION:::".length);
            inBlock = true;
          }
        }
      }
    },
  });

  return new NextResponse(filteredStream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Conversation-Id": conversationId!,
      "Transfer-Encoding": "chunked",
    },
  });
}
