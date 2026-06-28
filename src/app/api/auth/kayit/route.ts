import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail, sendWelcomeEmail } from "@/lib/email";
import { randomBytes } from "crypto";
import { auditFromRequest } from "@/server/audit/log";
import { rateLimit, getRateLimitKey, LIMITS } from "@/server/security/rate-limit";

const schema = z.object({
  name: z.string().min(2, "Ad en az 2 karakter olmalı"),
  email: z.string().email("Geçerli bir e-posta girin"),
  password: z.string().min(8, "Şifre en az 8 karakter olmalı"),
});

export async function POST(req: NextRequest) {
  const rl = await rateLimit(getRateLimitKey(req), LIMITS.AUTH);
  if (!rl.allowed) return NextResponse.json({ error: "Çok fazla kayıt denemesi. Lütfen bekleyin." }, { status: 429 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Bu e-posta zaten kayıtlı" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { name, email, passwordHash, globalRole: "CUSTOMER" },
  });

  // E-posta doğrulama token'ı oluştur
  const token = randomBytes(32).toString("hex");
  await prisma.emailVerificationToken.create({
    data: {
      email,
      token,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 saat
    },
  });

  try {
    await sendVerificationEmail(email, token);
    // Doğrulama sonrası hoş geldin maili için token'ı kaydettik,
    // welcome mail doğrulamadan sonra /mail-dogrulama route'unda gönderilebilir.
    // Ancak UX iyileştirmesi: hemen de gönderebiliriz.
    sendWelcomeEmail(email, name).catch(() => null);
  } catch {
    // Mail gönderilemese de kayıt tamamlanır
  }

  auditFromRequest("auth.register", user.id, {
    entity: "User", entityId: user.id, metadata: { email, name },
  }).catch(() => null);

  return NextResponse.json({ ok: true, userId: user.id }, { status: 201 });
}
