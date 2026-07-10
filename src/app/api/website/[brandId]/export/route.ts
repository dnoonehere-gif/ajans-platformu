import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import type { Block } from "@/server/ai/website-generator";

function renderBlocksToHtml(blocks: Block[], siteTitle: string): string {
  const sections = blocks.map((block) => renderBlock(block)).join("\n");
  return `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(siteTitle)}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: system-ui, -apple-system, sans-serif; color: #111; background: #fff; line-height: 1.6; }
    a { color: inherit; text-decoration: none; }
    img { max-width: 100%; }
    .container { max-width: 1100px; margin: 0 auto; padding: 0 24px; }
    .grid-3 { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 24px; }
    .grid-2 { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; }
    .grid-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; text-align: center; }
    .card { background: #f8f9fa; border-radius: 16px; padding: 24px; }
    .btn { display: inline-block; padding: 12px 28px; border-radius: 12px; font-weight: 600; color: #fff; cursor: pointer; transition: opacity .2s; }
    .btn:hover { opacity: .85; }
    @media(max-width:600px){ .grid-stats { grid-template-columns: 1fr; } }
  </style>
</head>
<body>
${sections}
<footer style="text-align:center;padding:32px;font-size:13px;color:#888;">
  Bu site <a href="https://novelya.com.tr" style="color:#6366f1">Novelya</a> ile oluşturuldu.
</footer>
</body>
</html>`;
}

function esc(s: unknown): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderBlock(block: Block): string {
  const d = block.data as Record<string, unknown>;
  switch (block.type) {
    case "hero": {
      const bg = esc(d.bgColor ?? "#6366f1");
      return `<section style="padding:112px 24px;text-align:center;background:linear-gradient(135deg,${bg}33,${bg}08)">
  <div class="container">
    <h1 style="font-size:clamp(2rem,5vw,3.2rem);font-weight:800;max-width:700px;margin:0 auto 20px">${esc(d.headline)}</h1>
    <p style="font-size:1.1rem;color:#555;max-width:520px;margin:0 auto 32px">${esc(d.subheadline)}</p>
    <a href="${esc(d.ctaHref)}" class="btn" style="background:${bg}">${esc(d.cta)}</a>
  </div>
</section>`;
    }
    case "features": {
      const items = (d.items as { icon: string; title: string; desc: string }[]) ?? [];
      return `<section style="padding:80px 24px;background:#f8f9fa">
  <div class="container">
    <h2 style="text-align:center;font-size:2rem;font-weight:700;margin-bottom:40px">${esc(d.title)}</h2>
    <div class="grid-3">
      ${items.map((it) => `<div class="card" style="text-align:center">
        <div style="font-size:2.5rem;margin-bottom:12px">${esc(it.icon)}</div>
        <h3 style="font-weight:600;margin-bottom:8px">${esc(it.title)}</h3>
        <p style="color:#555;font-size:.9rem">${esc(it.desc)}</p>
      </div>`).join("\n")}
    </div>
  </div>
</section>`;
    }
    case "about": {
      const stats = (d.stats as { value: string; label: string }[]) ?? [];
      return `<section style="padding:80px 24px">
  <div class="container" style="max-width:800px">
    <h2 style="font-size:2rem;font-weight:700;margin-bottom:24px">${esc(d.title)}</h2>
    <p style="color:#555;margin-bottom:40px;line-height:1.8">${esc(d.body)}</p>
    <div class="grid-stats">
      ${stats.map((s) => `<div class="card">
        <div style="font-size:2rem;font-weight:800;color:#6366f1">${esc(s.value)}</div>
        <div style="font-size:.85rem;color:#888;margin-top:4px">${esc(s.label)}</div>
      </div>`).join("\n")}
    </div>
  </div>
</section>`;
    }
    case "services": {
      const items = (d.items as { title: string; desc: string; icon: string }[]) ?? [];
      return `<section style="padding:80px 24px;background:#f8f9fa">
  <div class="container">
    <h2 style="text-align:center;font-size:2rem;font-weight:700;margin-bottom:40px">${esc(d.title)}</h2>
    <div class="grid-2">
      ${items.map((it) => `<div class="card" style="display:flex;gap:16px;align-items:flex-start">
        <span style="font-size:2rem">${esc(it.icon)}</span>
        <div>
          <h3 style="font-weight:600;margin-bottom:6px">${esc(it.title)}</h3>
          <p style="color:#555;font-size:.9rem">${esc(it.desc)}</p>
        </div>
      </div>`).join("\n")}
    </div>
  </div>
</section>`;
    }
    case "cta": {
      const btnColor = esc(d.buttonColor ?? "#6366f1");
      return `<section style="padding:80px 24px;text-align:center">
  <div class="card container" style="max-width:640px;padding:64px 40px;border-radius:24px">
    <h2 style="font-size:2rem;font-weight:700;margin-bottom:16px">${esc(d.title)}</h2>
    <p style="color:#555;margin-bottom:32px">${esc(d.body)}</p>
    <a href="${esc(d.buttonHref)}" class="btn" style="background:${btnColor}">${esc(d.buttonText)}</a>
  </div>
</section>`;
    }
    case "contact": {
      const phone = d.phone ? String(d.phone) : null;
      const email = d.email ? String(d.email) : null;
      const address = d.address ? String(d.address) : null;
      return `<section id="contact" style="padding:80px 24px;background:#f8f9fa;text-align:center">
  <div class="container">
    <h2 style="font-size:2rem;font-weight:700;margin-bottom:40px">${esc(d.title)}</h2>
    <div style="font-size:1.1rem;display:flex;flex-direction:column;gap:16px;align-items:center">
      ${phone ? `<p>📞 <a href="tel:${esc(phone)}" style="color:#6366f1">${esc(phone)}</a></p>` : ""}
      ${email ? `<p>✉️ <a href="mailto:${esc(email)}" style="color:#6366f1">${esc(email)}</a></p>` : ""}
      ${address ? `<p>📍 ${esc(address)}</p>` : ""}
    </div>
  </div>
</section>`;
    }
    default:
      return "";
  }
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
  const html = renderBlocksToHtml(blocks, website.title);

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Disposition": `attachment; filename="${website.brand.slug}-website.html"`,
    },
  });
}
