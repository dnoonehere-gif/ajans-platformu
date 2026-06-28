import { NextRequest, NextResponse } from "next/server";
import { randomBytes, createHmac } from "crypto";

const CSRF_SECRET = process.env.AUTH_SECRET ?? "csrf-fallback-secret";
const CSRF_HEADER = "x-csrf-token";
const CSRF_COOKIE = "__csrf";
const TOKEN_TTL_MS = 4 * 60 * 60 * 1000; // 4 saat

// HMAC imzalı token: base64(timestamp):hmac
export function generateCsrfToken(): string {
  const payload = `${Date.now()}:${randomBytes(16).toString("hex")}`;
  const sig = createHmac("sha256", CSRF_SECRET).update(payload).digest("hex");
  return `${Buffer.from(payload).toString("base64url")}:${sig}`;
}

export function verifyCsrfToken(token: string): boolean {
  try {
    const [b64Payload, sig] = token.split(":");
    if (!b64Payload || !sig) return false;

    const payload = Buffer.from(b64Payload, "base64url").toString();
    const [tsStr] = payload.split(":");
    const ts = parseInt(tsStr, 10);
    if (isNaN(ts) || Date.now() - ts > TOKEN_TTL_MS) return false;

    const expected = createHmac("sha256", CSRF_SECRET).update(payload).digest("hex");
    // Timing-safe compare
    if (sig.length !== expected.length) return false;
    let diff = 0;
    for (let i = 0; i < sig.length; i++) diff |= sig.charCodeAt(i) ^ expected.charCodeAt(i);
    return diff === 0;
  } catch {
    return false;
  }
}

// GET /api/security/csrf — token üret, cookie'ye yaz
export function csrfTokenResponse(): NextResponse {
  const token = generateCsrfToken();
  const res = NextResponse.json({ token });
  res.cookies.set(CSRF_COOKIE, token, {
    httpOnly: false, // JS'in okuyabilmesi için
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: TOKEN_TTL_MS / 1000,
  });
  return res;
}

// State-mutating methodlarda CSRF doğrula
// NextAuth zaten kendi CSRF mekanizmasını yönetiyor;
// Bu, custom form endpoint'leri (ör. profil güncelleme) içindir.
export function validateCsrf(req: NextRequest): boolean {
  const headerToken = req.headers.get(CSRF_HEADER);
  const cookieToken = req.cookies.get(CSRF_COOKIE)?.value;
  if (!headerToken || !cookieToken) return false;
  if (headerToken !== cookieToken) return false;
  return verifyCsrfToken(headerToken);
}

// Güvenli metodlar CSRF kontrolü gerekmez
export function requiresCsrf(method: string): boolean {
  return ["POST", "PUT", "PATCH", "DELETE"].includes(method.toUpperCase());
}
