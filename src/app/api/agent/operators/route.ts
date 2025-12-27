import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Shop from '@/models/Shop';
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
    if (!payload || payload.role !== UserRole.AGENT) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await connectDB();

    const agent = await User.findById(payload.userId);
    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    const operators = await User.find({ 
      agentId: agent._id, 
      role: UserRole.OPERATOR 
    }).select('-password');

    // Get shop count for each operator
    const operatorsWithShops = await Promise.all(
      operators.map(async (operator) => {
        const shopCount = await Shop.countDocuments({ operatorId: operator._id });
        return {
          _id: operator._id,
          name: operator.name,
          email: operator.email,
          phone: operator.phone,
          shops: shopCount,
          isActive: operator.isActive,
          createdAt: operator.createdAt,
        };
      })
    );

    return NextResponse.json({
      success: true,
      operators: operatorsWithShops,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

