import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ChatWidgetClient } from "./client";

export default async function PublicChatPage({ params }: { params: Promise<{ brandSlug: string }> }) {
  const { brandSlug } = await params;

  const brand = await prisma.brand.findUnique({
    where: { slug: brandSlug },
    include: { chatbot: true },
  });

  if (!brand || !brand.chatbot?.isActive) notFound();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[hsl(var(--background))] p-4">
      <div className="mb-4 text-center">
        {brand.logoUrl && (
          <img src={brand.logoUrl} alt={brand.name} className="mx-auto mb-2 h-12 w-auto object-contain" />
        )}
        <h1 className="text-lg font-bold">{brand.name}</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">{brand.chatbot.name} ile sohbet et</p>
      </div>
      <ChatWidgetClient
        brandId={brand.id}
        botName={brand.chatbot.name}
        primaryColor={brand.primaryColor ?? "#6366f1"}
      />
    </div>
  );
}
