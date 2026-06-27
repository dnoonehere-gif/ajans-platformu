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
    update: {},
    create: {
      name: "Başlangıç", slug: "baslangic", priceCents: 49900, trialDays: 14,
      features: { brands: 1, aiContentPerMonth: 50, chatbot: false },
    },
  });
  await prisma.plan.upsert({
    where: { slug: "profesyonel" },
    update: {},
    create: {
      name: "Profesyonel", slug: "profesyonel", priceCents: 99900, trialDays: 14,
      features: { brands: 5, aiContentPerMonth: 300, chatbot: true },
    },
  });

  console.log("✅ Tohumlama tamamlandı. Giriş: admin@ajans.com / admin123");
  console.log("   (Üretimde bu şifreyi mutlaka değiştirin!)", superAdmin.id);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
