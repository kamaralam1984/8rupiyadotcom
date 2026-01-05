import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Payment from '@/models/Payment';
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
    if (!payload || payload.role !== UserRole.AGENT) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await connectDB();

    const agent = await User.findById(payload.userId);
    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    // Get agent's shops
    const agentShops = await Shop.find({ agentId: agent._id }).select('_id');
    const shopIds = agentShops.map(shop => shop._id);

    // Get payments for agent's shops
    const payments = await Payment.find({ shopId: { $in: shopIds } })
      .populate('shopId', 'name planId')
      .populate('planId', 'name')
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      payments: payments.map(payment => ({
        _id: payment._id,
        shopName: (payment.shopId as any)?.name || 'N/A',
        planName: (payment.planId as any)?.name || (payment.shopId as any)?.planId?.name || 'N/A',
        amount: payment.amount,
        status: payment.status === 'success' ? 'success' : payment.status === 'pending' ? 'pending' : 'failed',
        date: payment.createdAt.toISOString().split('T')[0],
        transactionId: payment.razorpayOrderId || payment._id.toString(),
      })),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

