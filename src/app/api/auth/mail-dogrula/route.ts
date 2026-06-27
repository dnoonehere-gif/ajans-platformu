import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) return NextResponse.redirect(new URL("/giris?hata=gecersiz", req.url));

  const record = await prisma.emailVerificationToken.findUnique({ where: { token } });
  if (!record || record.expiresAt < new Date()) {
    await prisma.emailVerificationToken.deleteMany({ where: { token } });
    return NextResponse.redirect(new URL("/giris?hata=suresi-doldu", req.url));
  }

  await prisma.user.update({
    where: { email: record.email },
    data: { emailVerified: new Date() },
  });
  await prisma.emailVerificationToken.delete({ where: { token } });

  return NextResponse.redirect(new URL("/giris?basarili=dogrulandi", req.url));
}
