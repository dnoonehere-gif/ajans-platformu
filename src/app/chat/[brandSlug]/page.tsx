import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ChatWidgetClient } from "./client";

export default async function PublicChatPage({ params }: { params: Promise<{ brandSlug: string }> }) {
  const { brandSlug } = await params;

  const brand = await prisma.brand.findUnique({
    where: { slug: brandSlug },
    include: { chatbot: true },
  });

  // Marka gerçekten yoksa 404 doğru. Ama chatbot yalnızca PASİF olduğunda
  // çıplak 404 göstermek yanıltıcıydı: işletme sahibi linkini test ederken
  // linkin mi yanlış yoksa chatbot'un mu kapalı olduğunu anlayamıyordu.
  if (!brand) notFound();
  if (!brand.chatbot?.isActive) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[hsl(var(--background))] p-6">
        <div className="max-w-sm text-center">
          <h1 className="text-lg font-semibold">Sohbet şu anda kapalı</h1>
          <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
            {brand.name} için asistan henüz etkinleştirilmemiş. İşletme sahibiysen
            panelden Chatbot bölümünü açıp etkinleştirebilirsin.
          </p>
        </div>
      </div>
    );
  }

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
