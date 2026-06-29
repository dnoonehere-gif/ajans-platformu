import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export async function GET(_: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const qrCode = await prisma.qrCode.findUnique({
    where: { slug, isActive: true },
    include: {
      brand: {
        select: { name: true, logoUrl: true, primaryColor: true, sector: true },
      },
    },
  });
  if (!qrCode) return NextResponse.json({ error: "QR kodu bulunamadı" }, { status: 404 });
  return NextResponse.json({ brand: qrCode.brand, label: qrCode.label });
}

const schema = z.object({
  authorName: z.string().optional(),
  rating: z.number().int().min(1).max(5),
  text: z.string().min(1).max(2000),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const qrCode = await prisma.qrCode.findUnique({ where: { slug, isActive: true } });
  if (!qrCode) return NextResponse.json({ error: "QR kodu bulunamadı" }, { status: 404 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Geçersiz veri" }, { status: 400 });

  const [review] = await prisma.$transaction([
    prisma.review.create({
      data: {
        brandId: qrCode.brandId,
        source: "QR",
        qrCodeId: qrCode.id,
        ...parsed.data,
      },
    }),
    prisma.qrCode.update({
      where: { id: qrCode.id },
      data: { scanCount: { increment: 1 } },
    }),
  ]);

  return NextResponse.json({ review });
}
