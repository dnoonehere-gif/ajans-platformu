import { prisma } from "@/lib/prisma";

export interface PlanFeatures {
  brands: number;        // -1 = sınırsız
  teamMembers: number;
  aiContent: number;     // aylık
  chatbot: boolean;
  reviews: boolean;
  qrCodes: number;
  website: boolean;
  googleBusiness: boolean;
  seoContent: boolean;
  support: string;
}

const DEFAULT_FEATURES: PlanFeatures = {
  brands: 1, teamMembers: 2, aiContent: 50,
  chatbot: false, reviews: false, qrCodes: 2,
  website: true, googleBusiness: false, seoContent: false, support: "email",
};

/** Markanın aktif planının özelliklerini döndürür. Plan yoksa default (en kısıtlı) döner. */
export async function getBrandPlanFeatures(brandId: string): Promise<PlanFeatures> {
  const sub = await prisma.subscription.findFirst({
    where: { brandId, status: { in: ["ACTIVE", "TRIALING"] } },
    include: { plan: true },
    orderBy: { createdAt: "desc" },
  });

  if (!sub?.plan.features) return DEFAULT_FEATURES;
  return { ...DEFAULT_FEATURES, ...(sub.plan.features as Partial<PlanFeatures>) };
}

/** Kullanıcının sahip olduğu aktif bir aboneliğin plan özelliklerini döndürür (marka bazlı değil, kullanıcı bazlı). */
export async function getUserPlanFeatures(userId: string): Promise<PlanFeatures> {
  const sub = await prisma.subscription.findFirst({
    where: {
      brand: { ownerId: userId },
      status: { in: ["ACTIVE", "TRIALING"] },
    },
    include: { plan: true },
    orderBy: { createdAt: "desc" },
  });

  if (!sub?.plan.features) return DEFAULT_FEATURES;
  return { ...DEFAULT_FEATURES, ...(sub.plan.features as Partial<PlanFeatures>) };
}

/** Bu ay kaç AI içerik üretildi? */
export async function getMonthlyAiContentCount(brandId: string): Promise<number> {
  const start = new Date();
  start.setDate(1); start.setHours(0, 0, 0, 0);
  return prisma.contentItem.count({
    where: { brandId, createdAt: { gte: start } },
  });
}

/** Limitin aşılıp aşılmadığını kontrol eder. -1 = sınırsız */
export function isUnderLimit(current: number, limit: number): boolean {
  if (limit === -1) return true;
  return current < limit;
}
