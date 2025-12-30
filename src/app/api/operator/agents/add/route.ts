import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import AgentRequest, { RequestStatus } from '@/models/AgentRequest';
import { verifyToken } from '@/lib/auth';
import { UserRole } from '@/models/User';

// POST /api/operator/agents/add - Operator directly adds an existing agent
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
    const { agentId, agentEmail, agentPhone } = body;

    // Find agent by ID, email, or phone
    let agent;
    if (agentId) {
      agent = await User.findById(agentId);
    } else if (agentEmail) {
      agent = await User.findOne({ email: agentEmail.toLowerCase(), role: UserRole.AGENT });
    } else if (agentPhone) {
      agent = await User.findOne({ phone: agentPhone, role: UserRole.AGENT });
    } else {
      return NextResponse.json({ 
        error: 'Agent ID, email, or phone is required' 
      }, { status: 400 });
    }

    if (!agent) {
      return NextResponse.json({ 
        error: 'Agent not found with the provided details' 
      }, { status: 404 });
    }

    if (agent.role !== UserRole.AGENT) {
      return NextResponse.json({ 
        error: 'The user found is not an agent' 
      }, { status: 400 });
    }

    if (!agent.isActive) {
      return NextResponse.json({ 
        error: 'Agent account is inactive' 
      }, { status: 400 });
    }

    // Check if agent is already added (approved request exists)
    const existingApprovedRequest = await AgentRequest.findOne({
      operatorId: operator._id,
      agentId: agent._id,
      status: RequestStatus.APPROVED
    });

    if (existingApprovedRequest) {
      return NextResponse.json({ 
        error: 'Agent is already added to your panel' 
      }, { status: 400 });
    }

    // Check if there's a pending request
    const existingPendingRequest = await AgentRequest.findOne({
      operatorId: operator._id,
      agentId: agent._id,
      status: RequestStatus.PENDING
    });

    if (existingPendingRequest) {
      return NextResponse.json({ 
        error: 'A request for this agent is already pending' 
      }, { status: 400 });
    }

    // Check if agent is already linked to this operator through agentId field
    if (operator.agentId && operator.agentId.toString() === agent._id.toString()) {
      return NextResponse.json({ 
        error: 'Agent is already linked to your account' 
      }, { status: 400 });
    }

    // Create auto-approved agent request
    const request = await AgentRequest.create({
      operatorId: operator._id,
      agentId: agent._id,
      status: RequestStatus.APPROVED,
      requestedAt: new Date(),
      reviewedAt: new Date(),
      reviewedBy: operator._id, // Operator approved it themselves
    });

    return NextResponse.json({
      success: true,
      message: `Agent "${agent.name}" added successfully`,
      agent: {
        _id: agent._id.toString(),
        name: agent.name,
        email: agent.email,
        phone: agent.phone,
        isActive: agent.isActive,
        createdAt: agent.createdAt,
      },
    });
  } catch (error: any) {
    console.error('Error adding agent:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

