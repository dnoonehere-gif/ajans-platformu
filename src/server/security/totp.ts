import { authenticator } from "otplib";
import QRCode from "qrcode";

const APP_NAME = "Ajans Platformu";

authenticator.options = { window: 1 }; // ±1 period tolerans (30sn)

export function generateTotpSecret(): string {
  return authenticator.generateSecret(20);
}

export function verifyTotp(token: string, secret: string): boolean {
  try {
    return authenticator.verify({ token: token.replace(/\s/g, ""), secret });
  } catch {
    return false;
  }
}

export function getTotpUri(email: string, secret: string): string {
  return authenticator.keyuri(email, APP_NAME, secret);
}

export async function generateQrCodeDataUrl(uri: string): Promise<string> {
  return QRCode.toDataURL(uri, {
    width: 256,
    margin: 2,
    color: { dark: "#ffffff", light: "#18181f" }, // dark mode uyumlu
  });
}
