import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-guard";

export async function GET() {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const [owned, memberships] = await Promise.all([
    prisma.brand.findMany({
      where: { ownerId: user.id, isActive: true },
      select: { id: true, name: true, slug: true, logoUrl: true, primaryColor: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.brandMember.findMany({
      where: { userId: user.id },
      select: {
        role: true,
        brand: { select: { id: true, name: true, slug: true, logoUrl: true, primaryColor: true, isActive: true } },
      },
    }),
  ]);

  const memberBrands = memberships
    .filter((m) => m.brand.isActive)
    .map((m) => ({ ...m.brand, role: m.role }));

  const ownedIds = new Set(owned.map((b) => b.id));
  const all = [
    ...owned.map((b) => ({ ...b, role: "OWNER" as const })),
    ...memberBrands.filter((b) => !ownedIds.has(b.id)),
  ];

  return NextResponse.json({ brands: all });
}
