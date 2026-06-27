import { auth } from "@/server/auth/auth";
import { prisma } from "@/lib/prisma";
import type { GlobalRole, BrandRole } from "@prisma/client";
import { canGlobal, canBrand } from "@/lib/rbac";

export interface AuthUser {
  id: string;
  email: string;
  role: GlobalRole;
}

/** Oturumu doğrular ve kullanıcıyı döndürür. Yoksa null. */
export async function getAuthUser(): Promise<AuthUser | null> {
  const session = await auth();
  if (!session?.user) return null;
  const user = session.user as { id?: string; email?: string; role?: string };
  if (!user.id || !user.email) return null;
  return {
    id: user.id,
    email: user.email,
    role: (user.role ?? "CUSTOMER") as GlobalRole,
  };
}

/** Global izin kontrolü. */
export async function requireGlobalPermission(
  permission: string
): Promise<{ user: AuthUser } | { error: string; status: number }> {
  const user = await getAuthUser();
  if (!user) return { error: "Yetkisiz", status: 401 };
  if (!canGlobal(user.role, permission)) return { error: "Bu işlem için yetkiniz yok", status: 403 };
  return { user };
}

/** Kullanıcının markaya erişimini + marka içi rolünü döndürür. */
export async function getBrandAccess(
  brandId: string,
  userId: string
): Promise<{ role: BrandRole; isOwner: boolean } | null> {
  const brand = await prisma.brand.findFirst({
    where: { id: brandId },
    select: { ownerId: true },
  });
  if (!brand) return null;

  if (brand.ownerId === userId) return { role: "OWNER", isOwner: true };

  const member = await prisma.brandMember.findUnique({
    where: { brandId_userId: { brandId, userId } },
  });
  if (!member) return null;

  return { role: member.role, isOwner: false };
}

/** Marka işlemi için izin kontrolü — hem global hem marka içi roller dikkate alınır. */
export async function requireBrandPermission(
  brandId: string,
  permission: string
): Promise<{ user: AuthUser; brandRole: BrandRole } | { error: string; status: number }> {
  const user = await getAuthUser();
  if (!user) return { error: "Yetkisiz", status: 401 };

  // SUPER_ADMIN ve ADMIN her markaya erişebilir
  if (canGlobal(user.role, "*")) {
    return { user, brandRole: "OWNER" };
  }

  const access = await getBrandAccess(brandId, user.id);
  if (!access) return { error: "Bu markaya erişim yetkiniz yok", status: 403 };

  if (!canBrand(access.role, permission) && !canBrand(access.role, "*")) {
    return { error: "Bu işlem için marka yetkiniz yok", status: 403 };
  }

  return { user, brandRole: access.role };
}
