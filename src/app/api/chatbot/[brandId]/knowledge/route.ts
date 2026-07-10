import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { upsertKnowledge } from "@/lib/pinecone";

const schema = z.object({
  category: z.string().min(1),
  question: z.string().optional(),
  content: z.string().min(1),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ brandId: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { brandId } = await params;

  const chatbot = await prisma.chatbot.findFirst({
    where: { brandId, brand: { ownerId: (session.user as { id: string }).id } },
  });
  if (!chatbot) return NextResponse.json({ error: "Chatbot bulunamadı" }, { status: 404 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Geçersiz veri" }, { status: 400 });

  const entry = await prisma.chatbotKnowledge.create({
    data: { chatbotId: chatbot.id, ...parsed.data, embedding: [] },
  });

  // Pinecone'a senkronize et (hata fırlatmaz)
  const text = parsed.data.question
    ? `S: ${parsed.data.question}\nC: ${parsed.data.content}`
    : parsed.data.content;

  upsertKnowledge(brandId, [{ id: entry.id, text, source: parsed.data.category }]).catch(() => null);

  return NextResponse.json({ entry });
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ brandId: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { brandId } = await params;

  const chatbot = await prisma.chatbot.findFirst({
    where: { brandId, brand: { ownerId: (session.user as { id: string }).id } },
    include: { knowledgeBase: { orderBy: { createdAt: "desc" } } },
  });
  if (!chatbot) return NextResponse.json({ error: "Chatbot bulunamadı" }, { status: 404 });

  return NextResponse.json({ knowledge: chatbot.knowledgeBase });
}
