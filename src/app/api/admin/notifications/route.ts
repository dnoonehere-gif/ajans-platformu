import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { prisma } from "@/lib/prisma";
import { sendNotification, sendNotificationToMany } from "@/server/notifications/send";
import { z } from "zod";

const schema = z.object({
  title: z.string().min(1),
  body: z.string().optional(),
  type: z.string().default("system"),
  // hedef: belirli kullanıcı, tüm kullanıcılar, veya belirli rol
  target: z.enum(["all", "user", "role"]).default("all"),
  userId: z.string().optional(),
  role: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const user = session.user as { id: string; role?: string };
  if (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN") {
    return NextResponse.json({ error: "Yetersiz yetki" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Geçersiz veri" }, { status: 400 });

  const { title, body: notifBody, type, target, userId, role } = parsed.data;

  let count = 0;

  if (target === "user" && userId) {
    await sendNotification({ userId, type: type as never, title, body: notifBody });
    count = 1;
  } else if (target === "role" && role) {
    const users = await prisma.user.findMany({ where: { globalRole: role as never }, select: { id: true } });
    const ids = users.map((u) => u.id);
    if (ids.length) await sendNotificationToMany(ids, { type: type as never, title, body: notifBody });
    count = ids.length;
  } else {
    // Tüm kullanıcılar
    const users = await prisma.user.findMany({ select: { id: true } });
    const ids = users.map((u) => u.id);
    if (ids.length) await sendNotificationToMany(ids, { type: type as never, title, body: notifBody });
    count = ids.length;
  }

  return NextResponse.json({ ok: true, sent: count });
}
