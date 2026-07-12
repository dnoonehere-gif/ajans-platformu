import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createSchema = z.object({
  brandId: z.string(),
  subject: z.string().min(1).max(200),
  body: z.string().min(1).max(50000),
  recipientTag: z.string().optional().nullable(),
  scheduledAt: z.string().datetime().optional().nullable(),
  status: z.enum(["DRAFT", "SCHEDULED"]).default("DRAFT"),
});

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

    const userId = (session.user as { id: string }).id;
    const brandId = req.nextUrl.searchParams.get("brandId");
    if (!brandId) return NextResponse.json({ error: "brandId gerekli" }, { status: 400 });

    const brand = await prisma.brand.findFirst({ where: { id: brandId, ownerId: userId } });
    if (!brand) return NextResponse.json({ error: "Marka bulunamadı" }, { status: 404 });

    const campaigns = await prisma.emailCampaign.findMany({
      where: { brandId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const contactCount = await prisma.emailContact.count({ where: { brandId } });

    return NextResponse.json({ campaigns, contactCount });
  } catch (e) {
    console.error("EmailCampaigns GET error:", e);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

    const userId = (session.user as { id: string }).id;
    const body = await req.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Geçersiz veri", details: parsed.error.flatten() }, { status: 400 });

    const { brandId, ...data } = parsed.data;
    const brand = await prisma.brand.findFirst({ where: { id: brandId, ownerId: userId } });
    if (!brand) return NextResponse.json({ error: "Marka bulunamadı" }, { status: 404 });

    const campaign = await prisma.emailCampaign.create({
      data: {
        brandId,
        subject: data.subject,
        body: data.body,
        recipientTag: data.recipientTag ?? null,
        status: data.status,
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
      },
    });

    return NextResponse.json({ campaign }, { status: 201 });
  } catch (e) {
    console.error("EmailCampaigns POST error:", e);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const userId = (session.user as { id: string }).id;
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id gerekli" }, { status: 400 });

  const campaign = await prisma.emailCampaign.findUnique({ where: { id }, include: { brand: true } });
  if (!campaign || campaign.brand.ownerId !== userId) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
  if (campaign.status === "SENT" || campaign.status === "SENDING") return NextResponse.json({ error: "Gönderilmiş kampanya silinemez" }, { status: 400 });

  await prisma.emailCampaign.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
