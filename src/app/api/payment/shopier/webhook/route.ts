import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";
import { Redis } from "@upstash/redis";
import { sendSubscriptionConfirmEmail } from "@/lib/email";
import { sendNotification } from "@/server/notifications/send";
import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import { SubscriptionAgreementPDF } from "@/lib/pdf/contracts";

// Shopier ürün ID → plan slug
const PRODUCT_TO_PLAN: Record<string, string> = {
  "48849668": "baslangic",
  "48849672": "profesyonel",
  "48849675": "isletme",
  "48859443": "baslangic-yillik",
  "48859459": "profesyonel-yillik",
  "48859474": "isletme-yillik",
  "48897218": "ajans",
  "48897230": "ajans-yillik",
};

function getUpstash() {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) return null;
  return new Redis({ url: process.env.UPSTASH_REDIS_REST_URL, token: process.env.UPSTASH_REDIS_REST_TOKEN });
}

// Shopier webhook URL'sini doğrularken GET isteği atabiliyor; tarayıcıdan
// açıldığında da 405 yerine anlamlı bir yanıt dönsün. Gerçek işlem POST'ta.
export async function GET() {
  return NextResponse.json({
    ok: true,
    endpoint: "shopier-webhook",
    method: "POST",
  });
}

// Shopier imzayı HS256 (HMAC-SHA256) ile üretip Shopier-Signature başlığında
// gönderiyor. İmzalanan içeriğin tam formatı dokümanda belirtilmediği için
// yaygın iki şema da denenir; eşleşmezse istek reddedilir ve adaylar loglanır.
function verifySignature(raw: string, signature: string, timestamp: string, secret: string): boolean {
  const candidates = [raw, `${timestamp}.${raw}`];
  for (const payload of candidates) {
    for (const encoding of ["hex", "base64"] as const) {
      const digest = crypto.createHmac("sha256", secret).update(payload, "utf8").digest(encoding);
      const a = Buffer.from(digest);
      const b = Buffer.from(signature);
      if (a.length === b.length && crypto.timingSafeEqual(a, b)) return true;
    }
  }
  console.error("Shopier webhook: imza eşleşmedi", {
    received: signature,
    hexOfBody: crypto.createHmac("sha256", secret).update(raw, "utf8").digest("hex"),
  });
  return false;
}

