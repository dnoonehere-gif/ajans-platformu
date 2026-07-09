import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-guard";
import { z } from "zod";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ brandId: string }> }) {
  const { brandId } = await params;
  const user = await getAuthUser(_req);
  if (!user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const menu = await prisma.menu.findUnique({
    where: { brandId },
    include: {
      categories: {
        orderBy: { order: "asc" },
        include: { items: { orderBy: { order: "asc" } } },
      },
    },
  });
  return NextResponse.json({ menu });
}

const schema = z.object({
  title: z.string().min(1).nullish(),
  description: z.string().nullish(),
  currency: z.string().nullish(),
  isPublished: z.boolean().nullish(),
  theme: z.enum(["modern", "classic", "minimal"]).nullish(),
});

export async function PUT(req: NextRequest, { params }: { params: Promise<{ brandId: string }> }) {
  const { brandId } = await params;
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });

  const data = Object.fromEntries(Object.entries(parsed.data).filter(([, v]) => v !== undefined && v !== null)) as Record<string, string | boolean>;

  const menu = await prisma.menu.upsert({
    where: { brandId },
    create: { brandId, ...data },
    update: data,
  });
  return NextResponse.json({ menu });
}
