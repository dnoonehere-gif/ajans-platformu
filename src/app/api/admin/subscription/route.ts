import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireGlobalPermission } from "@/lib/auth-guard";
import { auditFromRequest } from "@/server/audit/log";

/**
 * Bir kullanıcıya plan (abonelik) tanımlar veya iptal eder.
 *
 * ÖNEMLİ: Bu rota kullanıcının ROLÜNÜ DEĞİŞTİRMEZ. Mevcut /api/admin/promote
 * rotası planla birlikte SUPER_ADMIN de veriyor; dış kişilere (ortak, test
 * kullanıcısı) plan tanımlarken o rota kullanılmamalı — tüm admin paneline
 * erişim açar. Bu rota yalnızca abonelik oluşturur.
 */

const assignSchema = z.object({
  email: z.string().email(),
  planSlug: z.string().min(1),
  // 0 = süresiz (50 yıl)
  months: z.number().int().min(0).max(120),
  brandId: z.string().optional(), // birden fazla markası varsa hangisi
});

// Hangi markaya uygulanacağını çözer
async function resolveBrand(userId: string, brandId?: string) {
  if (brandId) {
    return prisma.brand.findFirst({ where: { id: brandId, ownerId: userId } });
  }
  return prisma.brand.findFirst({ where: { ownerId: userId }, orderBy: { createdAt: "asc" } });
}

export async function POST(req: NextRequest) {
  const check = await requireGlobalPermission("admin.*");
  if ("error" in check) return NextResponse.json({ error: check.error }, { status: check.status });

  const parsed = assignSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }
  const { email, planSlug, months, brandId } = parsed.data;

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
    select: { id: true, email: true, name: true },
  });
  if (!user) return NextResponse.json({ error: "Bu e-posta ile kullanıcı bulunamadı" }, { status: 404 });

  const brand = await resolveBrand(user.id, brandId);
  if (!brand) {
    return NextResponse.json(
      { error: "Kullanıcının markası yok. Önce panelden bir marka oluşturması gerekiyor." },
      { status: 400 }
    );
  }

  const plan = await prisma.plan.findUnique({ where: { slug: planSlug } });
  if (!plan) return NextResponse.json({ error: "Plan bulunamadı" }, { status: 404 });

  // Mevcut aktif abonelikleri kapat (çift abonelik olmasın)
  await prisma.subscription.updateMany({
    where: { brandId: brand.id, status: { in: ["ACTIVE", "TRIALING"] } },
    data: { status: "CANCELED" },
  });

  const endsAt = new Date();
  if (months === 0) endsAt.setFullYear(endsAt.getFullYear() + 50);
  else endsAt.setMonth(endsAt.getMonth() + months);

  const sub = await prisma.subscription.create({
    data: {
      brandId: brand.id,
      planId: plan.id,
      status: "ACTIVE",
      startedAt: new Date(),
      endsAt,
      provider: null, // manuel tanımlandı, ödeme sağlayıcısı yok
    },
  });

  auditFromRequest("subscription.create", check.user.id, {
    entity: "Subscription",
    entityId: sub.id,
    metadata: { manual: true, email: user.email, brand: brand.name, plan: plan.name, months },
  }).catch(() => null);

  return NextResponse.json({
    ok: true,
    user: { email: user.email, name: user.name },
    brand: brand.name,
    plan: plan.name,
    endsAt,
    unlimited: months === 0,
  });
}

// Aktif aboneliği iptal eder
export async function DELETE(req: NextRequest) {
  const check = await requireGlobalPermission("admin.*");
  if ("error" in check) return NextResponse.json({ error: check.error }, { status: check.status });

  const email = new URL(req.url).searchParams.get("email");
  if (!email) return NextResponse.json({ error: "email gerekli" }, { status: 400 });

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
    select: { id: true, email: true },
  });
  if (!user) return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });

  const brands = await prisma.brand.findMany({ where: { ownerId: user.id }, select: { id: true } });
  const result = await prisma.subscription.updateMany({
    where: { brandId: { in: brands.map((b) => b.id) }, status: { in: ["ACTIVE", "TRIALING"] } },
    data: { status: "CANCELED" },
  });

  auditFromRequest("subscription.cancel", check.user.id, {
    entity: "User",
    entityId: user.id,
    metadata: { manual: true, email: user.email, canceled: result.count },
  }).catch(() => null);

  return NextResponse.json({ ok: true, canceled: result.count });
}

// Kullanıcının mevcut durumunu getirir (arayüzde önizleme için)
export async function GET(req: NextRequest) {
  const check = await requireGlobalPermission("admin.*");
  if ("error" in check) return NextResponse.json({ error: check.error }, { status: check.status });

  const email = new URL(req.url).searchParams.get("email");
  if (!email) return NextResponse.json({ error: "email gerekli" }, { status: 400 });

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
    select: {
      email: true, name: true, globalRole: true, emailVerified: true,
      ownedBrands: {
        select: {
          id: true, name: true,
          subscriptions: {
            where: { status: { in: ["ACTIVE", "TRIALING"] } },
            select: { status: true, endsAt: true, plan: { select: { name: true } } },
            orderBy: { createdAt: "desc" }, take: 1,
          },
        },
      },
    },
  });
  if (!user) return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });

  return NextResponse.json({ user });
}
