import { prisma } from "@/lib/prisma";
import { refreshAccessToken } from "@/lib/google-oauth";

/**
 * Markanın Google erişim jetonunu taze hâlde döndürür.
 *
 * Süresi dolmuşsa yeniler ve veritabanına yazar. Bu mantık daha önce
 * sync rotasının içinde gömülüydü; yanıt gönderme de aynı şeye ihtiyaç
 * duyduğu için buraya çıkarıldı.
 */
export async function getFreshGoogleToken(brandId: string): Promise<
  { ok: true; accessToken: string; locationName: string }
  | { ok: false; error: string; status: number }
> {
  const profile = await prisma.googleBusinessProfile.findUnique({ where: { brandId } });
  if (!profile?.accessToken || !profile?.googlePlaceId) {
    return { ok: false, error: "Google hesabı bağlı değil veya konum seçilmemiş", status: 400 };
  }

  let accessToken = profile.accessToken;
  if (profile.tokenExpiresAt && new Date() > profile.tokenExpiresAt) {
    if (!profile.refreshToken) {
      return { ok: false, error: "Token yenileme bilgisi yok, lütfen tekrar bağlanın", status: 401 };
    }
    const refreshed = await refreshAccessToken(profile.refreshToken);
    accessToken = refreshed.access_token;
    await prisma.googleBusinessProfile.update({
      where: { brandId },
      data: {
        accessToken,
        tokenExpiresAt: new Date(Date.now() + refreshed.expires_in * 1000),
      },
    });
  }

  return { ok: true, accessToken, locationName: profile.googlePlaceId };
}
