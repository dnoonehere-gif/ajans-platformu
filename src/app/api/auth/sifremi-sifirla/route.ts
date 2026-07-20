import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendPasswordChangedEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = z.object({
    token: z.string().min(1),
    password: z.string().min(8, "Şifre en az 8 karakter olmalı"),
  }).safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });

  const { token, password } = parsed.data;

  const record = await prisma.passwordResetToken.findUnique({ where: { token } });
  if (!record || record.expiresAt < new Date()) {
    await prisma.passwordResetToken.deleteMany({ where: { token } });
    return NextResponse.json({ error: "Link geçersiz veya süresi dolmuş" }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.update({ where: { email: record.email }, data: { passwordHash } });
  await prisma.passwordResetToken.delete({ where: { token } });

  // Güvenlik bildirimi — mail gönderilemese de işlem başarılı sayılır
  sendPasswordChangedEmail(record.email).catch((e) =>
    console.error("Şifre değişikliği maili gönderilemedi:", e)
  );

  return NextResponse.json({ ok: true });
}
