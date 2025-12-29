import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Shop from '@/models/Shop';
import Payment from '@/models/Payment';
import Commission from '@/models/Commission';
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
    if (!payload || payload.role !== UserRole.OPERATOR) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await connectDB();

    const operator = await User.findById(payload.userId);
    if (!operator) {
      return NextResponse.json({ error: 'Operator not found' }, { status: 404 });
    }

    // Get approved agents for this operator through AgentRequest
    const AgentRequest = (await import('@/models/AgentRequest')).default;
    const RequestStatus = (await import('@/models/AgentRequest')).RequestStatus;
    
    // Get approved requests for this operator
    const approvedRequests = await AgentRequest.find({
      operatorId: operator._id,
      status: RequestStatus.APPROVED
    });
    
    // Get agent IDs from approved requests
    const approvedAgentIds = approvedRequests.map(req => req.agentId.toString());
    
    // Also include agent if operator has agentId set (for backward compatibility)
    let allAgentIds = new Set(approvedAgentIds);
    if (operator.agentId) {
      allAgentIds.add(operator.agentId.toString());
    }

    // Get all agents
    const mongoose = await import('mongoose');
    const agentObjectIds = Array.from(allAgentIds).map(id => new mongoose.Types.ObjectId(id));
    
    const agents = agentObjectIds.length > 0
      ? await User.find({ 
          _id: { $in: agentObjectIds },
          role: UserRole.AGENT 
        }).select('name email phone _id createdAt')
      : [];
    // Get all shops for this operator (including shops where operatorId matches OR operatorId is null but agentId matches approved agents)
    const shopQuery: any = {
      $or: [
        { operatorId: operator._id }
      ]
    };
    
    // If we have approved agents, also include their shops without operatorId
    if (agentObjectIds.length > 0) {
      shopQuery.$or.push({
        agentId: { $in: agentObjectIds },
        $or: [
          { operatorId: { $exists: false } },
          { operatorId: null }
        ]
      });
    }
    
    const operatorShops = await Shop.find(shopQuery);
    
    const totalShops = operatorShops.length;
    const activeShops = operatorShops.filter(s => s.status === 'active' || s.status === 'approved').length;

    // Calculate operator's total revenue from their shops
    const operatorShopIds = operatorShops.map(s => s._id);
    const totalRevenue = operatorShopIds.length > 0
      ? (await Payment.find({
      shopId: { $in: operatorShopIds },
      status: 'success'
        })).reduce((sum, p) => sum + p.amount, 0)
      : 0;
    
    const operatorPayments = operatorShopIds.length > 0
      ? await Payment.find({
          shopId: { $in: operatorShopIds },
          status: 'success'
        })
      : [];

    // Get today's sales
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayPayments = operatorPayments.filter(p => {
      const paymentDate = p.paidAt || p.createdAt;
      return paymentDate >= today && paymentDate < tomorrow;
    });
    const todaySales = todayPayments.reduce((sum, p) => sum + p.amount, 0);

    // Calculate operator's total commission
    // First, get commissions where operatorId matches
    const operatorCommissionsDirect = await Commission.find({ operatorId: operator._id });
    let totalOperatorCommission = operatorCommissionsDirect.reduce((sum, c) => sum + (c.operatorAmount || 0), 0);
    
    // Also check commissions for shops under this operator but without operatorId set
    // This handles cases where commissions were created before operatorId was properly set
    const operatorShopIds = operatorShops.map(s => s._id);
    if (operatorShopIds.length > 0) {
      const commissionsForOperatorShops = await Commission.find({
        shopId: { $in: operatorShopIds },
        $or: [
          { operatorId: { $exists: false } },
          { operatorId: null },
          { operatorAmount: 0 }
        ],
        agentId: { $exists: true, $ne: null }
      });
      
      // Calculate operator commission for these commissions
      for (const comm of commissionsForOperatorShops) {
        const Payment = (await import('@/models/Payment')).default;
        const payment = await Payment.findById(comm.paymentId);
        if (payment) {
          // Operator gets 10% of remaining after agent's 20%
          const agentAmount = payment.amount * 0.20;
          const remaining = payment.amount - agentAmount;
          const operatorAmount = remaining * 0.10;
          totalOperatorCommission += operatorAmount;
        }
      }
    }

    // Get agents data with their stats
    const agentsData = await Promise.all(agents.map(async (agent) => {
      // Get agent's shops under this operator (where agentId matches and operatorId matches OR is null)
      const agentShops = await Shop.find({
        agentId: agent._id,
        $or: [
          { operatorId: operator._id },
          { operatorId: { $exists: false } },
          { operatorId: null }
        ]
      });
      const agentShopIds = agentShops.map(s => s._id);
      
      // Get agent's payments from shops under this operator
      const agentTotalRevenue = agentShopIds.length > 0
        ? (await Payment.find({
        shopId: { $in: agentShopIds },
        status: 'success'
          })).reduce((sum, p) => sum + p.amount, 0)
        : 0;
      
      // Calculate agent's 20% commission
      const agentCommissionAmount = agentTotalRevenue * 0.20;
      
      // Calculate remaining amount after agent's commission
      const remainingAfterAgent = agentTotalRevenue - agentCommissionAmount;
      
      // Calculate operator's 10% commission on remaining
      const operatorCommissionFromAgent = remainingAfterAgent * 0.10;
      
      // Get agent's commissions from database for shops under this operator
      const agentCommissions = await Commission.find({ 
        agentId: agent._id,
        shopId: { $in: agentShopIds }
      });
      const agentTotalCommission = agentCommissions.reduce((sum, c) => sum + c.agentAmount, 0);
      
      // Get operator's commission from this agent
      const operatorCommissionsFromAgent = await Commission.find({ 
        agentId: agent._id,
        operatorId: operator._id,
        shopId: { $in: agentShopIds }
      });
      const operatorCommissionFromAgentDB = operatorCommissionsFromAgent.reduce((sum, c) => sum + c.operatorAmount, 0);

      return {
        _id: agent._id.toString(),
        name: agent.name,
        email: agent.email,
        phone: agent.phone,
        totalShops: agentShops.length,
        activeShops: agentShops.filter(s => s.status === 'active' || s.status === 'approved').length,
        totalRevenue: agentTotalRevenue,
        agentCommission: agentTotalCommission || agentCommissionAmount, // Use DB value if available
        agentCommissionPercent: 20,
        remainingAfterAgent: remainingAfterAgent,
        operatorCommission: operatorCommissionFromAgentDB || operatorCommissionFromAgent, // Use DB value if available
        operatorCommissionPercent: 10,
        createdAt: agent.createdAt,
      };
    }));

    // Calculate total operator commission from all agents
    const totalOperatorCommissionFromAgents = agentsData.reduce((sum, agent) => sum + agent.operatorCommission, 0);

    return NextResponse.json({
      success: true,
      operator: {
        name: operator.name,
        email: operator.email,
        operatorId: operator._id.toString(),
      },
      stats: {
        totalShops,
        activeShops,
        totalRevenue,
        todaySales,
        totalOperatorCommission: totalOperatorCommission || totalOperatorCommissionFromAgents,
        totalAgents: agents.length,
      },
      agents: agentsData,
    });
  } catch (error: any) {
    console.error('Operator dashboard error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

