import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { auth } from "@/server/auth/auth";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/email";

// Giriş yapmış ama e-postası doğrulanmamış kullanıcıya yeni doğrulama maili gönderir.
export async function POST() {
  const session = await auth();
  const userId = (session?.user as { id?: string })?.id;
  if (!userId) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, emailVerified: true },
  });
  if (!user?.email) return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });
  if (user.emailVerified) return NextResponse.json({ ok: true, already: true });

  // Eski token'ları temizle, yenisini üret
  await prisma.emailVerificationToken.deleteMany({ where: { email: user.email } });
  const token = randomBytes(32).toString("hex");
  await prisma.emailVerificationToken.create({
    data: { email: user.email, token, expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) },
  });

  try {
    await sendVerificationEmail(user.email, token);
  } catch (e) {
    console.error("Doğrulama maili tekrar gönderilemedi:", e);
    return NextResponse.json({ error: "Mail gönderilemedi" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
