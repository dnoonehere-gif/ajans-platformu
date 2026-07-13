// Netgsm SMS entegrasyonu — env değişkenleri tanımlı değilse sessizce atlar.
// Gerekli env: NETGSM_USERCODE, NETGSM_PASSWORD, NETGSM_HEADER (gönderici adı)

function normalizePhone(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");
  // 05xx xxx xx xx → 5xxxxxxxxx | +90 5xx → 5xxxxxxxxx
  if (digits.length === 11 && digits.startsWith("05")) return digits.slice(1);
  if (digits.length === 12 && digits.startsWith("905")) return digits.slice(2);
  if (digits.length === 10 && digits.startsWith("5")) return digits;
  return null;
}

export async function sendSMS(phone: string, message: string): Promise<boolean> {
  const usercode = process.env.NETGSM_USERCODE;
  const password = process.env.NETGSM_PASSWORD;
  const header = process.env.NETGSM_HEADER;
  if (!usercode || !password || !header) return false;

  const normalized = normalizePhone(phone);
  if (!normalized) return false;

  try {
    const res = await fetch("https://api.netgsm.com.tr/sms/rest/v2/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(`${usercode}:${password}`).toString("base64")}`,
      },
      body: JSON.stringify({
        msgheader: header,
        messages: [{ msg: message, no: normalized }],
        encoding: "TR",
      }),
    });
    const data = await res.json().catch(() => null);
    return res.ok && data?.code === "00";
  } catch (e) {
    console.error("SMS gönderim hatası:", e);
    return false;
  }
}
