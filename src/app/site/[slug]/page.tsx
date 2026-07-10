import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { BlockRenderer } from "@/components/website/block-renderer";
import type { Block } from "@/server/ai/website-generator";
import type { Metadata } from "next";

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const brand = await prisma.brand.findUnique({ where: { slug } });
  return {
    title: brand?.name ?? slug,
    description: `${brand?.name ?? slug} — resmi web sitesi`,
  };
}

export default async function PublicSitePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const brand = await prisma.brand.findUnique({
    where: { slug },
    include: {
      website: {
        include: { pages: { orderBy: { order: "asc" } } },
      },
    },
  });

  if (!brand || !brand.website?.isPublished) notFound();

  const website = brand.website;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const blocks = (website.pages[0]?.blocks ?? []) as any as Block[];

  return (
    <div className="min-h-screen">
      <BlockRenderer blocks={blocks} />
    </div>
  );
}
