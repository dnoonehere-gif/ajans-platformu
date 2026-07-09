import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sendContactEmail } from "@/lib/email";

const schema = z.object({
  name: z.string().min(2, "Adınızı girin").max(100),
  email: z.string().email("Geçerli bir e-posta girin"),
  subject: z.string().min(2, "Konu girin").max(150),
  message: z.string().min(10, "Mesajınız en az 10 karakter olmalı").max(3000),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  try {
    await sendContactEmail(parsed.data);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Mesaj gönderilemedi, lütfen tekrar deneyin." }, { status: 500 });
  }
}
