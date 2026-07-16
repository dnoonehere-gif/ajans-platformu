import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { notifyBrandOwner } from "@/server/notifications/send";
import { rateLimit, getRateLimitKey, LIMITS } from "@/server/security/rate-limit";

const schema = z.object({
  brandId: z.string(),
  name: z.string().min(1).max(200),
  phone: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  date: z.string(),
  time: z.string(),
  partySize: z.number().int().min(1).max(50).default(1),
  notes: z.string().optional().nullable(),
  conversationId: z.string().optional().nullable(),
});

export async function POST(req: NextRequest) {
  try {
    // Public endpoint — IP başına dakikada 20 istek
    const rl = await rateLimit(getRateLimitKey(req, "res-public"), LIMITS.CHATBOT_MSG);
    if (!rl.allowed) {
      return NextResponse.json({ error: "Çok fazla istek. Lütfen biraz bekleyin." }, { status: 429 });
    }

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Geçersiz veri" }, { status: 400 });

    const { brandId, date, ...data } = parsed.data;

    const chatbot = await prisma.chatbot.findFirst({
      where: { brandId, isActive: true, reservationEnabled: true },
    });
    if (!chatbot) return NextResponse.json({ error: "Rezervasyon bu marka için aktif değil" }, { status: 403 });

    const reservation = await prisma.reservation.create({
      data: { brandId, date: new Date(date), source: "chatbot", ...data },
    });

    notifyBrandOwner(brandId, {
      type: "reservation_new",
      title: `Yeni rezervasyon: ${data.name}`,
      body: `${new Date(date).toLocaleDateString("tr-TR")} ${data.time} — ${data.partySize} kişi`,
      data: { reservationId: reservation.id, source: "chatbot" },
    }).catch(() => {});

    return NextResponse.json({ reservation }, { status: 201 });
  } catch (e) {
    console.error("Public reservation error:", e);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
