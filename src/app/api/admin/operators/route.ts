import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Shop from '@/models/Shop';
import Payment from '@/models/Payment';
import Commission from '@/models/Commission';
import { verifyToken } from '@/lib/auth';
import { UserRole } from '@/models/User';
import mongoose from 'mongoose';

interface AgentData {
  agentId: string;
  agentName: string;
  agentIncome: number;
  agentShopCount: number;
  planNames: string;
}

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

    // Verify user is admin
    const dbUser = await User.findById(payload.userId);
    if (!dbUser || dbUser.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get all operators
    const operators = await User.find({ role: UserRole.OPERATOR })
      .select('_id name email phone createdAt')
      .sort({ createdAt: -1 });

    // Get detailed data for each operator
    const operatorsData = await Promise.all(
      operators.map(async (operator) => {
        // Get approved agents for this operator
        const AgentRequest = (await import('@/models/AgentRequest')).default;
        const RequestStatus = (await import('@/models/AgentRequest')).RequestStatus;
        
        const approvedRequests = await AgentRequest.find({
          operatorId: operator._id,
          status: RequestStatus.APPROVED
        });
        
        const approvedAgentIds = approvedRequests.map(req => req.agentId.toString());
        let allAgentIds = new Set(approvedAgentIds);
        if (operator.agentId) {
          allAgentIds.add(operator.agentId.toString());
        }
        
        const agentObjectIds = Array.from(allAgentIds).map(id => new mongoose.Types.ObjectId(id));
        
        // Get operator's shops (including shops where operatorId matches OR operatorId is null but agentId matches approved agents)
        const shopQuery: any = {
          $or: [
            { operatorId: operator._id }
          ]
        };
        
        if (agentObjectIds.length > 0) {
          shopQuery.$or.push({
            agentId: { $in: agentObjectIds },
            $or: [
              { operatorId: { $exists: false } },
              { operatorId: null }
            ]
          });
        }
        
        const operatorShops = await Shop.find(shopQuery)
          .populate('planId', 'name')
          .populate('agentId', '_id name');

        // Get operator's total income (commission)
        const operatorCommissions = await Commission.find({ operatorId: operator._id });
        const operatorIncome = operatorCommissions.reduce((sum, c) => sum + c.operatorAmount, 0);

        // Get unique agents working under this operator
        // Use Map to ensure proper deduplication by ObjectId
        const agentIdMap = new Map();
        operatorShops.forEach(shop => {
          if (shop.agentId) {
            const agentIdStr = shop.agentId.toString();
            if (!agentIdMap.has(agentIdStr)) {
              agentIdMap.set(agentIdStr, shop.agentId);
            }
          }
        });
        const uniqueAgentIds = Array.from(agentIdMap.keys());

        // Get agent details with their stats
        const agentsData = await Promise.all(
          uniqueAgentIds.map(async (agentIdStr) => {
            const agent = await User.findById(agentIdStr);
            if (!agent) return null;

            // Get agent's shops under this operator - use ObjectId comparison
            const agentObjectId = new mongoose.Types.ObjectId(agentIdStr);
            const agentShops = operatorShops.filter(s => 
              s.agentId && s.agentId.toString() === agentIdStr
            );

            // Get agent's payments from these shops
            const agentShopIds = agentShops.map(s => s._id);
            const agentPayments = await Payment.find({
              shopId: { $in: agentShopIds },
              status: 'success'
            });

            const agentTotalRevenue = agentPayments.reduce((sum, p) => sum + p.amount, 0);

            // Get agent's commission
            const agentCommissions = await Commission.find({ 
              agentId: agent._id,
              operatorId: operator._id 
            });
            const agentIncome = agentCommissions.reduce((sum, c) => sum + c.agentAmount, 0);

            // Get plan names from shops
            const planNames = [...new Set(
              agentShops
                .map(s => s.planId)
                .filter(Boolean)
                .map((p: any) => p.name || 'N/A')
            )];

            return {
              agentId: agent._id.toString(),
              agentName: agent.name,
              agentIncome: agentIncome,
              agentShopCount: agentShops.length,
              planNames: planNames.join(', ') || 'N/A',
            };
          })
        );

        // Remove duplicate agents and null values
        const uniqueAgents = Array.from(
          new Map(
            agentsData
              .filter(a => a !== null)
              .map(agent => [agent!.agentId, agent])
          ).values()
        ) as AgentData[];

        return {
          operatorId: operator._id.toString(),
          operatorName: operator.name,
          operatorEmail: operator.email,
          operatorPhone: operator.phone,
          operatorIncome: operatorIncome,
          totalShops: operatorShops.length,
          agents: uniqueAgents,
          createdAt: operator.createdAt,
        };
      })
    );

    return NextResponse.json({
      success: true,
      operators: operatorsData,
    });
  } catch (error: any) {
    console.error('Admin operators error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

