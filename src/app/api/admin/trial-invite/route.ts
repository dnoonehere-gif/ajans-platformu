import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { requireGlobalPermission } from "@/lib/auth-guard";
import { auditFromRequest } from "@/server/audit/log";
import { sendTrialInviteEmail } from "@/lib/email";

/**
 * Admin, bir e-postaya ücretsiz deneme daveti gönderir. Alıcı /deneme
 * bağlantısına tıklayıp denemeyi kendi aktive eder — admin manuel plan
 * atamaz. Bu rota yalnızca davet token'ı oluşturur ve maili gönderir.
 */
const schema = z.object({
  email: z.string().email(),
  planSlug: z.string().min(1).default("profesyonel"),
  days: z.number().int().min(1).max(90).default(7),
  note: z.string().max(500).optional(),
});

export async function POST(req: NextRequest) {
  const check = await requireGlobalPermission("admin.*");
  if ("error" in check) return NextResponse.json({ error: check.error }, { status: check.status });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }
  const email = parsed.data.email.toLowerCase().trim();
  const { planSlug, days, note } = parsed.data;

  const plan = await prisma.plan.findUnique({ where: { slug: planSlug }, select: { name: true } });
  if (!plan) return NextResponse.json({ error: "Plan bulunamadı" }, { status: 404 });

  const token = randomBytes(32).toString("hex");
  await prisma.trialInvite.create({
    data: {
      email,
      token,
      planSlug,
      days,
      note: note || null,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // davet 7 gün geçerli
    },
  });

  try {
    await sendTrialInviteEmail(email, { token, days, planName: plan.name, inviterNote: note });
  } catch (e) {
    console.error("Deneme daveti maili gönderilemedi:", e);
    return NextResponse.json({ error: "Davet oluşturuldu ancak e-posta gönderilemedi. Tekrar deneyin." }, { status: 502 });
  }

  auditFromRequest("admin.trial_invite", undefined, {
    entity: "TrialInvite", metadata: { email, planSlug, days },
  }).catch(() => null);

  return NextResponse.json({ ok: true, email, days, planName: plan.name });
}
