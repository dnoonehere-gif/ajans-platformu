import { getToken } from "next-auth/jwt";
import { headers, cookies } from "next/headers";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import type { GlobalRole, BrandRole } from "@prisma/client";
import { canGlobal, canBrand } from "@/lib/rbac";

export interface AuthUser {
  id: string;
  email: string;
  role: GlobalRole;
}

/** Oturumu doğrular ve kullanıcıyı döndürür. Yoksa null. */
export async function getAuthUser(req?: NextRequest): Promise<AuthUser | null> {
  const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;

  let token;
  if (req) {
    token = await getToken({ req, secret });
  } else {
    // Route handler'larda req olmayabilir — headers/cookies API ile sentetik Request oluştur
    const cookieStore = await cookies();
    const headerStore = await headers();
    const cookieHeader = cookieStore.getAll().map((c) => `${c.name}=${c.value}`).join("; ");
    const host = headerStore.get("host") ?? "localhost";
    const proto = headerStore.get("x-forwarded-proto") ?? "https";
    const syntheticReq = new NextRequest(`${proto}://${host}/api/__auth_check`, {
      headers: { cookie: cookieHeader, host },
    });
    token = await getToken({ req: syntheticReq, secret });
  }

  if (!token) return null;
  const id = token.sub ?? (token.id as string | undefined);
  const email = token.email as string | undefined;
  if (!id || !email) return null;
  return {
    id,
    email,
    role: ((token.role as string) ?? "CUSTOMER") as GlobalRole,
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