export async function POST(req: NextRequest) {
  try {
    // İmza ham gövde üzerinden hesaplandığı için önce metin olarak okunur
    const raw = await req.text();

    const secret = process.env.SHOPIER_WEBHOOK_TOKEN;
    const signature = req.headers.get("shopier-signature");
    if (secret) {
      if (!signature) return new NextResponse("FAILED", { status: 403 });
      const timestamp = req.headers.get("shopier-timestamp") ?? "";
      if (!verifySignature(raw, signature, timestamp, secret)) {
        return new NextResponse("FAILED", { status: 403 });
      }
    }

    const body = JSON.parse(raw);

    // Olay tipi Shopier-Event başlığında gelir; gövdedeki alan yedek olarak kullanılır
    const eventType: string = req.headers.get("shopier-event") ?? body.event ?? "";

    if (eventType !== "order.fulfilled" && eventType !== "order.created") {
      return new NextResponse("OK", { status: 200 });
    }

    // Sipariş gövdenin kökünde ya da data altında gelebilir
    const data = body.data ?? body;

    // Alan adları Shopier Order modeline göre; eski tahminler yedekte bırakıldı
    const buyerEmail: string | undefined =
      data.shippingInfo?.email ??
      data.billingInfo?.email ??
      data.buyer?.email ??
      data.customer?.email ??
      data.email;

    const productId: string = String(
      data.lineItems?.[0]?.productId ??
        data.product?.id ??
        data.product_id ??
        data.items?.[0]?.product_id ??
        ""
    );

    const orderId: string = String(data.id ?? data.order_id ?? "");

    const totalValue: number = Number(
      data.totals?.total ?? data.total ?? data.total_price ?? data.amount ?? 0
    );

    if (!buyerEmail || !productId) {
      console.error("Shopier webhook: eksik alan", { eventType, buyerEmail, productId, orderId });
      return new NextResponse("OK", { status: 200 });
    }

    const planSlug = PRODUCT_TO_PLAN[productId];
    if (!planSlug) return new NextResponse("OK", { status: 200 });

    const plan = await prisma.plan.findUnique({ where: { slug: planSlug } });
    if (!plan) return new NextResponse("FAILED", { status: 500 });

    const user = await prisma.user.findUnique({ where: { email: buyerEmail } });
    if (!user) {
      console.error("Shopier webhook: kullanıcı bulunamadı:", buyerEmail);
      return new NextResponse("OK", { status: 200 });
    }

    if (eventType === "order.fulfilled") {
      // Redis'ten brandId bul
      const redis = getUpstash();
      let brandId: string | null = null;

      if (redis) {
        const intent = await redis.get<string>(`checkout:${user.id}:${planSlug}`);
        if (intent) {
          const parsed = typeof intent === "string" ? JSON.parse(intent) : intent;
          brandId = parsed.brandId ?? null;
          // Intent'i temizle
          await redis.del(`checkout:${user.id}:${planSlug}`);
        }
      }

      // Redis yoksa kullanıcının ilk markasını bul (fallback)
      if (!brandId) {
        const brand = await prisma.brand.findFirst({
          where: { ownerId: user.id },
          orderBy: { createdAt: "asc" },
        });
        brandId = brand?.id ?? null;
      }

      if (!brandId) {
        console.error("Shopier webhook: brandId bulunamadı", { userId: user.id });
        return new NextResponse("OK", { status: 200 });
      }

      // Mevcut aktif/trialing abonelikleri iptal et
      await prisma.subscription.updateMany({
        where: { brandId, status: { in: ["TRIALING", "ACTIVE"] } },
        data: { status: "CANCELED" },
      });

      const endsAt = new Date();
      endsAt.setMonth(endsAt.getMonth() + (plan.interval === "year" ? 12 : 1));

      // Yeni ACTIVE abonelik oluştur
      const subscription = await prisma.subscription.create({
        data: {
          brandId,
          planId: plan.id,
          status: "ACTIVE",
          startedAt: new Date(),
          endsAt,
          provider: "SHOPIER",
          providerSubId: orderId || null,
        },
      });

      // Fatura oluştur (PAID)
      await prisma.invoice.create({
        data: {
          subscriptionId: subscription.id,
          amountCents: Math.round(totalValue * 100) || plan.priceCents,
          currency: plan.currency,
          status: "PAID",
          paidAt: new Date(),
          provider: "SHOPIER",
          providerRef: orderId || null,
        },
      });

      // Bildirim + mail
      await sendNotification({
        userId: user.id,
        brandId,
        type: "subscription_started",
        title: `${plan.name} planı aktive edildi`,
        body: `Ödemeniz alındı. ${plan.name} planınız aktif!`,
        data: { planId: plan.id, planName: plan.name, subscriptionId: subscription.id },
      });

      // Abonelik sözleşmesi PDF'i oluştur ve onay mailine ekle
      (async () => {
        try {
          const brand = await prisma.brand.findUnique({ where: { id: brandId! }, select: { name: true } });
          const element = SubscriptionAgreementPDF({
            data: {
              name: user.name ?? "Kullanıcı",
              email: user.email!,
              planName: plan.name,
              planPrice: plan.priceCents,
              planCurrency: plan.currency,
              planInterval: plan.interval,
              startedAt: new Date(),
              endsAt,
              orderId: orderId || undefined,
              brandName: brand?.name,
            },
          });
          const pdfBuffer = await renderToBuffer(element as Parameters<typeof renderToBuffer>[0]);
          await sendSubscriptionConfirmEmail(user.email!, {
            name: user.name ?? "Kullanıcı",
            planName: plan.name,
            trialDays: 0,
            pdfBuffer: pdfBuffer as Buffer,
          });
        } catch {
          sendSubscriptionConfirmEmail(user.email!, {
            name: user.name ?? "Kullanıcı",
            planName: plan.name,
            trialDays: 0,
          }).catch(() => null);
        }
      })();
    } else if (eventType === "order.created") {
      console.log("Shopier order.created:", { buyerEmail, planSlug, orderId });
    }

    return new NextResponse("OK", { status: 200 });
  } catch (err) {
    console.error("Shopier webhook error:", err);
    return new NextResponse("FAILED", { status: 500 });
  }
}
