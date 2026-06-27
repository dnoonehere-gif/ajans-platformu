import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { prisma } from "@/lib/prisma";
import { analyzeBatch, generateInsightReport } from "@/server/ai/review-analyzer";

export async function POST(req: NextRequest, { params }: { params: Promise<{ brandId: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { brandId } = await params;

  const brand = await prisma.brand.findFirst({
    where: { id: brandId, ownerId: (session.user as { id: string }).id },
  });
  if (!brand) return NextResponse.json({ error: "Marka bulunamadı" }, { status: 404 });

  // Analiz edilmemiş yorumları al (en fazla 30)
  const unanalyzed = await prisma.review.findMany({
    where: { brandId, sentiment: null, text: { not: null } },
    take: 30,
    select: { id: true, text: true },
  });

  if (unanalyzed.length === 0) {
    return NextResponse.json({ analyzed: 0, message: "Analiz edilecek yorum yok" });
  }

  const results = await analyzeBatch(
    unanalyzed
      .filter((r): r is { id: string; text: string } => !!r.text)
      .map((r) => ({ id: r.id, text: r.text }))
  );

  // Sonuçları DB'ye yaz
  await Promise.all(
    Array.from(results.entries()).map(([id, analysis]) =>
      prisma.review.update({
        where: { id },
        data: {
          sentiment: analysis.sentiment,
          topics: analysis.topics,
          aiSummary: analysis.aiSummary,
        },
      })
    )
  );

  return NextResponse.json({ analyzed: results.size });
}
