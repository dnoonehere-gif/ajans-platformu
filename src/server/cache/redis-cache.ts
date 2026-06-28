import { redis } from "@/lib/redis";

const DEFAULT_TTL = 60; // saniye

export interface CacheOptions {
  ttl?: number;      // saniye — varsayılan 60
  tags?: string[];   // invalidation tag'leri
}

// ─── Temel get/set/del ───────────────────────────────────────────────────────

export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const raw = await redis.get(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function cacheSet<T>(key: string, value: T, opts: CacheOptions = {}): Promise<void> {
  try {
    const ttl = opts.ttl ?? DEFAULT_TTL;
    const serialized = JSON.stringify(value);
    await redis.setex(key, ttl, serialized);

    // Tag → key listesi tut (invalidation için)
    if (opts.tags?.length) {
      const pipeline = redis.pipeline();
      for (const tag of opts.tags) {
        pipeline.sadd(`tag:${tag}`, key);
        pipeline.expire(`tag:${tag}`, ttl + 60); // tag biraz daha uzun yaşasın
      }
      await pipeline.exec();
    }
  } catch {
    // Cache hatası sessiz geçmeli
  }
}

export async function cacheDel(key: string): Promise<void> {
  try { await redis.del(key); } catch { /* noop */ }
}

// ─── Tag bazlı toplu invalidation ────────────────────────────────────────────

export async function invalidateTag(tag: string): Promise<void> {
  try {
    const keys = await redis.smembers(`tag:${tag}`);
    if (keys.length) {
      const pipeline = redis.pipeline();
      keys.forEach((k) => pipeline.del(k));
      pipeline.del(`tag:${tag}`);
      await pipeline.exec();
    }
  } catch { /* noop */ }
}

export async function invalidateTags(tags: string[]): Promise<void> {
  await Promise.all(tags.map(invalidateTag));
}

// ─── Cache-aside helper ───────────────────────────────────────────────────────
// Otomatik: cache'de varsa döner, yoksa fn() çalıştırır, sonucu cache'e yazar

export async function cached<T>(
  key: string,
  fn: () => Promise<T>,
  opts: CacheOptions = {}
): Promise<T> {
  const hit = await cacheGet<T>(key);
  if (hit !== null) return hit;

  const value = await fn();
  await cacheSet(key, value, opts);
  return value;
}

// ─── Hazır cache key şablonları ──────────────────────────────────────────────

export const CacheKeys = {
  dashboard: (brandId: string) => `dashboard:${brandId}`,
  plans:     ()                => `plans:active`,
  brand:     (brandId: string) => `brand:${brandId}`,
  reviews:   (brandId: string, page: number) => `reviews:${brandId}:${page}`,
  chatbot:   (brandId: string) => `chatbot:${brandId}`,
  content:   (brandId: string, page: number) => `content:${brandId}:${page}`,
  qr:        (brandId: string) => `qr:${brandId}`,
} as const;

export const CacheTTL = {
  DASHBOARD:  120,   // 2 dakika — sık güncellenen
  PLANS:      3600,  // 1 saat — nadiren değişir
  BRAND:      300,   // 5 dakika
  REVIEWS:    60,    // 1 dakika
  CHATBOT:    300,   // 5 dakika
  CONTENT:    120,   // 2 dakika
  QR:         600,   // 10 dakika
} as const;
