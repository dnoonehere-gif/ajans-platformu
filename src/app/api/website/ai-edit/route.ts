import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { prisma } from "@/lib/prisma";
import { editWebsiteWithAI } from "@/server/ai/website-editor";
import { z } from "zod";

const schema = z.object({
  websiteId: z.string(),
  instruction: z.string().min(1),
  blocks: z.array(z.any()),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Geçersiz veri" }, { status: 400 });

  const { websiteId, instruction, blocks } = parsed.data;

  const website = await prisma.website.findFirst({
    where: { id: websiteId },
    include: { brand: { select: { name: true, ownerId: true } } },
  });

  if (!website || website.brand.ownerId !== (session.user as { id: string }).id) {
    return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
  }

  const updatedBlocks = await editWebsiteWithAI(blocks, instruction, website.brand.name);
  return NextResponse.json({ blocks: updatedBlocks });
}
