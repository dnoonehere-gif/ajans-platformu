import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const brand = await prisma.brand.findUnique({
    where: { slug },
    select: {
      id: true, name: true, logoUrl: true, primaryColor: true, phone: true, address: true,
      menu: {
        include: {
          categories: {
            orderBy: { order: "asc" },
            include: { items: { where: { isAvailable: true }, orderBy: { order: "asc" } } },
          },
        },
      },
    },
  });

  if (!brand?.menu?.isPublished) {
    return NextResponse.json({ error: "Menü bulunamadı" }, { status: 404 });
  }

  return NextResponse.json({ brand, menu: brand.menu });
}
