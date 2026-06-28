import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { prisma } from "@/lib/prisma";
import {
  refreshAccessToken,
  getGoogleReviews,
  starToNumber,
} from "@/lib/google-oauth";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { brandId } = await req.json();
  if (!brandId) return NextResponse.json({ error: "brandId gerekli" }, { status: 400 });

  const profile = await prisma.googleBusinessProfile.findUnique({ where: { brandId } });
  if (!profile?.accessToken || !profile?.googlePlaceId) {
    return NextResponse.json({ error: "Google hesabı bağlı değil veya konum seçilmemiş" }, { status: 400 });
  }

  // Token süresi dolmuşsa yenile
  let accessToken = profile.accessToken;
  if (profile.tokenExpiresAt && new Date() > profile.tokenExpiresAt) {
    if (!profile.refreshToken) {
      return NextResponse.json({ error: "Token yenileme bilgisi yok, lütfen tekrar bağlanın" }, { status: 401 });
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

  // Yorumları çek
  const { reviews, averageRating, totalReviewCount } = await getGoogleReviews(
    accessToken,
    profile.googlePlaceId
  );

  // DB'ye upsert (externalId ile tekrar kayıtı önle)
  let synced = 0;
  for (const r of reviews) {
    const existing = await prisma.review.findFirst({
      where: { brandId, externalId: r.reviewId },
    });
    if (existing) {
      await prisma.review.update({
        where: { id: existing.id },
        data: {
          authorName: r.reviewer?.displayName ?? "Anonim",
          rating: starToNumber(r.starRating),
          text: r.comment ?? null,
        },
      });
    } else {
      await prisma.review.create({
        data: {
          brandId,
          source: "GOOGLE",
          authorName: r.reviewer?.displayName ?? "Anonim",
          rating: starToNumber(r.starRating),
          text: r.comment ?? null,
          externalId: r.reviewId,
          createdAt: new Date(r.createTime),
        },
      });
    }
    synced++;
  }

  // Profili güncelle
  await prisma.googleBusinessProfile.update({
    where: { brandId },
    data: {
      averageRating,
      totalReviews: totalReviewCount,
      lastSyncedAt: new Date(),
    },
  });

  return NextResponse.json({ synced, averageRating, totalReviews: totalReviewCount });
}
