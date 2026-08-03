import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireBrandPermission } from "@/lib/auth-guard";

/**
 * Çalışan yönetimi.
 *
 * Employee modeli ve şube kartlarındaki çalışan sayacı vardı ama çalışan
 * ekleyecek hiçbir uç yoktu; bu yüzden "Toplam Çalışan" kalıcı olarak 0
 * görünüyor ve düzeltilemiyordu.
 */

const employeeSchema = z.object({
  fullName: z.string().min(2, "Ad soyad en az 2 karakter olmalı"),
  title: z.string().optional(),
  email: z.string().email("Geçerli bir e-posta girin").optional().or(z.literal("")),
  phone: z.string().optional(),
  /** Hangi şubede çalıştığı. Boş bırakılabilir (merkez/atanmamış). */
  branchId: z.string().optional().or(z.literal("")),
});

export async function GET(_: NextRequest, { params }: { params: Promise<{ brandId: string }> }) {
  const { brandId } = await params;
  const check = await requireBrandPermission(brandId, "brand.read");
  if ("error" in check) return NextResponse.json({ error: check.error }, { status: check.status });

  const employees = await prisma.employee.findMany({
    where: { brandId },
    orderBy: { createdAt: "asc" },
    include: { branch: { select: { id: true, name: true } } },
  });

  return NextResponse.json({ employees });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ brandId: string }> }) {
  const { brandId } = await params;
  const check = await requireBrandPermission(brandId, "brand.write");
  if ("error" in check) return NextResponse.json({ error: check.error }, { status: check.status });

  const parsed = employeeSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Geçersiz veri" }, { status: 400 });
  }
  const { fullName, title, email, phone, branchId } = parsed.data;

  // Şube başka bir markaya aitse atama reddedilir.
  if (branchId) {
    const branch = await prisma.branch.findFirst({ where: { id: branchId, brandId }, select: { id: true } });
    if (!branch) return NextResponse.json({ error: "Şube bulunamadı" }, { status: 404 });
  }

  const employee = await prisma.employee.create({
    data: {
      brandId,
      fullName,
      title: title || null,
      email: email || null,
      phone: phone || null,
      branchId: branchId || null,
    },
    include: { branch: { select: { id: true, name: true } } },
  });

  return NextResponse.json({ employee }, { status: 201 });
}
