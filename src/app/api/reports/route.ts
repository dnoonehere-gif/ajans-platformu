import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { z } from "zod";
import { buildReport, hasReportingAccess } from "@/lib/reports";

const schema = z.object({
  brandId: z.string(),
  period: z.enum(["week", "month"]).default("month"),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

    const userId = (session.user as { id: string }).id;
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Geçersiz veri" }, { status: 400 });

    const { brandId, period } = parsed.data;
    const hasAccess = await hasReportingAccess(userId, brandId);
    if (!hasAccess) return NextResponse.json({ error: "Bu özellik Ajans planına özeldir" }, { status: 403 });

    const report = await buildReport(brandId, period);
    return NextResponse.json({ report });
  } catch (e) {
    console.error("Reports POST error:", e);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
