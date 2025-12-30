import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Payment from '@/models/Payment';
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

    // Get payment statistics
    const totalRevenueResult = await Payment.aggregate([
      { $match: { status: 'success' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalRevenue = totalRevenueResult.length > 0 ? totalRevenueResult[0].total : 0;

    const onlinePaymentsResult = await Payment.aggregate([
      { $match: { status: 'success', mode: 'online' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const onlinePayments = onlinePaymentsResult.length > 0 ? onlinePaymentsResult[0].total : 0;

    const cashPaymentsResult = await Payment.aggregate([
      { $match: { status: 'success', mode: 'cash' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const cashPayments = cashPaymentsResult.length > 0 ? cashPaymentsResult[0].total : 0;

    const successCount = await Payment.countDocuments({ status: 'success' });
    const failedCount = await Payment.countDocuments({ status: 'failed' });

    return NextResponse.json({
      success: true,
      stats: {
        totalRevenue,
        onlinePayments,
        cashPayments,
        successCount,
        failedCount,
      },
    });
  } catch (error: any) {
    console.error('Error fetching payment stats:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}



