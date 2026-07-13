import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { prisma } from "@/lib/prisma";
import { generateText } from "@/server/ai/anthropic";

// POST { brandId, reviewId, tone? } → AI yanıt önerisi
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

    const userId = (session.user as { id: string }).id;
    const { brandId, reviewId, tone } = await req.json();
    if (!brandId || !reviewId) return NextResponse.json({ error: "brandId ve reviewId gerekli" }, { status: 400 });

    const brand = await prisma.brand.findFirst({ where: { id: brandId, ownerId: userId } });
    if (!brand) return NextResponse.json({ error: "Marka bulunamadı" }, { status: 404 });

    const review = await prisma.review.findFirst({ where: { id: reviewId, brandId } });
    if (!review) return NextResponse.json({ error: "Yorum bulunamadı" }, { status: 404 });

    const toneInstruction =
      tone === "formal" ? "Resmi ve kurumsal bir dille yaz."
      : tone === "friendly" ? "Samimi ve sıcak bir dille yaz."
      : "Profesyonel ama içten bir dille yaz.";

    const isNegative = review.rating <= 2;

    const prompt = `${brand.name} işletmesinin Google'daki müşteri yorumuna yanıt taslağı yaz.

Yorum (${review.rating}/5 yıldız)${review.authorName ? ` — ${review.authorName}` : ""}:
"${review.text ?? "(sadece puan, metin yok)"}"

Kurallar:
- Türkçe yaz. ${toneInstruction}
- ${isNegative
    ? "Olumsuz yorum: önce özür dile ve anlayış göster, sorunu ciddiye aldığını belirt, telafi veya iletişim daveti sun. Savunmacı olma."
    : "Olumlu yorum: teşekkür et, öne çıkan detaya değin, tekrar bekleriz mesajı ver."}
- İşletme sahibi ağzından yaz ("biz" dili).
- 2-4 cümle, en fazla 60 kelime. Emoji kullanma. Sadece yanıt metnini döndür, başka hiçbir şey yazma.`;

    const reply = await generateText({
      prompt,
      maxTokens: 300,
      model: "claude-haiku-4-5-20251001",
    });

    return NextResponse.json({ reply: reply.trim() });
  } catch (e) {
    console.error("Reply suggestion error:", e);
    return NextResponse.json({ error: "Yanıt önerisi oluşturulamadı" }, { status: 500 });
  }
}
