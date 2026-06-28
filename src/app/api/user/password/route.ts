import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-guard";

export async function PATCH(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const body = await req.json();
  const parsed = z.object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8, "Şifre en az 8 karakter olmalı"),
  }).safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser?.passwordHash) return NextResponse.json({ error: "Şifre bulunamadı" }, { status: 400 });

  const ok = await bcrypt.compare(parsed.data.currentPassword, dbUser.passwordHash);
  if (!ok) return NextResponse.json({ error: "Mevcut şifre hatalı" }, { status: 400 });

  const hash = await bcrypt.hash(parsed.data.newPassword, 12);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash: hash } });
  return NextResponse.json({ ok: true });
}
