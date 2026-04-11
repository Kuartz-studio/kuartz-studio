import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySession } from '@/lib/auth/session';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Client portal is fully public — no auth required
  if (pathname.startsWith('/client')) {
    return NextResponse.next();
  }

  const isAuthRoute = pathname.startsWith('/login');
  const isProtectedRoute = pathname.startsWith('/tasks') || pathname.startsWith('/projects') || pathname.startsWith('/users');
  
  const session = await verifySession();
  
  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL('/login', request.nextUrl));
  }
  
  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL('/tasks', request.nextUrl));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
