import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail, sendWelcomeEmail } from "@/lib/email";
import { randomBytes } from "crypto";
import { auditFromRequest } from "@/server/audit/log";
import { rateLimit, getRateLimitKey, LIMITS } from "@/server/security/rate-limit";
import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import { UserAgreementPDF } from "@/lib/pdf/contracts";
import { refreshPdfFonts } from "@/lib/pdf/fonts";
import { verifyCaptcha } from "@/lib/captcha";

const schema = z.object({
  name: z.string().min(2, "Ad en az 2 karakter olmalı"),
  email: z.string().email("Geçerli bir e-posta girin"),
  phone: z.string().min(10, "Geçerli bir telefon numarası girin").max(20),
  password: z.string().min(8, "Şifre en az 8 karakter olmalı"),
  captchaAnswer: z.string().min(1, "Güvenlik sorusunu yanıtlayın"),
  captchaToken: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const rl = await rateLimit(getRateLimitKey(req), LIMITS.AUTH);
  if (!rl.allowed) return NextResponse.json({ error: "Çok fazla kayıt denemesi. Lütfen bekleyin." }, { status: 429 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const { name, email, phone, password, captchaAnswer, captchaToken } = parsed.data;

  if (!verifyCaptcha(captchaAnswer.trim(), captchaToken)) {
    return NextResponse.json({ error: "Güvenlik sorusu yanlış veya süresi doldu. Tekrar deneyin." }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Bu e-posta zaten kayıtlı" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { name, email, phone, passwordHash, globalRole: "CUSTOMER" },
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
    // Kullanıcı sözleşmesi PDF'i arka planda oluştur ve hoş geldin mailine ekle
    (async () => {
      try {
        const element = UserAgreementPDF({ data: { name, email, registeredAt: new Date() } });
        refreshPdfFonts();
        const pdfBuffer = await renderToBuffer(element as Parameters<typeof renderToBuffer>[0]);
        await sendWelcomeEmail(email, name, pdfBuffer as Buffer);
      } catch {
        sendWelcomeEmail(email, name).catch(() => null);
      }
    })();
  } catch {
    // Mail gönderilemese de kayıt tamamlanır
  }

  auditFromRequest("auth.register", user.id, {
    entity: "User", entityId: user.id, metadata: { email, name },
  }).catch(() => null);

  return NextResponse.json({ ok: true, userId: user.id }, { status: 201 });
}
