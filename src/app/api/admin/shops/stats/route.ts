import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Shop, { ShopStatus } from '@/models/Shop';
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
    if (!payload || (payload.role !== UserRole.ADMIN && payload.role !== 'accountant')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await connectDB();

    // Get shop statistics
    const total = await Shop.countDocuments();
    const pending = await Shop.countDocuments({ status: ShopStatus.PENDING });
    const active = await Shop.countDocuments({ 
      status: { $in: [ShopStatus.ACTIVE, ShopStatus.APPROVED] } 
    });
    
    // Count expired shops (planExpiry < now)
    const now = new Date();
    const expired = await Shop.countDocuments({ 
      planExpiry: { $lt: now },
      status: { $ne: ShopStatus.REJECTED }
    });

    return NextResponse.json({
      success: true,
      stats: {
        total,
        pending,
        active,
        expired,
      },
    });
  } catch (error: any) {
    console.error('Error fetching shop stats:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

