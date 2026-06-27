import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ brandId: string; id: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { brandId, id } = await params;

  const entry = await prisma.chatbotKnowledge.findFirst({
    where: { id, chatbot: { brandId, brand: { ownerId: (session.user as { id: string }).id } } },
  });
  if (!entry) return NextResponse.json({ error: "Kayıt bulunamadı" }, { status: 404 });

  await prisma.chatbotKnowledge.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
