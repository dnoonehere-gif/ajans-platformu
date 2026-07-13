import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { prisma } from "@/lib/prisma";
import { renderToBuffer } from "@react-pdf/renderer";
import { InvoicePDF } from "@/lib/pdf/invoice";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

    const userId = (session.user as { id: string }).id;
    const { id } = await params;

    const invoice = await prisma.invoice.findFirst({
      where: { id, subscription: { brand: { ownerId: userId } } },
      include: {
        subscription: {
          select: { brand: { select: { name: true } }, plan: { select: { name: true } } },
        },
      },
    });
    if (!invoice) return NextResponse.json({ error: "Fatura bulunamadı" }, { status: 404 });

    const buffer = await renderToBuffer(
      <InvoicePDF
        inv={{
          id: invoice.id,
          amountCents: invoice.amountCents,
          currency: invoice.currency,
          status: invoice.status,
          provider: invoice.provider,
          providerRef: invoice.providerRef,
          paidAt: invoice.paidAt,
          createdAt: invoice.createdAt,
          brandName: invoice.subscription.brand.name,
          planName: invoice.subscription.plan.name,
        }}
      />
    );

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="fatura-${invoice.id.slice(-8).toUpperCase()}.pdf"`,
      },
    });
  } catch (e) {
    console.error("Invoice PDF error:", e);
    return NextResponse.json({ error: "PDF oluşturulamadı" }, { status: 500 });
  }
}
