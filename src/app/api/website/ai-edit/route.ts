import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { editWebsiteWithAI } from "@/server/ai/website-editor";
import { getBrandPlanFeatures } from "@/lib/plan-guard";
import { z } from "zod";

const schema = z.object({
  websiteId: z.string(),
  instruction: z.string().min(1),
  blocks: z.array(z.any()),
  history: z.array(z.object({ role: z.enum(["user", "ai"]), content: z.string() })).optional().default([]),
});

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Geçersiz veri" }, { status: 400 });

  const { websiteId, instruction, blocks, history } = parsed.data;

  const website = await prisma.website.findFirst({
    where: { id: websiteId },
    include: { brand: { select: { id: true, name: true, ownerId: true } } },
  });

  if (!website || website.brand.ownerId !== user.id) {
    return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
  }

  const features = await getBrandPlanFeatures(website.brand.id);
  if (!features.website) {
    return NextResponse.json({
      error: "Website düzenleme özelliği aktif aboneliğinizde bulunmuyor.",
      upgrade: true,
    }, { status: 403 });
  }

  const updatedBlocks = await editWebsiteWithAI(blocks, instruction, website.brand.name, history);
  return NextResponse.json({ blocks: updatedBlocks });
}
