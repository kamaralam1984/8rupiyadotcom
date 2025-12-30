import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import AgentRequest, { RequestStatus } from '@/models/AgentRequest';
import { verifyToken } from '@/lib/auth';
import { UserRole } from '@/models/User';

// POST /api/admin/operators/link-agent - Admin directly links agent to operator
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

    const body = await req.json();
    const { operatorId, agentId } = body;

    if (!operatorId || !agentId) {
      return NextResponse.json({ 
        error: 'Operator ID and Agent ID are required' 
      }, { status: 400 });
    }

    // Find operator
    const operator = await User.findById(operatorId);
    if (!operator || operator.role !== UserRole.OPERATOR) {
      return NextResponse.json({ 
        error: 'Operator not found' 
      }, { status: 404 });
    }

    // Find agent
    const agent = await User.findById(agentId);
    if (!agent || agent.role !== UserRole.AGENT) {
      return NextResponse.json({ 
        error: 'Agent not found' 
      }, { status: 404 });
    }

    // Check if request already exists
    const existingRequest = await AgentRequest.findOne({
      operatorId: operator._id,
      agentId: agent._id,
    });

    if (existingRequest) {
      if (existingRequest.status === RequestStatus.APPROVED) {
        return NextResponse.json({ 
          error: 'Agent is already linked to this operator' 
        }, { status: 400 });
      } else if (existingRequest.status === RequestStatus.PENDING) {
        // Approve the pending request
        existingRequest.status = RequestStatus.APPROVED;
        existingRequest.reviewedAt = new Date();
        existingRequest.reviewedBy = admin._id;
        await existingRequest.save();

        return NextResponse.json({
          success: true,
          message: `Agent "${agent.name}" linked to operator "${operator.name}" (approved pending request)`,
          request: {
            _id: existingRequest._id.toString(),
            operatorId: operator._id.toString(),
            operatorName: operator.name,
            agentId: agent._id.toString(),
            agentName: agent.name,
            status: existingRequest.status,
          },
        });
      } else {
        // Rejected request - create new approved one
        const newRequest = await AgentRequest.create({
          operatorId: operator._id,
          agentId: agent._id,
          status: RequestStatus.APPROVED,
          requestedAt: new Date(),
          reviewedAt: new Date(),
          reviewedBy: admin._id,
        });

        return NextResponse.json({
          success: true,
          message: `Agent "${agent.name}" linked to operator "${operator.name}"`,
          request: {
            _id: newRequest._id.toString(),
            operatorId: operator._id.toString(),
            operatorName: operator.name,
            agentId: agent._id.toString(),
            agentName: agent.name,
            status: newRequest.status,
          },
        });
      }
    }

    // Create new approved request
    const newRequest = await AgentRequest.create({
      operatorId: operator._id,
      agentId: agent._id,
      status: RequestStatus.APPROVED,
      requestedAt: new Date(),
      reviewedAt: new Date(),
      reviewedBy: admin._id,
    });

    return NextResponse.json({
      success: true,
      message: `Agent "${agent.name}" successfully linked to operator "${operator.name}"`,
      request: {
        _id: newRequest._id.toString(),
        operatorId: operator._id.toString(),
        operatorName: operator.name,
        agentId: agent._id.toString(),
        agentName: agent.name,
        status: newRequest.status,
      },
    });

  } catch (error: any) {
    console.error('Error linking agent to operator:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

