import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { capture } from "@/lib/posthog";

// Railway Cron veya harici cron servisi tarafından her gün çağrılır
// Header: Authorization: Bearer <CRON_SECRET>
export async function POST(req: NextRequest) {
  const secret = req.headers.get("authorization")?.replace("Bearer ", "");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const now = new Date();

  // Trial süresi dolmuş ama hala TRIALING olan abonelikler
  const expired = await prisma.subscription.findMany({
    where: {
      status: "TRIALING",
      trialEndsAt: { lte: now },
    },
    include: { brand: { include: { owner: true } } },
  });

  let expiredCount = 0;
  for (const sub of expired) {
    await prisma.subscription.update({
      where: { id: sub.id },
      data: { status: "PAST_DUE" },
    });

    // PostHog event
    capture(sub.brand.ownerId, "trial_expired", {
      brandId: sub.brandId,
      brandName: sub.brand.name,
      planId: sub.planId,
    });

    expiredCount++;
  }

  // 30 günden fazla PAST_DUE olan abonelikler → EXPIRED yap (veri silinmez)
  const stale = await prisma.subscription.updateMany({
    where: {
      status: "PAST_DUE",
      updatedAt: { lte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) },
    },
    data: { status: "EXPIRED" },
  });

  return NextResponse.json({
    ok: true,
    trialExpired: expiredCount,
    movedToExpired: stale.count,
    checkedAt: now.toISOString(),
  });
}
