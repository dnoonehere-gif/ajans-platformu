import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ brandId: string }> }) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { brandId } = await params;

  // brandId parametresi aslında websiteId de olabilir (editor sayfası websiteId ile çağırır)
  const website = await prisma.website.findFirst({
    where: {
      OR: [
        { brandId, brand: { ownerId: user.id } },
        { id: brandId, brand: { ownerId: user.id } },
      ],
    },
    include: { pages: { orderBy: { order: "asc" } }, brand: { select: { slug: true } } },
  });

  if (!website) return NextResponse.json({ error: "Site bulunamadı" }, { status: 404 });
  return NextResponse.json({ website });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ brandId: string }> }) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { brandId } = await params;
  const body = await req.json();

  const website = await prisma.website.findFirst({
    where: { brandId, brand: { ownerId: user.id } },
    include: { pages: true },
  });
  if (!website) return NextResponse.json({ error: "Site bulunamadı" }, { status: 404 });

  if (body.pageId && body.blocks) {
    await prisma.websitePage.update({
      where: { id: body.pageId },
      data: { blocks: body.blocks },
    });
  }

  if (body.title !== undefined) {
    await prisma.website.update({ where: { id: website.id }, data: { title: body.title } });
  }

  const updated = await prisma.website.findUnique({
    where: { id: website.id },
    include: { pages: { orderBy: { order: "asc" } } },
  });
  return NextResponse.json({ website: updated });
}
