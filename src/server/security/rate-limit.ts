import { NextRequest, NextResponse } from "next/server";
import { Redis } from "ioredis";

let redis: Redis | null = null;
function getRedis() {
  if (!redis) redis = new Redis(process.env.REDIS_URL ?? "redis://localhost:6379", { lazyConnect: true, maxRetriesPerRequest: 1 });
  return redis;
}

interface RateLimitConfig {
  windowMs: number;   // pencere süresi (ms)
  max: number;        // pencerede izin verilen istek sayısı
  keyPrefix?: string;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number; // unix ms
}

// Sliding window counter — Redis INCR + EXPIRE
export async function rateLimit(key: string, config: RateLimitConfig): Promise<RateLimitResult> {
  const r = getRedis();
  const windowSec = Math.ceil(config.windowMs / 1000);
  const redisKey = `rl:${config.keyPrefix ?? "default"}:${key}`;

  try {
    const count = await r.incr(redisKey);
    if (count === 1) await r.expire(redisKey, windowSec);
    const ttl = await r.ttl(redisKey);

    return {
      allowed: count <= config.max,
      remaining: Math.max(0, config.max - count),
      resetAt: Date.now() + ttl * 1000,
    };
  } catch {
    // Redis down → fail open (güvenlik kritik değilse geçir)
    return { allowed: true, remaining: config.max, resetAt: Date.now() + config.windowMs };
  }
}

// IP + yol bazlı key
export function getRateLimitKey(req: NextRequest, extra?: string): string {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";
  return extra ? `${ip}:${extra}` : ip;
}

// Hazır limitler
export const LIMITS = {
  AUTH:         { windowMs: 15 * 60 * 1000, max: 10,  keyPrefix: "auth"    }, // 15dk/10 istek
  API_GENERAL:  { windowMs:  1 * 60 * 1000, max: 60,  keyPrefix: "api"     }, // 1dk/60 istek
  AI_GENERATE:  { windowMs:  1 * 60 * 1000, max: 5,   keyPrefix: "ai"      }, // 1dk/5 AI isteği
  CHATBOT_MSG:  { windowMs:  1 * 60 * 1000, max: 20,  keyPrefix: "chat"    }, // 1dk/20 chatbot mesaj
  PASSWORD_RST: { windowMs: 60 * 60 * 1000, max: 3,   keyPrefix: "pwreset" }, // 1sa/3 şifre sıfırla
  WEBHOOK:      { windowMs:  1 * 60 * 1000, max: 100, keyPrefix: "webhook" }, // 1dk/100 webhook
} as const;

// Route handler wrapper — 429 döner
export function withRateLimit(config: RateLimitConfig) {
  return async (req: NextRequest, handler: () => Promise<NextResponse>): Promise<NextResponse> => {
    const key = getRateLimitKey(req);
    const result = await rateLimit(key, config);

    if (!result.allowed) {
      return NextResponse.json(
        { error: "Çok fazla istek. Lütfen bir süre bekleyin." },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil((result.resetAt - Date.now()) / 1000)),
            "X-RateLimit-Limit": String(config.max),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(result.resetAt),
          },
        }
      );
    }

    const res = await handler();
    res.headers.set("X-RateLimit-Limit", String(config.max));
    res.headers.set("X-RateLimit-Remaining", String(result.remaining));
    res.headers.set("X-RateLimit-Reset", String(result.resetAt));
    return res;
  };
}
