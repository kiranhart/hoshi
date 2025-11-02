import { getSessionCookie } from 'better-auth/cookies';
import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith('/api/auth/callback/google')) return NextResponse.next();
  const sessionCookie = getSessionCookie(req);
  if (!sessionCookie) return NextResponse.redirect('/');
  return NextResponse.next();
}

export const config = { matcher: ['/dashboard/:path*'] };
