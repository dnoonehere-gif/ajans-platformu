import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-guard";

export async function POST(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const body = await req.json();
  const parsed = z.object({
    name: z.string().min(2, "Marka adı en az 2 karakter olmalı"),
    slug: z.string().min(2).regex(/^[a-z0-9-]+$/, "Slug sadece küçük harf, rakam ve tire içerebilir"),
    description: z.string().optional(),
    email:       z.string().email().optional().or(z.literal("")),
    phone:       z.string().optional(),
    address:     z.string().optional(),
    instagram:   z.string().optional(),
    whatsapp:    z.string().optional(),
    sector:      z.string().optional(),
    logoUrl:     z.string().url().optional(),
  }).safeParse(body);

  if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });

  const existing = await prisma.brand.findUnique({ where: { slug: parsed.data.slug } });
  if (existing) return NextResponse.json({ error: "Bu slug zaten kullanılıyor" }, { status: 409 });

  const brand = await prisma.brand.create({
    data: {
      ownerId:     user.id,
      name:        parsed.data.name,
      slug:        parsed.data.slug,
      description: parsed.data.description || null,
      email:       parsed.data.email       || null,
      phone:       parsed.data.phone       || null,
      address:     parsed.data.address     || null,
      instagram:   parsed.data.instagram   || null,
      whatsapp:    parsed.data.whatsapp    || null,
      sector:      parsed.data.sector      || null,
      logoUrl:     parsed.data.logoUrl     || null,
    },
  });

  return NextResponse.json({ brand }, { status: 201 });
}
