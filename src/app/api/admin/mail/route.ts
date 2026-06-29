import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { sendCustomEmail, sendBulkEmail } from "@/lib/email";
import { z } from "zod";
import { auditFromRequest } from "@/server/audit/log";

const schema = z.object({
  subject: z.string().min(1),
  content: z.string().min(1),
  target: z.enum(["all", "user", "role"]).default("all"),
  userId: z.string().optional(),
  role: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  if (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN") {
    return NextResponse.json({ error: "Yetersiz yetki" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Geçersiz veri" }, { status: 400 });

  const { subject, content, target, userId, role } = parsed.data;

  let sent = 0;

  if (target === "user" && userId) {
    const u = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } });
    if (u?.email) { await sendCustomEmail(u.email, subject, content); sent = 1; }
  } else if (target === "role" && role) {
    const users = await prisma.user.findMany({ where: { globalRole: role as never }, select: { email: true } });
    const emails = users.map((u) => u.email).filter(Boolean) as string[];
    if (emails.length) { await sendBulkEmail(emails, subject, content); sent = emails.length; }
  } else {
    const users = await prisma.user.findMany({ select: { email: true } });
    const emails = users.map((u) => u.email).filter(Boolean) as string[];
    if (emails.length) { await sendBulkEmail(emails, subject, content); sent = emails.length; }
  }

  auditFromRequest("admin.mail_send", user.id, {
    entity: "Mail", metadata: { target, subject, sent },
  }).catch(() => null);

  return NextResponse.json({ ok: true, sent });
}
