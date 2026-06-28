import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { redis } from "@/lib/redis";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const user = session.user as { role?: string };
  if (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN") {
    return NextResponse.json({ error: "Yetersiz yetki" }, { status: 403 });
  }

  try {
    const info = await redis.info("memory");
    const keyCount = await redis.dbsize();

    const memMatch = info.match(/used_memory_human:(\S+)/);
    const peakMatch = info.match(/used_memory_peak_human:(\S+)/);

    // Cache key pattern'lerine göre sayım
    const [dashKeys, planKeys, brandKeys, rlKeys, tagKeys] = await Promise.all([
      redis.keys("dashboard:*").then((k) => k.length),
      redis.keys("plans:*").then((k) => k.length),
      redis.keys("brand:*").then((k) => k.length),
      redis.keys("rl:*").then((k) => k.length),
      redis.keys("tag:*").then((k) => k.length),
    ]);

    return NextResponse.json({
      memory: { used: memMatch?.[1], peak: peakMatch?.[1] },
      totalKeys: keyCount,
      breakdown: { dashboard: dashKeys, plans: planKeys, brand: brandKeys, rateLimit: rlKeys, tags: tagKeys },
    });
  } catch {
    return NextResponse.json({ error: "Redis bağlantı hatası" }, { status: 503 });
  }
}

// DELETE — tüm cache'i temizle
export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const user = session.user as { role?: string };
  if (user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Sadece Süper Admin" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const pattern = searchParams.get("pattern") ?? "dashboard:*";

  const keys = await redis.keys(pattern);
  if (keys.length) await redis.del(...keys);

  return NextResponse.json({ deleted: keys.length, pattern });
}
