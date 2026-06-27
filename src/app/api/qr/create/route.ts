import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  brandId: z.string(),
  label: z.string().optional(),
});

function randomSlug() {
  return Math.random().toString(36).slice(2, 9);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Geçersiz veri" }, { status: 400 });

  const { brandId, label } = parsed.data;

  const brand = await prisma.brand.findFirst({
    where: { id: brandId, ownerId: (session.user as { id: string }).id },
  });
  if (!brand) return NextResponse.json({ error: "Marka bulunamadı" }, { status: 404 });

  let slug = randomSlug();
  // Çakışma ihtimaline karşı
  while (await prisma.qrCode.findUnique({ where: { slug } })) {
    slug = randomSlug();
  }

  const qrCode = await prisma.qrCode.create({
    data: { brandId, slug, label, isActive: true },
  });

  return NextResponse.json({ qrCode, url: `/qr/${slug}` });
}
