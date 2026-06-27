import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { prisma } from "@/lib/prisma";

async function getQr(brandId: string, id: string, ownerId: string) {
  return prisma.qrCode.findFirst({
    where: { id, brandId, brand: { ownerId } },
  });
}

export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ brandId: string; id: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { brandId, id } = await params;
  const qr = await getQr(brandId, id, (session.user as { id: string }).id);
  if (!qr) return NextResponse.json({ error: "QR bulunamadı" }, { status: 404 });

  const updated = await prisma.qrCode.update({
    where: { id },
    data: { isActive: !qr.isActive },
  });

  return NextResponse.json({ isActive: updated.isActive });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ brandId: string; id: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { brandId, id } = await params;
  const qr = await getQr(brandId, id, (session.user as { id: string }).id);
  if (!qr) return NextResponse.json({ error: "QR bulunamadı" }, { status: 404 });

  await prisma.qrCode.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
