import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Commission from '@/models/Commission';
import Shop from '@/models/Shop';
import { verifyToken } from '@/lib/auth';
import { UserRole } from '@/types/user';
import { calculateCommission } from '@/lib/commission';

// POST /api/admin/fix-commissions - Backfill operatorId in existing commissions
export async function POST(req: NextRequest) {
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

    // Verify user exists and is admin
    const User = (await import('@/models/User')).default;
    const dbUser = await User.findById(payload.userId);
    if (!dbUser || dbUser.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get all commissions that need fixing:
    // 1. Have agentId (operator commission only applies when there's an agent)
    // 2. Missing operatorId or operatorAmount is 0
    const commissionsToFix = await Commission.find({
      agentId: { $exists: true, $ne: null },
      $or: [
        { operatorId: { $exists: false } },
        { operatorId: null },
        { operatorAmount: 0 }
      ]
    });

    let fixedCount = 0;
    let updatedCount = 0;

    for (const commission of commissionsToFix) {
      const shop = await Shop.findById(commission.shopId);
      if (!shop) continue;

      // Find operatorId if missing
      let operatorId = shop.operatorId;
      
      if (!operatorId && shop.agentId) {
        // Try to find approved operator for this agent
        const AgentRequest = (await import('@/models/AgentRequest')).default;
        const RequestStatus = (await import('@/models/AgentRequest')).RequestStatus;
        const approvedRequest = await AgentRequest.findOne({
          agentId: shop.agentId,
          status: RequestStatus.APPROVED
        }).sort({ createdAt: 1 });
        
        if (approvedRequest) {
          operatorId = approvedRequest.operatorId;
          // Update shop to set operatorId for future queries
          shop.operatorId = operatorId;
          await shop.save();
        }
      }

      if (operatorId) {
        // Recalculate commission with operatorId
        const Payment = (await import('@/models/Payment')).default;
        const payment = await Payment.findById(commission.paymentId);
        if (payment) {
          const breakdown = calculateCommission(
            payment.amount,
            shop.agentId?.toString(),
            operatorId.toString()
          );

          // Update commission
          commission.operatorId = operatorId;
          commission.agentAmount = breakdown.agentAmount;
          commission.operatorAmount = breakdown.operatorAmount;
          commission.companyAmount = breakdown.companyAmount;
          await commission.save();
          
          updatedCount++;
        }
      }
      
      fixedCount++;
    }

    return NextResponse.json({
      success: true,
      message: `Fixed ${fixedCount} commissions, updated ${updatedCount} with operatorId`,
      fixedCount,
      updatedCount,
    });
  } catch (error: any) {
    console.error('Fix commissions error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

