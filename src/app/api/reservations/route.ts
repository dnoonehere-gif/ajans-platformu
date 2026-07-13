import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { sendCustomEmail } from "@/lib/email";
import { sendSMS } from "@/lib/sms";

const createSchema = z.object({
  brandId: z.string(),
  name: z.string().min(1).max(200),
  phone: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  date: z.string(),
  time: z.string(),
  partySize: z.number().int().min(1).max(50).default(1),
  notes: z.string().optional().nullable(),
  source: z.enum(["chatbot", "manual"]).default("manual"),
  conversationId: z.string().optional().nullable(),
});

const updateSchema = z.object({
  id: z.string(),
  status: z.enum(["PENDING", "CONFIRMED", "CANCELLED"]).optional(),
  notes: z.string().optional().nullable(),
  date: z.string().optional(),
  time: z.string().optional(),
  partySize: z.number().int().min(1).max(50).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

    const userId = (session.user as { id: string }).id;
    const brandId = req.nextUrl.searchParams.get("brandId");
    if (!brandId) return NextResponse.json({ error: "brandId gerekli" }, { status: 400 });

    const brand = await prisma.brand.findFirst({ where: { id: brandId, ownerId: userId } });
    if (!brand) return NextResponse.json({ error: "Marka bulunamadı" }, { status: 404 });

    const status = req.nextUrl.searchParams.get("status");
    const reservations = await prisma.reservation.findMany({
      where: {
        brandId,
        ...(status ? { status } : {}),
      },
      orderBy: { date: "asc" },
      take: 200,
    });

    return NextResponse.json({ reservations });
  } catch (e) {
    console.error("Reservations GET error:", e);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

    const userId = (session.user as { id: string }).id;
    const body = await req.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Geçersiz veri" }, { status: 400 });

    const { brandId, date, ...data } = parsed.data;
    const brand = await prisma.brand.findFirst({ where: { id: brandId, ownerId: userId } });
    if (!brand) return NextResponse.json({ error: "Marka bulunamadı" }, { status: 404 });

    const reservation = await prisma.reservation.create({
      data: { brandId, date: new Date(date), ...data },
    });
    return NextResponse.json({ reservation }, { status: 201 });
  } catch (e) {
    console.error("Reservations POST error:", e);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

    const userId = (session.user as { id: string }).id;
    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Geçersiz veri" }, { status: 400 });

    const { id, date, ...data } = parsed.data;
    const reservation = await prisma.reservation.findUnique({ where: { id }, include: { brand: true } });
    if (!reservation || reservation.brand.ownerId !== userId)
      return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });

    const updated = await prisma.reservation.update({
      where: { id },
      data: { ...data, ...(date ? { date: new Date(date) } : {}) },
    });

    // Onay/iptal bildirimi — müşteriye e-posta + SMS (arka planda, hata yut)
    if (data.status && data.status !== reservation.status && (data.status === "CONFIRMED" || data.status === "CANCELLED")) {
      const brandName = reservation.brand.name;
      const dateStr = updated.date.toLocaleDateString("tr-TR", { day: "2-digit", month: "long", year: "numeric" });
      const confirmed = data.status === "CONFIRMED";
      const subject = confirmed
        ? `Rezervasyonunuz onaylandı — ${brandName}`
        : `Rezervasyonunuz iptal edildi — ${brandName}`;
      const text = confirmed
        ? `Sayın ${updated.name}, ${brandName} için ${dateStr} ${updated.time} tarihli ${updated.partySize} kişilik rezervasyonunuz onaylanmıştır. Sizi ağırlamayı sabırsızlıkla bekliyoruz!`
        : `Sayın ${updated.name}, ${brandName} için ${dateStr} ${updated.time} tarihli rezervasyonunuz maalesef iptal edilmiştir. Yeni bir rezervasyon için bizimle iletişime geçebilirsiniz.`;

      if (updated.email) sendCustomEmail(updated.email, subject, text).catch(() => null);
      if (updated.phone) sendSMS(updated.phone, `${brandName}: ${confirmed ? "Rezervasyonunuz ONAYLANDI" : "Rezervasyonunuz IPTAL edildi"} — ${dateStr} ${updated.time}, ${updated.partySize} kisi.`).catch(() => null);
    }

    return NextResponse.json({ reservation: updated });
  } catch (e) {
    console.error("Reservations PATCH error:", e);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

    const userId = (session.user as { id: string }).id;
    const id = req.nextUrl.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id gerekli" }, { status: 400 });

    const reservation = await prisma.reservation.findUnique({ where: { id }, include: { brand: true } });
    if (!reservation || reservation.brand.ownerId !== userId)
      return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });

    await prisma.reservation.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Reservations DELETE error:", e);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
