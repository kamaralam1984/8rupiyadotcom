import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Commission from '@/models/Commission';
import Payment from '@/models/Payment';
import Shop from '@/models/Shop';
import User from '@/models/User';
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
    if (!payload || payload.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 });
    }

    await connectDB();

    // 1. Count total successful payments
    const totalPayments = await Payment.countDocuments({ status: 'success' });
    
    // 2. Count total commission records
    const totalCommissions = await Commission.countDocuments();
    
    // 3. Find payments without commission records
    const paymentsWithoutCommissions = await Payment.find({ status: 'success' }).lean();
    const paymentIds = paymentsWithoutCommissions.map(p => p._id.toString());
    const existingCommissionPaymentIds = (await Commission.find().distinct('paymentId')).map((id: any) => id.toString());
    const missingCommissions = paymentIds.filter(id => !existingCommissionPaymentIds.includes(id));
    
    // 4. Count commissions without operatorId
    const commissionsWithoutOperator = await Commission.countDocuments({
      $or: [
        { operatorId: { $exists: false } },
        { operatorId: null }
      ],
      agentId: { $exists: true, $ne: null }
    });
    
    // 5. Count commissions with operatorAmount = 0
    const commissionsWithZeroOperator = await Commission.countDocuments({
      operatorAmount: 0,
      agentId: { $exists: true, $ne: null }
    });
    
    // 6. Get total operators
    const totalOperators = await User.countDocuments({ role: UserRole.OPERATOR });
    
    // 7. Get shops without operatorId
    const shopsWithoutOperator = await Shop.countDocuments({
      $or: [
        { operatorId: { $exists: false } },
        { operatorId: null }
      ],
      agentId: { $exists: true, $ne: null },
      status: { $in: ['active', 'approved'] }
    });
    
    // 8. Calculate current commission totals
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
    
    // 9. Get sample commissions without operator
    const sampleCommissionsWithoutOperator = await Commission.find({
      $or: [
        { operatorId: { $exists: false } },
        { operatorId: null },
        { operatorAmount: 0 }
      ],
      agentId: { $exists: true, $ne: null }
    })
      .populate('paymentId', 'amount')
      .populate('shopId', 'name')
      .populate('agentId', 'name')
      .limit(5)
      .lean();

    return NextResponse.json({
      success: true,
      diagnosis: {
        payments: {
          total: totalPayments,
          withoutCommissions: missingCommissions.length,
        },
        commissions: {
          total: totalCommissions,
          withoutOperatorId: commissionsWithoutOperator,
          withZeroOperatorAmount: commissionsWithZeroOperator,
          needsFix: commissionsWithoutOperator + commissionsWithZeroOperator,
        },
        shops: {
          withoutOperatorId: shopsWithoutOperator,
        },
        operators: {
          total: totalOperators,
        },
        totals: {
          agentCommission: agentTotal,
          operatorCommission: operatorTotal,
          companyRevenue: companyTotal,
        },
        samples: {
          commissionsWithoutOperator: sampleCommissionsWithoutOperator,
        },
        recommendations: [
          missingCommissions.length > 0 && `❌ ${missingCommissions.length} payments don't have commission records. Run sync.`,
          commissionsWithoutOperator > 0 && `❌ ${commissionsWithoutOperator} commissions are missing operatorId. Run fix-commissions.`,
          commissionsWithZeroOperator > 0 && `❌ ${commissionsWithZeroOperator} commissions have zero operator amount. Run fix-commissions.`,
          shopsWithoutOperator > 0 && `⚠️ ${shopsWithoutOperator} active shops don't have operatorId assigned.`,
          operatorTotal === 0 && totalCommissions > 0 && `❌ CRITICAL: Operator commission is 0 despite having ${totalCommissions} commission records!`,
        ].filter(Boolean),
      },
    });
  } catch (error: any) {
    console.error('Error diagnosing commissions:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}



