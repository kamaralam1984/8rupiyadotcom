import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Shop from '@/models/Shop';
import Payment from '@/models/Payment';
import { verifyToken } from '@/lib/auth';
import { UserRole } from '@/models/User';

// GET /api/admin/agents/stats - Get stats for all agents (Admin only)
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
    if (!admin) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!admin.isActive) {
      return NextResponse.json({ error: 'Account is inactive' }, { status: 403 });
    }

    if (admin.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Forbidden. Admin access required.' }, { status: 403 });
    }

    // Get all agents
    const agents = await User.find({ role: UserRole.AGENT }).select('name email phone _id isActive createdAt');

    // Get stats for each agent
    const agentsWithStats = await Promise.all(
      agents.map(async (agent) => {
        // Get all shops for this agent
        const agentShops = await Shop.find({ agentId: agent._id });
        const totalShops = agentShops.length;

        // Get shop IDs
        const shopIds = agentShops.map(s => s._id);

        // Calculate total earnings from successful payments
        let totalEarnings = 0;
        if (shopIds.length > 0) {
          const payments = await Payment.find({
            shopId: { $in: shopIds },
            status: 'success'
          });
          totalEarnings = payments.reduce((sum, p) => sum + p.amount, 0);
        }

        // Calculate commission as 20% of total earnings
        const commission = totalEarnings * 0.20;

        // Get operators count (operators linked to this agent)
        const operatorsCount = await User.countDocuments({
          agentId: agent._id,
          role: UserRole.OPERATOR
        });

        return {
          _id: agent._id.toString(),
          name: agent.name,
          email: agent.email,
          phone: agent.phone,
          role: agent.role || 'agent', // Include role field
          shops: totalShops,
          earnings: commission, // Return commission (20% of earnings) instead of total earnings
          totalEarnings: totalEarnings, // Keep total earnings for reference
          operators: operatorsCount,
          isActive: agent.isActive,
          createdAt: agent.createdAt,
        };
      })
    );

    return NextResponse.json({
      success: true,
      agents: agentsWithStats,
    });
  } catch (error: any) {
    console.error('Error fetching agent stats:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

