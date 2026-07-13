import { prisma } from "@/lib/prisma";

export type NotificationType =
  | "new_review"
  | "negative_review"
  | "ai_content_ready"
  | "subscription_started"
  | "subscription_canceled"
  | "subscription_expiring"
  | "team_invite"
  | "chatbot_limit"
  | "crm_lead_new"
  | "crm_lead_won"
  | "reservation_new"
  | "reservation_confirmed"
  | "email_campaign_sent"
  | "social_post_published"
  | "system";

interface SendNotificationOptions {
  userId: string;
  brandId?: string;
  type: NotificationType;
  title: string;
  body?: string;
  data?: Record<string, unknown>;
}

const TYPE_ICONS: Record<NotificationType, string> = {
  new_review: "⭐",
  negative_review: "⚠️",
  ai_content_ready: "✨",
  subscription_started: "🚀",
  subscription_canceled: "❌",
  subscription_expiring: "⏰",
  team_invite: "👥",
  chatbot_limit: "🤖",
  crm_lead_new: "👤",
  crm_lead_won: "🎉",
  reservation_new: "📅",
  reservation_confirmed: "✅",
  email_campaign_sent: "📧",
  social_post_published: "📱",
  system: "🔔",
};

export async function sendNotification(opts: SendNotificationOptions) {
  if (!opts.userId) return null;
  return prisma.notification.create({
    data: {
      userId: opts.userId,
      brandId: opts.brandId ?? null,
      channel: "IN_APP",
      status: "UNREAD",
      title: opts.title,
      body: opts.body,
      data: opts.data
        ? { ...opts.data, type: opts.type, icon: TYPE_ICONS[opts.type] }
        : { type: opts.type, icon: TYPE_ICONS[opts.type] },
    },
  });
}

export async function notifyBrandOwner(
  brandId: string,
  opts: Omit<SendNotificationOptions, "userId" | "brandId">
) {
  const brand = await prisma.brand.findUnique({ where: { id: brandId }, select: { ownerId: true } });
  if (!brand) return null;
  return sendNotification({ ...opts, userId: brand.ownerId, brandId });
}

export async function sendNotificationToMany(userIds: string[], opts: Omit<SendNotificationOptions, "userId">) {
  return prisma.notification.createMany({
    data: userIds.map((userId) => ({
      userId,
      brandId: opts.brandId ?? null,
      channel: "IN_APP",
      status: "UNREAD",
      title: opts.title,
      body: opts.body,
      data: opts.data
        ? { ...opts.data, type: opts.type, icon: TYPE_ICONS[opts.type] }
        : { type: opts.type, icon: TYPE_ICONS[opts.type] },
    })),
  });
}
