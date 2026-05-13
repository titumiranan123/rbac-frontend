import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ROUTE_PERMISSIONS: Record<string, string> = {
  "/dashboard/users": "view_users",
  "/dashboard/leads": "view_leads",
  "/dashboard/tasks": "view_tasks",
  "/dashboard/reports": "view_reports",
  "/dashboard/audit": "view_audit_log",
  "/dashboard/settings": "view_settings",
  "/dashboard/customer-portal": "view_customer_portal",
};

function parseJwt(token: string) {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
}

function isTokenValid(token: string | undefined): boolean {
  if (!token) return false;
  const payload = parseJwt(token);
  if (!payload) return false;
  if (!payload.exp) return true;
  return payload.exp * 1000 > Date.now();
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("accessToken")?.value;
  const isValid = isTokenValid(token);
  const payload = token ? parseJwt(token) : null;
  const role = payload?.role || "";
  const permissions: string[] = payload?.grantedPermissions || [];

  if (pathname === "/") {
    return NextResponse.redirect(new URL(isValid ? "/dashboard" : "/login", request.url));
  }

  if (pathname === "/login" || pathname === "/register") {
    if (isValid) return NextResponse.redirect(new URL("/dashboard", request.url));
    return NextResponse.next();
  }

  if (!isValid) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (role === "ADMIN") return NextResponse.next();

  const required = Object.entries(ROUTE_PERMISSIONS).find(
    ([route]) => pathname === route || pathname.startsWith(route + "/"),
  )?.[1];

  if (required && !permissions.includes(required)) {
    return NextResponse.redirect(new URL("/403", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
