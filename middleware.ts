import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { UserRole } from '@/models/User';

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET });

  // Admin routes protection
  if (req.nextUrl.pathname.startsWith('/admin')) {
    if (!token || token.role !== UserRole.ADMIN) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  // Agent routes protection
  if (req.nextUrl.pathname.startsWith('/agent')) {
    if (!token || token.role !== UserRole.AGENT) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  // Operator routes protection
  if (req.nextUrl.pathname.startsWith('/operator')) {
    if (!token || token.role !== UserRole.OPERATOR) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  // Accountant routes protection
  if (req.nextUrl.pathname.startsWith('/accountant')) {
    if (!token || token.role !== UserRole.ACCOUNTANT) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  // User routes protection
  if (req.nextUrl.pathname.startsWith('/user')) {
    if (!token || (token.role !== UserRole.USER && token.role !== UserRole.SHOPPER)) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/agent/:path*',
    '/operator/:path*',
    '/accountant/:path*',
    '/user/:path*',
  ],
};

