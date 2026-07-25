import { prisma } from "@/lib/prisma";
import { renderToBuffer } from "@react-pdf/renderer";
import { TrialAgreementPDF } from "@/lib/pdf/contracts";
import { refreshPdfFonts } from "@/lib/pdf/fonts";
import { sendTrialStartedEmail } from "@/lib/email";

interface GrantTrialResult {
  ok: boolean;
  reason?: "no_plan" | "already_active";
  trialEndsAt?: Date;
}

/**
 * Bir markaya ücretsiz deneme aboneliği açar ve deneme sözleşmesi PDF'ini
 * marka sahibine e-posta ile gönderir. Hem otomatik deneme (marka oluşturma)
 * hem de admin daveti aktivasyonu bu tek noktadan geçer.
 *
 * Marka zaten aktif/deneme aboneliğine sahipse tekrar açmaz.
 */
export async function grantTrial(opts: {
  brandId: string;
  planSlug?: string;
  days?: number;
}): Promise<GrantTrialResult> {
  const planSlug = opts.planSlug ?? "profesyonel";
  const days = opts.days ?? 7;

  const activeSub = await prisma.subscription.findFirst({
    where: { brandId: opts.brandId, status: { in: ["ACTIVE", "TRIALING"] } },
    select: { id: true },
  });
  if (activeSub) return { ok: false, reason: "already_active" };

  const plan = await prisma.plan.findUnique({ where: { slug: planSlug } });
  if (!plan) return { ok: false, reason: "no_plan" };

  const startedAt = new Date();
  const trialEndsAt = new Date(startedAt.getTime() + days * 24 * 60 * 60 * 1000);

  await prisma.subscription.create({
    data: {
      brandId: opts.brandId,
      planId: plan.id,
      status: "TRIALING",
      startedAt,
      trialEndsAt,
      endsAt: trialEndsAt,
      provider: null,
    },
  });

  // Sözleşme PDF'i + "deneme başladı" maili — ana akışı bloklamadan gönderilir.
  const brand = await prisma.brand.findUnique({
    where: { id: opts.brandId },
    select: { name: true, owner: { select: { name: true, email: true } } },
  });
  const owner = brand?.owner;
  if (owner?.email) {
    (async () => {
      try {
        const element = TrialAgreementPDF({
          data: {
            name: owner.name ?? "",
            email: owner.email,
            planName: plan.name,
            trialDays: days,
            startedAt,
            endsAt: trialEndsAt,
            brandName: brand?.name,
          },
        });
        refreshPdfFonts();
        const pdfBuffer = await renderToBuffer(element as Parameters<typeof renderToBuffer>[0]);
        await sendTrialStartedEmail(owner.email, owner.name ?? "", { days, endsAt: trialEndsAt, planName: plan.name }, pdfBuffer as Buffer);
      } catch (e) {
        console.error("Deneme sözleşmesi PDF ile gönderilemedi, PDF'siz deneniyor:", e);
        await sendTrialStartedEmail(owner.email, owner.name ?? "", { days, endsAt: trialEndsAt, planName: plan.name }).catch((e2) =>
          console.error("Deneme başladı maili gönderilemedi:", e2)
        );
      }
    })();
  }

  return { ok: true, trialEndsAt };
}
