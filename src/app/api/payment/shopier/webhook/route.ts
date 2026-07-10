import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendSubscriptionConfirmEmail } from "@/lib/email";

// Shopier ürün ID → plan slug eşleştirmesi
const PRODUCT_TO_PLAN: Record<string, string> = {
  "48849668": "baslangic",
  "48849672": "profesyonel",
  "48849675": "isletme",
};

export async function POST(req: NextRequest) {
  try {
    // Shopier webhook token doğrulaması
    const webhookToken = process.env.SHOPIER_WEBHOOK_TOKEN;
    if (webhookToken) {
      const incoming =
        req.headers.get("x-shopier-webhook-token") ??
        req.headers.get("authorization")?.replace("Bearer ", "") ??
        "";
      if (incoming !== webhookToken) {
        console.error("Shopier webhook token doğrulaması başarısız");
        return new NextResponse("FAILED", { status: 403 });
      }
    }

    const event = await req.json();

    const eventType: string = event.event ?? "";
    const data = event.data ?? {};

    // Sadece sipariş tamamlandığında işlem yap
    if (eventType !== "order.fulfilled" && eventType !== "order.created") {
      return new NextResponse("OK", { status: 200 });
    }

    const buyerEmail: string | undefined =
      data.buyer?.email ?? data.customer?.email ?? data.email;

    const productId: string | undefined =
      String(data.product?.id ?? data.product_id ?? data.items?.[0]?.product_id ?? "");

    const orderId: string | undefined =
      String(data.id ?? data.order_id ?? "");

    const totalValue: number =
      data.total ?? data.total_price ?? data.amount ?? 0;

    if (!buyerEmail || !productId) {
      console.error("Shopier webhook: eksik alan", { buyerEmail, productId, eventType });
      return new NextResponse("OK", { status: 200 });
    }

    const planSlug = PRODUCT_TO_PLAN[productId];
    if (!planSlug) {
      // Novelya ürünü değil, yoksay
      return new NextResponse("OK", { status: 200 });
    }

    const plan = await prisma.plan.findUnique({ where: { slug: planSlug } });
    if (!plan) return new NextResponse("FAILED", { status: 500 });

    const user = await prisma.user.findUnique({ where: { email: buyerEmail } });
    if (!user) {
      console.error("Shopier webhook: kullanıcı bulunamadı:", buyerEmail);
      return new NextResponse("OK", { status: 200 });
    }

    if (eventType === "order.fulfilled") {
      // Ödeme tamamlandı — aboneliği aktif et
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
            amountCents: Math.round(totalValue * 100),
            providerRef: orderId,
          },
        });

        sendSubscriptionConfirmEmail(user.email!, {
          name: user.name ?? "Kullanıcı",
          planName: plan.name,
          trialDays: 0,
        }).catch(() => null);
      }
    } else if (eventType === "order.created") {
      // Sipariş oluşturuldu ama henüz ödenmedi — şimdilik logluyoruz
      console.log("Shopier order.created:", { buyerEmail, planSlug, orderId });
    }

    return new NextResponse("OK", { status: 200 });
  } catch (err) {
    console.error("Shopier webhook error:", err);
    return new NextResponse("FAILED", { status: 500 });
  }
}
