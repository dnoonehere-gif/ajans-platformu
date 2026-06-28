import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { prisma } from "@/lib/prisma";

// POST /api/notifications/read  { id?: string }
// id verilmezse tüm bildirimleri okundu yap
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const userId = (session.user as { id: string }).id;

  const body = await req.json().catch(() => ({}));
  const { id } = body as { id?: string };

  if (id) {
    // Tek bildirim — sadece kullanıcının bildirimini güncelle
    await prisma.notification.updateMany({
      where: { id, userId },
      data: { status: "READ" },
    });
  } else {
    await prisma.notification.updateMany({
      where: { userId, status: "UNREAD", channel: "IN_APP" },
      data: { status: "READ" },
    });
  }

  return NextResponse.json({ ok: true });
}
