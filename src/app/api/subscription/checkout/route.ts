import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { Redis } from "@upstash/redis";

function getUpstash() {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) return null;
  return new Redis({ url: process.env.UPSTASH_REDIS_REST_URL, token: process.env.UPSTASH_REDIS_REST_TOKEN });
}

const schema = z.object({
  brandId: z.string(),
  planId: z.string(),
});

// Shopier ürün linkleri — plan slug → URL
const SHOPIER_LINKS: Record<string, string> = {
  baslangic:            "https://www.shopier.com/NovelyaDijitalAjans/48849668",
  profesyonel:          "https://www.shopier.com/NovelyaDijitalAjans/48849672",
  isletme:              "https://www.shopier.com/NovelyaDijitalAjans/48849675",
  ajans:                "https://www.shopier.com/NovelyaDijitalAjans/TODO_AJANS",
  "baslangic-yillik":   "https://www.shopier.com/NovelyaDijitalAjans/48859443",
  "profesyonel-yillik": "https://www.shopier.com/NovelyaDijitalAjans/48859459",
  "isletme-yillik":     "https://www.shopier.com/NovelyaDijitalAjans/48859474",
  "ajans-yillik":       "https://www.shopier.com/NovelyaDijitalAjans/TODO_AJANS_YILLIK",
};

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Geçersiz veri" }, { status: 400 });

  const { brandId, planId } = parsed.data;
  const userId = (session.user as { id?: string }).id;
  if (!userId) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const brand = await prisma.brand.findFirst({
    where: { id: brandId, ownerId: userId },
  });
  if (!brand) return NextResponse.json({ error: "Marka bulunamadı" }, { status: 404 });

  const plan = await prisma.plan.findUnique({ where: { id: planId, isActive: true } });
  if (!plan) return NextResponse.json({ error: "Plan bulunamadı" }, { status: 404 });

  // Mevcut aboneliği getir (göstermek için, değiştirme)
  const currentSub = await prisma.subscription.findFirst({
    where: { brandId, status: { in: ["TRIALING", "ACTIVE"] } },
    include: { plan: true },
    orderBy: { createdAt: "desc" },
  });

  // Ödeme niyetini Redis'e kaydet (24 saat TTL)
  // Webhook gelince bu bilgiyle subscription aktive edilecek
  const redis = getUpstash();
  if (redis) {
    await redis.set(
      `checkout:${userId}:${plan.slug}`,
      JSON.stringify({ brandId, planId, userId, planSlug: plan.slug }),
      { ex: 60 * 60 * 24 }
    );
  }

  // Kullanıcı emailini URL'ye ekle — Shopier formu otomatik doldurur
  // Bu sayede webhook gelen email her zaman Novelya emailiyle eşleşir
  const dbUser = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } });
  const baseUrl = SHOPIER_LINKS[plan.slug] ?? null;
  const checkoutUrl = baseUrl && dbUser?.email
    ? `${baseUrl}?buyer_email=${encodeURIComponent(dbUser.email)}`
    : baseUrl;

  return NextResponse.json({ subscription: currentSub, checkoutUrl });
}
