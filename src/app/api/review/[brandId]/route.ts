import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { sendNotification } from "@/server/notifications/send";

const postSchema = z.object({
  authorName: z.string().optional(),
  rating: z.number().int().min(1).max(5),
  text: z.string().min(1),
  source: z.enum(["GOOGLE", "QR", "MANUAL", "CHATBOT"]).default("MANUAL"),
});

export async function GET(req: NextRequest, { params }: { params: Promise<{ brandId: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { brandId } = await params;
  const { searchParams } = new URL(req.url);
  const sentiment = searchParams.get("sentiment");
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = 20;

  const brand = await prisma.brand.findFirst({
    where: { id: brandId, ownerId: (session.user as { id: string }).id },
  });
  if (!brand) return NextResponse.json({ error: "Marka bulunamadı" }, { status: 404 });

  const where = {
    brandId,
    ...(sentiment ? { sentiment: sentiment as "POSITIVE" | "NEUTRAL" | "NEGATIVE" } : {}),
  };

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.review.count({ where }),
  ]);

  return NextResponse.json({ reviews, total, page, pages: Math.ceil(total / limit) });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ brandId: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { brandId } = await params;

  const brand = await prisma.brand.findFirst({
    where: { id: brandId, ownerId: (session.user as { id: string }).id },
  });
  if (!brand) return NextResponse.json({ error: "Marka bulunamadı" }, { status: 404 });

  const body = await req.json();
  const parsed = postSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Geçersiz veri" }, { status: 400 });

  const review = await prisma.review.create({
    data: { brandId, ...parsed.data },
  });

  // Yorum bildirimi
  const userId = (session.user as { id: string }).id;
  const isNegative = parsed.data.rating <= 2;
  await sendNotification({
    userId,
    brandId,
    type: isNegative ? "negative_review" : "new_review",
    title: isNegative
      ? `${parsed.data.rating}⭐ Olumsuz yorum alındı`
      : `${parsed.data.rating}⭐ Yeni yorum alındı`,
    body: parsed.data.text.slice(0, 120),
    data: { reviewId: review.id, rating: parsed.data.rating, source: parsed.data.source },
  });

  return NextResponse.json({ review });
}
