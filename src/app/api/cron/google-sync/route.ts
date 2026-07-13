import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { analyzeBatch } from "@/server/ai/review-analyzer";
import { notifyBrandOwner } from "@/server/notifications/send";
import { cacheDel, CacheKeys } from "@/server/cache/redis-cache";

interface PlaceReview {
  author_name: string;
  rating: number;
  text: string;
  time: number;
}

// Railway Cron / QStash tarafından günlük çağrılır
// Header: Authorization: Bearer <CRON_SECRET>
export async function POST(req: NextRequest) {
  const secret = req.headers.get("authorization")?.replace("Bearer ", "");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "GOOGLE_MAPS_API_KEY tanımlı değil" }, { status: 500 });

  const profiles = await prisma.googleBusinessProfile.findMany({
    where: { googlePlaceId: { not: null } },
  });

  let totalSynced = 0;
  const results: { brandId: string; newReviews: number; error?: string }[] = [];

  for (const profile of profiles) {
    try {
      const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${profile.googlePlaceId}&fields=name,rating,reviews,user_ratings_total&language=tr&reviews_sort=newest&key=${apiKey}`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.status !== "OK") {
        results.push({ brandId: profile.brandId, newReviews: 0, error: data.status });
        continue;
      }

      const reviews: PlaceReview[] = data.result.reviews ?? [];
      const newReviews: { id: string; text: string; rating: number }[] = [];

      for (const r of reviews) {
        const externalId = `maps_${profile.googlePlaceId}_${r.time}`;
        const existing = await prisma.review.findFirst({ where: { brandId: profile.brandId, externalId } });
        if (!existing) {
          const created = await prisma.review.create({
            data: {
              brandId: profile.brandId,
              source: "GOOGLE",
              authorName: r.author_name,
              rating: r.rating,
              text: r.text || null,
              externalId,
              createdAt: new Date(r.time * 1000),
            },
          });
          if (r.text) newReviews.push({ id: created.id, text: r.text, rating: r.rating });
          totalSynced++;
        }
      }

      await prisma.googleBusinessProfile.update({
        where: { brandId: profile.brandId },
        data: {
          averageRating: data.result.rating ?? null,
          totalReviews: data.result.user_ratings_total ?? 0,
          lastSyncedAt: new Date(),
        },
      });

      // Yeni yorumlara sentiment analizi
      if (newReviews.length > 0) {
        const analyses = await analyzeBatch(newReviews.map((r) => ({ id: r.id, text: r.text })));
        for (const [id, analysis] of analyses) {
          await prisma.review.update({
            where: { id },
            data: { sentiment: analysis.sentiment, topics: analysis.topics, aiSummary: analysis.aiSummary },
          }).catch(() => null);
        }

        // Dashboard cache temizle + bildirim
        cacheDel(CacheKeys.dashboard(profile.brandId)).catch(() => null);

        const negativeCount = newReviews.filter((r) => r.rating <= 2).length;
        await notifyBrandOwner(profile.brandId, {
          type: negativeCount > 0 ? "negative_review" : "new_review",
          title: `Google'dan ${newReviews.length} yeni yorum`,
          body: negativeCount > 0
            ? `${negativeCount} olumsuz yorum var — incelemenizi öneririz`
            : `${profile.locationName ?? "İşletmeniz"} için yeni yorumlar senkronize edildi`,
          data: { source: "google_auto_sync", count: newReviews.length },
        }).catch(() => null);
      }

      results.push({ brandId: profile.brandId, newReviews: newReviews.length });
    } catch (e) {
      console.error(`Google sync error for brand ${profile.brandId}:`, e);
      results.push({ brandId: profile.brandId, newReviews: 0, error: "fetch_failed" });
    }
  }

  return NextResponse.json({ profiles: profiles.length, totalSynced, results });
}
