import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Shop from '@/models/Shop';
import Payment from '@/models/Payment';
import Commission from '@/models/Commission';
import AgentRequest from '@/models/AgentRequest';
import { verifyToken } from '@/lib/auth';
import { UserRole } from '@/models/User';

// GET /api/admin/diagnose-operator-commission?operatorName=Khushi&agentName=Afroz
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

    const searchParams = req.nextUrl.searchParams;
    const operatorName = searchParams.get('operatorName') || 'Khushi';
    const agentName = searchParams.get('agentName') || 'Afroz';

    const result: any = {
      operatorName,
      agentName,
      checks: [],
      issues: [],
      suggestions: [],
    };

    // Find operator
    const operator = await User.findOne({
      name: { $regex: new RegExp(operatorName, 'i') },
      role: UserRole.OPERATOR,
    });

    if (!operator) {
      result.checks.push({ step: 'Find Operator', status: 'FAILED', message: `Operator "${operatorName}" not found` });
      return NextResponse.json(result);
    }

    result.checks.push({
      step: 'Find Operator',
      status: 'SUCCESS',
      data: {
        id: operator._id.toString(),
        name: operator.name,
        email: operator.email,
      },
    });

    // Find agent
    const agent = await User.findOne({
      name: { $regex: new RegExp(agentName, 'i') },
      role: UserRole.AGENT,
    });

    if (!agent) {
      result.checks.push({ step: 'Find Agent', status: 'FAILED', message: `Agent "${agentName}" not found` });
      return NextResponse.json(result);
    }

    result.checks.push({
      step: 'Find Agent',
      status: 'SUCCESS',
      data: {
        id: agent._id.toString(),
        name: agent.name,
        email: agent.email,
      },
    });

    // Check AgentRequest
    const agentRequest = await AgentRequest.findOne({
      operatorId: operator._id,
      agentId: agent._id,
    });

    if (!agentRequest) {
      result.checks.push({
        step: 'Check Agent Request',
        status: 'FAILED',
        message: 'No AgentRequest found between operator and agent',
      });
      result.issues.push('Operator and Agent are not linked in the system');
      result.suggestions.push('Operator needs to add agent through /operator/agents page');
      result.suggestions.push('Use "Request Agent" option and admin needs to approve');
    } else {
      result.checks.push({
        step: 'Check Agent Request',
        status: agentRequest.status === 'approved' ? 'SUCCESS' : 'WARNING',
        data: {
          status: agentRequest.status,
          requestedAt: agentRequest.requestedAt,
          reviewedAt: agentRequest.reviewedAt,
        },
      });

      if (agentRequest.status !== 'approved') {
        result.issues.push(`Agent request is ${agentRequest.status}, not approved`);
        result.suggestions.push('Admin needs to approve the agent request in /admin/operators → Agent Requests tab');
      }
    }

    // Find agent's shops
    const shops = await Shop.find({ agentId: agent._id });
    
    result.checks.push({
      step: 'Find Agent Shops',
      status: shops.length > 0 ? 'SUCCESS' : 'WARNING',
      data: {
        count: shops.length,
        shops: shops.map(s => ({
          id: s._id.toString(),
          name: s.name,
          status: s.status,
          hasOperatorId: !!s.operatorId,
          operatorId: s.operatorId?.toString(),
        })),
      },
    });

    if (shops.length === 0) {
      result.issues.push('Agent has no shops');
      result.suggestions.push('Agent needs to add shops first');
      return NextResponse.json(result);
    }

    const shopsWithoutOperator = shops.filter(s => !s.operatorId);
    if (shopsWithoutOperator.length > 0) {
      result.issues.push(`${shopsWithoutOperator.length} shops don't have operatorId set`);
      result.suggestions.push('Click "Sync Commissions" button to auto-assign operatorId');
    }

    // Check payments
    const shopIds = shops.map(s => s._id);
    const payments = await Payment.find({
      shopId: { $in: shopIds },
      status: 'success',
    });

    const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);

    result.checks.push({
      step: 'Find Payments',
      status: payments.length > 0 ? 'SUCCESS' : 'WARNING',
      data: {
        count: payments.length,
        totalAmount,
      },
    });

    if (payments.length === 0) {
      result.issues.push('No successful payments found for agent shops');
      result.suggestions.push('Commission will be ₹0 until shops receive payments');
      return NextResponse.json(result);
    }

    // Check commissions
    const paymentIds = payments.map(p => p._id);
    const commissions = await Commission.find({
      paymentId: { $in: paymentIds },
    });

    result.checks.push({
      step: 'Find Commissions',
      status: commissions.length > 0 ? 'SUCCESS' : 'FAILED',
      data: {
        count: commissions.length,
        expectedCount: payments.length,
      },
    });

    if (commissions.length === 0) {
      result.issues.push('No commission records found for these payments');
      result.suggestions.push('Click "Sync Commissions" button to create commission records');
      return NextResponse.json(result);
    }

    if (commissions.length < payments.length) {
      result.issues.push(`Only ${commissions.length} out of ${payments.length} payments have commission records`);
      result.suggestions.push('Click "Sync Commissions" to create missing commission records');
    }

    // Analyze commissions
    let totalAgentCommission = 0;
    let totalOperatorCommission = 0;
    let totalCompanyRevenue = 0;
    let commissionsWithoutOperator = 0;

    commissions.forEach(comm => {
      totalAgentCommission += comm.agentAmount || 0;
      totalOperatorCommission += comm.operatorAmount || 0;
      totalCompanyRevenue += comm.companyAmount || 0;

      if (!comm.operatorId) {
        commissionsWithoutOperator++;
      }
    });

    result.checks.push({
      step: 'Analyze Commissions',
      status: totalOperatorCommission > 0 ? 'SUCCESS' : 'FAILED',
      data: {
        totalAgentCommission,
        totalOperatorCommission,
        totalCompanyRevenue,
        commissionsWithoutOperator,
      },
    });

    if (commissionsWithoutOperator > 0) {
      result.issues.push(`${commissionsWithoutOperator} commission records don't have operatorId set`);
      result.suggestions.push('Click "Sync Commissions" to fix operatorId in commission records');
    }

    if (totalOperatorCommission === 0) {
      result.issues.push('Operator commission is ₹0 despite having payments');
      result.suggestions.push('Main Issue: Commission records are missing operatorId');
      result.suggestions.push('Solution: Click "Sync Commissions" button on admin dashboard');
    }

    // Calculate expected commission
    const expectedAgentCommission = totalAmount * 0.20;
    const remainingAfterAgent = totalAmount - expectedAgentCommission;
    const expectedOperatorCommission = remainingAfterAgent * 0.10;

    result.expectedCommission = {
      totalPaymentAmount: totalAmount,
      expectedAgentCommission,
      expectedOperatorCommission,
      expectedCompanyRevenue: remainingAfterAgent - expectedOperatorCommission,
    };

    result.actualCommission = {
      totalAgentCommission,
      totalOperatorCommission,
      totalCompanyRevenue,
    };

    result.discrepancy = {
      agentDiff: expectedAgentCommission - totalAgentCommission,
      operatorDiff: expectedOperatorCommission - totalOperatorCommission,
    };

    // Final summary
    if (result.issues.length === 0) {
      result.summary = '✅ Everything looks good! Commission should be displaying correctly.';
    } else {
      result.summary = `❌ Found ${result.issues.length} issue(s) preventing commission from showing correctly.`;
    }

    return NextResponse.json(result);

  } catch (error: any) {
    console.error('Error diagnosing commission:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

