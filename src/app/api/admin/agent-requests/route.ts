import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import AgentRequest, { RequestStatus } from '@/models/AgentRequest';
import { verifyToken } from '@/lib/auth';
import { UserRole } from '@/models/User';

// GET /api/admin/agent-requests - Get all pending agent requests (Admin only)
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

    const searchParams = req.nextUrl.searchParams;
    const status = searchParams.get('status') || 'pending';

    let query: any = {};
    if (status === 'pending') {
      query.status = RequestStatus.PENDING;
    } else if (status === 'approved') {
      query.status = RequestStatus.APPROVED;
    } else if (status === 'rejected') {
      query.status = RequestStatus.REJECTED;
    }

    const requests = await AgentRequest.find(query)
      .populate('operatorId', 'name email phone')
      .populate('agentId', 'name email phone')
      .populate('reviewedBy', 'name')
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      requests: requests.map(req => ({
        _id: req._id.toString(),
        operatorId: (req.operatorId as any)?._id?.toString(),
        operatorName: (req.operatorId as any)?.name,
        operatorEmail: (req.operatorId as any)?.email,
        operatorPhone: (req.operatorId as any)?.phone,
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
      count: requests.length,
    });
  } catch (error: any) {
    console.error('Error fetching agent requests:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/admin/agent-requests - Approve or reject agent request (Admin only)
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
    if (!admin) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!admin.isActive) {
      return NextResponse.json({ error: 'Account is inactive' }, { status: 403 });
    }

    if (admin.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Forbidden. Admin access required.' }, { status: 403 });
    }

    const body = await req.json();
    const { requestId, action, rejectionReason } = body;

    if (!requestId || !action) {
      return NextResponse.json({ 
        error: 'Request ID and action are required' 
      }, { status: 400 });
    }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json({ 
        error: 'Action must be "approve" or "reject"' 
      }, { status: 400 });
    }

    const request = await AgentRequest.findById(requestId)
      .populate('operatorId')
      .populate('agentId');

    if (!request) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    if (request.status !== RequestStatus.PENDING) {
      return NextResponse.json({ 
        error: `Request is already ${request.status}` 
      }, { status: 400 });
    }

    if (action === 'approve') {
      // Link operator to agent
      const operator = request.operatorId as any;
      operator.agentId = (request.agentId as any)._id;
      await operator.save();

      // Update request status
      request.status = RequestStatus.APPROVED;
      request.reviewedAt = new Date();
      request.reviewedBy = admin._id;
      await request.save();

      return NextResponse.json({
        success: true,
        message: `Agent "${(request.agentId as any).name}" has been added to operator "${operator.name}"`,
      });
    } else {
      // Reject request
      request.status = RequestStatus.REJECTED;
      request.reviewedAt = new Date();
      request.reviewedBy = admin._id;
      if (rejectionReason) {
        request.rejectionReason = rejectionReason;
      }
      await request.save();

      return NextResponse.json({
        success: true,
        message: 'Request has been rejected',
      });
    }
  } catch (error: any) {
    console.error('Error processing agent request:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

