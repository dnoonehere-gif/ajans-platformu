import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { generateWebsiteBlocks } from "@/server/ai/website-generator";
import { getBrandPlanFeatures } from "@/lib/plan-guard";
import { z } from "zod";

const schema = z.object({
  brandId: z.string(),
  sector: z.string().min(2),
  description: z.string().optional().default(""),
  primaryColor: z.string().optional(),
  phone: z.string().optional(),

  // Brief — üretimden önce sorulan sorular. Hepsi isteğe bağlı; boş
  // bırakılanlar üreticiye gitmez ve AI o konuda içerik UYDURMAZ.
  audience: z.string().optional(),
  topServices: z.string().optional(),
  goal: z.enum(["randevu", "arama", "bilgi", "satis", "rezervasyon"]).optional(),
  tone: z.enum(["luks", "samimi", "profesyonel", "eglenceli", "sade"]).optional(),
  differentiator: z.string().optional(),
  realStats: z.string().optional(),
  realReviews: z.string().optional(),
  hours: z.string().optional(),
  showPricing: z.boolean().optional(),
  hasPhotos: z.boolean().optional(),
  /** "Yeniden üret" sayacı — her turda farklı tasarım gelsin diye */
  attempt: z.number().optional(),
});

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Geçersiz veri" }, { status: 400 });

  const { brandId, sector, description, primaryColor, phone,
    audience, topServices, goal, tone, differentiator,
    realStats, realReviews, hours, showPricing, hasPhotos, attempt } = parsed.data;

  const brand = await prisma.brand.findFirst({
    where: { id: brandId, ownerId: user.id },
  });
  if (!brand) return NextResponse.json({ error: "Marka bulunamadı" }, { status: 404 });

  const features = await getBrandPlanFeatures(brandId);
  if (!features.website) {
    return NextResponse.json({
      error: "Website oluşturma özelliği aktif aboneliğinizde bulunmuyor.",
      upgrade: true,
    }, { status: 403 });
  }

  // Renk veya telefon değiştiyse markayı güncelle
  if (primaryColor || phone) {
    await prisma.brand.update({
      where: { id: brandId },
      data: {
        ...(primaryColor ? { primaryColor } : {}),
        ...(phone ? { phone } : {}),
      },
    });
  }

  const { blocks, theme } = await generateWebsiteBlocks({
    brandName: brand.name,
    sector,
    description: description || `${brand.name} — ${sector} sektöründe hizmet veren bir işletme.`,
    phone: phone || brand.phone || undefined,
    email: brand.email ?? undefined,
    address: brand.address ?? undefined,
    primaryColor: primaryColor || brand.primaryColor || undefined,
    // Brief — kullanıcı doldurmazsa undefined kalır ve üretici uydurmaz
    audience, topServices, goal, tone, differentiator,
    realStats, realReviews, hours, showPricing, hasPhotos,
  }, Number(attempt) || 0);

  // Amaç randevu/rezervasyon ise butonlar gerçek rezervasyon sayfasına
  // bağlanır. Aksi hâlde AI hepsini #contact'a yönlendiriyor ve "rezervasyon"
  // seçmenin hiçbir karşılığı olmuyordu.
  if (goal === "randevu" || goal === "rezervasyon") {
    const rezervasyonYolu = `/rezervasyon/${brand.slug}`;
    for (const blok of blocks) {
      const d = blok.data as Record<string, unknown>;
      if (blok.type === "hero" && d.ctaHref === "#contact") d.ctaHref = rezervasyonYolu;
      if (blok.type === "cta" && d.buttonHref === "#contact") d.buttonHref = rezervasyonYolu;
    }
  }

  const website = await prisma.website.upsert({
    where: { brandId },
    create: {
      brandId,
      title: brand.name,
      subdomain: brand.slug,
      theme: theme as never,
      isPublished: false,
      pages: {
        create: {
          slug: "anasayfa",
          title: "Ana Sayfa",
          order: 0,
          blocks: blocks as never,
        },
      },
    },
    update: {
      title: brand.name,
      theme: theme as never,
      pages: {
        deleteMany: {},
        create: {
          slug: "anasayfa",
          title: "Ana Sayfa",
          order: 0,
          blocks: blocks as never,
        },
      },
    },
    include: { pages: true },
  });

  return NextResponse.json({ website });
}
