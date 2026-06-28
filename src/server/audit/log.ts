import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

export type AuditAction =
  // Auth
  | "auth.login"
  | "auth.logout"
  | "auth.register"
  | "auth.password_reset_request"
  | "auth.password_reset"
  | "auth.email_verify"
  // User
  | "user.update"
  | "user.role_change"
  | "user.delete"
  // Brand
  | "brand.create"
  | "brand.update"
  | "brand.delete"
  // Subscription
  | "subscription.create"
  | "subscription.cancel"
  | "subscription.activate"
  | "subscription.plan_change"
  // Review
  | "review.create"
  | "review.delete"
  | "review.analyze"
  // Content
  | "content.generate"
  | "content.delete"
  // Chatbot
  | "chatbot.update"
  | "chatbot.knowledge_add"
  | "chatbot.knowledge_delete"
  | "chatbot.conversation"
  // Team
  | "team.invite"
  | "team.remove"
  | "team.role_change"
  // Website
  | "website.generate"
  | "website.publish"
  | "website.unpublish"
  // QR
  | "qr.create"
  | "qr.delete"
  // Admin
  | "admin.mail_send"
  | "admin.notification_send"
  | "admin.plan_seed"
  | "admin.user_delete";

interface AuditOptions {
  userId?: string;
  action: AuditAction;
  entity?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  ip?: string;
}

export async function audit(opts: AuditOptions) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: opts.userId ?? null,
        action: opts.action,
        entity: opts.entity ?? null,
        entityId: opts.entityId ?? null,
        metadata: (opts.metadata ?? undefined) as never,
        ip: opts.ip ?? null,
      },
    });
  } catch {
    // Log hatası asla ana akışı durdurmamalı
  }
}

// Next.js route handler'lardan IP almak için yardımcı
export async function getClientIp(): Promise<string | undefined> {
  try {
    const hdrs = await headers();
    return (
      hdrs.get("x-forwarded-for")?.split(",")[0].trim() ??
      hdrs.get("x-real-ip") ??
      undefined
    );
  } catch {
    return undefined;
  }
}

// Oturum + IP alıp log atan kolaylaştırıcı
export async function auditFromRequest(
  action: AuditAction,
  userId: string | undefined,
  opts?: Omit<AuditOptions, "action" | "userId" | "ip">
) {
  const ip = await getClientIp();
  await audit({ action, userId, ip, ...opts });
}
