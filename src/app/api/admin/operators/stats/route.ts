import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Shop from '@/models/Shop';
import Payment from '@/models/Payment';
import Commission from '@/models/Commission';
import { verifyToken } from '@/lib/auth';
import { UserRole } from '@/models/User';

// GET /api/admin/operators/stats - Get detailed operator commission stats
export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '') || 
                 req.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    await connectDB();

    const admin = await User.findById(payload.userId);
    if (!admin || admin.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get all operators
    const operators = await User.find({ role: UserRole.OPERATOR, isActive: true })
      .select('name email phone _id createdAt')
      .lean();

    // Get detailed stats for each operator
    const operatorStats = await Promise.all(
      operators.map(async (operator) => {
        // Get shops for this operator
        const operatorShops = await Shop.find({ 
          $or: [
            { operatorId: operator._id }
          ]
        }).select('_id name agentId');

        const shopIds = operatorShops.map(s => s._id);

        // Get payments for these shops
        const payments = shopIds.length > 0
          ? await Payment.find({
              shopId: { $in: shopIds },
              status: 'success'
            }).lean()
          : [];

        const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);

        // Get commissions from database
        const commissionsFromDB = await Commission.find({ 
          operatorId: operator._id 
        }).lean();

        const totalOperatorCommissionFromDB = commissionsFromDB.reduce(
          (sum, c) => sum + (c.operatorAmount || 0), 
          0
        );

        // Also check for shops under this operator but commission might be missing operatorId
        const commissionsForShops = shopIds.length > 0
          ? await Commission.find({
              shopId: { $in: shopIds }
            }).lean()
          : [];

        // Calculate total operator commission including shops without operatorId set
        let totalOperatorCommission = totalOperatorCommissionFromDB;
        
        for (const comm of commissionsForShops) {
          // If commission doesn't have operatorId but shop belongs to this operator
          if (!comm.operatorId || comm.operatorAmount === 0) {
            const shop = operatorShops.find(s => s._id.toString() === comm.shopId.toString());
            if (shop) {
              // Get payment to calculate correct commission
              const payment = await Payment.findById(comm.paymentId);
              if (payment) {
                // Calculate operator commission: 10% of remaining after agent's 20%
                const agentAmount = payment.amount * 0.20;
                const remaining = payment.amount - agentAmount;
                const operatorAmount = remaining * 0.10;
                totalOperatorCommission += operatorAmount;
              }
            }
          }
        }

        // Get agents working under this operator
        const AgentRequest = (await import('@/models/AgentRequest')).default;
        const RequestStatus = (await import('@/models/AgentRequest')).RequestStatus;
        
        const approvedRequests = await AgentRequest.find({
          operatorId: operator._id,
          status: RequestStatus.APPROVED
        }).populate('agentId', 'name');

        const agents = approvedRequests.map(req => ({
          _id: (req.agentId as any)?._id?.toString(),
          name: (req.agentId as any)?.name
        })).filter(a => a._id);

        // Get commission status (paid/pending)
        const paidCommissions = commissionsFromDB.filter(c => c.status === 'paid');
        const pendingCommissions = commissionsFromDB.filter(c => c.status === 'pending');
        
        const paidAmount = paidCommissions.reduce((sum, c) => sum + (c.operatorAmount || 0), 0);
        const pendingAmount = pendingCommissions.reduce((sum, c) => sum + (c.operatorAmount || 0), 0);

        return {
          _id: operator._id.toString(),
          name: operator.name,
          email: operator.email,
          phone: operator.phone,
          totalShops: operatorShops.length,
          totalRevenue,
          totalCommission: totalOperatorCommission,
          paidCommission: paidAmount,
          pendingCommission: pendingAmount,
          totalAgents: agents.length,
          agents: agents,
          createdAt: operator.createdAt,
        };
      })
    );

    // Calculate totals
    const totalOperatorCommission = operatorStats.reduce((sum, op) => sum + op.totalCommission, 0);
    const totalPaidCommission = operatorStats.reduce((sum, op) => sum + op.paidCommission, 0);
    const totalPendingCommission = operatorStats.reduce((sum, op) => sum + op.pendingCommission, 0);

    return NextResponse.json({
      success: true,
      operators: operatorStats,
      summary: {
        totalOperators: operators.length,
        totalOperatorCommission,
        totalPaidCommission,
        totalPendingCommission,
      },
    });
  } catch (error: any) {
    console.error('Error fetching operator stats:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

