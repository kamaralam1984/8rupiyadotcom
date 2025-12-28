import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import AgentRequest, { RequestStatus } from '@/models/AgentRequest';
import { verifyToken } from '@/lib/auth';
import { UserRole } from '@/models/User';

// POST /api/operator/agents/request - Operator sends request to add an agent
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

    const body = await req.json();
    const { agentId, agentEmail, agentName } = body;

    // Find agent by ID, email, or name
    let agent;
    if (agentId) {
      agent = await User.findById(agentId);
    } else if (agentEmail) {
      agent = await User.findOne({ email: agentEmail.toLowerCase(), role: UserRole.AGENT });
    } else if (agentName) {
      agent = await User.findOne({ 
        name: { $regex: new RegExp(agentName, 'i') },
        role: UserRole.AGENT 
      });
    } else {
      return NextResponse.json({ 
        error: 'Agent ID, email, or name is required' 
      }, { status: 400 });
    }

    if (!agent) {
      return NextResponse.json({ 
        error: 'Agent not found' 
      }, { status: 404 });
    }

    if (!agent.isActive) {
      return NextResponse.json({ 
        error: 'Agent account is inactive' 
      }, { status: 400 });
    }

    // Check if request already exists (pending or approved)
    const existingRequest = await AgentRequest.findOne({
      operatorId: operator._id,
      agentId: agent._id,
      status: { $in: [RequestStatus.PENDING, RequestStatus.APPROVED] }
    });

    if (existingRequest) {
      if (existingRequest.status === RequestStatus.PENDING) {
        return NextResponse.json({ 
          error: 'Request already pending for this agent' 
        }, { status: 400 });
      } else if (existingRequest.status === RequestStatus.APPROVED) {
        return NextResponse.json({ 
          error: 'Agent is already added to your panel' 
        }, { status: 400 });
      }
    }

    // Check if agent is already linked to this operator
    if (operator.agentId && operator.agentId.toString() === agent._id.toString()) {
      return NextResponse.json({ 
        error: 'Agent is already linked to your account' 
      }, { status: 400 });
    }

    // Create request
    const request = await AgentRequest.create({
      operatorId: operator._id,
      agentId: agent._id,
      status: RequestStatus.PENDING,
      requestedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: `Request sent to admin for agent "${agent.name}"`,
      request: {
        _id: request._id.toString(),
        agentId: agent._id.toString(),
        agentName: agent.name,
        agentEmail: agent.email,
        status: request.status,
        requestedAt: request.requestedAt,
      },
    });
  } catch (error: any) {
    console.error('Error creating agent request:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET /api/operator/agents/request - Get operator's agent requests
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

    if (operator.role !== UserRole.OPERATOR) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const requests = await AgentRequest.find({ operatorId: operator._id })
      .populate('agentId', 'name email phone')
      .populate('reviewedBy', 'name')
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      requests: requests.map(req => ({
        _id: req._id.toString(),
        agentId: (req.agentId as any)?._id?.toString(),
        agentName: (req.agentId as any)?.name,
        agentEmail: (req.agentId as any)?.email,
        agentPhone: (req.agentId as any)?.phone,
        status: req.status,
        requestedAt: req.requestedAt,
        reviewedAt: req.reviewedAt,
        reviewedBy: (req.reviewedBy as any)?.name,
        rejectionReason: req.rejectionReason,
      })),
    });
  } catch (error: any) {
    console.error('Error fetching agent requests:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

