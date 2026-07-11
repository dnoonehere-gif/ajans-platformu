import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const brandId = req.nextUrl.searchParams.get("brandId");
  if (!brandId) return NextResponse.json({ error: "brandId gerekli" }, { status: 400 });

  const brand = await prisma.brand.findFirst({ where: { id: brandId, ownerId: user.id } });
  if (!brand) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });

  const sub = await prisma.subscription.findFirst({
    where: { brandId },
    orderBy: { createdAt: "desc" },
  });

  if (!sub) return NextResponse.json({ state: "none" });

  if (sub.status === "ACTIVE") return NextResponse.json({ state: "active" });

  if (sub.status === "TRIALING") return NextResponse.json({ state: "active" });

  if (sub.status === "PAST_DUE" || sub.status === "EXPIRED" || sub.status === "CANCELED") {
    return NextResponse.json({ state: "suspended" });
  }

  return NextResponse.json({ state: "none" });
}
