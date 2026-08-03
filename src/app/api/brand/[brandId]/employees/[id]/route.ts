import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireBrandPermission } from "@/lib/auth-guard";

const updateSchema = z.object({
  fullName: z.string().min(2, "Ad soyad en az 2 karakter olmalı").optional(),
  title: z.string().optional(),
  email: z.string().email("Geçerli bir e-posta girin").optional().or(z.literal("")),
  phone: z.string().optional(),
  branchId: z.string().optional().or(z.literal("")),
});

/** Çalışan bilgilerini günceller (şube değişikliği dahil). */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ brandId: string; id: string }> }
) {
  const { brandId, id } = await params;
  const check = await requireBrandPermission(brandId, "brand.write");
  if ("error" in check) return NextResponse.json({ error: check.error }, { status: check.status });

  const parsed = updateSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Geçersiz veri" }, { status: 400 });
  }

  // Çalışan gerçekten bu markaya mı ait — id tahmin edilerek başka markanın
  // kaydı değiştirilemesin.
  const mevcut = await prisma.employee.findFirst({ where: { id, brandId }, select: { id: true } });
  if (!mevcut) return NextResponse.json({ error: "Çalışan bulunamadı" }, { status: 404 });

  const { fullName, title, email, phone, branchId } = parsed.data;

  if (branchId) {
    const branch = await prisma.branch.findFirst({ where: { id: branchId, brandId }, select: { id: true } });
    if (!branch) return NextResponse.json({ error: "Şube bulunamadı" }, { status: 404 });
  }

  const employee = await prisma.employee.update({
    where: { id },
    data: {
      ...(fullName !== undefined ? { fullName } : {}),
      ...(title !== undefined ? { title: title || null } : {}),
      ...(email !== undefined ? { email: email || null } : {}),
      ...(phone !== undefined ? { phone: phone || null } : {}),
      ...(branchId !== undefined ? { branchId: branchId || null } : {}),
    },
    include: { branch: { select: { id: true, name: true } } },
  });

  return NextResponse.json({ employee });
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ brandId: string; id: string }> }
) {
  const { brandId, id } = await params;
  const check = await requireBrandPermission(brandId, "brand.write");
  if ("error" in check) return NextResponse.json({ error: check.error }, { status: check.status });

  const mevcut = await prisma.employee.findFirst({ where: { id, brandId }, select: { id: true } });
  if (!mevcut) return NextResponse.json({ error: "Çalışan bulunamadı" }, { status: 404 });

  await prisma.employee.delete({ where: { id } });
  return NextResponse.json({ deleted: true });
}
