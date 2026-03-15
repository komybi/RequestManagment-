import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function middleware(request: any) {
  try {
    const session = await auth();
    const pathname = request.nextUrl.pathname;

    // Public routes - no authentication needed
    if (pathname.startsWith('/auth/') || pathname.startsWith('/track')) {
      return NextResponse.next();
    }

    // If user is not authenticated, redirect to login
    if (!session) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    // Get user role
    const role = (session.user as any)?.role;

    // Role-based redirection for root path
    if (pathname === '/') {
      switch (role) {
        case 'admin':
          return NextResponse.redirect(new URL('/admin', request.url));
        case 'registrar':
          return NextResponse.redirect(new URL('/registrar', request.url));
        case 'revenue':
          return NextResponse.redirect(new URL('/revenue', request.url));
        case 'student':
          return NextResponse.redirect(new URL('/dashboard', request.url));
        default:
          return NextResponse.next();
      }
    }

    // Role-based access control for protected routes
    if (pathname.startsWith('/admin') && role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url));
    }
    if (pathname.startsWith('/registrar') && role !== 'registrar') {
      return NextResponse.redirect(new URL('/', request.url));
    }
    if (pathname.startsWith('/revenue') && role !== 'revenue') {
      return NextResponse.redirect(new URL('/', request.url));
    }
    if (pathname.startsWith('/dashboard') && role !== 'student') {
      return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
  } catch (error) {
    console.error('[v0] Middleware error:', error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: ['/', '/dashboard/:path*', '/admin/:path*', '/registrar/:path*', '/revenue/:path*'],
};
