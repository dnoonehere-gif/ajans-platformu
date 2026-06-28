import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const brandId = req.nextUrl.searchParams.get("brandId");
  if (!brandId) return NextResponse.json({ error: "brandId gerekli" }, { status: 400 });

  const profile = await prisma.googleBusinessProfile.findUnique({ where: { brandId } });
  const reviews = profile
    ? await prisma.review.findMany({
        where: { brandId, source: "GOOGLE" },
        orderBy: { createdAt: "desc" },
        take: 50,
      })
    : [];

  return NextResponse.json({ profile, reviews });
}
