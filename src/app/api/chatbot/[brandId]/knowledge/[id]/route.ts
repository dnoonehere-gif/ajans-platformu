import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { prisma } from "@/lib/prisma";
import { getPinecone, PINECONE_INDEX } from "@/lib/pinecone";

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

  // Pinecone'dan da sil
  try {
    const pc = getPinecone();
    if (pc) await pc.index(PINECONE_INDEX).namespace(brandId).deleteMany([id]);
  } catch { /* sessizce geç */ }

  return NextResponse.json({ ok: true });
}
