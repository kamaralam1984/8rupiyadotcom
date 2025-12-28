import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { UserRole } from '@/models/User';

export async function middleware(req: NextRequest) {
  // Get token from Authorization header or cookie
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '') || req.cookies.get('token')?.value;

  // Admin routes - admin and accountant can access
  if (req.nextUrl.pathname.startsWith('/admin')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    const payload = verifyToken(token);
    if (!payload || (payload.role !== UserRole.ADMIN && payload.role !== UserRole.ACCOUNTANT)) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  // Agent routes - only agent and admin can access
  if (req.nextUrl.pathname.startsWith('/agent')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    const payload = verifyToken(token);
    if (!payload || (payload.role !== UserRole.AGENT && payload.role !== UserRole.ADMIN)) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  // Operator routes - only operator and admin can access
  if (req.nextUrl.pathname.startsWith('/operator')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    const payload = verifyToken(token);
    if (!payload || (payload.role !== UserRole.OPERATOR && payload.role !== UserRole.ADMIN)) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  // Accountant routes - only accountant and admin can access
  if (req.nextUrl.pathname.startsWith('/accountant')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    const payload = verifyToken(token);
    if (!payload || (payload.role !== UserRole.ACCOUNTANT && payload.role !== UserRole.ADMIN)) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  // User routes - only shopper can access (not regular user)
  if (req.nextUrl.pathname.startsWith('/user')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    const payload = verifyToken(token);
    if (!payload || payload.role !== UserRole.SHOPPER) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  // Block users with role 'user' from accessing any panel routes
  if (token) {
    const payload = verifyToken(token);
    if (payload && payload.role === UserRole.USER) {
      // If user tries to access any panel, redirect to home
      if (req.nextUrl.pathname.startsWith('/admin') || 
          req.nextUrl.pathname.startsWith('/agent') || 
          req.nextUrl.pathname.startsWith('/operator') || 
          req.nextUrl.pathname.startsWith('/accountant') ||
          req.nextUrl.pathname.startsWith('/user')) {
        return NextResponse.redirect(new URL('/', req.url));
      }
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
