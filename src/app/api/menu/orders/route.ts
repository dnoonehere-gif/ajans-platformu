import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/server/auth/auth";
import { rateLimit, getRateLimitKey, LIMITS } from "@/server/security/rate-limit";

/**
 * QR menüden sipariş.
 *
 * POST herkese açıktır (masadaki müşteri oturum açmaz), GET/PATCH işletmeye
 * aittir. Fiyat İSTEMCİDEN ALINMAZ; ürün kimliğine göre veritabanından
 * okunur, yoksa müşteri fiyatı değiştirip sipariş verebilirdi.
 */

const createSchema = z.object({
  brandId: z.string(),
  tableNo: z.string().min(1).max(20),
  note: z.string().max(500).optional().nullable(),
  items: z.array(z.object({
    menuItemId: z.string(),
    quantity: z.number().int().min(1).max(50),
  })).min(1).max(50),
});

export async function POST(req: NextRequest) {
  try {
    const rl = await rateLimit(getRateLimitKey(req, "order-public"), LIMITS.CHATBOT_MSG);
    if (!rl.allowed) {
      return NextResponse.json({ error: "Çok fazla istek. Lütfen biraz bekleyin." }, { status: 429 });
    }

    const parsed = createSchema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: "Geçersiz sipariş" }, { status: 400 });
    const { brandId, tableNo, note, items } = parsed.data;

    const menu = await prisma.menu.findFirst({
      where: { brandId, isPublished: true, orderingEnabled: true },
      select: { id: true },
    });
    if (!menu) return NextResponse.json({ error: "Bu menüden sipariş alınmıyor" }, { status: 403 });

    // Ürünler bu menüye ait mi ve satışta mı — fiyat da buradan okunur.
    const urunler = await prisma.menuItem.findMany({
      where: {
        id: { in: items.map((i) => i.menuItemId) },
        isAvailable: true,
        category: { menuId: menu.id },
      },
      select: { id: true, name: true, price: true },
    });

    if (urunler.length === 0) {
      return NextResponse.json({ error: "Seçilen ürünler artık satışta değil" }, { status: 400 });
    }

    const satirlar = items
      .map((i) => {
        const u = urunler.find((x) => x.id === i.menuItemId);
        if (!u) return null;
        return { menuItemId: u.id, name: u.name, price: u.price ?? 0, quantity: i.quantity };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);

    if (satirlar.length === 0) {
      return NextResponse.json({ error: "Seçilen ürünler artık satışta değil" }, { status: 400 });
    }

    const total = satirlar.reduce((t, s) => t + s.price * s.quantity, 0);

    const order = await prisma.order.create({
      data: {
        menuId: menu.id, brandId, tableNo, note: note || null, total,
        items: { create: satirlar },
      },
      include: { items: true },
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch (e) {
    console.error("Order POST error:", e);
    return NextResponse.json({ error: "Sipariş oluşturulamadı" }, { status: 500 });
  }
}

/** İşletmenin sipariş listesi. */
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const userId = (session.user as { id: string }).id;

  const brandId = req.nextUrl.searchParams.get("brandId");
  if (!brandId) return NextResponse.json({ error: "brandId gerekli" }, { status: 400 });

  const brand = await prisma.brand.findFirst({ where: { id: brandId, ownerId: userId }, select: { id: true } });
  if (!brand) return NextResponse.json({ error: "Marka bulunamadı" }, { status: 404 });

  const status = req.nextUrl.searchParams.get("status");
  const orders = await prisma.order.findMany({
    where: { brandId, ...(status ? { status } : {}) },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { items: true },
  });

  // Sipariş alınabilmesi için menünün hem YAYINDA hem de siparişe AÇIK olması
  // gerekiyor. Panel bunu söylemezse işletme "neden sipariş gelmiyor" diye
  // bekliyor; durum birlikte döndürülür.
  const menu = await prisma.menu.findFirst({
    where: { brandId },
    select: { isPublished: true, orderingEnabled: true },
  });

  return NextResponse.json({
    orders,
    enabled: Boolean(menu?.isPublished && menu?.orderingEnabled),
    menuPublished: Boolean(menu?.isPublished),
  });
}

/** Sipariş durumunu değiştirir. */
export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const userId = (session.user as { id: string }).id;

  const parsed = z.object({
    id: z.string(),
    status: z.enum(["NEW", "PREPARING", "DELIVERED", "CANCELLED"]),
  }).safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Geçersiz veri" }, { status: 400 });

  const order = await prisma.order.findUnique({
    where: { id: parsed.data.id },
    select: { id: true, brand: { select: { ownerId: true } } },
  });
  if (!order || order.brand.ownerId !== userId) {
    return NextResponse.json({ error: "Sipariş bulunamadı" }, { status: 404 });
  }

  const updated = await prisma.order.update({
    where: { id: parsed.data.id },
    data: { status: parsed.data.status },
    include: { items: true },
  });

  return NextResponse.json({ order: updated });
}
