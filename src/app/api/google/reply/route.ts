import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { prisma } from "@/lib/prisma";
import { getFreshGoogleToken } from "@/server/google/token";
import { replyToGoogleReview, deleteGoogleReviewReply } from "@/lib/google-oauth";
import { z } from "zod";

const schema = z.object({
  brandId: z.string(),
  reviewId: z.string(),
  /** Google'a gönderilecek metin. Taslağı saklamak için publish=false gönder. */
  comment: z.string().min(1).max(4096),
  publish: z.boolean().optional().default(true),
});

/** Sahiplik kontrolü — kullanıcı yalnızca kendi markasının yorumuna dokunabilir. */
async function yetkiliMi(userId: string, brandId: string, reviewId: string) {
  const brand = await prisma.brand.findFirst({ where: { id: brandId, ownerId: userId }, select: { id: true } });
  if (!brand) return null;
  return prisma.review.findFirst({ where: { id: reviewId, brandId } });
}

/**
 * POST — yanıtı kaydeder ve (publish ise) Google'a gönderir.
 *
 * Google'a yazma yetkisi (business.manage) işletme bağlanırken zaten
 * alınıyor; ek başvuru gerekmez. Yalnızca Google'dan senkronlanmış
 * yorumlar gönderilebilir — panelden elle eklenen yorumun Google
 * tarafında karşılığı olmadığı için yanıtlanamaz.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    const userId = (session.user as { id: string }).id;

    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: "Geçersiz veri" }, { status: 400 });
    const { brandId, reviewId, comment, publish } = parsed.data;

    const review = await yetkiliMi(userId, brandId, reviewId);
    if (!review) return NextResponse.json({ error: "Yorum bulunamadı" }, { status: 404 });

    // Sadece taslak kaydet
    if (!publish) {
      await prisma.review.update({ where: { id: reviewId }, data: { reply: comment } });
      return NextResponse.json({ saved: true, published: false });
    }

    if (review.source !== "GOOGLE" || !review.externalId) {
      return NextResponse.json({
        error: "Bu yorum Google'dan gelmiyor, Google'a yanıt gönderilemez. Yanıt taslak olarak kaydedildi.",
      }, { status: 400 });
    }

    const token = await getFreshGoogleToken(brandId);
    if (!token.ok) return NextResponse.json({ error: token.error }, { status: token.status });

    await replyToGoogleReview(token.accessToken, token.locationName, review.externalId, comment);

    await prisma.review.update({
      where: { id: reviewId },
      data: { reply: comment, replyPublishedAt: new Date() },
    });

    return NextResponse.json({ saved: true, published: true });
  } catch (e) {
    console.error("Google reply error:", e);
    return NextResponse.json({ error: "Yanıt gönderilemedi" }, { status: 500 });
  }
}

/** DELETE — Google'daki işletme yanıtını kaldırır. */
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    const userId = (session.user as { id: string }).id;

    const { brandId, reviewId } = await req.json();
    if (!brandId || !reviewId) return NextResponse.json({ error: "brandId ve reviewId gerekli" }, { status: 400 });

    const review = await yetkiliMi(userId, brandId, reviewId);
    if (!review) return NextResponse.json({ error: "Yorum bulunamadı" }, { status: 404 });

    if (review.externalId && review.replyPublishedAt) {
      const token = await getFreshGoogleToken(brandId);
      if (!token.ok) return NextResponse.json({ error: token.error }, { status: token.status });
      await deleteGoogleReviewReply(token.accessToken, token.locationName, review.externalId);
    }

    await prisma.review.update({
      where: { id: reviewId },
      data: { reply: null, replyPublishedAt: null },
    });

    return NextResponse.json({ deleted: true });
  } catch (e) {
    console.error("Google reply delete error:", e);
    return NextResponse.json({ error: "Yanıt silinemedi" }, { status: 500 });
  }
}
