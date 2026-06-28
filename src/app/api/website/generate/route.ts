import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { prisma } from "@/lib/prisma";
import { generateWebsiteBlocks } from "@/server/ai/website-generator";
import { z } from "zod";

const schema = z.object({
  brandId: z.string(),
  sector: z.string().min(2),
  description: z.string().optional().default(""),
  primaryColor: z.string().optional(),
  phone: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Geçersiz veri" }, { status: 400 });

  const { brandId, sector, description, primaryColor, phone } = parsed.data;

  const brand = await prisma.brand.findFirst({
    where: { id: brandId, ownerId: (session.user as { id: string }).id },
  });
  if (!brand) return NextResponse.json({ error: "Marka bulunamadı" }, { status: 404 });

  // Renk veya telefon değiştiyse markayı güncelle
  if (primaryColor || phone) {
    await prisma.brand.update({
      where: { id: brandId },
      data: {
        ...(primaryColor ? { primaryColor } : {}),
        ...(phone ? { phone } : {}),
      },
    });
  }

  const blocks = await generateWebsiteBlocks({
    brandName: brand.name,
    sector,
    description: description || `${brand.name} — ${sector} sektöründe hizmet veren bir işletme.`,
    phone: phone || brand.phone || undefined,
    email: brand.email ?? undefined,
    address: brand.address ?? undefined,
    primaryColor: primaryColor || brand.primaryColor || undefined,
  });

  const website = await prisma.website.upsert({
    where: { brandId },
    create: {
      brandId,
      title: brand.name,
      isPublished: false,
      pages: {
        create: {
          slug: "anasayfa",
          title: "Ana Sayfa",
          order: 0,
          blocks,
        },
      },
    },
    update: {
      title: brand.name,
      pages: {
        deleteMany: {},
        create: {
          slug: "anasayfa",
          title: "Ana Sayfa",
          order: 0,
          blocks,
        },
      },
    },
    include: { pages: true },
  });

  return NextResponse.json({ website });
}
