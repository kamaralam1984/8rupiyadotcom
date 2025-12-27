import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, JWTPayload } from '@/lib/auth';
import { UserRole } from '@/models/User';

export interface AuthRequest extends NextRequest {
  user?: JWTPayload;
}

export function withAuth(
  handler: (req: AuthRequest, context?: { params?: Promise<any> }) => Promise<NextResponse>,
  allowedRoles?: UserRole[]
) {
  return async (req: NextRequest, context?: { params?: Promise<any> }) => {
    try {
      const token = req.headers.get('authorization')?.replace('Bearer ', '') || 
                   req.cookies.get('token')?.value;

      if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const payload = verifyToken(token);
      if (!payload) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
      }

      if (allowedRoles && !allowedRoles.includes(payload.role)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      (req as AuthRequest).user = payload;
      return handler(req as AuthRequest, context);
    } catch (error) {
      return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
    }
  };
}

