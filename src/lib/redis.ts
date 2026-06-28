import IORedis from "ioredis";

const globalForRedis = globalThis as unknown as { redis?: IORedis };

function createRedis() {
  const url = process.env.REDIS_URL ?? "redis://localhost:6379";
  const client = new IORedis(url, {
    maxRetriesPerRequest: null,
    lazyConnect: true,
    enableOfflineQueue: false,
  });
  client.on("error", () => {});
  return client;
}

export const redis = globalForRedis.redis ?? createRedis();

if (process.env.NODE_ENV !== "production") globalForRedis.redis = redis;
