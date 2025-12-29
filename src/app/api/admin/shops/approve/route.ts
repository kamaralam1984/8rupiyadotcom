import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Shop, { ShopStatus } from '@/models/Shop';
import { verifyToken } from '@/lib/auth';
import { UserRole } from '@/types/user';

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '') || 
                 req.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || payload.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 });
    }

    await connectDB();

    const { shopId, status } = await req.json();

    if (!shopId || !status) {
      return NextResponse.json({ error: 'Shop ID and status required' }, { status: 400 });
    }

    if (!['approved', 'rejected', 'active'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const shop = await Shop.findById(shopId);

    if (!shop) {
      return NextResponse.json({ error: 'Shop not found' }, { status: 404 });
    }

    // Update status
    shop.status = status as ShopStatus;
    
    // If approved, set planExpiry if not already set
    if (status === 'approved' || status === 'active') {
      if (!shop.planExpiry || shop.planExpiry < new Date()) {
        // Default 30 days from now
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 30);
        shop.planExpiry = expiryDate;
      }
    }

    await shop.save();

    return NextResponse.json({
      success: true,
      message: `Shop ${status} successfully`,
      shop,
    });
  } catch (error: any) {
    console.error('Error approving shop:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
