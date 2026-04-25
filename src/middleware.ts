import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  // Handle uploads directory requests
  if (request.nextUrl.pathname.startsWith('/uploads/')) {
    // Rewrite to API route
    const url = request.nextUrl.clone();
    url.pathname = `/api${url.pathname}`;
    return NextResponse.rewrite(url);
  }

  // Admin panel authentication kontrolü
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Login sayfasına erişim serbest
    if (request.nextUrl.pathname === '/admin/login') {
      return NextResponse.next();
    }

    try {
      const token = await getToken({ 
        req: request, 
        secret: process.env.NEXTAUTH_SECRET 
      });

      // Token yoksa veya geçersizse login sayfasına yönlendir
      if (!token || !token.username) {
        const loginUrl = new URL('/admin/login', request.url);
        return NextResponse.redirect(loginUrl);
      }

      return NextResponse.next();
    } catch {
      // Token parse hatası durumunda login sayfasına yönlendir
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/uploads/:path*', '/admin', '/admin/:path*'],
};
