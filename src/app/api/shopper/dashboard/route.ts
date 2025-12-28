import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Shop from '@/models/Shop';
import { verifyToken } from '@/lib/auth';
import { UserRole } from '@/models/User';

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '') || 
                 req.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || (payload.role !== UserRole.SHOPPER && payload.role !== UserRole.ADMIN)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await connectDB();

    const shopper = await User.findById(payload.userId);
    if (!shopper) {
      return NextResponse.json({ error: 'Shopper not found' }, { status: 404 });
    }

    // Get all shops for this shopper
    const shops = await Shop.find({ shopperId: shopper._id });

    // Calculate stats
    const totalShops = shops.length;
    const activeShops = shops.filter(s => s.status === 'approved' && (!s.planExpiry || new Date(s.planExpiry) > new Date())).length;
    const pendingShops = shops.filter(s => s.status === 'pending').length;

    // Calculate total revenue from payments
    const { default: Payment } = await import('@/models/Payment');
    const payments = await Payment.find({
      shopId: { $in: shops.map(s => s._id) },
      status: 'success',
    });

    const totalRevenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

    // Get recent shops (last 5)
    const recentShops = shops
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
      .map(shop => ({
        _id: shop._id.toString(),
        name: shop.name,
        category: shop.category,
        status: shop.status,
        createdAt: shop.createdAt.toISOString(),
      }));

    return NextResponse.json({
      success: true,
      stats: {
        totalShops,
        activeShops,
        pendingShops,
        totalRevenue,
      },
      recentShops,
    });
  } catch (error: any) {
    console.error('Shopper dashboard error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

