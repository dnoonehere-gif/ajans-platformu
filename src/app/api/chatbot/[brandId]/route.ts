import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ brandId: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { brandId } = await params;

  const chatbot = await prisma.chatbot.findFirst({
    where: { brandId, brand: { ownerId: (session.user as { id: string }).id } },
    include: { knowledgeBase: { orderBy: { createdAt: "desc" } } },
  });

  if (!chatbot) return NextResponse.json({ chatbot: null });
  return NextResponse.json({ chatbot });
}
