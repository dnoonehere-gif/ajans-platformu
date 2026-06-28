import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { prisma } from "@/lib/prisma";
import {
  exchangeCodeForTokens,
  getGoogleAccounts,
  getGoogleLocations,
} from "@/lib/google-oauth";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.redirect(new URL("/giris", req.url));

  const { searchParams } = req.nextUrl;
  const code = searchParams.get("code");
  const brandId = searchParams.get("state"); // brandId state olarak gönderildi
  const error = searchParams.get("error");

  if (error || !code || !brandId) {
    return NextResponse.redirect(
      new URL(`/dashboard/google?error=cancelled&brandId=${brandId ?? ""}`, req.url)
    );
  }

  try {
    // Token al
    const tokens = await exchangeCodeForTokens(code);
    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);

    // Google hesaplarını çek
    const { accounts } = await getGoogleAccounts(tokens.access_token);
    const account = accounts?.[0];

    let locationResourceName: string | null = null;
    let locationName: string | null = null;

    if (account) {
      const { locations } = await getGoogleLocations(tokens.access_token, account.name);
      if (locations?.length) {
        // İlk lokasyon auto-seç (birden fazlaysa dashboard'dan değiştirilebilir)
        locationResourceName = locations[0].name;
        locationName = locations[0].title;
      }
    }

    // DB'ye kaydet
    await prisma.googleBusinessProfile.upsert({
      where: { brandId },
      create: {
        brandId,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        tokenExpiresAt: expiresAt,
        accountEmail: account?.accountName ?? null,
        googlePlaceId: locationResourceName,
        locationName,
      },
      update: {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        tokenExpiresAt: expiresAt,
        accountEmail: account?.accountName ?? null,
        googlePlaceId: locationResourceName,
        locationName,
      },
    });

    return NextResponse.redirect(
      new URL(`/dashboard/google?brandId=${brandId}&connected=1`, req.url)
    );
  } catch (e) {
    console.error("Google callback error:", e);
    return NextResponse.redirect(
      new URL(`/dashboard/google?brandId=${brandId}&error=failed`, req.url)
    );
  }
}
