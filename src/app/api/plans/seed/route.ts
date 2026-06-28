import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireGlobalPermission } from "@/lib/auth-guard";
import { invalidateTag } from "@/server/cache/redis-cache";

const DEFAULT_PLANS = [
  {
    name: "Başlangıç",
    slug: "baslangic",
    priceCents: 49900,   // 499 TL
    currency: "TRY",
    interval: "month" as const,
    trialDays: 14,
    features: {
      brands: 1,
      teamMembers: 2,
      aiContent: 30,
      chatbot: true,
      reviews: true,
      qrCodes: 3,
      website: true,
      googleBusiness: false,
      seoContent: false,
      support: "email",
    },
  },
  {
    name: "Profesyonel",
    slug: "profesyonel",
    priceCents: 99900,   // 999 TL
    currency: "TRY",
    interval: "month" as const,
    trialDays: 14,
    features: {
      brands: 3,
      teamMembers: 5,
      aiContent: 150,
      chatbot: true,
      reviews: true,
      qrCodes: 10,
      website: true,
      googleBusiness: true,
      seoContent: true,
      support: "priority",
    },
  },
  {
    name: "İşletme",
    slug: "isletme",
    priceCents: 199900,  // 1999 TL
    currency: "TRY",
    interval: "month" as const,
    trialDays: 14,
    features: {
      brands: 10,
      teamMembers: 20,
      aiContent: -1,     // sınırsız
      chatbot: true,
      reviews: true,
      qrCodes: -1,       // sınırsız
      website: true,
      googleBusiness: true,
      seoContent: true,
      support: "dedicated",
    },
  },
];

export async function POST() {
  const check = await requireGlobalPermission("admin.*");
  if ("error" in check) return NextResponse.json({ error: check.error }, { status: check.status });

  const created = [];
  for (const plan of DEFAULT_PLANS) {
    const existing = await prisma.plan.findUnique({ where: { slug: plan.slug } });
    if (!existing) {
      const p = await prisma.plan.create({ data: plan });
      created.push(p);
    }
  }

  if (created.length) await invalidateTag("plans");
  return NextResponse.json({ created, message: `${created.length} plan oluşturuldu` });
}
