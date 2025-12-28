import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { User, Payment, Shop } from '@/models';
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
    if (!payload || payload.role !== UserRole.SHOPPER) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await connectDB();

    // Get user's shops
    const shops = await Shop.find({ createdBy: payload.userId }).select('_id');
    const shopIds = shops.map(shop => shop._id);

    // Get payments for user's shops
    const payments = await Payment.find({ 
      shopId: { $in: shopIds } 
    })
    .populate('shopId', 'name')
    .populate('planId', 'name')
    .sort({ createdAt: -1 })
    .lean();

    const formattedPayments = payments.map(payment => ({
      _id: payment._id.toString(),
      amount: payment.amount,
      status: payment.status,
      shopName: (payment.shopId as any)?.name || 'N/A',
      planName: (payment.planId as any)?.name || 'N/A',
      createdAt: payment.createdAt,
      paidAt: payment.paidAt,
    }));

    return NextResponse.json({
      success: true,
      payments: formattedPayments,
    });
  } catch (error: any) {
    console.error('Shopper payments error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

