import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireBrandPermission } from "@/lib/auth-guard";
import { z } from "zod";
import type { BrandRole } from "@prisma/client";

const BRAND_ROLES: BrandRole[] = ["MANAGER", "EDITOR", "VIEWER"];

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ brandId: string; userId: string }> }
) {
  const { brandId, userId } = await params;
  const check = await requireBrandPermission(brandId, "member.write");
  if ("error" in check) return NextResponse.json({ error: check.error }, { status: check.status });

  const body = await req.json();
  const parsed = z.object({
    role: z.enum(BRAND_ROLES as [BrandRole, ...BrandRole[]]),
  }).safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Geçersiz rol" }, { status: 400 });

  const member = await prisma.brandMember.findUnique({
    where: { brandId_userId: { brandId, userId } },
  });
  if (!member) return NextResponse.json({ error: "Üye bulunamadı" }, { status: 404 });

  const updated = await prisma.brandMember.update({
    where: { brandId_userId: { brandId, userId } },
    data: { role: parsed.data.role },
  });

  return NextResponse.json({ role: updated.role });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ brandId: string; userId: string }> }
) {
  const { brandId, userId } = await params;
  const check = await requireBrandPermission(brandId, "member.write");
  if ("error" in check) return NextResponse.json({ error: check.error }, { status: check.status });

  // Marka sahibi çıkarılamaz
  const brand = await prisma.brand.findUnique({ where: { id: brandId }, select: { ownerId: true } });
  if (brand?.ownerId === userId) {
    return NextResponse.json({ error: "Marka sahibi çıkarılamaz" }, { status: 400 });
  }

  await prisma.brandMember.deleteMany({ where: { brandId, userId } });
  return NextResponse.json({ ok: true });
}
