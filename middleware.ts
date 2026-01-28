// middleware.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Always allow auth API routes
  if (pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }
  
  // Always allow login page
  if (pathname === '/login') {
    return NextResponse.next();
  }
  
  // Check for session token
  const token = await getToken({ 
    req: request,
    secret: process.env.AUTH_SECRET,
  });
  
  // Protect other admin routes
  if (pathname.startsWith('/admin')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }
  
  // Protect admin API routes
  if (pathname.startsWith('/api/') && !token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/:path*',
    '/login',
  ],
};
