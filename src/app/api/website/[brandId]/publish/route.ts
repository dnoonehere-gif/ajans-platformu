import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { prisma } from "@/lib/prisma";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ brandId: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { brandId } = await params;

  const website = await prisma.website.findFirst({
    where: { brandId, brand: { ownerId: (session.user as { id: string }).id } },
  });
  if (!website) return NextResponse.json({ error: "Site bulunamadı" }, { status: 404 });

  const updated = await prisma.website.update({
    where: { id: website.id },
    data: { isPublished: !website.isPublished },
  });

  return NextResponse.json({ isPublished: updated.isPublished });
}
