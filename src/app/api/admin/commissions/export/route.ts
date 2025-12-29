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

    // Fetch all commissions
    const commissions = await Commission.find()
      .populate('paymentId', 'amount createdAt')
      .populate('shopId', 'name category')
      .populate('agentId', 'name email')
      .populate('operatorId', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    // Generate CSV
    const csv = [
      'Date,Shop,Category,Payment Amount,Agent,Agent Commission,Operator,Operator Commission,Company Revenue,Status',
      ...commissions.map((c: any) => {
        return [
          new Date(c.createdAt).toLocaleDateString(),
          c.shopId?.name || 'N/A',
          c.shopId?.category || 'N/A',
          c.paymentId?.amount || 0,
          c.agentId?.name || 'N/A',
          c.agentAmount,
          c.operatorId?.name || 'N/A',
          c.operatorAmount,
          c.companyAmount,
          c.status,
        ].join(',');
      }),
    ].join('\n');

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename=commissions-${new Date().toISOString()}.csv`,
      },
    });
  } catch (error: any) {
    console.error('Error exporting commissions:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

