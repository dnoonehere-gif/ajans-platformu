import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireGlobalPermission } from "@/lib/auth-guard";

export async function POST(req: NextRequest) {
  const check = await requireGlobalPermission("admin.*");
  if ("error" in check) return NextResponse.json({ error: check.error }, { status: check.status });

  const { email } = await req.json();
  if (!email) return NextResponse.json({ error: "email gerekli" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });

  await prisma.user.update({
    where: { id: user.id },
    data: { globalRole: "SUPER_ADMIN" },
  });

  const brand = await prisma.brand.findFirst({ where: { ownerId: user.id } });
  if (!brand) return NextResponse.json({ error: "Kullanıcının markası yok" }, { status: 404 });

  const ajansPlan = await prisma.plan.findUnique({ where: { slug: "ajans" } });
  if (!ajansPlan) return NextResponse.json({ error: "Ajans planı bulunamadı" }, { status: 404 });

  await prisma.subscription.updateMany({
    where: { brandId: brand.id, status: { in: ["ACTIVE", "TRIALING"] } },
    data: { status: "CANCELED" },
  });

  const endsAt = new Date();
  endsAt.setFullYear(endsAt.getFullYear() + 10);

  await prisma.subscription.create({
    data: {
      brandId: brand.id,
      planId: ajansPlan.id,
      status: "ACTIVE",
      startedAt: new Date(),
      endsAt,
      provider: "MANUAL",
    },
  });

  return NextResponse.json({ ok: true, role: "SUPER_ADMIN", plan: "ajans", brand: brand.name });
}
