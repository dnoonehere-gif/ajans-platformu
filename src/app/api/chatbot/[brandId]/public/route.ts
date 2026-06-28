import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ brandId: string }> }) {
  const { brandId } = await params;

  const chatbot = await prisma.chatbot.findFirst({
    where: { brandId, isActive: true },
    select: {
      id: true,
      name: true,
      brand: { select: { name: true, primaryColor: true, logoUrl: true } },
    },
  });

  if (!chatbot) return NextResponse.json({ error: "Chatbot bulunamadı" }, { status: 404 });

  return NextResponse.json({
    botName: chatbot.name,
    brandName: chatbot.brand.name,
    primaryColor: chatbot.brand.primaryColor ?? "#6366f1",
    logoUrl: chatbot.brand.logoUrl,
  });
}
