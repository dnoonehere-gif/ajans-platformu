import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireGlobalPermission } from "@/lib/auth-guard";
import { invalidateTag } from "@/server/cache/redis-cache";

const ALL_PLANS = [
  {
    name: "Başlangıç", slug: "baslangic", priceCents: 69900, currency: "TRY", interval: "month" as const, trialDays: 14,
    features: { brands: 1, teamMembers: 2, aiContent: 50, chatbot: false, reviews: false, qrCodes: 2, website: true, googleBusiness: false, seoContent: false, support: "email" },
  },
  {
    name: "Profesyonel", slug: "profesyonel", priceCents: 149900, currency: "TRY", interval: "month" as const, trialDays: 14,
    features: { brands: 5, teamMembers: 10, aiContent: 300, chatbot: true, reviews: true, qrCodes: 10, website: true, googleBusiness: true, seoContent: true, support: "priority" },
  },
  {
    name: "İşletme", slug: "isletme", priceCents: 249900, currency: "TRY", interval: "month" as const, trialDays: 14,
    features: { brands: 20, teamMembers: 50, aiContent: -1, chatbot: true, reviews: true, qrCodes: -1, website: true, googleBusiness: true, seoContent: true, support: "dedicated" },
  },
  {
    name: "Ajans", slug: "ajans", priceCents: 499900, currency: "TRY", interval: "month" as const, trialDays: 7,
    features: { brands: -1, teamMembers: -1, aiContent: -1, chatbot: true, reviews: true, qrCodes: -1, website: true, googleBusiness: true, seoContent: true, whiteLabel: true, batchContent: true, clientReporting: true, socialMedia: true, apiAccess: true, support: "dedicated" },
  },
  {
    name: "Başlangıç Yıllık", slug: "baslangic-yillik", priceCents: 659000, currency: "TRY", interval: "year" as const, trialDays: 0,
    features: { brands: 1, teamMembers: 2, aiContent: 50, chatbot: false, reviews: false, qrCodes: 2, website: true, googleBusiness: false, seoContent: false, support: "email" },
  },
  {
    name: "Profesyonel Yıllık", slug: "profesyonel-yillik", priceCents: 1439000, currency: "TRY", interval: "year" as const, trialDays: 0,
    features: { brands: 5, teamMembers: 10, aiContent: 300, chatbot: true, reviews: true, qrCodes: 10, website: true, googleBusiness: true, seoContent: true, support: "priority" },
  },
  {
    name: "İşletme Yıllık", slug: "isletme-yillik", priceCents: 2399000, currency: "TRY", interval: "year" as const, trialDays: 0,
    features: { brands: 20, teamMembers: 50, aiContent: -1, chatbot: true, reviews: true, qrCodes: -1, website: true, googleBusiness: true, seoContent: true, support: "dedicated" },
  },
  {
    name: "Ajans Yıllık", slug: "ajans-yillik", priceCents: 4799000, currency: "TRY", interval: "year" as const, trialDays: 0,
    features: { brands: -1, teamMembers: -1, aiContent: -1, chatbot: true, reviews: true, qrCodes: -1, website: true, googleBusiness: true, seoContent: true, whiteLabel: true, batchContent: true, clientReporting: true, socialMedia: true, apiAccess: true, support: "dedicated" },
  },
];

export async function POST() {
  const check = await requireGlobalPermission("admin.*");
  if ("error" in check) return NextResponse.json({ error: check.error }, { status: check.status });

  const results = [];
  for (const plan of ALL_PLANS) {
    const p = await prisma.plan.upsert({
      where: { slug: plan.slug },
      update: { name: plan.name, priceCents: plan.priceCents, features: plan.features, trialDays: plan.trialDays },
      create: plan,
    });
    results.push({ slug: p.slug, priceCents: p.priceCents });
  }

  await invalidateTag("plans");
  return NextResponse.json({ plans: results, message: `${results.length} plan güncellendi` });
}
