import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "id gerekli" }, { status: 400 });

  await prisma.qrCode.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
