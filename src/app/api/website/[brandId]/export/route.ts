import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { BlockRenderer } from "@/components/website/block-renderer";
import type { Block, SiteTheme } from "@/server/ai/website-generator";

/**
 * Siteyi tek dosyalık HTML olarak dışa aktarır.
 *
 * Önceden burada ELLE yazılmış ikinci bir HTML üreticisi vardı: yalnızca eski
 * altı bloğu tanıyor, temayı (palet/tipografi/düzen) hiç bilmiyordu. Bu yüzden
 * indirilen dosya editörde görünen siteyle aynı çıkmıyordu — yeni bloklar
 * (galeri, fiyat, SSS, ekip, yorumlar, saatler) sessizce kayboluyordu.
 *
 * Artık sayfayı ekranda çizen bileşenin TA KENDİSİ sunucuda render ediliyor,
 * yani çıktı tanım gereği birebir aynı. Tailwind sınıfları tek dosyada da
 * çalışsın diye Play CDN gömülüyor (indirilen dosyada CSP kısıtı yok).
 */

function esc(s: unknown): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ brandId: string }> }
) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { brandId } = await params;

  const website = await prisma.website.findFirst({
    where: { brandId, brand: { ownerId: user.id } },
    include: { pages: { orderBy: { order: "asc" } }, brand: true },
  });
  if (!website) return NextResponse.json({ error: "Site bulunamadı" }, { status: 404 });

  const blocks = (website.pages[0]?.blocks ?? []) as unknown as Block[];
  const theme = (website.theme ?? null) as unknown as SiteTheme | null;

  // editable verilmez → düzenleyici kodu, contentEditable ve hover efektleri
  // indirilen dosyaya sızmaz.
  // Next.js, rota dosyalarında react-dom/server'ın STATİK importunu yasaklıyor
  // (istemci paketine sızmasın diye). Burada kod zaten yalnızca sunucuda
  // çalışıyor, bu yüzden çalışma anında yükleniyor.
  const { renderToStaticMarkup } = await import("react-dom/server");
  const body = renderToStaticMarkup(
    BlockRenderer({ blocks, theme }) as React.ReactElement
  );

  const html = `<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(website.title)}</title>
<script src="https://cdn.tailwindcss.com"></script>
<style>
  *,*::before,*::after{box-sizing:border-box}
  body{margin:0;line-height:1.6}
  a{color:inherit;text-decoration:none}
  img,video{max-width:100%}
</style>
</head>
<body>
${body}
</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Disposition": `attachment; filename="${website.brand.slug}-website.html"`,
    },
  });
}
