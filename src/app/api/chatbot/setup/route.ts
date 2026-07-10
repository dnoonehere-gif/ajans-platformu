import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { getBrandPlanFeatures } from "@/lib/plan-guard";

const schema = z.object({
  brandId: z.string(),
  name: z.string().min(1).max(50).optional(),
  systemPrompt: z.string().max(2000).optional(),
  isActive: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Geçersiz veri" }, { status: 400 });

  const { brandId, ...data } = parsed.data;

  const brand = await prisma.brand.findFirst({
    where: { id: brandId, ownerId: (session.user as { id: string }).id },
  });
  if (!brand) return NextResponse.json({ error: "Marka bulunamadı" }, { status: 404 });

  // Plan limiti: chatbot erişimi
  const features = await getBrandPlanFeatures(brandId);
  if (!features.chatbot) {
    return NextResponse.json({
      error: "Chatbot özelliği planınıza dahil değil. Daha yüksek bir plana geçin.",
      code: "PLAN_LIMIT_CHATBOT",
    }, { status: 403 });
  }

  const chatbot = await prisma.chatbot.upsert({
    where: { brandId },
    create: { brandId, name: data.name ?? "Asistan", ...data },
    update: data,
  });

  return NextResponse.json({ chatbot });
}
