import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-guard";
import { generateText } from "@/server/ai/anthropic";

// POST { name, category? } → iştah açıcı ürün açıklaması
export async function POST(req: NextRequest, { params }: { params: Promise<{ brandId: string }> }) {
  try {
    const { brandId } = await params;
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

    const { name, category } = await req.json();
    if (!name) return NextResponse.json({ error: "Ürün adı gerekli" }, { status: 400 });

    const brand = await prisma.brand.findFirst({ where: { id: brandId, ownerId: user.id } });
    if (!brand) return NextResponse.json({ error: "Marka bulunamadı" }, { status: 404 });

    const description = await generateText({
      prompt: `"${name}" adlı menü ürünü için${category ? ` (kategori: ${category})` : ""} iştah açıcı, kısa bir menü açıklaması yaz.

Kurallar:
- Türkçe, en fazla 15 kelime
- İçerik ve lezzeti öne çıkar, abartısız
- Sadece açıklama metnini döndür, tırnak işareti kullanma`,
      maxTokens: 100,
      model: "claude-haiku-4-5-20251001",
    });

    return NextResponse.json({ description: description.trim().replace(/^["']|["']$/g, "") });
  } catch (e) {
    console.error("Menu AI description error:", e);
    return NextResponse.json({ error: "Açıklama oluşturulamadı" }, { status: 500 });
  }
}
