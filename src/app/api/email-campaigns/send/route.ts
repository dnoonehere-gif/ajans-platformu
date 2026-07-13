import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { prisma } from "@/lib/prisma";
import { sendBulkEmail } from "@/lib/email";
import { sendNotification } from "@/server/notifications/send";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

    const userId = (session.user as { id: string }).id;
    const { campaignId } = await req.json();
    if (!campaignId) return NextResponse.json({ error: "campaignId gerekli" }, { status: 400 });

    const campaign = await prisma.emailCampaign.findUnique({
      where: { id: campaignId },
      include: { brand: true },
    });
    if (!campaign || campaign.brand.ownerId !== userId) {
      return NextResponse.json({ error: "Kampanya bulunamadı" }, { status: 404 });
    }
    if (campaign.status !== "DRAFT" && campaign.status !== "SCHEDULED") {
      return NextResponse.json({ error: "Bu kampanya zaten gönderilmiş" }, { status: 400 });
    }

    const contacts = await prisma.emailContact.findMany({
      where: {
        brandId: campaign.brandId,
        ...(campaign.recipientTag ? { tags: { has: campaign.recipientTag } } : {}),
      },
      select: { email: true },
    });

    if (contacts.length === 0) {
      return NextResponse.json({ error: "Gönderilecek kişi bulunamadı. Önce kişi ekleyin." }, { status: 400 });
    }

    await prisma.emailCampaign.update({
      where: { id: campaignId },
      data: { status: "SENDING" },
    });

    const emails = contacts.map((c) => c.email);

    try {
      await sendBulkEmail(emails, campaign.subject, campaign.body);
      await prisma.emailCampaign.update({
        where: { id: campaignId },
        data: { status: "SENT", sentCount: emails.length, sentAt: new Date() },
      });
      sendNotification({
        userId,
        brandId: campaign.brandId,
        type: "email_campaign_sent",
        title: `Kampanya gönderildi: ${campaign.subject}`,
        body: `${emails.length} kişiye başarıyla gönderildi`,
        data: { campaignId: campaign.id, sentCount: emails.length },
      }).catch(() => {});

      return NextResponse.json({ success: true, sentCount: emails.length });
    } catch (sendErr) {
      console.error("Email send error:", sendErr);
      await prisma.emailCampaign.update({
        where: { id: campaignId },
        data: { status: "FAILED" },
      });
      return NextResponse.json({ error: "E-posta gönderimi başarısız oldu" }, { status: 500 });
    }
  } catch (e) {
    console.error("EmailCampaigns send error:", e);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
