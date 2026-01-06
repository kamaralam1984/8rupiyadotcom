import { NextRequest, NextResponse } from 'next/server';
import { clearAllCache, deleteCachePattern } from '@/lib/cache';
import { withAuth, AuthRequest } from '@/middleware/auth';
import { UserRole } from '@/models/User';

// POST - Clear all cache (admin only)
export const POST = withAuth(async (req: AuthRequest) => {
  try {
    if (req.user!.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { pattern } = await req.json().catch(() => ({}));

    if (pattern) {
      // Clear cache matching pattern
      await deleteCachePattern(pattern);
      return NextResponse.json({ 
        success: true, 
        message: `Cache cleared for pattern: ${pattern}` 
      });
    } else {
      // Clear all cache
      const cleared = await clearAllCache();
      return NextResponse.json({ 
        success: cleared, 
        message: cleared ? 'All cache cleared successfully' : 'Failed to clear cache' 
      });
    }
  } catch (error: any) {
    console.error('Cache clear error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}, [UserRole.ADMIN]);

