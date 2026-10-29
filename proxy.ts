import { NextResponse } from "next/server";
import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

// Built from the Edge-safe config only — importing "@/auth" here would
// pull mongoose into the Edge bundle and break the deploy.
const { auth } = NextAuth(authConfig);

// Routes that manage admins themselves are SUPER_ADMIN-only — a normal
// ADMIN or EDITOR should never reach these, at the routing layer or the
// API layer. This is a first line of defense; every route handler must
// ALSO re-check permissions itself (see lib/permissions.ts) rather than
// trusting that proxy.ts was the only gate — never rely on this alone.
const SUPER_ADMIN_ONLY_PREFIXES = ["/admin/admins", "/api/admins", "/admin/audit-logs", "/api/audit-logs"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  const isLoginPage = pathname === "/admin/login";
  const isNextAuthApi = pathname.startsWith("/api/auth");
  if (isLoginPage || isNextAuthApi) return NextResponse.next();

  const isAdminPage = pathname.startsWith("/admin");
  const isPublicReadableApi =
    pathname.startsWith("/api/universities") || pathname.startsWith("/api/articles");
  const isAlwaysProtectedApi =
    pathname.startsWith("/api/admins") || pathname.startsWith("/api/audit-logs");
  const isProtectedApi =
    isAlwaysProtectedApi || (isPublicReadableApi && req.method !== "GET");

  if (!isAdminPage && !isProtectedApi) return NextResponse.next();

  if (!session?.user) {
    if (isProtectedApi) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const loginUrl = new URL("/admin/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const requiresSuperAdmin = SUPER_ADMIN_ONLY_PREFIXES.some((p) =>
    pathname.startsWith(p)
  );
  if (requiresSuperAdmin && session.user.role !== "SUPER_ADMIN") {
    if (isProtectedApi) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/universities/:path*",
    "/api/articles/:path*",
    "/api/admins/:path*",
    "/api/audit-logs/:path*",
  ],
};
