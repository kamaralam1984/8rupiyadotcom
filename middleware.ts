import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyTokenEdge } from '@/lib/auth-edge';
import { UserRole } from '@/types/user';

export async function middleware(req: NextRequest) {
  try {
    // Get token from Authorization header or cookie
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '') || req.cookies.get('token')?.value;

    // Admin routes - admin and accountant can access
    if (req.nextUrl.pathname.startsWith('/admin')) {
      // Allow access to /admin/login without token
      if (req.nextUrl.pathname === '/admin/login') {
        return NextResponse.next();
      }
      
      if (!token) {
        return NextResponse.redirect(new URL('/admin/login', req.url));
      }
      try {
        const payload = await verifyTokenEdge(token);
        if (!payload || (payload.role !== UserRole.ADMIN && payload.role !== UserRole.ACCOUNTANT)) {
          return NextResponse.redirect(new URL('/admin/login', req.url));
        }
      } catch (error) {
        console.error('Middleware error verifying admin token:', error);
        return NextResponse.redirect(new URL('/admin/login', req.url));
      }
    }

    // Agent routes - only agent and admin can access
    if (req.nextUrl.pathname.startsWith('/agent')) {
      // Allow access to /agent/login without token
      if (req.nextUrl.pathname === '/agent/login') {
        return NextResponse.next();
      }
      
      if (!token) {
        return NextResponse.redirect(new URL('/agent/login', req.url));
      }
      try {
        const payload = await verifyTokenEdge(token);
        if (!payload || (payload.role !== UserRole.AGENT && payload.role !== UserRole.ADMIN)) {
          return NextResponse.redirect(new URL('/agent/login', req.url));
        }
      } catch (error) {
        console.error('Middleware error verifying agent token:', error);
        return NextResponse.redirect(new URL('/agent/login', req.url));
      }
    }

    // Operator routes - only operator and admin can access
    if (req.nextUrl.pathname.startsWith('/operator')) {
      if (!token) {
        return NextResponse.redirect(new URL('/login', req.url));
      }
      try {
        const payload = await verifyTokenEdge(token);
        if (!payload || (payload.role !== UserRole.OPERATOR && payload.role !== UserRole.ADMIN)) {
          return NextResponse.redirect(new URL('/login', req.url));
        }
      } catch (error) {
        console.error('Middleware error verifying operator token:', error);
        return NextResponse.redirect(new URL('/login', req.url));
      }
    }

    // Accountant routes - only accountant and admin can access
    if (req.nextUrl.pathname.startsWith('/accountant')) {
      if (!token) {
        return NextResponse.redirect(new URL('/login', req.url));
      }
      try {
        const payload = await verifyTokenEdge(token);
        if (!payload || (payload.role !== UserRole.ACCOUNTANT && payload.role !== UserRole.ADMIN)) {
          return NextResponse.redirect(new URL('/login', req.url));
        }
      } catch (error) {
        console.error('Middleware error verifying accountant token:', error);
        return NextResponse.redirect(new URL('/login', req.url));
      }
    }

    // Shopper routes - only shopper and admin can access
    if (req.nextUrl.pathname.startsWith('/shopper')) {
      // Allow access to /shopper/login without token
      if (req.nextUrl.pathname === '/shopper/login') {
        return NextResponse.next();
      }
      
      if (!token) {
        return NextResponse.redirect(new URL('/shopper/login', req.url));
      }
      try {
        const payload = await verifyTokenEdge(token);
        if (!payload || (payload.role !== UserRole.SHOPPER && payload.role !== UserRole.ADMIN)) {
          return NextResponse.redirect(new URL('/shopper/login', req.url));
        }
      } catch (error) {
        console.error('Middleware error verifying shopper token:', error);
        return NextResponse.redirect(new URL('/shopper/login', req.url));
      }
    }

    // User routes - only shopper can access (not regular user)
    if (req.nextUrl.pathname.startsWith('/user')) {
      if (!token) {
        return NextResponse.redirect(new URL('/login', req.url));
      }
      try {
        const payload = await verifyTokenEdge(token);
        if (!payload || payload.role !== UserRole.SHOPPER) {
          return NextResponse.redirect(new URL('/login', req.url));
        }
      } catch (error) {
        console.error('Middleware error verifying user token:', error);
        return NextResponse.redirect(new URL('/login', req.url));
      }
    }

    // Block users with role 'user' from accessing any panel routes
    if (token) {
      try {
        const payload = await verifyTokenEdge(token);
        if (payload && payload.role === UserRole.USER) {
          // If user tries to access any panel, redirect to home
          if (req.nextUrl.pathname.startsWith('/admin') || 
              req.nextUrl.pathname.startsWith('/agent') || 
              req.nextUrl.pathname.startsWith('/operator') || 
              req.nextUrl.pathname.startsWith('/accountant') ||
              req.nextUrl.pathname.startsWith('/user') ||
              req.nextUrl.pathname.startsWith('/shopper')) {
            return NextResponse.redirect(new URL('/', req.url));
          }
        }
      } catch (error) {
        // If token verification fails, just continue (don't block)
        console.error('Middleware error verifying token for user role check:', error);
      }
    }

    return NextResponse.next();
  } catch (error) {
    // Catch any unexpected errors and log them
    console.error('Middleware unexpected error:', error);
    // Don't block the request, just continue
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/agent/:path*',
    '/operator/:path*',
    '/accountant/:path*',
    '/user/:path*',
    '/shopper/:path*',
  ],
};
