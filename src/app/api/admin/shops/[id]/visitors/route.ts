import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Shop from '@/models/Shop';
import { verifyToken } from '@/lib/auth';
import { UserRole } from '@/models/User';
import User from '@/models/User';

// POST /api/admin/shops/[id]/visitors - Increase shop visitors
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    await connectDB();

    // Verify user is admin or accountant
    const dbUser = await User.findById(payload.userId);
    if (!dbUser || (dbUser.role !== UserRole.ADMIN && dbUser.role !== UserRole.ACCOUNTANT)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const { amount } = await req.json();

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount. Must be a positive number.' }, { status: 400 });
    }

    const shop = await Shop.findById(id);
    if (!shop) {
      return NextResponse.json({ error: 'Shop not found' }, { status: 404 });
    }

    // Increase visitor count
    const currentVisitors = shop.visitorCount || 0;
    shop.visitorCount = currentVisitors + amount;
    await shop.save();

    return NextResponse.json({
      success: true,
      shop: {
        _id: shop._id,
        name: shop.name,
        visitorCount: shop.visitorCount,
      },
      message: `Successfully added ${amount} visitors. Total visitors: ${shop.visitorCount}`,
    });
  } catch (error: any) {
    console.error('Error updating visitors:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

