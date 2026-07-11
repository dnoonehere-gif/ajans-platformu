import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-guard";
import { z } from "zod";

const updateSchema = z.object({
  brandId: z.string(),
  agencyName: z.string().max(100).optional(),
  agencyLogoUrl: z.string().url().optional().nullable(),
  agencyFaviconUrl: z.string().url().optional().nullable(),
  customDomain: z.string().max(253).optional().nullable(),
  primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  footerText: z.string().max(200).optional().nullable(),
  hideNovelya: z.boolean().optional(),
  customCss: z.string().max(5000).optional().nullable(),
});

async function hasWhiteLabelAccess(userId: string, brandId: string): Promise<boolean> {
  const brand = await prisma.brand.findFirst({
    where: { id: brandId, ownerId: userId },
    include: { subscriptions: { where: { status: "ACTIVE" }, include: { plan: true }, take: 1 } },
  });
  if (!brand) return false;
  const plan = brand.subscriptions[0]?.plan;
  if (!plan) return false;
  const features = plan.features as Record<string, unknown>;
  return features?.whiteLabel === true;
}

export async function GET(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const brandId = req.nextUrl.searchParams.get("brandId");
  if (!brandId) return NextResponse.json({ error: "brandId gerekli" }, { status: 400 });

  const hasAccess = await hasWhiteLabelAccess(user.id, brandId);
  if (!hasAccess) return NextResponse.json({ error: "Bu özellik Ajans planına özeldir" }, { status: 403 });

  const wl = await prisma.whiteLabel.findUnique({ where: { brandId } });
  return NextResponse.json({ whiteLabel: wl });
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Geçersiz veri", details: parsed.error.flatten() }, { status: 400 });

  const { brandId, ...data } = parsed.data;
  const hasAccess = await hasWhiteLabelAccess(user.id, brandId);
  if (!hasAccess) return NextResponse.json({ error: "Bu özellik Ajans planına özeldir" }, { status: 403 });

  const wl = await prisma.whiteLabel.upsert({
    where: { brandId },
    update: data,
    create: { brandId, ...data },
  });

  return NextResponse.json({ whiteLabel: wl });
}
