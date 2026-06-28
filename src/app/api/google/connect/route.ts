import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { getGoogleAuthUrl } from "@/lib/google-oauth";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const brandId = req.nextUrl.searchParams.get("brandId");
  if (!brandId) return NextResponse.json({ error: "brandId gerekli" }, { status: 400 });

  if (!process.env.GOOGLE_CLIENT_ID) {
    return NextResponse.json({ error: "GOOGLE_CLIENT_ID tanımlı değil" }, { status: 500 });
  }

  const url = getGoogleAuthUrl(brandId);
  return NextResponse.redirect(url);
}
