// =============================================================
//  ARKA PLAN GÖREV KUYRUKLARI (BullMQ)
//  Ağır AI işleri, e-posta gönderimi, günlük özet üretimi vb.
// =============================================================
import { Queue } from "bullmq";
import { redis } from "@/lib/redis";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const connection = redis as any;

/** Kuyruk adları - merkezi tanım */
export const QUEUE_NAMES = {
  ai: "ai-tasks",
  email: "email",
  dashboard: "dashboard-summary",
  reviewSync: "review-sync",
} as const;

export const aiQueue = new Queue(QUEUE_NAMES.ai, { connection });
export const emailQueue = new Queue(QUEUE_NAMES.email, { connection });
export const dashboardQueue = new Queue(QUEUE_NAMES.dashboard, { connection });
export const reviewSyncQueue = new Queue(QUEUE_NAMES.reviewSync, { connection });
