
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { AuthUser } from '@/hooks/use-auth';

const AUTH_COOKIE_NAME = 'readify-auth';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Get user from cookie
  const authCookie = request.cookies.get(AUTH_COOKIE_NAME);
  let user: AuthUser | null = null;
  if (authCookie) {
    try {
      user = JSON.parse(authCookie.value);
    } catch (error) {
      // Invalid JSON in cookie, treat as unauthenticated
      user = null;
    }
  }

  const isAuthenticated = !!user;

  // 2. Define public, protected, and admin routes
  const isPublicRoute = ['/', '/login'].includes(pathname);
  const isAppRoute = pathname.startsWith('/app');
  const isAdminRoute = pathname.startsWith('/admin');

  // 3. Redirect logic
  // If trying to access a protected route without being authenticated, redirect to login
  if (!isAuthenticated && (isAppRoute || isAdminRoute)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If authenticated and trying to access a public route (like /login), redirect to the app dashboard
  if (isAuthenticated && isPublicRoute) {
    return NextResponse.redirect(new URL('/app', request.url));
  }

  // If a regular user tries to access an admin route, redirect to the app dashboard
  if (isAuthenticated && isAdminRoute && user.role === 'User') {
     return NextResponse.redirect(new URL('/app', request.url));
  }

  // 4. If no redirect is needed, continue
  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
