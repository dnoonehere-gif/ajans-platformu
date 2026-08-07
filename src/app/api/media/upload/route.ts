import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";

/**
 * Site içeriği için görsel/video yükleme.
 *
 * Logo yüklemesiyle aynı Supabase Storage kovasını (brand-assets) kullanır;
 * ayrı bir servise gerek yok. Dosyalar marka klasörüne ayrılır, böylece
 * markalar birbirinin dosyasını ezemez.
 */

const MAX_IMAGE = 8 * 1024 * 1024;   // 8 MB
const MAX_VIDEO = 50 * 1024 * 1024;  // 50 MB

/**
 * İzin verilen türler.
 *
 * Görsellerde katı bir liste gerçek kullanıcıyı engelliyordu: iPhone
 * fotoğrafları HEIC/HEIF, bazı Android'ler farklı MIME bildiriyor. Görsel
 * tarafında "image/*" kabul edilip yalnızca tehlikeli olanlar (SVG — script
 * çalıştırabilir) dışlanıyor. Video tarafı dar tutuluyor.
 */
const ENGELLI_GORSEL = ["image/svg+xml"];
const IZINLI_VIDEO = ["video/mp4", "video/webm", "video/quicktime"];

function turUygunMu(tur: string) {
  if (tur.startsWith("image/")) return !ENGELLI_GORSEL.includes(tur);
  return IZINLI_VIDEO.includes(tur);
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const brandId = formData.get("brandId") as string | null;

  if (!file || !brandId) {
    return NextResponse.json({ error: "Dosya veya marka eksik" }, { status: 400 });
  }

  // Sahiplik: kullanıcı yalnızca kendi markasına yükleyebilir.
  const brand = await prisma.brand.findFirst({
    where: { id: brandId, ownerId: user.id },
    select: { id: true },
  });
  if (!brand) return NextResponse.json({ error: "Marka bulunamadı" }, { status: 404 });

  // Tür kontrolü tarayıcının bildirdiği MIME'a değil, izin listesine dayanır.
  if (!turUygunMu(file.type)) {
    return NextResponse.json(
      { error: `Bu dosya türü desteklenmiyor (${file.type || "bilinmiyor"}). Görsel veya MP4/WEBM/MOV video yükleyin.` },
      { status: 400 }
    );
  }

  const isVideo = file.type.startsWith("video/");
  const limit = isVideo ? MAX_VIDEO : MAX_IMAGE;
  if (file.size > limit) {
    return NextResponse.json(
      { error: `Dosya ${Math.round(limit / 1024 / 1024)}MB'dan büyük olamaz` },
      { status: 400 }
    );
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: "Dosya deposu yapılandırılmamış" }, { status: 503 });
  }

  // Dosya adı kullanıcıdan gelen metinden türetilmez — yalnızca uzantı alınır.
  const ext = (file.name.split(".").pop() ?? "bin").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 5);
  const path = `sites/${brandId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const res = await fetch(`${supabaseUrl}/storage/v1/object/brand-assets/${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${supabaseKey}`,
      "Content-Type": file.type,
      "Cache-Control": "31536000",
    },
    body: await file.arrayBuffer(),
  });

  if (!res.ok) {
    console.error("Medya yükleme hatası:", await res.text());
    return NextResponse.json({ error: "Yükleme başarısız" }, { status: 500 });
  }

  return NextResponse.json({
    url: `${supabaseUrl}/storage/v1/object/public/brand-assets/${path}`,
    kind: isVideo ? "video" : "image",
  });
}
