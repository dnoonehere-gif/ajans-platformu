import { NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { prisma } from "@/lib/prisma";
import { generateTotpSecret, getTotpUri, generateQrCodeDataUrl } from "@/server/security/totp";
import { rateLimit, getRateLimitKey, LIMITS } from "@/server/security/rate-limit";
import { NextRequest } from "next/server";
import { auditFromRequest } from "@/server/audit/log";

// GET — yeni secret üret + QR kodu döndür (henüz aktif etme)
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const userId = (session.user as { id: string }).id;

  const rl = await rateLimit(getRateLimitKey(req), { windowMs: 60_000, max: 5, keyPrefix: "2fa-setup" });
  if (!rl.allowed) return NextResponse.json({ error: "Çok fazla istek" }, { status: 429 });

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true, twoFactorEnabled: true } });
  if (!user) return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });
  if (user.twoFactorEnabled) return NextResponse.json({ error: "2FA zaten aktif" }, { status: 400 });

  const secret = generateTotpSecret();
  const uri = getTotpUri(user.email!, secret);
  const qrCode = await generateQrCodeDataUrl(uri);

  // Secret'i geçici olarak kaydet (doğrulanmamış)
  await prisma.user.update({ where: { id: userId }, data: { twoFactorSecret: secret } });

  return NextResponse.json({ secret, qrCode, uri });
}

// POST — TOTP kodu doğrula ve 2FA'yı aktif et
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const userId = (session.user as { id: string }).id;

  const rl = await rateLimit(getRateLimitKey(req), { windowMs: 60_000, max: 5, keyPrefix: "2fa-verify" });
  if (!rl.allowed) return NextResponse.json({ error: "Çok fazla istek" }, { status: 429 });

  const { token } = await req.json();
  if (!token) return NextResponse.json({ error: "Kod gerekli" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { twoFactorSecret: true, twoFactorEnabled: true } });
  if (!user?.twoFactorSecret) return NextResponse.json({ error: "Önce QR kodu okutun" }, { status: 400 });
  if (user.twoFactorEnabled) return NextResponse.json({ error: "2FA zaten aktif" }, { status: 400 });

  const { verifyTotp } = await import("@/server/security/totp");
  if (!verifyTotp(token, user.twoFactorSecret)) {
    return NextResponse.json({ error: "Geçersiz kod. Lütfen tekrar deneyin." }, { status: 400 });
  }

  await prisma.user.update({ where: { id: userId }, data: { twoFactorEnabled: true } });
  auditFromRequest("auth.email_verify", userId, { metadata: { action: "2fa_enabled" } }).catch(() => null);

  return NextResponse.json({ ok: true });
}

// DELETE — 2FA'yı devre dışı bırak
export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const userId = (session.user as { id: string }).id;

  const { token } = await req.json();
  if (!token) return NextResponse.json({ error: "Mevcut 2FA kodunuz gerekli" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { twoFactorSecret: true, twoFactorEnabled: true } });
  if (!user?.twoFactorEnabled || !user.twoFactorSecret) {
    return NextResponse.json({ error: "2FA aktif değil" }, { status: 400 });
  }

  const { verifyTotp } = await import("@/server/security/totp");
  if (!verifyTotp(token, user.twoFactorSecret)) {
    return NextResponse.json({ error: "Geçersiz kod" }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: userId },
    data: { twoFactorEnabled: false, twoFactorSecret: null },
  });
  auditFromRequest("auth.email_verify", userId, { metadata: { action: "2fa_disabled" } }).catch(() => null);

  return NextResponse.json({ ok: true });
}
