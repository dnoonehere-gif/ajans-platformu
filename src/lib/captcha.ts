import { createHmac } from "crypto";

// Basit matematik captcha — HMAC imzalı token, 5 dk geçerli.
const SECRET = process.env.NEXTAUTH_SECRET ?? "captcha-fallback-secret";

export function signCaptcha(answer: number, expiresAt: number): string {
  const payload = `${answer}.${expiresAt}`;
  const sig = createHmac("sha256", SECRET).update(payload).digest("hex");
  return `${expiresAt}.${sig}`;
}

export function verifyCaptcha(answer: string | number, token: string): boolean {
  const [expStr, sig] = (token ?? "").split(".");
  const expiresAt = parseInt(expStr);
  if (!expiresAt || !sig || Date.now() > expiresAt) return false;
  const expected = createHmac("sha256", SECRET).update(`${answer}.${expiresAt}`).digest("hex");
  return sig === expected;
}
