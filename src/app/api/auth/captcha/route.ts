import { NextResponse } from "next/server";
import { randomInt } from "crypto";
import { signCaptcha } from "@/lib/captcha";

// GET → { question, token } — kayıt formu captcha sorusu
export async function GET() {
  const a = randomInt(1, 10);
  const b = randomInt(1, 10);
  const expiresAt = Date.now() + 5 * 60 * 1000;
  return NextResponse.json({
    question: `${a} + ${b} = ?`,
    token: signCaptcha(a + b, expiresAt),
  });
}
