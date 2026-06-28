import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-guard";

export async function GET() {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { name: true, email: true, twoFactorEnabled: true, createdAt: true, globalRole: true },
  });
  return NextResponse.json({ user: dbUser });
}

export async function PATCH(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const body = await req.json();
  const parsed = z.object({ name: z.string().min(2) }).safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Geçersiz veri" }, { status: 400 });

  await prisma.user.update({ where: { id: user.id }, data: { name: parsed.data.name } });
  return NextResponse.json({ ok: true });
}
