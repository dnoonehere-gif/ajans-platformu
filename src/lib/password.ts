import { z } from "zod";

/**
 * Ortak şifre kuralı. Önceden yalnızca "en az 8 karakter" isteniyordu; bu
 * "12345678" gibi şifrelere izin veriyordu. Dönüşümü boğmamak için karmaşıklık
 * makul tutuldu: en az 8 karakter + en az bir harf + en az bir rakam.
 * Ayrıca çok yaygın şifreler doğrudan reddedilir.
 */
const COMMON = new Set([
  "12345678", "123456789", "1234567890", "password", "parola123",
  "qwerty123", "11111111", "00000000", "sifre123", "password1",
  "novelya123", "admin123", "iloveyou", "abc12345",
]);

export const passwordSchema = z
  .string()
  .min(8, "Şifre en az 8 karakter olmalı")
  .max(72, "Şifre en fazla 72 karakter olabilir") // bcrypt sınırı
  .refine((v) => /[a-zA-ZğüşıöçĞÜŞİÖÇ]/.test(v), "Şifre en az bir harf içermeli")
  .refine((v) => /[0-9]/.test(v), "Şifre en az bir rakam içermeli")
  .refine((v) => !COMMON.has(v.toLowerCase()), "Bu şifre çok yaygın, daha güçlü bir tane seçin");

/** İstemci tarafı güç göstergesi için 0-4 arası puan. */
export function passwordScore(v: string): number {
  let s = 0;
  if (v.length >= 8) s++;
  if (v.length >= 12) s++;
  if (/[a-zğüşıöç]/i.test(v) && /[0-9]/.test(v)) s++;
  if (/[^a-zA-Z0-9]/.test(v)) s++;
  if (COMMON.has(v.toLowerCase())) return 0;
  return Math.min(4, s);
}
