import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireBrandPermission } from "@/lib/auth-guard";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ brandId: string; id: string }> }) {
  const { brandId, id } = await params;
  const check = await requireBrandPermission(brandId, "brand.write");
  if ("error" in check) return NextResponse.json({ error: check.error }, { status: check.status });

  const body = await req.json();
  const parsed = z.object({
    name:    z.string().min(2).optional(),
    address: z.string().optional(),
    phone:   z.string().optional(),
    lat:     z.number().optional().nullable(),
    lng:     z.number().optional().nullable(),
  }).safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });

  const branch = await prisma.branch.update({
    where: { id, brandId },
    data: parsed.data,
    include: { _count: { select: { employees: true } } },
  });

  return NextResponse.json({ branch });
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ brandId: string; id: string }> }) {
  const { brandId, id } = await params;
  const check = await requireBrandPermission(brandId, "brand.write");
  if ("error" in check) return NextResponse.json({ error: check.error }, { status: check.status });

  await prisma.branch.delete({ where: { id, brandId } });
  return NextResponse.json({ ok: true });
}
