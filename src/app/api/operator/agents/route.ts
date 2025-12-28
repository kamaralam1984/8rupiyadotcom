import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Shop from '@/models/Shop';
import { verifyToken } from '@/lib/auth';
import { UserRole } from '@/models/User';

// GET /api/operator/agents - Get agents for the logged-in operator
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

    const operator = await User.findById(payload.userId);
    if (!operator) {
      return NextResponse.json({ error: 'Operator not found' }, { status: 404 });
    }

    if (!operator.isActive) {
      return NextResponse.json({ error: 'Account is inactive' }, { status: 403 });
    }

    if (operator.role !== UserRole.OPERATOR) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get only approved agents for this operator
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
        }).select('name email phone _id createdAt isActive')
      : [];

    // Get shop counts and revenue for each agent
    const agentsWithStats = await Promise.all(
      agents.map(async (agent) => {
        // Find shops where agentId matches and (operatorId matches OR operatorId is null/undefined)
        // This includes shops created by the agent (no operatorId) and shops created by operator for this agent
        const agentShops = await Shop.find({
          agentId: agent._id,
          $or: [
            { operatorId: operator._id },
            { operatorId: { $exists: false } },
            { operatorId: null }
          ]
        });
        const totalShops = agentShops.length;
        const activeShops = agentShops.filter(s => s.status === 'active' || s.status === 'approved').length;
        
        // Calculate revenue from payments
        const Payment = (await import('@/models/Payment')).default;
        const shopIds = agentShops.map(s => s._id);
        const totalRevenue = shopIds.length > 0
          ? (await Payment.find({
          shopId: { $in: shopIds },
          status: 'success'
            })).reduce((sum, p) => sum + p.amount, 0)
          : 0;

        return {
          _id: agent._id.toString(),
          name: agent.name,
          email: agent.email,
          phone: agent.phone,
          isActive: agent.isActive,
          totalShops,
          activeShops,
          totalRevenue,
          createdAt: agent.createdAt,
        };
      })
    );

    return NextResponse.json({
      success: true,
      agents: agentsWithStats,
    });
  } catch (error: any) {
    console.error('Error fetching agents:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


