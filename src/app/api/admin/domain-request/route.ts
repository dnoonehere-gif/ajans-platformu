import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/server/auth/auth";

/**
 * Alan adı taleplerinin yönetimi (yalnızca ekip).
 *
 * Rota /api/admin altında olduğu için middleware zaten SUPER_ADMIN/ADMIN
 * rolü arıyor; burada ikinci kez kontrol edilir çünkü middleware
 * yapılandırması ileride değişebilir ve bu uç müşteri verisi görüyor.
 */

async function yoneticiMi() {
  const session = await auth();
  const rol = (session?.user as { role?: string } | undefined)?.role;
  return rol === "SUPER_ADMIN" || rol === "ADMIN";
}

export async function GET(req: NextRequest) {
  if (!(await yoneticiMi())) return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });

  const status = req.nextUrl.searchParams.get("status");

  const requests = await prisma.domainRequest.findMany({
    where: status ? { status } : {},
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      brand: {
        select: {
          name: true, slug: true, phone: true,
          // Paket bilgisi: İşletme ve Ajans'ta kurulum ücretsiz, ekip
          // fiyat yazarken bunu görmeli.
          subscriptions: {
            where: { status: { in: ["ACTIVE", "TRIALING"] } },
            select: { plan: { select: { slug: true, name: true } } },
            take: 1,
          },
        },
      },
      user: { select: { name: true, email: true } },
      website: { select: { id: true, title: true, subdomain: true, isPublished: true } },
    },
  });

  return NextResponse.json({ requests });
}

const updateSchema = z.object({
  id: z.string(),
  status: z.enum(["PENDING", "QUOTED", "IN_PROGRESS", "COMPLETED", "REJECTED"]).optional(),
  /** Kuruş cinsinden ücret; kullanıcıya gösterilir */
  priceCents: z.number().int().min(0).max(100_000_00).optional().nullable(),
  finalDomain: z.string().trim().toLowerCase().max(253).optional().nullable(),
  /** Kullanıcıya iletilecek not — giriş bilgisi/şifre YAZILMAZ */
  adminNote: z.string().max(2000).optional().nullable(),
});

export async function PATCH(req: NextRequest) {
  if (!(await yoneticiMi())) return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });

  const parsed = updateSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Geçersiz veri" }, { status: 400 });

  const { id, ...veri } = parsed.data;

  const mevcut = await prisma.domainRequest.findUnique({ where: { id }, select: { id: true } });
  if (!mevcut) return NextResponse.json({ error: "Talep bulunamadı" }, { status: 404 });

  const request = await prisma.domainRequest.update({
    where: { id },
    data: {
      ...(veri.status !== undefined ? { status: veri.status } : {}),
      ...(veri.priceCents !== undefined ? { priceCents: veri.priceCents } : {}),
      ...(veri.finalDomain !== undefined ? { finalDomain: veri.finalDomain || null } : {}),
      ...(veri.adminNote !== undefined ? { adminNote: veri.adminNote || null } : {}),
    },
  });

  return NextResponse.json({ request });
}
