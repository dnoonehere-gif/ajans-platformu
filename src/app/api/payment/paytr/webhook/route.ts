import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PayTR IPN (Instant Payment Notification) webhook
// Belgeleme: https://dev.paytr.com/iframe-api/payment-result
export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const params = new URLSearchParams(body);

    const merchantOid = params.get("merchant_oid"); // subscriptionId
    const status = params.get("status");            // "success" | "failed"
    const totalAmount = params.get("total_amount"); // kuruş cinsinden (x100)
    // const hash = params.get("hash");             // TODO: HMAC doğrulaması ekle

    // TODO: PayTR HMAC hash doğrulaması
    // const secret = process.env.PAYTR_MERCHANT_SALT!;
    // const expected = createHmac("sha256", secret).update(...).digest("base64");
    // if (hash !== expected) return new NextResponse("FAILED", { status: 403 });

    if (!merchantOid) return new NextResponse("FAILED", { status: 400 });

    if (status === "success") {
      // Fatura güncelle
      await prisma.invoice.updateMany({
        where: { subscriptionId: merchantOid, status: "PENDING" },
        data: {
          status: "PAID",
          paidAt: new Date(),
          amountCents: totalAmount ? parseInt(totalAmount) * 10 : undefined, // PayTR kuruş*10 gönderir
          providerRef: merchantOid,
        },
      });

      // Aboneliği aktif et
      const subscription = await prisma.subscription.findUnique({ where: { id: merchantOid }, include: { plan: true } });
      if (subscription) {
        const endsAt = new Date();
        endsAt.setMonth(endsAt.getMonth() + (subscription.plan.interval === "year" ? 12 : 1));

        await prisma.subscription.update({
          where: { id: merchantOid },
          data: { status: "ACTIVE", startedAt: new Date(), endsAt },
        });
      }
    } else if (status === "failed") {
      await prisma.invoice.updateMany({
        where: { subscriptionId: merchantOid, status: "PENDING" },
        data: { status: "FAILED" },
      });

      await prisma.subscription.updateMany({
        where: { id: merchantOid, status: "TRIALING" },
        data: { status: "PAST_DUE" },
      });
    }

    return new NextResponse("OK", { status: 200 });
  } catch (err) {
    console.error("PayTR webhook error:", err);
    return new NextResponse("FAILED", { status: 500 });
  }
}
