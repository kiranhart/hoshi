import { getSessionCookie } from 'better-auth/cookies';
import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  // Allow all auth routes to pass through
  if (req.nextUrl.pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }
  
  // Check session for protected routes
  const sessionCookie = getSessionCookie(req);
  if (!sessionCookie) {
    return NextResponse.redirect(new URL('/', req.url));
  }
  
  return NextResponse.next();
}

export const config = { matcher: ['/dashboard/:path*'] };
