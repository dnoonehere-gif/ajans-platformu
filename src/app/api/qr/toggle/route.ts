import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { id, isActive } = await req.json();
  if (!id) return NextResponse.json({ error: "id gerekli" }, { status: 400 });

  const code = await prisma.qrCode.update({
    where: { id },
    data: { isActive },
  });

  return NextResponse.json({ code });
}
