import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Halka açık — auth gerektirmez
export async function GET() {
  const plans = await prisma.plan.findMany({
    where: { isActive: true },
    orderBy: { priceCents: "asc" },
  });
  return NextResponse.json({ plans });
}
