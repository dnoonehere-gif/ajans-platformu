import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";
import { Redis } from "@upstash/redis";
import { sendSubscriptionConfirmEmail } from "@/lib/email";
import { sendNotification } from "@/server/notifications/send";
import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import { SubscriptionAgreementPDF } from "@/lib/pdf/contracts";
import { refreshPdfFonts } from "@/lib/pdf/fonts";

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
// gönderiyor, ancak imzalanan içeriğin tam formatı dokümanda belirtilmemiş.
// Bu yüzden yaygın şemalar denenir ve hangisinin tuttuğu döndürülür.
const SIGNATURE_SCHEMES = ["body", "timestamp.body"] as const;

// Shopier her webhook kaydı için ayrı bir token üretiyor (order.created ve
// order.fulfilled farklı token'lara sahip). Bu yüzden secret'lar virgülle
// ayrılmış liste olarak tutulur ve herhangi biri eşleşirse imza geçerlidir.
function secretList(value: string | undefined): string[] {
  return (value ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function matchSignature(
  raw: string,
  signature: string,
  timestamp: string,
  secrets: string[]
): string | null {
  for (const secret of secrets) {
    for (const scheme of SIGNATURE_SCHEMES) {
      const payload = scheme === "body" ? raw : `${timestamp}.${raw}`;
      for (const encoding of ["hex", "base64"] as const) {
        const digest = crypto.createHmac("sha256", secret).update(payload, "utf8").digest(encoding);
        const a = Buffer.from(digest);
        const b = Buffer.from(signature);
        if (a.length === b.length && crypto.timingSafeEqual(a, b)) return `${scheme}:${encoding}`;
      }
    }
  }
  return null;
}

// İmza doğrulaması SHOPIER_WEBHOOK_SECRET tanımlanana kadar kapalıdır.
// Kapalıyken bile, imza başlığı geldiyse hangi şemanın tuttuğu loglanır —
// ilk gerçek webhook teslimatı doğru şemayı kendisi ortaya çıkarsın diye.
function inspectSignature(req: NextRequest, raw: string) {
  const signature = req.headers.get("shopier-signature");
  if (!signature) return;
  const probes = secretList(process.env.SHOPIER_WEBHOOK_SECRET ?? process.env.SHOPIER_WEBHOOK_TOKEN);
  if (probes.length === 0) return;
  const timestamp = req.headers.get("shopier-timestamp") ?? "";
  console.log("Shopier webhook: imza incelemesi", {
    matchedScheme: matchSignature(raw, signature, timestamp, probes) ?? "EŞLEŞME YOK",
    webhookId: req.headers.get("shopier-webhook-id"),
    timestamp,
  });
}

export async function POST(req: NextRequest) {
  try {
    // İmza ham gövde üzerinden hesaplandığı için önce metin olarak okunur
    const raw = await req.text();

    // Doğru imza şeması teyit edilene kadar zorunlu doğrulama kapalı.
    // Teyit edildiğinde Railway'e SHOPIER_WEBHOOK_SECRET eklenerek açılır.
    const secrets = secretList(process.env.SHOPIER_WEBHOOK_SECRET);
    if (secrets.length > 0) {
      const signature = req.headers.get("shopier-signature");
      if (!signature) return new NextResponse("FAILED", { status: 403 });
      const timestamp = req.headers.get("shopier-timestamp") ?? "";
      if (!matchSignature(raw, signature, timestamp, secrets)) {
        console.error("Shopier webhook: imza doğrulanamadı", {
          webhookId: req.headers.get("shopier-webhook-id"),
        });
        return new NextResponse("FAILED", { status: 403 });
      }
    } else {
      inspectSignature(req, raw);
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

    // Ödeme tamamlanmışsa aboneliği aç. Shopier aynı sipariş için hem
    // order.created hem order.fulfilled gönderebiliyor, ayrıca 200 alamazsa
    // 9 kez tekrar deniyor — bu yüzden ödeme durumuna bakılıyor, olay tipine değil.
    const paid = data.paymentStatus ? data.paymentStatus === "paid" : eventType === "order.fulfilled";

    if (paid) {
      // Aynı sipariş daha önce işlendiyse tekrar abonelik/fatura oluşturma
      if (orderId) {
        const existing = await prisma.subscription.findFirst({
          where: { provider: "SHOPIER", providerSubId: orderId },
          select: { id: true },
        });
        if (existing) {
          console.log("Shopier webhook: sipariş zaten işlenmiş, atlandı", { orderId });
          return new NextResponse("OK", { status: 200 });
        }
      }

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
          refreshPdfFonts();
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
    } else {
      console.log("Shopier webhook: ödeme henüz tamamlanmamış", {
        eventType,
        orderId,
        paymentStatus: data.paymentStatus,
      });
    }

    return new NextResponse("OK", { status: 200 });
  } catch (err) {
    console.error("Shopier webhook error:", err);
    return new NextResponse("FAILED", { status: 500 });
  }
}
