import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const brand = await prisma.brand.findUnique({
    where: { slug },
    select: {
      id: true, name: true, logoUrl: true, primaryColor: true, phone: true, address: true,
      // "Powered by" yazısı white label ayarına göre gizlenir. Ayar
      // kaydediliyordu ama hiçbir herkese açık sayfa okumuyordu.
      whiteLabel: { select: { hideNovelya: true, footerText: true } },
      menu: {
        include: {
          categories: {
            orderBy: { order: "asc" },
            // Tükenen ürün menüden SİLİNMEZ. Müşteri "bu mekânda bu var mı" diye
            // bakarken ürünün yok olması kafa karıştırıyor ve işletme ürünü geri
            // eklemek zorunda kalıyordu; artık "Tükendi" olarak gösteriliyor.
            include: { items: { orderBy: [{ isAvailable: "desc" }, { order: "asc" }] } },
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
