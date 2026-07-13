import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const userId = (session.user as { id: string }).id;
  const { searchParams } = new URL(req.url);
  const brandId = searchParams.get("brandId");
  const status = searchParams.get("status");
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = 20;

  const brands = await prisma.brand.findMany({
    where: { ownerId: userId, ...(brandId ? { id: brandId } : {}) },
    select: { id: true, name: true },
  });
  if (brands.length === 0) return NextResponse.json({ invoices: [], total: 0, stats: null });

  const brandIds = brands.map((b) => b.id);
  const brandMap = Object.fromEntries(brands.map((b) => [b.id, b.name]));

  const where = {
    subscription: { brandId: { in: brandIds } },
    ...(status ? { status: status as "PENDING" | "PAID" | "FAILED" | "REFUNDED" } : {}),
  };

  const [invoices, total, stats] = await Promise.all([
    prisma.invoice.findMany({
      where,
      include: { subscription: { select: { brandId: true, plan: { select: { name: true, slug: true } } } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.invoice.count({ where }),
    prisma.invoice.groupBy({
      by: ["status"],
      where: { subscription: { brandId: { in: brandIds } } },
      _count: true,
      _sum: { amountCents: true },
    }),
  ]);

  const statsMap: Record<string, { count: number; totalCents: number }> = {};
  stats.forEach((s) => {
    statsMap[s.status] = { count: s._count, totalCents: s._sum.amountCents ?? 0 };
  });

  const enriched = invoices.map((inv) => ({
    id: inv.id,
    amountCents: inv.amountCents,
    currency: inv.currency,
    status: inv.status,
    provider: inv.provider,
    providerRef: inv.providerRef,
    paidAt: inv.paidAt,
    createdAt: inv.createdAt,
    brandName: brandMap[inv.subscription.brandId] ?? "—",
    planName: inv.subscription.plan.name,
  }));

  return NextResponse.json({
    invoices: enriched,
    total,
    page,
    pages: Math.ceil(total / limit),
    stats: statsMap,
  });
}
