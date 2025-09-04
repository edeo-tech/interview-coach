import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Public routes that don't require authentication
  const publicRoutes = ['/', '/welcome', '/login', '/register', '/terms'];
  
  // Check if the current path is a public route
  const isPublicRoute = publicRoutes.includes(pathname);
  
  // For middleware, we can't access localStorage, so we'll be more permissive
  // and let client-side routing handle auth redirects for public routes
  const accessToken = request.cookies.get('accessToken')?.value || 
                    request.headers.get('authorization')?.replace('Bearer ', '');

  // Only block access to clearly protected routes if no token is found
  // Let /, /welcome, /login, /register through regardless of auth status
  const protectedPaths = ['/dashboard', '/interviews', '/jobs', '/profile', '/paywall'];
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));
  
  if (!accessToken && isProtectedPath) {
    return NextResponse.redirect(new URL('/welcome', request.url));
  }

  return NextResponse.next();
}

// Configure which routes this middleware runs on
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