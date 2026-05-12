import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedRoutes = ['/dashboard', '/users', '/leads', '/tasks', '/reports', '/audit', '/settings'];
const adminRoutes = ['/users'];

function parseJwt(token: string): { sub: string; email: string; role: string; exp: number } | null {
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

  if (!isValid && protectedRoutes.some((route) => pathname.startsWith(route))) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isValid && pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (adminRoutes.some((route) => pathname.startsWith(route))) {
    if (!token) return NextResponse.redirect(new URL('/login', request.url));
    const payload = parseJwt(token);
    if (payload && payload.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/403', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|login|register|403).*)'],
};