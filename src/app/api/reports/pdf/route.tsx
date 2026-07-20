import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { renderToBuffer } from "@react-pdf/renderer";
import { buildReport, hasReportingAccess, type ReportPeriod } from "@/lib/reports";
import { ReportPDF } from "@/lib/pdf/report";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

    const userId = (session.user as { id: string }).id;
    const { searchParams } = new URL(req.url);
    const brandId = searchParams.get("brandId") ?? "";
    const period: ReportPeriod = searchParams.get("period") === "week" ? "week" : "month";
    const lang = searchParams.get("lang") === "en" ? "en" : "tr";

    if (!brandId) return NextResponse.json({ error: "Marka belirtilmedi" }, { status: 400 });

    const hasAccess = await hasReportingAccess(userId, brandId);
    if (!hasAccess) return NextResponse.json({ error: "Bu özellik Ajans planına özeldir" }, { status: 403 });

    const report = await buildReport(brandId, period);
    const buffer = await renderToBuffer(<ReportPDF report={report} lang={lang} />);

    const safeName = report.brand.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "rapor";
    const dateTag = new Date().toISOString().slice(0, 10);

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${safeName}-${period}-${dateTag}.pdf"`,
      },
    });
  } catch (e) {
    console.error("Report PDF error:", e);
    return NextResponse.json({ error: "PDF oluşturulamadı" }, { status: 500 });
  }
}
