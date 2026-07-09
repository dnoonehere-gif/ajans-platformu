import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-guard";
import { z } from "zod";

const schema = z.object({
  categoryId: z.string(),
  name: z.string().min(1),
  description: z.string().nullish(),
  price: z.number().nullish(),
  imageUrl: z.string().url().nullish(),
  isAvailable: z.boolean().nullish(),
  isPopular: z.boolean().nullish(),
  allergens: z.array(z.string()).nullish(),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ brandId: string }> }) {
  await params;
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });

  const count = await prisma.menuItem.count({ where: { categoryId: parsed.data.categoryId } });
  const item = await prisma.menuItem.create({
    data: {
      categoryId: parsed.data.categoryId,
      name: parsed.data.name,
      description: parsed.data.description ?? null,
      price: parsed.data.price ?? null,
      imageUrl: parsed.data.imageUrl ?? null,
      isAvailable: parsed.data.isAvailable ?? true,
      isPopular: parsed.data.isPopular ?? false,
      allergens: parsed.data.allergens ?? [],
      order: count,
    },
  });
  return NextResponse.json({ item }, { status: 201 });
}
