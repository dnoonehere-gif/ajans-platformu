import { auth } from "@/server/auth/auth";
import { NextResponse } from "next/server";

// Korunan route'lar ve minimum global roller
const PROTECTED: { pattern: RegExp; roles: string[] }[] = [
  { pattern: /^\/admin/, roles: ["SUPER_ADMIN", "ADMIN"] },
  { pattern: /^\/dashboard/, roles: ["SUPER_ADMIN", "ADMIN", "CUSTOMER", "STAFF"] },
  { pattern: /^\/api\/brand/, roles: ["SUPER_ADMIN", "ADMIN", "CUSTOMER", "STAFF"] },
  { pattern: /^\/api\/content/, roles: ["SUPER_ADMIN", "ADMIN", "CUSTOMER", "STAFF"] },
  { pattern: /^\/api\/chatbot\/setup/, roles: ["SUPER_ADMIN", "ADMIN", "CUSTOMER"] },
  { pattern: /^\/api\/dashboard/, roles: ["SUPER_ADMIN", "ADMIN", "CUSTOMER", "STAFF"] },
  { pattern: /^\/api\/review/, roles: ["SUPER_ADMIN", "ADMIN", "CUSTOMER", "STAFF"] },
  { pattern: /^\/api\/website/, roles: ["SUPER_ADMIN", "ADMIN", "CUSTOMER"] },
  { pattern: /^\/api\/qr\/.+\/list/, roles: ["SUPER_ADMIN", "ADMIN", "CUSTOMER", "STAFF"] },
];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  const rule = PROTECTED.find((r) => r.pattern.test(pathname));
  if (!rule) return NextResponse.next();

  if (!session?.user) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    }
    const loginUrl = new URL("/giris", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const role = (session.user as { role?: string }).role ?? "CUSTOMER";
  if (!rule.roles.includes(role)) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Bu işlem için yetkiniz yok" }, { status: 403 });
    }
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/api/brand/:path*", "/api/content/:path*",
    "/api/chatbot/setup", "/api/dashboard/:path*", "/api/review/:path*",
    "/api/website/:path*", "/api/qr/:path*"],
};
