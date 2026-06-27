import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireGlobalPermission } from "@/lib/auth-guard";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const check = await requireGlobalPermission("admin.*");
  if ("error" in check) return NextResponse.json({ error: check.error }, { status: check.status });

  const { id } = await params;
  const body = await req.json();

  const plan = await prisma.plan.update({
    where: { id },
    data: { isActive: body.isActive },
    include: { _count: { select: { subscriptions: true } } },
  });
  return NextResponse.json({ plan });
}
