import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Commission from '@/models/Commission';
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
    if (!payload || payload.role !== UserRole.AGENT) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await connectDB();

    const agent = await User.findById(payload.userId);
    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    const commissions = await Commission.find({ agentId: agent._id })
      .populate('shopId', 'name planId')
      .populate('planId', 'name')
      .sort({ createdAt: -1 });

    const total = commissions.reduce((sum, c) => sum + c.amount, 0);
    const paid = commissions.filter(c => c.status === 'paid').reduce((sum, c) => sum + c.amount, 0);
    const pending = commissions.filter(c => c.status === 'pending').reduce((sum, c) => sum + c.amount, 0);

    return NextResponse.json({
      success: true,
      commissions: commissions.map(commission => ({
        _id: commission._id,
        shopName: (commission.shopId as any)?.name || 'N/A',
        planName: (commission.planId as any)?.name || (commission.shopId as any)?.planId?.name || 'N/A',
        amount: commission.amount,
        status: commission.status,
        date: commission.createdAt.toISOString().split('T')[0],
      })),
      total,
      paid,
      pending,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

