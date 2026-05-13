import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getRequiredPermission } from '@/lib/permissions';

const PROTECTED_ROUTES = ['/dashboard', '/users', '/leads', '/tasks', '/reports', '/audit', '/settings', '/customer-portal'];
const AUTH_ROUTES = ['/login', '/register'];

function parseJwt(token: string): { sub: string; email: string; role: string; exp: number; grantedPermissions?: string[] } | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64).split('').map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

function isTokenValid(token: string | undefined): boolean {
  if (!token) return false;
  const payload = parseJwt(token);
  if (!payload) return false;
  return payload.exp > Math.floor(Date.now() / 1000);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('accessToken')?.value;
  const isValid = isTokenValid(token);
  const payload = isValid ? parseJwt(token!) : null;
  const userPermissions = payload?.grantedPermissions || [];
  const userRole = payload?.role || '';

  if (pathname === '/') {
    return isValid ? NextResponse.redirect(new URL('/dashboard', request.url)) : NextResponse.redirect(new URL('/login', request.url));
  }

  if (AUTH_ROUTES.some(r => pathname.startsWith(r))) {
    if (isValid) return NextResponse.redirect(new URL('/dashboard', request.url));
    return NextResponse.next();
  }

  if (!isValid && PROTECTED_ROUTES.some(r => pathname.startsWith(r))) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (isValid) {
    if (userRole === 'ADMIN') return NextResponse.next();
    const requiredPermission = getRequiredPermission(pathname);
    if (requiredPermission && !userPermissions.includes(requiredPermission) && !userPermissions.includes('*')) {
      return NextResponse.redirect(new URL('/403', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};