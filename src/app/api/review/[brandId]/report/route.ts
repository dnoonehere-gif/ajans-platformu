import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { prisma } from "@/lib/prisma";
import { generateThemeReport } from "@/server/ai/review-report";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ brandId: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { brandId } = await params;

  const brand = await prisma.brand.findFirst({
    where: { id: brandId },
  });
  if (!brand) return NextResponse.json({ error: "Marka bulunamadı" }, { status: 404 });

  const reviews = await prisma.review.findMany({
    where: { brandId, text: { not: null } },
    select: { text: true, rating: true },
    orderBy: { createdAt: "desc" },
    take: 500,
  });

  if (reviews.length === 0) {
    return NextResponse.json({ error: "Analiz edilecek yorum yok" }, { status: 400 });
  }

  const report = await generateThemeReport(
    reviews.map((r) => ({ text: r.text!, rating: r.rating })),
    brand.name
  );

  return NextResponse.json({ report });
}
