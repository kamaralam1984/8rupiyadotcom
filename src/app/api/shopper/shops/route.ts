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

    // ⚡ Optimized query with lean() and select() for 1-second performance
    const shops = await Shop.find({ shopperId: shopper._id })
      .select('name category address city pincode status paymentStatus planId planExpiry images createdAt')
      .populate('planId', 'name price')
      .sort({ createdAt: -1 })
      .lean(); // ⚡ Use lean() for 5-10x faster queries

    // ⚡ Optimized mapping - shops are already lean objects
    const shopsData = shops.map((shop: any) => ({
      _id: shop._id.toString(),
      name: shop.name,
      category: shop.category,
      address: shop.address,
      city: shop.city,
      pincode: shop.pincode,
      status: shop.status,
      paymentStatus: shop.paymentStatus,
      planId: shop.planId ? {
        _id: shop.planId._id?.toString() || shop.planId._id,
        name: shop.planId.name,
      } : undefined,
      planExpiry: shop.planExpiry ? new Date(shop.planExpiry).toISOString() : undefined,
      images: shop.images || [],
      createdAt: new Date(shop.createdAt).toISOString(),
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

