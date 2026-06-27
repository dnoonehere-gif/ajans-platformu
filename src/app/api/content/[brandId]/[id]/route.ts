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

  const item = await prisma.contentItem.findFirst({
    where: { id, brandId, brand: { ownerId: (session.user as { id: string }).id } },
  });
  if (!item) return NextResponse.json({ error: "İçerik bulunamadı" }, { status: 404 });

  await prisma.contentItem.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
