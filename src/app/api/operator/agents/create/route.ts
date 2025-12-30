import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth';
import { UserRole } from '@/models/User';
import bcrypt from 'bcryptjs';

// POST /api/operator/agents/create - Create a new agent account
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
    const { name, email, phone, password } = body;

    // Validation
    if (!name || !email || !phone || !password) {
      return NextResponse.json({ 
        error: 'All fields are required: name, email, phone, password' 
      }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ 
        error: 'Invalid email format' 
      }, { status: 400 });
    }

    // Validate phone format (10 digits)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone)) {
      return NextResponse.json({ 
        error: 'Phone number must be exactly 10 digits' 
      }, { status: 400 });
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json({ 
        error: 'Password must be at least 6 characters long' 
      }, { status: 400 });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json({ 
        error: 'Email already registered' 
      }, { status: 400 });
    }

    // Check if phone already exists
    const existingPhone = await User.findOne({ phone });
    if (existingPhone) {
      return NextResponse.json({ 
        error: 'Phone number already registered' 
      }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create agent user
    const newAgent = await User.create({
      name,
      email: email.toLowerCase(),
      phone,
      password: hashedPassword,
      role: UserRole.AGENT,
      isActive: true,
      isVerified: true,
      createdBy: operator._id, // Track who created this agent
    });

    // Create an auto-approved agent request for tracking
    const AgentRequest = (await import('@/models/AgentRequest')).default;
    const RequestStatus = (await import('@/models/AgentRequest')).RequestStatus;
    
    await AgentRequest.create({
      operatorId: operator._id,
      agentId: newAgent._id,
      status: RequestStatus.APPROVED,
      requestedAt: new Date(),
      reviewedAt: new Date(),
      reviewedBy: operator._id,
    });

    return NextResponse.json({
      success: true,
      message: 'Agent created successfully',
      agent: {
        _id: newAgent._id.toString(),
        name: newAgent.name,
        email: newAgent.email,
        phone: newAgent.phone,
        role: newAgent.role,
        isActive: newAgent.isActive,
        createdAt: newAgent.createdAt,
      },
    });
  } catch (error: any) {
    console.error('Error creating agent:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

