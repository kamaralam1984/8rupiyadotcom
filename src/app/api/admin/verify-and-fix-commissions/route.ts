import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Shop from '@/models/Shop';
import Payment from '@/models/Payment';
import Commission from '@/models/Commission';
import AgentRequest, { RequestStatus } from '@/models/AgentRequest';
import { verifyToken } from '@/lib/auth';
import { UserRole } from '@/models/User';
import { calculateCommission } from '@/lib/commission';

// POST /api/admin/verify-and-fix-commissions - Comprehensive database check and fix
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

    const admin = await User.findById(payload.userId);
    if (!admin || admin.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const report: any = {
      timestamp: new Date().toISOString(),
      checks: [],
      fixes: [],
      summary: {},
    };

    // Step 1: Check all operators
    console.log('=== Step 1: Checking Operators ===');
    const operators = await User.find({ role: UserRole.OPERATOR, isActive: true });
    report.summary.totalOperators = operators.length;
    report.checks.push({
      step: 'Find Operators',
      count: operators.length,
      operators: operators.map(op => ({
        id: op._id.toString(),
        name: op.name,
        email: op.email,
      })),
    });

    // Step 2: Check all agents
    console.log('=== Step 2: Checking Agents ===');
    const agents = await User.find({ role: UserRole.AGENT, isActive: true });
    report.summary.totalAgents = agents.length;

    // Step 3: Check AgentRequests
    console.log('=== Step 3: Checking Agent Requests ===');
    const allRequests = await AgentRequest.find({});
    const approvedRequests = allRequests.filter(r => r.status === RequestStatus.APPROVED);
    report.checks.push({
      step: 'Agent Requests',
      total: allRequests.length,
      approved: approvedRequests.length,
      pending: allRequests.filter(r => r.status === RequestStatus.PENDING).length,
      rejected: allRequests.filter(r => r.status === RequestStatus.REJECTED).length,
    });

    // Step 4: Check shops and their operatorId
    console.log('=== Step 4: Checking Shops ===');
    const allShops = await Shop.find({});
    const shopsWithAgent = allShops.filter(s => s.agentId);
    const shopsWithOperator = allShops.filter(s => s.operatorId);
    const shopsWithoutOperator = shopsWithAgent.filter(s => !s.operatorId);

    report.checks.push({
      step: 'Shops',
      total: allShops.length,
      withAgent: shopsWithAgent.length,
      withOperator: shopsWithOperator.length,
      withoutOperator: shopsWithOperator.length,
    });

    // Fix shops without operatorId
    let fixedShops = 0;
    for (const shop of shopsWithoutOperator) {
      if (shop.agentId) {
        const approvedRequest = await AgentRequest.findOne({
          agentId: shop.agentId,
          status: RequestStatus.APPROVED,
        }).sort({ createdAt: 1 });

        if (approvedRequest) {
          shop.operatorId = approvedRequest.operatorId;
          await shop.save();
          fixedShops++;
          report.fixes.push({
            type: 'Shop operatorId',
            shopId: shop._id.toString(),
            shopName: shop.name,
            operatorId: approvedRequest.operatorId.toString(),
          });
        }
      }
    }

    // Step 5: Check payments
    console.log('=== Step 5: Checking Payments ===');
    const successfulPayments = await Payment.find({ status: 'success' });
    const totalPaymentAmount = successfulPayments.reduce((sum, p) => sum + p.amount, 0);
    
    report.checks.push({
      step: 'Payments',
      total: successfulPayments.length,
      totalAmount: totalPaymentAmount,
    });

    // Step 6: Check commissions
    console.log('=== Step 6: Checking Commissions ===');
    const allCommissions = await Commission.find({});
    
    let totalAgentCommission = 0;
    let totalOperatorCommission = 0;
    let totalCompanyRevenue = 0;
    let commissionsWithoutOperator = 0;
    let commissionsWithZeroOperatorAmount = 0;

    for (const comm of allCommissions) {
      totalAgentCommission += comm.agentAmount || 0;
      totalOperatorCommission += comm.operatorAmount || 0;
      totalCompanyRevenue += comm.companyAmount || 0;

      if (!comm.operatorId) {
        commissionsWithoutOperator++;
      }
      if (comm.operatorId && comm.operatorAmount === 0) {
        commissionsWithZeroOperatorAmount++;
      }
    }

    report.checks.push({
      step: 'Commissions',
      total: allCommissions.length,
      totalAgentCommission,
      totalOperatorCommission,
      totalCompanyRevenue,
      withoutOperator: commissionsWithoutOperator,
      zeroOperatorAmount: commissionsWithZeroOperatorAmount,
    });

    // Step 7: Fix commissions
    console.log('=== Step 7: Fixing Commissions ===');
    let fixedCommissions = 0;
    let recalculatedCommissions = 0;

    for (const comm of allCommissions) {
      let needsFix = false;
      const payment = await Payment.findById(comm.paymentId);
      const shop = await Shop.findById(comm.shopId);

      if (!payment || !shop) continue;

      // Fix missing operatorId
      if (!comm.operatorId && shop.operatorId) {
        comm.operatorId = shop.operatorId;
        needsFix = true;
      } else if (!comm.operatorId && shop.agentId) {
        const approvedRequest = await AgentRequest.findOne({
          agentId: shop.agentId,
          status: RequestStatus.APPROVED,
        }).sort({ createdAt: 1 });

        if (approvedRequest) {
          comm.operatorId = approvedRequest.operatorId;
          shop.operatorId = approvedRequest.operatorId;
          await shop.save();
          needsFix = true;
        }
      }

      // Recalculate if operatorId exists but operatorAmount is 0
      if (comm.operatorId && comm.operatorAmount === 0) {
        const breakdown = calculateCommission(
          payment.amount,
          shop.agentId?.toString(),
          comm.operatorId.toString()
        );
        comm.operatorAmount = breakdown.operatorAmount;
        comm.companyAmount = breakdown.companyAmount;
        needsFix = true;
        recalculatedCommissions++;
      }

      // Recalculate if amounts don't match
      if (comm.operatorId) {
        const expectedBreakdown = calculateCommission(
          payment.amount,
          shop.agentId?.toString(),
          comm.operatorId.toString()
        );

        const tolerance = 0.01; // Allow small rounding differences
        if (
          Math.abs(comm.agentAmount - expectedBreakdown.agentAmount) > tolerance ||
          Math.abs(comm.operatorAmount - expectedBreakdown.operatorAmount) > tolerance ||
          Math.abs(comm.companyAmount - expectedBreakdown.companyAmount) > tolerance
        ) {
          comm.agentAmount = expectedBreakdown.agentAmount;
          comm.operatorAmount = expectedBreakdown.operatorAmount;
          comm.companyAmount = expectedBreakdown.companyAmount;
          needsFix = true;
          recalculatedCommissions++;
        }
      }

      if (needsFix) {
        await comm.save();
        fixedCommissions++;
        report.fixes.push({
          type: 'Commission Fix',
          commissionId: comm._id.toString(),
          paymentId: comm.paymentId.toString(),
          shopId: comm.shopId.toString(),
          operatorId: comm.operatorId?.toString(),
          agentAmount: comm.agentAmount,
          operatorAmount: comm.operatorAmount,
          companyAmount: comm.companyAmount,
        });
      }
    }

    // Step 8: Create missing commissions
    console.log('=== Step 8: Creating Missing Commissions ===');
    let createdCommissions = 0;

    for (const payment of successfulPayments) {
      const existingCommission = await Commission.findOne({ paymentId: payment._id });
      if (existingCommission) continue;

      const shop = await Shop.findById(payment.shopId);
      if (!shop) continue;

      let operatorId = shop.operatorId;
      if (!operatorId && shop.agentId) {
        const approvedRequest = await AgentRequest.findOne({
          agentId: shop.agentId,
          status: RequestStatus.APPROVED,
        }).sort({ createdAt: 1 });

        if (approvedRequest) {
          operatorId = approvedRequest.operatorId;
          shop.operatorId = operatorId;
          await shop.save();
        }
      }

      const breakdown = calculateCommission(
        payment.amount,
        shop.agentId?.toString(),
        operatorId?.toString()
      );

      await Commission.create({
        paymentId: payment._id,
        shopId: shop._id,
        agentId: shop.agentId,
        operatorId: operatorId,
        agentAmount: breakdown.agentAmount,
        operatorAmount: breakdown.operatorAmount,
        companyAmount: breakdown.companyAmount,
        totalAmount: breakdown.totalAmount,
        status: 'pending',
      });

      createdCommissions++;
      report.fixes.push({
        type: 'Create Commission',
        paymentId: payment._id.toString(),
        shopId: shop._id.toString(),
        operatorId: operatorId?.toString(),
        agentAmount: breakdown.agentAmount,
        operatorAmount: breakdown.operatorAmount,
        companyAmount: breakdown.companyAmount,
      });
    }

    // Step 9: Final totals
    console.log('=== Step 9: Calculating Final Totals ===');
    const finalCommissions = await Commission.find({});
    let finalAgentCommission = 0;
    let finalOperatorCommission = 0;
    let finalCompanyRevenue = 0;

    for (const comm of finalCommissions) {
      finalAgentCommission += comm.agentAmount || 0;
      finalOperatorCommission += comm.operatorAmount || 0;
      finalCompanyRevenue += comm.companyAmount || 0;
    }

    report.summary = {
      totalOperators: operators.length,
      totalAgents: agents.length,
      totalShops: allShops.length,
      totalPayments: successfulPayments.length,
      totalPaymentAmount,
      totalCommissions: finalCommissions.length,
      finalAgentCommission,
      finalOperatorCommission,
      finalCompanyRevenue,
      fixes: {
        shopsFixed: fixedShops,
        commissionsFixed: fixedCommissions,
        commissionsRecalculated: recalculatedCommissions,
        commissionsCreated: createdCommissions,
        totalFixes: fixedShops + fixedCommissions + createdCommissions,
      },
    };

    console.log('\n=== Verification Complete ===');
    console.log('Summary:', JSON.stringify(report.summary, null, 2));

    return NextResponse.json({
      success: true,
      message: 'Database verification and fix complete',
      report,
    });

  } catch (error: any) {
    console.error('Error verifying and fixing commissions:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

