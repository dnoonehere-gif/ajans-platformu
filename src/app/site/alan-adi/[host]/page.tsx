import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { BlockRenderer } from "@/components/website/block-renderer";
import type { Block, SiteTheme } from "@/server/ai/website-generator";

/**
 * Müşterinin kendi alan adından gelen istekler.
 *
 * Middleware kenar çalışma zamanında olduğu için veritabanına bakamıyor;
 * tanımadığı her konağı buraya yönlendiriyor ve alan adı → marka eşleşmesi
 * burada yapılıyor. Eşleşme yoksa 404 döner, yani rastgele bir alan adı
 * bizim sunucumuza yönlendirilse bile içerik sızmaz.
 */
export default async function CustomDomainSitePage({
  params,
}: {
  params: Promise<{ host: string }>;
}) {
  const { host } = await params;
  const konak = decodeURIComponent(host).toLowerCase().replace(/^www\./, "");

  // www'lu ve www'suz hâli aynı siteye çıksın.
  const whiteLabel = await prisma.whiteLabel.findFirst({
    where: { customDomain: { in: [konak, `www.${konak}`] } },
    select: {
      brand: {
        select: {
          website: { select: { isPublished: true, theme: true, pages: { orderBy: { order: "asc" }, take: 1 } } },
        },
      },
    },
  });

  const website = whiteLabel?.brand?.website;
  if (!website?.isPublished) notFound();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const blocks = (website.pages[0]?.blocks ?? []) as any as Block[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const theme = (website.theme ?? null) as any as SiteTheme | null;

  return (
    <div className="min-h-screen">
      <BlockRenderer blocks={blocks} theme={theme} />
    </div>
  );
}
