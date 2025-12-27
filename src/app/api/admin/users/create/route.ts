import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User, { UserRole } from '@/models/User';
import { hashPassword } from '@/lib/auth';
import { withAuth, AuthRequest } from '@/middleware/auth';

// POST /api/admin/users/create - Create user (Admin only)
export const POST = withAuth(async (req: AuthRequest) => {
  try {
    await connectDB();

    const jwtPayload = req.user!;
    
    // Verify user exists and is admin in database
    const dbUser = await User.findById(jwtPayload.userId);
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!dbUser.isActive) {
      return NextResponse.json({ error: 'Account is inactive' }, { status: 403 });
    }
    
    // Only admin can create users
    if (dbUser.role !== UserRole.ADMIN) {
      return NextResponse.json({ 
        error: 'Forbidden. Admin access required.',
        message: `Your current role is: ${dbUser.role}. Admin role is required.`
      }, { status: 403 });
    }

    const body = await req.json();
    const { name, email, phone, password, role, agentId, operatorId } = body;

    // Validate required fields
    if (!name || !email || !phone || !password || !role) {
      return NextResponse.json({ 
        error: 'Missing required fields: name, email, phone, password, role' 
      }, { status: 400 });
    }

    // Validate role
    if (!Object.values(UserRole).includes(role)) {
      return NextResponse.json({ 
        error: `Invalid role. Must be one of: ${Object.values(UserRole).join(', ')}` 
      }, { status: 400 });
    }

    // Validate phone format (should be 10 digits)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone.replace(/\s+/g, ''))) {
      return NextResponse.json({ 
        error: 'Phone number must be 10 digits' 
      }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ 
        error: 'Invalid email format' 
      }, { status: 400 });
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json({ 
        error: 'Password must be at least 6 characters' 
      }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        { email: email.toLowerCase() }, 
        { phone: phone.replace(/\s+/g, '') }
      ],
    });

    if (existingUser) {
      return NextResponse.json({ 
        error: 'User with this email or phone already exists' 
      }, { status: 400 });
    }

    // Validate agentId for operators
    if (role === UserRole.OPERATOR && agentId) {
      const agent = await User.findById(agentId);
      if (!agent || agent.role !== UserRole.AGENT) {
        return NextResponse.json({ 
          error: 'Invalid agent ID. Agent not found.' 
        }, { status: 400 });
      }
    }

    // Validate operatorId for shoppers
    if (role === UserRole.SHOPPER && operatorId) {
      const operator = await User.findById(operatorId);
      if (!operator || operator.role !== UserRole.OPERATOR) {
        return NextResponse.json({ 
          error: 'Invalid operator ID. Operator not found.' 
        }, { status: 400 });
      }
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const userData: any = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.replace(/\s+/g, ''),
      password: hashedPassword,
      role: role,
      isActive: true,
    };

    // Add agentId for operators
    if (role === UserRole.OPERATOR && agentId) {
      userData.agentId = agentId;
    }

    // Add operatorId for shoppers
    if (role === UserRole.SHOPPER && operatorId) {
      userData.operatorId = operatorId;
    }

    const newUser = await User.create(userData) as any;

    return NextResponse.json({
      success: true,
      user: {
        _id: newUser._id?.toString() || newUser._id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        isActive: newUser.isActive,
        createdAt: newUser.createdAt,
      },
      message: `${role.charAt(0).toUpperCase() + role.slice(1)} user created successfully`,
    }, { status: 201 });
  } catch (error: any) {
    console.error('User creation error:', error);
    
    // Handle Mongoose validation errors
    let errorMessage = error.message || 'Failed to create user';
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors || {}).map((err: any) => err.message);
      errorMessage = `Validation error: ${validationErrors.join(', ')}`;
    }
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0];
      errorMessage = `${field} already exists`;
    }

    return NextResponse.json({ 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}, [UserRole.ADMIN]);

