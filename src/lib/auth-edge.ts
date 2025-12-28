import { jwtVerify } from 'jose';
import { UserRole } from '@/types/user';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export interface JWTPayload {
  userId: string;
  role: UserRole;
  email: string;
}

/**
 * Edge Runtime compatible JWT verification using jose library
 * This is used in Next.js middleware which runs in Edge Runtime
 */
export async function verifyTokenEdge(token: string): Promise<JWTPayload | null> {
  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    
    return {
      userId: payload.userId as string,
      role: payload.role as UserRole,
      email: payload.email as string,
    };
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}

