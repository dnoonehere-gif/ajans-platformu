import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { prisma } from "@/lib/prisma";
import { generateContent } from "@/server/ai/content-generator";
import { z } from "zod";

const schema = z.object({
  brandId: z.string(),
  sector: z.string().min(2),
  description: z.string().min(5),
  tone: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Geçersiz veri" }, { status: 400 });

  const { brandId, sector, description, tone } = parsed.data;

  const brand = await prisma.brand.findFirst({
    where: { id: brandId, ownerId: (session.user as { id: string }).id },
  });
  if (!brand) return NextResponse.json({ error: "Marka bulunamadı" }, { status: 404 });

  const generated = await generateContent("CONTENT_PLAN", {
    brandName: brand.name,
    sector,
    description,
    tone,
  });

  const item = await prisma.contentItem.create({
    data: {
      brandId,
      type: "CONTENT_PLAN",
      title: generated.title,
      body: generated.body,
      meta: generated.meta ?? {},
      createdById: (session.user as { id: string }).id,
    },
  });

  return NextResponse.json({ item, plan: generated.meta });
}
