import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const addSchema = z.object({
  brandId: z.string(),
  contacts: z.array(z.object({
    email: z.string().email(),
    name: z.string().optional(),
    tags: z.array(z.string()).optional(),
  })).min(1).max(500),
});

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const userId = (session.user as { id: string }).id;
  const brandId = req.nextUrl.searchParams.get("brandId");
  if (!brandId) return NextResponse.json({ error: "brandId gerekli" }, { status: 400 });

  const brand = await prisma.brand.findFirst({ where: { id: brandId, ownerId: userId } });
  if (!brand) return NextResponse.json({ error: "Marka bulunamadı" }, { status: 404 });

  const contacts = await prisma.emailContact.findMany({
    where: { brandId },
    orderBy: { createdAt: "desc" },
    take: 500,
  });

  return NextResponse.json({ contacts });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const userId = (session.user as { id: string }).id;
  const body = await req.json();
  const parsed = addSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Geçersiz veri" }, { status: 400 });

  const { brandId, contacts } = parsed.data;
  const brand = await prisma.brand.findFirst({ where: { id: brandId, ownerId: userId } });
  if (!brand) return NextResponse.json({ error: "Marka bulunamadı" }, { status: 404 });

  let added = 0;
  for (const c of contacts) {
    try {
      await prisma.emailContact.upsert({
        where: { brandId_email: { brandId, email: c.email } },
        update: { name: c.name, tags: c.tags ?? [] },
        create: { brandId, email: c.email, name: c.name, tags: c.tags ?? [] },
      });
      added++;
    } catch { /* duplicate — skip */ }
  }

  return NextResponse.json({ added, total: contacts.length });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const userId = (session.user as { id: string }).id;
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id gerekli" }, { status: 400 });

  const contact = await prisma.emailContact.findUnique({ where: { id }, include: { brand: true } });
  if (!contact || contact.brand.ownerId !== userId) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });

  await prisma.emailContact.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
