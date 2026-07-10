import { NextRequest, NextResponse } from "next/server";
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
};

function getUpstash() {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) return null;
  return new Redis({ url: process.env.UPSTASH_REDIS_REST_URL, token: process.env.UPSTASH_REDIS_REST_TOKEN });
}

export async function POST(req: NextRequest) {
  try {
    const webhookToken = process.env.SHOPIER_WEBHOOK_TOKEN;
    if (webhookToken) {
      const incoming =
        req.headers.get("x-shopier-webhook-token") ??
        req.headers.get("authorization")?.replace("Bearer ", "") ?? "";
      if (incoming !== webhookToken) {
        return new NextResponse("FAILED", { status: 403 });
      }
    }

    const event = await req.json();
    const eventType: string = event.event ?? "";
    const data = event.data ?? {};

    if (eventType !== "order.fulfilled" && eventType !== "order.created") {
      return new NextResponse("OK", { status: 200 });
    }

    const buyerEmail: string | undefined =
      data.buyer?.email ?? data.customer?.email ?? data.email;
    const productId: string =
      String(data.product?.id ?? data.product_id ?? data.items?.[0]?.product_id ?? "");
    const orderId: string =
      String(data.id ?? data.order_id ?? "");
    const totalValue: number =
      data.total ?? data.total_price ?? data.amount ?? 0;

    if (!buyerEmail || !productId) {
      console.error("Shopier webhook: eksik alan", { buyerEmail, productId });
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
