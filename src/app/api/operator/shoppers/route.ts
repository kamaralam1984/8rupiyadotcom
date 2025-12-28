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
    if (!payload || payload.role !== UserRole.OPERATOR) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await connectDB();

    const operator = await User.findById(payload.userId);
    if (!operator) {
      return NextResponse.json({ error: 'Operator not found' }, { status: 404 });
    }

    // Get all shoppers under this operator
    const shoppers = await User.find({ 
      operatorId: operator._id,
      role: UserRole.SHOPPER 
    }).select('-password');

    // Get shop count for each shopper
    const shoppersWithShops = await Promise.all(
      shoppers.map(async (shopper) => {
        const shopCount = await Shop.countDocuments({ shopperId: shopper._id });
        const activeShopCount = await Shop.countDocuments({ 
          shopperId: shopper._id,
          status: 'approved'
        });
        return {
          _id: shopper._id.toString(),
          name: shopper.name,
          email: shopper.email,
          phone: shopper.phone,
          shops: shopCount,
          activeShops: activeShopCount,
          isActive: shopper.isActive,
          createdAt: shopper.createdAt,
        };
      })
    );

    return NextResponse.json({
      success: true,
      shoppers: shoppersWithShops,
    });
  } catch (error: any) {
    console.error('Operator shoppers error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

