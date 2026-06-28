// =============================================================
//  GÖREV İŞÇİSİ (Worker)
//  `npm run worker` veya docker-compose 'worker' servisi ile çalışır.
// =============================================================
import { Worker } from "bullmq";
import { redis } from "@/lib/redis";
import { QUEUE_NAMES } from "./queues";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const connection = redis as any;

// AI görevleri işçisi (örnek iskelet)
new Worker(
  QUEUE_NAMES.ai,
  async (job) => {
    console.log(`[AI] Görev işleniyor: ${job.name}`, job.data);
    // TODO: job.name'e göre içerik üretimi / yorum analizi / chatbot eğitimi
    return { ok: true };
  },
  { connection },
);

// E-posta işçisi (örnek iskelet)
new Worker(
  QUEUE_NAMES.email,
  async (job) => {
    console.log(`[EMAIL] Gönderiliyor: ${job.name}`, job.data);
    // TODO: nodemailer ile gönderim
    return { ok: true };
  },
  { connection },
);

console.log("✅ Worker başlatıldı. Kuyruklar dinleniyor...");
