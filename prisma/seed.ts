// =============================================================
//  VERİTABANI TOHUMLAMA (seed)
//  `npm run db:seed` ile çalıştırılır.
//  Süper admin, örnek paketler ve örnek müşteri oluşturur.
// =============================================================
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Süper admin
  const superAdmin = await prisma.user.upsert({
    where: { email: "admin@ajans.com" },
    update: {},
    create: {
      email: "admin@ajans.com",
      name: "Süper Admin",
      passwordHash: await bcrypt.hash("admin123", 10),
      globalRole: "SUPER_ADMIN",
      emailVerified: new Date(),
    },
  });

  // Paketler
  await prisma.plan.upsert({
    where: { slug: "baslangic" },
    update: { priceCents: 69900 },
    create: {
      name: "Başlangıç", slug: "baslangic", priceCents: 69900, trialDays: 14,
      features: { brands: 1, teamMembers: 2, aiContent: 50, chatbot: false, reviews: false, qrCodes: 2, website: true, googleBusiness: false, seoContent: false, support: "email" },
    },
  });
  await prisma.plan.upsert({
    where: { slug: "profesyonel" },
    update: { priceCents: 149900 },
    create: {
      name: "Profesyonel", slug: "profesyonel", priceCents: 149900, trialDays: 14,
      features: { brands: 5, teamMembers: 10, aiContent: 300, chatbot: true, reviews: true, qrCodes: 10, website: true, googleBusiness: true, seoContent: true, support: "priority" },
    },
  });
  await prisma.plan.upsert({
    where: { slug: "isletme" },
    update: { priceCents: 249900 },
    create: {
      name: "İşletme", slug: "isletme", priceCents: 249900, trialDays: 14,
      features: { brands: 20, teamMembers: 50, aiContent: -1, chatbot: true, reviews: true, qrCodes: -1, website: true, googleBusiness: true, seoContent: true, support: "dedicated" },
    },
  });
  await prisma.plan.upsert({
    where: { slug: "ajans" },
    update: { priceCents: 499900 },
    create: {
      name: "Ajans", slug: "ajans", priceCents: 499900, trialDays: 7,
      features: { brands: -1, teamMembers: -1, aiContent: -1, chatbot: true, reviews: true, qrCodes: -1, website: true, googleBusiness: true, seoContent: true, whiteLabel: true, batchContent: true, clientReporting: true, socialMedia: true, apiAccess: true, support: "dedicated" },
    },
  });

  // Yıllık planlar
  await prisma.plan.upsert({
    where: { slug: "baslangic-yillik" },
    update: { priceCents: 659000 },
    create: {
      name: "Başlangıç Yıllık", slug: "baslangic-yillik", priceCents: 659000, interval: "year", trialDays: 0,
      features: { brands: 1, teamMembers: 2, aiContent: 50, chatbot: false, reviews: false, qrCodes: 2, website: true, googleBusiness: false, seoContent: false, support: "email" },
    },
  });
  await prisma.plan.upsert({
    where: { slug: "profesyonel-yillik" },
    update: { priceCents: 1439000 },
    create: {
      name: "Profesyonel Yıllık", slug: "profesyonel-yillik", priceCents: 1439000, interval: "year", trialDays: 0,
      features: { brands: 5, teamMembers: 10, aiContent: 300, chatbot: true, reviews: true, qrCodes: 10, website: true, googleBusiness: true, seoContent: true, support: "priority" },
    },
  });
  await prisma.plan.upsert({
    where: { slug: "isletme-yillik" },
    update: { priceCents: 2399000 },
    create: {
      name: "İşletme Yıllık", slug: "isletme-yillik", priceCents: 2399000, interval: "year", trialDays: 0,
      features: { brands: 20, teamMembers: 50, aiContent: -1, chatbot: true, reviews: true, qrCodes: -1, website: true, googleBusiness: true, seoContent: true, support: "dedicated" },
    },
  });
  await prisma.plan.upsert({
    where: { slug: "ajans-yillik" },
    update: { priceCents: 4799000 },
    create: {
      name: "Ajans Yıllık", slug: "ajans-yillik", priceCents: 4799000, interval: "year", trialDays: 0,
      features: { brands: -1, teamMembers: -1, aiContent: -1, chatbot: true, reviews: true, qrCodes: -1, website: true, googleBusiness: true, seoContent: true, whiteLabel: true, batchContent: true, clientReporting: true, socialMedia: true, apiAccess: true, support: "dedicated" },
    },
  });

  console.log("✅ Tohumlama tamamlandı. Giriş: admin@ajans.com / admin123");
  console.log("   (Üretimde bu şifreyi mutlaka değiştirin!)", superAdmin.id);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
