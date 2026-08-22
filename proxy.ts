import { NextResponse, type NextRequest } from "next/server";

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/overview",
  "/inbox",
  "/campaigns",
  "/automations",
  "/logs",
  "/settings",
  "/diagnostics",
];

function hasSessionCookie(request: NextRequest): boolean {
  return (
    request.cookies.has("authjs.session-token") ||
    request.cookies.has("__Secure-authjs.session-token") ||
    request.cookies.has("next-auth.session-token") ||
    request.cookies.has("__Secure-next-auth.session-token")
  );
}

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
  const isLogin = pathname === "/login";
  const isAuthenticated = hasSessionCookie(request);

  if (isProtected && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isLogin && isAuthenticated && !request.nextUrl.searchParams.has("callbackUrl") && !request.nextUrl.searchParams.has("mode")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/overview/:path*",
    "/inbox/:path*",
    "/campaigns/:path*",
    "/automations/:path*",
    "/logs/:path*",
    "/settings/:path*",
    "/diagnostics/:path*",
    "/login",
  ],
};
