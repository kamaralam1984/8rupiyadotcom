import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Commission from '@/models/Commission';
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

    // Get total commissions using aggregation
    const agentTotalResult = await Commission.aggregate([
      { $group: { _id: null, total: { $sum: { $ifNull: ['$agentAmount', 0] } } } }
    ]);
    const agentTotal = agentTotalResult.length > 0 ? agentTotalResult[0].total : 0;

    const operatorTotalResult = await Commission.aggregate([
      { $group: { _id: null, total: { $sum: { $ifNull: ['$operatorAmount', 0] } } } }
    ]);
    const operatorTotal = operatorTotalResult.length > 0 ? operatorTotalResult[0].total : 0;

    const companyTotalResult = await Commission.aggregate([
      { $group: { _id: null, total: { $sum: { $ifNull: ['$companyAmount', 0] } } } }
    ]);
    const companyTotal = companyTotalResult.length > 0 ? companyTotalResult[0].total : 0;

    const totalCommissions = agentTotal + operatorTotal + companyTotal;

    // Get counts by status
    const pending = await Commission.countDocuments({ status: 'pending' });
    const paid = await Commission.countDocuments({ status: 'paid' });

    return NextResponse.json({
      success: true,
      stats: {
        totalCommissions,
        agentTotal,
        operatorTotal,
        companyTotal,
        pending,
        paid,
      },
    });
  } catch (error: any) {
    console.error('Error fetching commission stats:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}



