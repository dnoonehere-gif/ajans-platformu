import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/server/auth/auth";

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

function addSecurityHeaders(res: NextResponse): NextResponse {
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("X-XSS-Protection", "1; mode=block");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  return res;
}

export async function middleware(req: NextRequest) {
  const hostname = req.headers.get("host") ?? "";
  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN ?? "novelya.com.tr";
  const subdomainMatch = hostname.match(new RegExp(`^([a-z0-9-]+)\\.${baseDomain.replace(".", "\\.")}$`));
  if (subdomainMatch && subdomainMatch[1] !== "www") {
    const sub = subdomainMatch[1];
    const url = req.nextUrl.clone();
    url.pathname = `/site/${sub}${req.nextUrl.pathname === "/" ? "" : req.nextUrl.pathname}`;
    return NextResponse.rewrite(url);
  }

  const { pathname } = req.nextUrl;

  const rule = PROTECTED.find((r) => r.pattern.test(pathname));
  if (!rule) return addSecurityHeaders(NextResponse.next());

  const session = await auth();

  if (!session?.user) {
    if (pathname.startsWith("/api/")) {
      return addSecurityHeaders(NextResponse.json({ error: "Yetkisiz" }, { status: 401 }));
    }
    const loginUrl = new URL("/giris", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const role = (session.user as { role?: string }).role ?? "CUSTOMER";
  if (!rule.roles.includes(role)) {
    if (pathname.startsWith("/api/")) {
      return addSecurityHeaders(NextResponse.json({ error: "Bu işlem için yetkiniz yok" }, { status: 403 }));
    }
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return addSecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
