import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-guard";
import { getBrandPlanFeatures } from "@/lib/plan-guard";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const brandId = req.nextUrl.searchParams.get("brandId");
  if (!brandId) return NextResponse.json({ error: "brandId gerekli" }, { status: 400 });

  const brand = await prisma.brand.findFirst({ where: { id: brandId, ownerId: user.id } });
  if (!brand) return NextResponse.json({ error: "Marka bulunamadı" }, { status: 404 });

  const features = await getBrandPlanFeatures(brandId);
  return NextResponse.json({ features });
}
