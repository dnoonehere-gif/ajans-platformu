import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { sendCustomEmail } from "@/lib/email";
import { sendNotification } from "@/server/notifications/send";

const STAGES = ["NEW", "CONTACTED", "QUALIFIED", "PROPOSAL", "WON", "LOST"] as const;

const createSchema = z.object({
  brandId: z.string(),
  name: z.string().min(1).max(200),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  company: z.string().optional().nullable(),
  source: z.string().optional().nullable(),
  stage: z.enum(STAGES).default("NEW"),
  value: z.number().int().optional().nullable(),
  notes: z.string().optional().nullable(),
});

const updateSchema = z.object({
  id: z.string(),
  stage: z.enum(STAGES).optional(),
  notes: z.string().optional().nullable(),
  value: z.number().int().optional().nullable(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

    const userId = (session.user as { id: string }).id;
    const brandId = req.nextUrl.searchParams.get("brandId");
    if (!brandId) return NextResponse.json({ error: "brandId gerekli" }, { status: 400 });

    const brand = await prisma.brand.findFirst({ where: { id: brandId, ownerId: userId } });
    if (!brand) return NextResponse.json({ error: "Marka bulunamadı" }, { status: 404 });

    const leads = await prisma.crmLead.findMany({
      where: { brandId },
      orderBy: { updatedAt: "desc" },
      take: 200,
    });

    return NextResponse.json({ leads });
  } catch (e) {
    console.error("CRM GET error:", e);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

    const userId = (session.user as { id: string }).id;
    const body = await req.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Geçersiz veri" }, { status: 400 });

    const { brandId, ...data } = parsed.data;
    const brand = await prisma.brand.findFirst({ where: { id: brandId, ownerId: userId } });
    if (!brand) return NextResponse.json({ error: "Marka bulunamadı" }, { status: 404 });

    const lead = await prisma.crmLead.create({ data: { brandId, ...data } });

    sendNotification({
      userId,
      brandId,
      type: "crm_lead_new",
      title: `Yeni müşteri adayı: ${lead.name}`,
      body: lead.company ? `${lead.company} — ${lead.source ?? "Manuel"}` : lead.source ?? "Manuel eklendi",
      data: { leadId: lead.id },
    }).catch(() => {});

    return NextResponse.json({ lead }, { status: 201 });
  } catch (e) {
    console.error("CRM POST error:", e);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

    const userId = (session.user as { id: string }).id;
    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Geçersiz veri" }, { status: 400 });

    const { id, ...data } = parsed.data;
    const lead = await prisma.crmLead.findUnique({ where: { id }, include: { brand: true } });
    if (!lead || lead.brand.ownerId !== userId) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });

    const updated = await prisma.crmLead.update({ where: { id }, data });

    const STAGE_LABELS: Record<string, string> = {
      NEW: "Yeni", CONTACTED: "İletişime Geçildi", QUALIFIED: "Nitelikli",
      PROPOSAL: "Teklif", WON: "Kazanıldı", LOST: "Kaybedildi",
    };

    if (data.stage && data.stage !== lead.stage) {
      sendNotification({
        userId,
        brandId: lead.brandId,
        type: data.stage === "WON" ? "crm_lead_won" : "crm_lead_new",
        title: data.stage === "WON"
          ? `🎉 ${lead.name} kazanıldı!`
          : `${lead.name} → ${STAGE_LABELS[data.stage]}`,
        body: lead.value ? `Tahmini değer: ${lead.value.toLocaleString("tr-TR")}₺` : undefined,
        data: { leadId: lead.id, fromStage: lead.stage, toStage: data.stage },
      }).catch(() => {});

      const owner = await prisma.user.findUnique({ where: { id: lead.brand.ownerId }, select: { email: true } });
      if (owner?.email && (data.stage === "WON" || data.stage === "LOST")) {
        const emoji = data.stage === "WON" ? "🎉" : "⚠️";
        sendCustomEmail(
          owner.email,
          `${emoji} CRM: ${lead.name} — ${STAGE_LABELS[data.stage]}`,
          `${lead.name}${lead.company ? ` (${lead.company})` : ""} adlı müşteri adayı "${STAGE_LABELS[lead.stage]}" aşamasından "${STAGE_LABELS[data.stage]}" aşamasına geçti.${lead.value ? ` Tahmini değer: ${lead.value.toLocaleString("tr-TR")}₺` : ""}`,
        ).catch(() => {});
      }
    }

    return NextResponse.json({ lead: updated, previousStage: lead.stage });
  } catch (e) {
    console.error("CRM PATCH error:", e);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

    const userId = (session.user as { id: string }).id;
    const id = req.nextUrl.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id gerekli" }, { status: 400 });

    const lead = await prisma.crmLead.findUnique({ where: { id }, include: { brand: true } });
    if (!lead || lead.brand.ownerId !== userId) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });

    await prisma.crmLead.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("CRM DELETE error:", e);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
