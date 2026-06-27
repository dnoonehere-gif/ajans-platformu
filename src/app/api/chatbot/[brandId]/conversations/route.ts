import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ brandId: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { brandId } = await params;

  const chatbot = await prisma.chatbot.findFirst({
    where: { brandId, brand: { ownerId: (session.user as { id: string }).id } },
  });
  if (!chatbot) return NextResponse.json({ error: "Chatbot bulunamadı" }, { status: 404 });

  const conversations = await prisma.chatbotConversation.findMany({
    where: { chatbotId: chatbot.id },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      messages: { orderBy: { createdAt: "asc" } },
    },
  });

  return NextResponse.json({ conversations });
}
