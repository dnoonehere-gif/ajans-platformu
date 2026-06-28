import * as otplib from "otplib";
import QRCode from "qrcode";

const APP_NAME = "Ajans Platformu";

export function generateTotpSecret(): string {
  return otplib.generateSecret();
}

export async function verifyTotp(token: string, secret: string): Promise<boolean> {
  try {
    const result = await otplib.verify({ token: token.replace(/\s/g, ""), secret });
    return typeof result === "boolean" ? result : (result as { valid: boolean }).valid;
  } catch {
    return false;
  }
}

export async function getTotpUri(email: string, secret: string): Promise<string> {
  return otplib.generateURI({ label: email, issuer: APP_NAME, secret });
}

export async function generateQrCodeDataUrl(uri: string): Promise<string> {
  return QRCode.toDataURL(uri, {
    width: 256,
    margin: 2,
    color: { dark: "#ffffff", light: "#18181f" },
  });
}
