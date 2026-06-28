import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { prisma } from "@/lib/prisma";
import { verifyTotp } from "@/server/security/totp";
import { rateLimit, getRateLimitKey } from "@/server/security/rate-limit";
import { auditFromRequest } from "@/server/audit/log";

// Giriş sonrası 2FA step doğrulaması
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const userId = (session.user as { id: string }).id;

  const rl = await rateLimit(getRateLimitKey(req), { windowMs: 5 * 60_000, max: 5, keyPrefix: "2fa-login" });
  if (!rl.allowed) {
    return NextResponse.json({ error: "Çok fazla hatalı deneme. 5 dakika bekleyin." }, { status: 429 });
  }

  const { token } = await req.json();
  if (!token) return NextResponse.json({ error: "Kod gerekli" }, { status: 400 });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { twoFactorEnabled: true, twoFactorSecret: true },
  });

  if (!user?.twoFactorEnabled || !user.twoFactorSecret) {
    return NextResponse.json({ error: "2FA aktif değil" }, { status: 400 });
  }

  if (!(await verifyTotp(token, user.twoFactorSecret))) {
    auditFromRequest("auth.login", userId, { metadata: { result: "2fa_failed" } }).catch(() => null);
    return NextResponse.json({ error: "Geçersiz kod" }, { status: 400 });
  }

  auditFromRequest("auth.login", userId, { metadata: { result: "2fa_success" } }).catch(() => null);
  return NextResponse.json({ ok: true });
}
