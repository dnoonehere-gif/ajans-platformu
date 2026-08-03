import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ReservationForm } from "./form";

/**
 * Halka açık rezervasyon sayfası.
 *
 * İşletme bu adresi WhatsApp/Instagram biyografisinde veya sitesinde paylaşır.
 * Sayfa markanın kendi rengini kullanır ve Novelya markası taşımaz.
 */
export default async function PublicReservationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const brand = await prisma.brand.findUnique({
    where: { slug },
    select: {
      id: true, name: true, phone: true, address: true, primaryColor: true, logoUrl: true,
      chatbot: { select: { isActive: true, reservationEnabled: true } },
      website: { select: { isPublished: true } },
      // Çalışan varsa ziyaretçi kimden randevu alacağını seçebilir.
      employees: { select: { id: true, fullName: true, title: true }, orderBy: { createdAt: "asc" } },
    },
  });

  if (!brand) notFound();

  // Uç ile aynı koşul: chatbot rezervasyonu açık VEYA yayında bir site var.
  const acik = Boolean(
    (brand.chatbot?.isActive && brand.chatbot?.reservationEnabled) || brand.website?.isPublished
  );

  const renk = brand.primaryColor ?? "#6366f1";

  return (
    <div className="min-h-screen bg-neutral-50 px-4 py-10 text-neutral-900">
      <div className="mx-auto max-w-md">
        <div className="mb-6 text-center">
          {brand.logoUrl && (
            // Marka logoları dış depoda; next/image yapılandırması gerektirmesin diye img.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={brand.logoUrl} alt="" className="mx-auto mb-3 h-14 w-14 rounded-2xl object-cover" />
          )}
          <h1 className="text-2xl font-bold">{brand.name}</h1>
          <p className="mt-1 text-sm text-neutral-500">Rezervasyon talebi oluştur</p>
        </div>

        {acik ? (
          <ReservationForm brandId={brand.id} color={renk} employees={brand.employees} />
        ) : (
          <div className="rounded-2xl bg-white p-6 text-center shadow-sm">
            <p className="text-sm text-neutral-600">
              Online rezervasyon şu anda kapalı.
              {brand.phone && <> Bizi <a href={`tel:${brand.phone}`} className="font-semibold underline">{brand.phone}</a> numarasından arayabilirsiniz.</>}
            </p>
          </div>
        )}

        {(brand.phone || brand.address) && (
          <div className="mt-6 space-y-1 text-center text-xs text-neutral-500">
            {brand.address && <p>{brand.address}</p>}
            {brand.phone && <p><a href={`tel:${brand.phone}`} className="hover:underline">{brand.phone}</a></p>}
          </div>
        )}
      </div>
    </div>
  );
}
