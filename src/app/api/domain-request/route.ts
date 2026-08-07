import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/server/auth/auth";

/**
 * "Sitemi kendi alan adımla yayınlayın" talebi.
 *
 * Özel alan adı bağlamak DNS + sunucu ayarı gerektiriyor; müşterilerin
 * çoğu bunu yapamıyor ve self-servis bir akış destek yükü yaratıyor.
 * Bu yüzden talep ekibe düşüyor, kurulumu ekip yapıyor.
 */

/** Alan adı biçimi. Protokol/yol kabul edilmez, sadece ad.uzantı. */
const alanAdi = z
  .string()
  .trim()
  .toLowerCase()
  .min(4)
  .max(253)
  .regex(
    /^(?!-)[a-z0-9-]{1,63}(?<!-)(\.[a-z]{2,}){1,3}$/,
    "Geçerli bir alan adı yazın (örn. kuaforayse.com.tr)"
  );

const schema = z.object({
  websiteId: z.string(),
  desiredDomain: alanAdi,
  altDomain: alanAdi.optional().or(z.literal("")),
  note: z.string().max(1000).optional().or(z.literal("")),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const userId = (session.user as { id: string }).id;

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Geçersiz veri" }, { status: 400 });
  }
  const { websiteId, desiredDomain, altDomain, note } = parsed.data;

  // Site gerçekten bu kullanıcının mı — id tahmin edilerek başkasının sitesi
  // için talep açılamasın.
  const website = await prisma.website.findFirst({
    where: { id: websiteId, brand: { ownerId: userId } },
    select: { id: true, brandId: true },
  });
  if (!website) return NextResponse.json({ error: "Site bulunamadı" }, { status: 404 });

  // Aynı site için açık talep varsa ikincisi oluşturulmaz; ekip aynı işi
  // iki kez görmesin, kullanıcı da mükerrer ücret beklentisine girmesin.
  const acikTalep = await prisma.domainRequest.findFirst({
    where: { websiteId, status: { in: ["PENDING", "QUOTED", "IN_PROGRESS"] } },
    select: { id: true, status: true },
  });
  if (acikTalep) {
    return NextResponse.json(
      { error: "Bu site için zaten bekleyen bir talebiniz var. Ekibimiz sizinle iletişime geçecek." },
      { status: 409 }
    );
  }

  const request = await prisma.domainRequest.create({
    data: {
      websiteId,
      brandId: website.brandId,
      userId,
      desiredDomain,
      altDomain: altDomain || null,
      note: note || null,
    },
  });

  return NextResponse.json({ request }, { status: 201 });
}

/** Kullanıcının kendi taleplerini listeler (site kartında durum göstermek için). */
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const userId = (session.user as { id: string }).id;

  const websiteId = req.nextUrl.searchParams.get("websiteId");

  const requests = await prisma.domainRequest.findMany({
    where: { userId, ...(websiteId ? { websiteId } : {}) },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return NextResponse.json({ requests });
}
