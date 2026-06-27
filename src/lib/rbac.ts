// =============================================================
//  ROL BAZLI YETKİLENDİRME (RBAC)
//  Hem global roller hem marka içi roller için izin haritası.
// =============================================================
import type { GlobalRole, BrandRole } from "@prisma/client";

/** Sistem genelindeki yetkiler */
export const GLOBAL_PERMISSIONS = {
  SUPER_ADMIN: ["*"], // her şey
  ADMIN: [
    "user.read", "user.write",
    "brand.read", "brand.write",
    "subscription.read", "subscription.write",
    "settings.read", "settings.write",
    "ticket.read", "ticket.write",
    "ai.stats.read", "log.read",
  ],
  CUSTOMER: ["brand.own.read", "brand.own.write", "subscription.own.read"],
  STAFF: ["brand.assigned.read"],
} as const satisfies Record<GlobalRole, readonly string[]>;

/** Marka içi yetkiler */
export const BRAND_PERMISSIONS = {
  OWNER: ["*"],
  MANAGER: ["brand.read", "brand.write", "content.write", "review.read", "member.write"],
  EDITOR: ["brand.read", "content.write", "review.read"],
  VIEWER: ["brand.read", "review.read"],
} as const satisfies Record<BrandRole, readonly string[]>;

/** Global rolün belirtilen izne sahip olup olmadığını kontrol eder */
export function canGlobal(role: GlobalRole, permission: string): boolean {
  const perms = GLOBAL_PERMISSIONS[role] as readonly string[];
  return perms.includes("*") || perms.includes(permission);
}

/** Marka rolünün belirtilen izne sahip olup olmadığını kontrol eder */
export function canBrand(role: BrandRole, permission: string): boolean {
  const perms = BRAND_PERMISSIONS[role] as readonly string[];
  return perms.includes("*") || perms.includes(permission);
}
