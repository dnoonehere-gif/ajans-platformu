import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";

export const dynamic = "force-dynamic";

export async function GET() {
  const start = Date.now();
  const checks: Record<string, { ok: boolean; ms?: number; error?: string }> = {};

  // DB check
  try {
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    checks.db = { ok: true, ms: Date.now() - dbStart };
  } catch (e) {
    checks.db = { ok: false, error: String(e) };
  }

  // Redis check
  try {
    const rStart = Date.now();
    await redis.ping();
    checks.redis = { ok: true, ms: Date.now() - rStart };
  } catch (e) {
    checks.redis = { ok: false, error: String(e) };
  }

  const allOk = Object.values(checks).every((c) => c.ok);
  const status = allOk ? 200 : 503;

  return NextResponse.json(
    {
      status: allOk ? "ok" : "degraded",
      version: process.env.npm_package_version ?? "0.1.0",
      uptime: Math.floor(process.uptime()),
      totalMs: Date.now() - start,
      checks,
    },
    {
      status,
      headers: { "Cache-Control": "no-store" },
    }
  );
}
