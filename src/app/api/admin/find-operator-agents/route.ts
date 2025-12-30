import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import AgentRequest, { RequestStatus } from '@/models/AgentRequest';
import { verifyToken } from '@/lib/auth';
import { UserRole } from '@/models/User';

// GET /api/admin/find-operator-agents?operatorName=Khushi
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

    // Find operator
    const operator = await User.findOne({
      name: { $regex: new RegExp(operatorName, 'i') },
      role: UserRole.OPERATOR,
    });

    if (!operator) {
      return NextResponse.json({
        success: false,
        message: `Operator "${operatorName}" not found`,
      });
    }

    // Find all approved agent requests for this operator
    const approvedRequests = await AgentRequest.find({
      operatorId: operator._id,
      status: RequestStatus.APPROVED,
    }).populate('agentId', 'name email phone _id');

    // Get all agents linked to this operator
    const agents = approvedRequests.map(req => ({
      _id: (req.agentId as any)?._id?.toString(),
      name: (req.agentId as any)?.name,
      email: (req.agentId as any)?.email,
      phone: (req.agentId as any)?.phone,
      requestId: req._id.toString(),
      approvedAt: req.reviewedAt,
    }));

    // Also check for agents added directly (without request)
    const allAgents = await User.find({ role: UserRole.AGENT }).select('name email phone _id');
    
    return NextResponse.json({
      success: true,
      operator: {
        _id: operator._id.toString(),
        name: operator.name,
        email: operator.email,
      },
      linkedAgents: agents,
      allAgents: allAgents.map(a => ({
        _id: a._id.toString(),
        name: a.name,
        email: a.email,
        phone: a.phone,
      })),
      message: agents.length > 0 
        ? `Found ${agents.length} agent(s) linked to operator "${operator.name}"`
        : `No agents linked to operator "${operator.name}". All available agents listed below.`,
    });

  } catch (error: any) {
    console.error('Error finding operator agents:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

