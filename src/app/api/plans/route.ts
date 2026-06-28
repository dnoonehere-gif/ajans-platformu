import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cached, CacheKeys, CacheTTL } from "@/server/cache/redis-cache";

// Halka açık — auth gerektirmez
export async function GET() {
  const plans = await cached(
    CacheKeys.plans(),
    () => prisma.plan.findMany({ where: { isActive: true }, orderBy: { priceCents: "asc" } }),
    { ttl: CacheTTL.PLANS, tags: ["plans"] }
  );

  const res = NextResponse.json({ plans });
  res.headers.set("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=300");
  return res;
}
