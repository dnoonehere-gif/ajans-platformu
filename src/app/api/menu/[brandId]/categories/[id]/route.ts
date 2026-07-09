import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-guard";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1).nullish(),
  description: z.string().nullish(),
  emoji: z.string().nullish(),
  order: z.number().int().nullish(),
});

export async function PUT(req: NextRequest, { params }: { params: Promise<{ brandId: string; id: string }> }) {
  const { id } = await params;
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });

  const data = Object.fromEntries(Object.entries(parsed.data).filter(([, v]) => v !== undefined));
  const category = await prisma.menuCategory.update({ where: { id }, data, include: { items: true } });
  return NextResponse.json({ category });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ brandId: string; id: string }> }) {
  const { id } = await params;
  const user = await getAuthUser(_req);
  if (!user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  await prisma.menuCategory.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
