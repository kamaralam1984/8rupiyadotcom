import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Shop from '@/models/Shop';
import Plan from '@/models/Plan';
import { withAuth, AuthRequest } from '@/middleware/auth';
import { UserRole } from '@/types/user';

// GET /api/shops/[id] - Get single shop
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    // ⚡ Optimized query with lean() and select() for 1-second performance
    const shop = await Shop.findById(id)
      .select('name description category address area city state pincode phone email website images photos location status planId shopperId agentId operatorId planExpiry rankScore isFeatured rating reviewCount visitorCount likeCount offers pages paymentStatus paymentMode createdAt updatedAt')
      .populate('planId', 'name price duration priority featuredTag')
      .populate('shopperId', 'name email phone')
      .populate('agentId', 'name email')
      .populate('operatorId', 'name email')
      .lean(); // ⚡ Use lean() for 5-10x faster queries

    if (!shop) {
      return NextResponse.json({ error: 'Shop not found' }, { status: 404 });
    }

    return NextResponse.json({ shop });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT /api/shops/[id] - Update shop
export const PUT = withAuth(async (req: AuthRequest, context?: { params?: Promise<{ id: string }> }) => {
  try {
    await connectDB();
    if (!context?.params) {
      return NextResponse.json({ error: 'Missing params' }, { status: 400 });
    }
    const { id } = await context.params;

    const shop = await Shop.findById(id);
    if (!shop) {
      return NextResponse.json({ error: 'Shop not found' }, { status: 404 });
    }

    const user = req.user!;

    // Only owner, admin, or assigned agent/operator can update
    const canUpdate =
      user.role === UserRole.ADMIN ||
      shop.shopperId.toString() === user.userId ||
      shop.agentId?.toString() === user.userId ||
      shop.operatorId?.toString() === user.userId;

    if (!canUpdate) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const updatedShop = await Shop.findByIdAndUpdate(id, body, { new: true });

    // Clear cache
    const { cacheDel } = await import('@/lib/redis');
    await cacheDel(`shops:nearby:*`);

    return NextResponse.json({ success: true, shop: updatedShop });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
});

// DELETE /api/shops/[id] - Delete shop
export const DELETE = withAuth(async (req: AuthRequest, context?: { params?: Promise<{ id: string }> }) => {
  try {
    await connectDB();
    if (!context?.params) {
      return NextResponse.json({ error: 'Missing params' }, { status: 400 });
    }
    const { id } = await context.params;

    const shop = await Shop.findById(id);
    if (!shop) {
      return NextResponse.json({ error: 'Shop not found' }, { status: 404 });
    }

    const user = req.user!;

    // Only admin or owner can delete
    if (user.role !== UserRole.ADMIN && shop.shopperId.toString() !== user.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await Shop.findByIdAndDelete(id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}, [UserRole.ADMIN, UserRole.SHOPPER]);

