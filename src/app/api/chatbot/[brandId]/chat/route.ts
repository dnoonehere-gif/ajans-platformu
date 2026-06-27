import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { streamChatResponse } from "@/server/ai/chatbot-engine";
import { z } from "zod";

const schema = z.object({
  message: z.string().min(1).max(1000),
  conversationId: z.string().optional(),
  visitorId: z.string().optional(),
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

  // Önceki mesajları al (son 10)
  const history = await prisma.chatbotMessage.findMany({
    where: { conversationId: conversation.id },
    orderBy: { createdAt: "asc" },
    take: 10,
  });

  // Kullanıcı mesajını kaydet
  await prisma.chatbotMessage.create({
    data: { conversationId: conversation.id, role: "user", content: message },
  });

  // Streaming yanıt oluştur
  const stream = await streamChatResponse({
    botName: chatbot.name,
    brandName: chatbot.brand.name,
    systemPrompt: chatbot.systemPrompt,
    knowledge: chatbot.knowledgeBase,
    history: history.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
    userMessage: message,
  });

  // Yanıtı DB'ye kaydetmek için arka planda oku
  const [streamForClient, streamForDB] = stream.tee();

  (async () => {
    const reader = streamForDB.getReader();
    let fullText = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      fullText += new TextDecoder().decode(value);
    }
    await prisma.chatbotMessage.create({
      data: { conversationId: conversation!.id, role: "assistant", content: fullText },
    });
  })();

  return new NextResponse(streamForClient, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Conversation-Id": conversationId!,
      "Transfer-Encoding": "chunked",
    },
  });
}
