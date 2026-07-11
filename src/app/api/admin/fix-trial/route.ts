import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireGlobalPermission } from "@/lib/auth-guard";

export async function POST() {
  const check = await requireGlobalPermission("admin.*");
  if ("error" in check) return NextResponse.json({ error: check.error }, { status: check.status });

  const result = await prisma.subscription.updateMany({
    where: { status: "TRIALING" },
    data: { status: "ACTIVE", trialEndsAt: null },
  });

  return NextResponse.json({ ok: true, updated: result.count });
}
