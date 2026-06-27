import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ brandId: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { brandId } = await params;

  const brand = await prisma.brand.findFirst({
    where: { id: brandId, ownerId: (session.user as { id: string }).id },
  });
  if (!brand) return NextResponse.json({ error: "Marka bulunamadı" }, { status: 404 });

  const qrCodes = await prisma.qrCode.findMany({
    where: { brandId },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { reviews: true } },
      reviews: {
        select: { rating: true, sentiment: true },
      },
    },
  });

  const enriched = qrCodes.map((qr) => {
    const ratings = qr.reviews.map((r) => r.rating);
    const avgRating = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : null;
    const sentimentCounts = {
      positive: qr.reviews.filter((r) => r.sentiment === "POSITIVE").length,
      neutral: qr.reviews.filter((r) => r.sentiment === "NEUTRAL").length,
      negative: qr.reviews.filter((r) => r.sentiment === "NEGATIVE").length,
    };
    return {
      id: qr.id,
      slug: qr.slug,
      label: qr.label,
      isActive: qr.isActive,
      scanCount: qr.scanCount,
      reviewCount: qr._count.reviews,
      avgRating,
      sentimentCounts,
      createdAt: qr.createdAt,
    };
  });

  return NextResponse.json({ qrCodes: enriched });
}
