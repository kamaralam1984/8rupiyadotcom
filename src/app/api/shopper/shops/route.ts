import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Shop from '@/models/Shop';
import Plan from '@/models/Plan';
import { verifyToken } from '@/lib/auth';
import { UserRole } from '@/types/user';

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
    const shops = await Shop.find({ shopperId: shopper._id })
      .populate('planId', 'name price')
      .sort({ createdAt: -1 });

    const shopsData = shops.map(shop => ({
      _id: shop._id.toString(),
      name: shop.name,
      category: shop.category,
      address: shop.address,
      city: shop.city,
      pincode: shop.pincode,
      status: shop.status,
      paymentStatus: shop.paymentStatus,
      planId: shop.planId ? {
        _id: (shop.planId as any)._id?.toString(),
        name: (shop.planId as any).name,
      } : undefined,
      planExpiry: shop.planExpiry?.toISOString(),
      images: shop.images || [],
      createdAt: shop.createdAt.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      shops: shopsData,
    });
  } catch (error: any) {
    console.error('Shopper shops error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

