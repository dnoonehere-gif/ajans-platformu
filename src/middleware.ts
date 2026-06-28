import { auth } from "@/server/auth/auth";
import { NextResponse, NextRequest } from "next/server";

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
  { pattern: /^\/api\/admin/, roles: ["SUPER_ADMIN", "ADMIN"] },
  { pattern: /^\/api\/security\/2fa/, roles: ["SUPER_ADMIN", "ADMIN", "CUSTOMER", "STAFF"] },
];

// Güvenlik başlıkları
function addSecurityHeaders(res: NextResponse): NextResponse {
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("X-XSS-Protection", "1; mode=block");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  res.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Next.js dev için
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      "connect-src 'self' https:",
      "frame-ancestors 'none'",
    ].join("; ")
  );
  return res;
}

export default auth((req: NextRequest & { auth?: unknown }) => {
  const { pathname } = req.nextUrl;
  const session = (req as { auth?: { user?: { role?: string } } }).auth;

  // Güvenlik başlıkları her response'a ekle
  const applyHeaders = (res: NextResponse) => addSecurityHeaders(res);

  const rule = PROTECTED.find((r) => r.pattern.test(pathname));
  if (!rule) return applyHeaders(NextResponse.next());

  if (!session?.user) {
    if (pathname.startsWith("/api/")) {
      return applyHeaders(NextResponse.json({ error: "Yetkisiz" }, { status: 401 }));
    }
    const loginUrl = new URL("/giris", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const role = session.user.role ?? "CUSTOMER";
  if (!rule.roles.includes(role)) {
    if (pathname.startsWith("/api/")) {
      return applyHeaders(NextResponse.json({ error: "Bu işlem için yetkiniz yok" }, { status: 403 }));
    }
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return applyHeaders(NextResponse.next());
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/api/brand/:path*",
    "/api/content/:path*",
    "/api/chatbot/setup",
    "/api/dashboard/:path*",
    "/api/review/:path*",
    "/api/website/:path*",
    "/api/qr/:path*",
    "/api/admin/:path*",
    "/api/security/2fa/:path*",
    // Global header uygulamak için tüm sayfalar
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
