import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireBrandPermission } from "@/lib/auth-guard";
import { z } from "zod";
import type { BrandRole } from "@prisma/client";

const BRAND_ROLES: BrandRole[] = ["OWNER", "MANAGER", "EDITOR", "VIEWER"];

export async function GET(_req: NextRequest, { params }: { params: Promise<{ brandId: string }> }) {
  const { brandId } = await params;
  const check = await requireBrandPermission(brandId, "brand.read");
  if ("error" in check) return NextResponse.json({ error: check.error }, { status: check.status });

  const [owner, members] = await Promise.all([
    prisma.brand.findUnique({
      where: { id: brandId },
      select: { owner: { select: { id: true, name: true, email: true, avatarUrl: true, globalRole: true } } },
    }),
    prisma.brandMember.findMany({
      where: { brandId },
      include: { user: { select: { id: true, name: true, email: true, avatarUrl: true, globalRole: true } } },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  return NextResponse.json({
    owner: owner?.owner ? { ...owner.owner, brandRole: "OWNER" as BrandRole, isOwner: true } : null,
    members: members.map((m) => ({ ...m.user, brandRole: m.role, memberId: m.id, isOwner: false })),
  });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ brandId: string }> }) {
  const { brandId } = await params;
  const check = await requireBrandPermission(brandId, "member.write");
  if ("error" in check) return NextResponse.json({ error: check.error }, { status: check.status });

  const body = await req.json();
  const parsed = z.object({
    email: z.string().email(),
    role: z.enum(BRAND_ROLES as [BrandRole, ...BrandRole[]]).default("VIEWER"),
  }).safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Geçersiz veri" }, { status: 400 });

  const { email, role } = parsed.data;

  const targetUser = await prisma.user.findUnique({ where: { email } });
  if (!targetUser) return NextResponse.json({ error: "Bu e-posta ile kayıtlı kullanıcı bulunamadı" }, { status: 404 });

  // Marka sahibi eklenemez
  const brand = await prisma.brand.findUnique({ where: { id: brandId }, select: { ownerId: true } });
  if (brand?.ownerId === targetUser.id) {
    return NextResponse.json({ error: "Marka sahibi zaten üye" }, { status: 409 });
  }

  const member = await prisma.brandMember.upsert({
    where: { brandId_userId: { brandId, userId: targetUser.id } },
    create: { brandId, userId: targetUser.id, role },
    update: { role },
    include: { user: { select: { id: true, name: true, email: true, avatarUrl: true, globalRole: true } } },
  });

  return NextResponse.json({
    member: { ...member.user, brandRole: member.role, memberId: member.id, isOwner: false },
  });
}
