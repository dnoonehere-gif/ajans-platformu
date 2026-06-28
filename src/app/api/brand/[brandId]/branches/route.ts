import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireBrandPermission } from "@/lib/auth-guard";

export async function GET(_: NextRequest, { params }: { params: Promise<{ brandId: string }> }) {
  const { brandId } = await params;
  const check = await requireBrandPermission(brandId, "brand.read");
  if ("error" in check) return NextResponse.json({ error: check.error }, { status: check.status });

  const branches = await prisma.branch.findMany({
    where: { brandId },
    orderBy: { createdAt: "asc" },
    include: { _count: { select: { employees: true } } },
  });

  return NextResponse.json({ branches });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ brandId: string }> }) {
  const { brandId } = await params;
  const check = await requireBrandPermission(brandId, "brand.write");
  if ("error" in check) return NextResponse.json({ error: check.error }, { status: check.status });

  const body = await req.json();
  const parsed = z.object({
    name:    z.string().min(2, "Şube adı en az 2 karakter olmalı"),
    address: z.string().optional(),
    phone:   z.string().optional(),
    lat:     z.number().optional(),
    lng:     z.number().optional(),
  }).safeParse(body);

  if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });

  const branch = await prisma.branch.create({
    data: { brandId, ...parsed.data },
    include: { _count: { select: { employees: true } } },
  });

  return NextResponse.json({ branch }, { status: 201 });
}
