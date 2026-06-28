import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";
import { randomBytes } from "crypto";
import { rateLimit, getRateLimitKey, LIMITS } from "@/server/security/rate-limit";

export async function POST(req: NextRequest) {
  const rl = await rateLimit(getRateLimitKey(req), LIMITS.PASSWORD_RST);
  if (!rl.allowed) return NextResponse.json({ error: "Çok fazla istek. 1 saat sonra tekrar deneyin." }, { status: 429 });
  const body = await req.json();
  const parsed = z.object({ email: z.string().email() }).safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Geçerli bir e-posta girin" }, { status: 400 });

  const { email } = parsed.data;

  // Kullanıcı yoksa bile aynı yanıtı dön (güvenlik için)
  const user = await prisma.user.findUnique({ where: { email } });
  if (user) {
    // Varsa eski token'ları sil
    await prisma.passwordResetToken.deleteMany({ where: { email } });

    const token = randomBytes(32).toString("hex");
    await prisma.passwordResetToken.create({
      data: { email, token, expiresAt: new Date(Date.now() + 60 * 60 * 1000) }, // 1 saat
    });

    try {
      await sendPasswordResetEmail(email, token);
    } catch {
      // sessiz hata
    }
  }

  return NextResponse.json({ ok: true });
}
