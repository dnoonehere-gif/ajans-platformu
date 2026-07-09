import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-guard";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1),
  description: z.string().nullish(),
  emoji: z.string().nullish(),
  order: z.number().int().nullish(),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ brandId: string }> }) {
  const { brandId } = await params;
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });

  let menu = await prisma.menu.findUnique({ where: { brandId } });
  if (!menu) menu = await prisma.menu.create({ data: { brandId } });

  const count = await prisma.menuCategory.count({ where: { menuId: menu.id } });
  const category = await prisma.menuCategory.create({
    data: {
      menuId: menu.id,
      name: parsed.data.name,
      description: parsed.data.description ?? null,
      emoji: parsed.data.emoji ?? null,
      order: parsed.data.order ?? count,
    },
    include: { items: true },
  });
  return NextResponse.json({ category }, { status: 201 });
}
