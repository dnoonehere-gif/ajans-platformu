import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireGlobalPermission } from "@/lib/auth-guard";

export async function GET() {
  const check = await requireGlobalPermission("admin.*");
  if ("error" in check) return NextResponse.json({ error: check.error }, { status: check.status });

  const plans = await prisma.plan.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { subscriptions: true } } },
  });
  return NextResponse.json({ plans });
}

export async function POST(req: NextRequest) {
  const check = await requireGlobalPermission("admin.*");
  if ("error" in check) return NextResponse.json({ error: check.error }, { status: check.status });

  const body = await req.json();
  const parsed = z.object({
    name: z.string().min(1),
    slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
    priceCents: z.number().int().min(0),
    currency: z.string().default("TRY"),
    interval: z.enum(["month", "year"]).default("month"),
    trialDays: z.number().int().min(0).default(14),
  }).safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });

  const plan = await prisma.plan.create({
    data: parsed.data,
    include: { _count: { select: { subscriptions: true } } },
  });
  return NextResponse.json({ plan }, { status: 201 });
}
