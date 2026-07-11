import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createSchema = z.object({
  brandId: z.string(),
  platform: z.enum(["INSTAGRAM", "FACEBOOK", "LINKEDIN", "TWITTER"]),
  content: z.string().min(1).max(5000),
  mediaUrl: z.string().url().optional().nullable(),
  scheduledAt: z.string().datetime(),
  status: z.enum(["DRAFT", "SCHEDULED"]).default("SCHEDULED"),
});

async function hasSocialAccess(userId: string, brandId: string): Promise<boolean> {
  const brand = await prisma.brand.findFirst({
    where: { id: brandId, ownerId: userId },
    include: { subscriptions: { where: { status: "ACTIVE" }, include: { plan: true }, take: 1 } },
  });
  if (!brand) return false;
  const features = brand.subscriptions[0]?.plan?.features as Record<string, unknown> | undefined;
  return features?.socialMedia === true;
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const userId = (session.user as { id: string }).id;
  const brandId = req.nextUrl.searchParams.get("brandId");
  if (!brandId) return NextResponse.json({ error: "brandId gerekli" }, { status: 400 });

  const hasAccess = await hasSocialAccess(userId, brandId);
  if (!hasAccess) return NextResponse.json({ error: "Bu özellik Ajans planına özeldir" }, { status: 403 });

  const posts = await prisma.socialPost.findMany({
    where: { brandId },
    orderBy: { scheduledAt: "asc" },
    take: 100,
  });

  return NextResponse.json({ posts });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const userId = (session.user as { id: string }).id;
  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Geçersiz veri", details: parsed.error.flatten() }, { status: 400 });

  const { brandId, ...data } = parsed.data;
  const hasAccess = await hasSocialAccess(userId, brandId);
  if (!hasAccess) return NextResponse.json({ error: "Bu özellik Ajans planına özeldir" }, { status: 403 });

  const post = await prisma.socialPost.create({
    data: { brandId, ...data, scheduledAt: new Date(data.scheduledAt) },
  });

  return NextResponse.json({ post }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const userId = (session.user as { id: string }).id;
  const postId = req.nextUrl.searchParams.get("id");
  if (!postId) return NextResponse.json({ error: "id gerekli" }, { status: 400 });

  const post = await prisma.socialPost.findUnique({ where: { id: postId }, include: { brand: true } });
  if (!post || post.brand.ownerId !== userId) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });

  await prisma.socialPost.delete({ where: { id: postId } });
  return NextResponse.json({ success: true });
}
