import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const STAGES = ["NEW", "CONTACTED", "QUALIFIED", "PROPOSAL", "WON", "LOST"] as const;

const createSchema = z.object({
  brandId: z.string(),
  name: z.string().min(1).max(200),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  company: z.string().optional().nullable(),
  source: z.string().optional().nullable(),
  stage: z.enum(STAGES).default("NEW"),
  value: z.number().int().optional().nullable(),
  notes: z.string().optional().nullable(),
});

const updateSchema = z.object({
  id: z.string(),
  stage: z.enum(STAGES).optional(),
  notes: z.string().optional().nullable(),
  value: z.number().int().optional().nullable(),
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

    const leads = await prisma.crmLead.findMany({
      where: { brandId },
      orderBy: { updatedAt: "desc" },
      take: 200,
    });

    return NextResponse.json({ leads });
  } catch (e) {
    console.error("CRM GET error:", e);
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
    if (!parsed.success) return NextResponse.json({ error: "Geçersiz veri" }, { status: 400 });

    const { brandId, ...data } = parsed.data;
    const brand = await prisma.brand.findFirst({ where: { id: brandId, ownerId: userId } });
    if (!brand) return NextResponse.json({ error: "Marka bulunamadı" }, { status: 404 });

    const lead = await prisma.crmLead.create({ data: { brandId, ...data } });
    return NextResponse.json({ lead }, { status: 201 });
  } catch (e) {
    console.error("CRM POST error:", e);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const userId = (session.user as { id: string }).id;
  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Geçersiz veri" }, { status: 400 });

  const { id, ...data } = parsed.data;
  const lead = await prisma.crmLead.findUnique({ where: { id }, include: { brand: true } });
  if (!lead || lead.brand.ownerId !== userId) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });

  const updated = await prisma.crmLead.update({ where: { id }, data });
  return NextResponse.json({ lead: updated });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const userId = (session.user as { id: string }).id;
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id gerekli" }, { status: 400 });

  const lead = await prisma.crmLead.findUnique({ where: { id }, include: { brand: true } });
  if (!lead || lead.brand.ownerId !== userId) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });

  await prisma.crmLead.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
