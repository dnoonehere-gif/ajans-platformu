import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-guard";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1).nullish(),
  description: z.string().nullish(),
  price: z.number().nullish(),
  imageUrl: z.string().nullish(),
  isAvailable: z.boolean().nullish(),
  isPopular: z.boolean().nullish(),
  allergens: z.array(z.string()).nullish(),
  categoryId: z.string().nullish(),
});

export async function PUT(req: NextRequest, { params }: { params: Promise<{ brandId: string; id: string }> }) {
  const { id } = await params;
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });

  const data = Object.fromEntries(Object.entries(parsed.data).filter(([, v]) => v !== undefined));
  const item = await prisma.menuItem.update({ where: { id }, data });
  return NextResponse.json({ item });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ brandId: string; id: string }> }) {
  const { id } = await params;
  const user = await getAuthUser(_req);
  if (!user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  await prisma.menuItem.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
