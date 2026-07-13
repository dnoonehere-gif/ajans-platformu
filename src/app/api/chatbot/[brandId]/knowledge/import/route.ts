import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { upsertKnowledge } from "@/lib/pinecone";

const entrySchema = z.object({
  category: z.string().min(1).default("sss"),
  question: z.string().optional(),
  content: z.string().min(1),
});

const bulkSchema = z.object({
  entries: z.array(entrySchema).min(1).max(200),
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
  const parsed = bulkSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Geçersiz veri", details: parsed.error.flatten() }, { status: 400 });

  const created = await prisma.$transaction(
    parsed.data.entries.map((entry) =>
      prisma.chatbotKnowledge.create({
        data: { chatbotId: chatbot.id, ...entry, embedding: [] },
      })
    )
  );

  const pineconeData = created.map((entry, i) => {
    const src = parsed.data.entries[i];
    const text = src.question ? `S: ${src.question}\nC: ${src.content}` : src.content;
    return { id: entry.id, text, source: src.category };
  });
  upsertKnowledge(brandId, pineconeData).catch(() => null);

  return NextResponse.json({ count: created.length, entries: created });
}
