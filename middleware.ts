// middleware.ts

import { auth } from '@/auth';
import { NextResponse, type NextRequest } from 'next/server';

// Dev-only auth bypass. Two gates required:
//   - NODE_ENV !== 'production' (Next sets this to 'production' on build)
//   - DEV_SKIP_AUTH === 'true'  (explicit opt-in via .env.local)
// When both are true, treat every request as authenticated.
const AUTH_BYPASSED =
  process.env.NODE_ENV !== 'production' && process.env.DEV_SKIP_AUTH === 'true';

function handleAuthed(pathname: string, url: string, isAuthenticated: boolean) {
  // Redirect authenticated users away from login page
  if (pathname === '/login') {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/admin', url));
    }
    return NextResponse.next();
  }

  // Protect admin routes
  if (pathname.startsWith('/admin')) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/login', url));
    }
  }

  // Protect admin API routes (except auth routes)
  if (pathname.startsWith('/api/') && !pathname.startsWith('/api/auth')) {
    if (!isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export default AUTH_BYPASSED
  ? (req: NextRequest) => handleAuthed(req.nextUrl.pathname, req.url, true)
  : auth((req) => handleAuthed(req.nextUrl.pathname, req.url, !!req.auth));

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/:path*',
    '/login',
  ],
};
