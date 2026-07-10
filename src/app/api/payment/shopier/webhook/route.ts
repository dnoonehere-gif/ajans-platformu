import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import { prisma } from "@/lib/prisma";
import { sendSubscriptionConfirmEmail } from "@/lib/email";

// Shopier ürün ID → plan slug eşleştirmesi
const PRODUCT_TO_PLAN: Record<string, string> = {
  "48849668": "baslangic",
  "48849672": "profesyonel",
  "48849675": "isletme",
};

function verifySignature(params: URLSearchParams, apiKey: string): boolean {
  const signature = params.get("signature");
  if (!signature) return false;

  // Shopier imza: SHA256(buyer_name + buyer_email + buyer_phone + product_id + order_id + product_count + total_order_value + status + api_key)
  const raw = [
    params.get("buyer_name") ?? "",
    params.get("buyer_email") ?? "",
    params.get("buyer_phone") ?? "",
    params.get("product_id") ?? "",
    params.get("order_id") ?? "",
    params.get("product_count") ?? "",
    params.get("total_order_value") ?? "",
    params.get("status") ?? "",
    apiKey,
  ].join("");

  const expected = createHmac("sha256", apiKey).update(raw).digest("base64");
  return expected === signature;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const params = new URLSearchParams(body);

    const apiKey = process.env.SHOPIER_API_KEY;
    if (!apiKey) {
      console.error("SHOPIER_API_KEY eksik");
      return new NextResponse("FAILED", { status: 500 });
    }

    // İmza doğrulama
    if (!verifySignature(params, apiKey)) {
      console.error("Shopier webhook imza doğrulaması başarısız");
      return new NextResponse("FAILED", { status: 403 });
    }

    const status = params.get("status");       // "1" = başarılı, "0" = başarısız
    const buyerEmail = params.get("buyer_email");
    const productId = params.get("product_id");
    const orderId = params.get("order_id");
    const totalValue = params.get("total_order_value"); // TL cinsinden

    if (!buyerEmail || !productId || !orderId) {
      return new NextResponse("FAILED", { status: 400 });
    }

    const planSlug = PRODUCT_TO_PLAN[productId];
    if (!planSlug) {
      console.error("Bilinmeyen Shopier ürün ID:", productId);
      return new NextResponse("OK", { status: 200 }); // Novelya ürünü değil, yoksay
    }

    // Kullanıcıyı bul
    const user = await prisma.user.findUnique({
      where: { email: buyerEmail },
      include: { brands: { take: 1, orderBy: { createdAt: "asc" } } },
    });

    if (!user) {
      console.error("Shopier webhook: kullanıcı bulunamadı:", buyerEmail);
      return new NextResponse("OK", { status: 200 });
    }

    const plan = await prisma.plan.findUnique({ where: { slug: planSlug } });
    if (!plan) return new NextResponse("FAILED", { status: 500 });

    if (status === "1") {
      // Başarılı ödeme — kullanıcının bu planla TRIALING/PENDING aboneliğini bul
      const subscription = await prisma.subscription.findFirst({
        where: {
          brand: { ownerId: user.id },
          planId: plan.id,
          status: { in: ["TRIALING", "PENDING"] },
        },
        orderBy: { createdAt: "desc" },
      });

      if (subscription) {
        const endsAt = new Date();
        endsAt.setMonth(endsAt.getMonth() + (plan.interval === "year" ? 12 : 1));

        await prisma.subscription.update({
          where: { id: subscription.id },
          data: { status: "ACTIVE", startedAt: new Date(), endsAt },
        });

        await prisma.invoice.updateMany({
          where: { subscriptionId: subscription.id, status: "PENDING" },
          data: {
            status: "PAID",
            paidAt: new Date(),
            amountCents: totalValue ? Math.round(parseFloat(totalValue) * 100) : plan.priceCents,
            providerRef: orderId,
          },
        });

        // Onay maili
        sendSubscriptionConfirmEmail(user.email!, {
          name: user.name ?? "Kullanıcı",
          planName: plan.name,
          trialDays: 0,
        }).catch(() => null);
      }
    } else if (status === "0") {
      // Başarısız ödeme
      await prisma.subscription.updateMany({
        where: {
          brand: { ownerId: user.id },
          planId: plan.id,
          status: { in: ["TRIALING", "PENDING"] },
        },
        data: { status: "PAST_DUE" },
      });
    }

    return new NextResponse("OK", { status: 200 });
  } catch (err) {
    console.error("Shopier webhook error:", err);
    return new NextResponse("FAILED", { status: 500 });
  }
}
