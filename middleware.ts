import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function middleware(request: any) {
  try {
    const session = await auth();
    const pathname = request.nextUrl.pathname;

    // Public routes
    if (pathname.startsWith('/auth/') || pathname.startsWith('/track')) {
      return NextResponse.next();
    }

    // Check authentication for protected routes
    if (
      pathname.startsWith('/dashboard') ||
      pathname.startsWith('/admin') ||
      pathname.startsWith('/registrar') ||
      pathname.startsWith('/revenue')
    ) {
      if (!session) {
        return NextResponse.redirect(new URL('/auth/login', request.url));
      }

      // Role-based access control
      const role = (session.user as any)?.role;

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
    }

    return NextResponse.next();
  } catch (error) {
    console.error('[v0] Middleware error:', error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/registrar/:path*', '/revenue/:path*'],
};
