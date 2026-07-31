import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail, sendWelcomeEmail } from "@/lib/email";
import { randomBytes } from "crypto";
import { auditFromRequest, getClientIp } from "@/server/audit/log";
import { normalizeEmail } from "@/lib/email-normalize";
import { rateLimit, getRateLimitKey, LIMITS } from "@/server/security/rate-limit";
import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import { UserAgreementPDF } from "@/lib/pdf/contracts";
import { refreshPdfFonts } from "@/lib/pdf/fonts";
import { verifyCaptcha } from "@/lib/captcha";
import { passwordSchema } from "@/lib/password";

const schema = z.object({
  name: z.string().min(2, "Ad en az 2 karakter olmalı"),
  email: z.string().email("Geçerli bir e-posta girin"),
  phone: z.string().max(20).optional().or(z.literal("")).transform((v) => v || undefined),
  password: passwordSchema,
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
  const signupIp = await getClientIp();
  const user = await prisma.user.create({
    data: {
      name, email, phone: phone ?? null, passwordHash, globalRole: "CUSTOMER",
      emailNormalized: normalizeEmail(email),
      signupIp: signupIp ?? null,
    },
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

  // Doğrulama maili + hoş geldin maili (kullanıcı sözleşmesi PDF ekli).
  // Kayıt işlemini bloklamamak için beklemeden gönderilir; hatalar loglanır.
  sendVerificationEmail(email, token).catch((e) =>
    console.error("Doğrulama maili gönderilemedi:", e)
  );
  (async () => {
    try {
      const element = UserAgreementPDF({ data: { name, email, registeredAt: new Date() } });
      refreshPdfFonts();
      const pdfBuffer = await renderToBuffer(element as Parameters<typeof renderToBuffer>[0]);
      await sendWelcomeEmail(email, name, pdfBuffer as Buffer);
    } catch (e) {
      // PDF üretimi/gönderimi başarısız olursa en azından PDF'siz hoş geldin maili git
      console.error("Hoş geldin maili PDF ile gönderilemedi, PDF'siz deneniyor:", e);
      await sendWelcomeEmail(email, name).catch((e2) =>
        console.error("Hoş geldin maili PDF'siz de gönderilemedi:", e2)
      );
    }
  })();

  auditFromRequest("auth.register", user.id, {
    entity: "User", entityId: user.id, metadata: { email, name },
  }).catch(() => null);

  return NextResponse.json({ ok: true, userId: user.id }, { status: 201 });
}
