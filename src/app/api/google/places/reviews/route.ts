import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { prisma } from "@/lib/prisma";
import { analyzeBatch } from "@/server/ai/review-analyzer";

interface PlaceReview {
  author_name: string;
  rating: number;
  text: string;
  time: number;
  relative_time_description: string;
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { brandId, placeId, placeName } = await req.json();
  if (!brandId || !placeId) return NextResponse.json({ error: "brandId ve placeId gerekli" }, { status: 400 });

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "GOOGLE_MAPS_API_KEY tanımlı değil" }, { status: 500 });

  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,reviews,user_ratings_total&language=tr&reviews_sort=newest&key=${apiKey}`;
  const res = await fetch(url);
  const data = await res.json();

  if (data.status !== "OK") {
    return NextResponse.json({ error: `Google API hatası: ${data.status}` }, { status: 400 });
  }

  const result = data.result;
  const reviews: PlaceReview[] = result.reviews ?? [];

  // GoogleBusinessProfile'ı güncelle / oluştur (place_id kaydet)
  await prisma.googleBusinessProfile.upsert({
    where: { brandId },
    create: {
      brandId,
      googlePlaceId: placeId,
      locationName: placeName ?? result.name,
      averageRating: result.rating ?? null,
      totalReviews: result.user_ratings_total ?? 0,
      lastSyncedAt: new Date(),
    },
    update: {
      googlePlaceId: placeId,
      locationName: placeName ?? result.name,
      averageRating: result.rating ?? null,
      totalReviews: result.user_ratings_total ?? 0,
      lastSyncedAt: new Date(),
    },
  });

  // Yorumları kaydet
  let synced = 0;
  const newForAnalysis: { id: string; text: string }[] = [];
  for (const r of reviews) {
    const externalId = `maps_${placeId}_${r.time}`;
    const existing = await prisma.review.findFirst({ where: { brandId, externalId } });
    if (!existing) {
      const created = await prisma.review.create({
        data: {
          brandId,
          source: "GOOGLE",
          authorName: r.author_name,
          rating: r.rating,
          text: r.text || null,
          externalId,
          createdAt: new Date(r.time * 1000),
        },
      });
      if (r.text) newForAnalysis.push({ id: created.id, text: r.text });
    }
    synced++;
  }

  // Yeni yorumlara arka planda sentiment analizi
  if (newForAnalysis.length > 0) {
    (async () => {
      const analyses = await analyzeBatch(newForAnalysis);
      for (const [id, analysis] of analyses) {
        await prisma.review.update({
          where: { id },
          data: { sentiment: analysis.sentiment, topics: analysis.topics, aiSummary: analysis.aiSummary },
        }).catch(() => null);
      }
    })().catch(() => null);
  }

  return NextResponse.json({
    synced,
    averageRating: result.rating,
    totalReviews: result.user_ratings_total,
    placeName: result.name,
  });
}
