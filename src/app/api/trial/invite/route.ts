import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-guard";
import { auditFromRequest } from "@/server/audit/log";
import { grantTrial } from "@/server/trial/grant-trial";

/**
 * Ücretsiz deneme davetinin durumunu döndürür (GET) ve daveti aktive eder (POST).
 * Davet admin panelinden e-posta ile gönderilir; alıcı /deneme sayfasında
 * butona tıklayınca burası çağrılır. Manuel plan atama gerekmez.
 */

async function loadInvite(token: string) {
  if (!token) return null;
  return prisma.trialInvite.findUnique({ where: { token } });
}

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token") ?? "";
  const invite = await loadInvite(token);
  if (!invite) return NextResponse.json({ valid: false, reason: "not_found" });

  const expired = invite.expiresAt < new Date();
  const used = !!invite.usedAt;
  const plan = await prisma.plan.findUnique({ where: { slug: invite.planSlug }, select: { name: true } });

  const me = await getAuthUser();
  const loggedIn = !!me;
  const emailMatches = !!me && me.email.toLowerCase() === invite.email.toLowerCase();
  const brandCount = me ? await prisma.brand.count({ where: { ownerId: me.id } }) : 0;

  return NextResponse.json({
    valid: true,
    email: invite.email,
    days: invite.days,
    planName: plan?.name ?? invite.planSlug,
    note: invite.note,
    expired,
    used,
    loggedIn,
    emailMatches,
    hasBrand: brandCount > 0,
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const token = typeof body?.token === "string" ? body.token : "";
  const invite = await loadInvite(token);
  if (!invite) return NextResponse.json({ error: "Davet bulunamadı." }, { status: 404 });
  if (invite.usedAt) return NextResponse.json({ error: "Bu davet zaten kullanılmış." }, { status: 409 });
  if (invite.expiresAt < new Date()) return NextResponse.json({ error: "Davetin süresi dolmuş." }, { status: 410 });

  const me = await getAuthUser();
  if (!me) return NextResponse.json({ error: "Devam etmek için giriş yapın.", needLogin: true }, { status: 401 });
  if (me.email.toLowerCase() !== invite.email.toLowerCase()) {
    return NextResponse.json({ error: "Bu davet başka bir e-posta adresi için gönderilmiş." }, { status: 403 });
  }

  const brandCount = await prisma.brand.count({ where: { ownerId: me.id } });
  if (brandCount === 0) {
    return NextResponse.json({ ok: false, status: "no_brand" });
  }

  // Aktif/deneme aboneliği OLMAYAN en yeni markaya uygula
  const brand = await prisma.brand.findFirst({
    where: { ownerId: me.id, subscriptions: { none: { status: { in: ["ACTIVE", "TRIALING"] } } } },
    orderBy: { createdAt: "desc" },
    select: { id: true },
  });
  if (!brand) return NextResponse.json({ ok: false, status: "already_active" });

  const res = await grantTrial({ brandId: brand.id, planSlug: invite.planSlug, days: invite.days });
  if (!res.ok) {
    return NextResponse.json({ ok: false, status: res.reason ?? "failed" });
  }

  await prisma.trialInvite.update({ where: { id: invite.id }, data: { usedAt: new Date() } });
  auditFromRequest("subscription.trial_start", me.id, {
    entity: "TrialInvite", entityId: invite.id, metadata: { source: "invite", planSlug: invite.planSlug, days: invite.days },
  }).catch(() => null);

  return NextResponse.json({ ok: true, trialEndsAt: res.trialEndsAt });
}
