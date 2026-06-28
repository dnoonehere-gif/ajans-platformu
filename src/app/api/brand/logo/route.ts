import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-guard";

export async function POST(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const slug = formData.get("slug") as string | null;

  if (!file || !slug) return NextResponse.json({ error: "Dosya veya slug eksik" }, { status: 400 });
  if (file.size > 5 * 1024 * 1024) return NextResponse.json({ error: "Dosya 5MB'dan büyük olamaz" }, { status: 400 });
  if (!file.type.startsWith("image/")) return NextResponse.json({ error: "Sadece resim dosyası yüklenebilir" }, { status: 400 });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    // Supabase ayarlanmamışsa placeholder döndür
    return NextResponse.json({ url: null });
  }

  const ext = file.name.split(".").pop() ?? "png";
  const path = `logos/${slug}-${Date.now()}.${ext}`;
  const bytes = await file.arrayBuffer();

  const res = await fetch(`${supabaseUrl}/storage/v1/object/brand-assets/${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${supabaseKey}`,
      "Content-Type": file.type,
    },
    body: bytes,
  });

  if (!res.ok) return NextResponse.json({ error: "Yükleme başarısız" }, { status: 500 });

  const url = `${supabaseUrl}/storage/v1/object/public/brand-assets/${path}`;
  return NextResponse.json({ url });
}
