import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { appUrl } from "@/lib/base-url";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) return NextResponse.redirect(appUrl("/giris?hata=gecersiz", req));

  const record = await prisma.emailVerificationToken.findUnique({ where: { token } });
  if (!record || record.expiresAt < new Date()) {
    await prisma.emailVerificationToken.deleteMany({ where: { token } });
    return NextResponse.redirect(appUrl("/giris?hata=suresi-doldu", req));
  }

  await prisma.user.update({
    where: { email: record.email },
    data: { emailVerified: new Date() },
  });
  await prisma.emailVerificationToken.delete({ where: { token } });

  return NextResponse.redirect(appUrl("/giris?basarili=dogrulandi", req));
}
