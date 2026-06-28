import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { prisma } from "@/lib/prisma";
import { generateQrPng } from "@/lib/qr-image";

export async function GET(req: NextRequest, { params }: { params: Promise<{ brandId: string; id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { brandId, id } = await params;

  const qr = await prisma.qrCode.findFirst({
    where: { id, brandId, brand: { ownerId: (session.user as { id: string }).id } },
  });
  if (!qr) return NextResponse.json({ error: "QR bulunamadı" }, { status: 404 });

  const origin = new URL(req.url).origin;
  const url = `${origin}/qr/${qr.slug}`;
  const png = await generateQrPng(url);

  return new NextResponse(png as unknown as BodyInit, {
    headers: {
      "Content-Type": "image/png",
      "Content-Disposition": `attachment; filename="qr-${qr.slug}.png"`,
      "Cache-Control": "public, max-age=86400",
    },
  });
}
