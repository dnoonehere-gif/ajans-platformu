import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

let _redis: Redis | null = null;

function getRedis(): Redis | null {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) return null;
  if (!_redis) {
    _redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  }
  return _redis;
}

interface RateLimitConfig {
  windowMs: number;
  max: number;
  keyPrefix?: string;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export async function rateLimit(key: string, config: RateLimitConfig): Promise<RateLimitResult> {
  const r = getRedis();
  const windowSec = Math.ceil(config.windowMs / 1000);
  const redisKey = `rl:${config.keyPrefix ?? "default"}:${key}`;

  if (!r) {
    // Upstash yapılandırılmamışsa fail-open
    return { allowed: true, remaining: config.max, resetAt: Date.now() + config.windowMs };
  }

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
    return { allowed: true, remaining: config.max, resetAt: Date.now() + config.windowMs };
  }
}

export function getRateLimitKey(req: NextRequest, extra?: string): string {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";
  return extra ? `${ip}:${extra}` : ip;
}

export const LIMITS = {
  AUTH:         { windowMs: 15 * 60 * 1000, max: 10,  keyPrefix: "auth"    },
  API_GENERAL:  { windowMs:  1 * 60 * 1000, max: 60,  keyPrefix: "api"     },
  AI_GENERATE:  { windowMs:  1 * 60 * 1000, max: 5,   keyPrefix: "ai"      },
  CHATBOT_MSG:  { windowMs:  1 * 60 * 1000, max: 20,  keyPrefix: "chat"    },
  PASSWORD_RST: { windowMs: 60 * 60 * 1000, max: 3,   keyPrefix: "pwreset" },
  WEBHOOK:      { windowMs:  1 * 60 * 1000, max: 100, keyPrefix: "webhook" },
} as const;

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
