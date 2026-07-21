import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { getBrandPlanFeatures } from "@/lib/plan-guard";

export async function POST(req: NextRequest, { params }: { params: Promise<{ brandId: string }> }) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { brandId } = await params;

  const website = await prisma.website.findFirst({
    where: { brandId, brand: { ownerId: user.id } },
  });
  if (!website) return NextResponse.json({ error: "Site bulunamadı" }, { status: 404 });

  // Yayından kaldırmaya her zaman izin ver; yayına almak abonelik gerektirir
  if (!website.isPublished) {
    const features = await getBrandPlanFeatures(brandId);
    if (!features.website) {
      return NextResponse.json({
        error: "Siteyi yayınlamak için aktif bir aboneliğe ihtiyacınız var.",
        upgrade: true,
      }, { status: 403 });
    }
  }

  const updated = await prisma.website.update({
    where: { id: website.id },
    data: { isPublished: !website.isPublished },
  });

  return NextResponse.json({ isPublished: updated.isPublished });
}
