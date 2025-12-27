import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User, { UserRole } from '@/models/User';
import { hashPassword } from '@/lib/auth';

// POST /api/admin/create-user - Create a user (public endpoint for setup)
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const { 
      name, 
      email, 
      phone, 
      password, 
      role = UserRole.USER 
    } = body;

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json({ 
        error: 'Name and email are required' 
      }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ 
      email: email.toLowerCase() 
    });

    if (existingUser) {
      return NextResponse.json({ 
        success: false,
        error: 'User already exists',
        user: {
          _id: existingUser._id,
          name: existingUser.name,
          email: existingUser.email,
          role: existingUser.role,
        }
      }, { status: 400 });
    }

    // Generate default password if not provided
    const userPassword = password || 'password123';
    const hashedPassword = await hashPassword(userPassword);

    // Create user
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      phone: phone || '0000000000',
      password: hashedPassword,
      role: role as UserRole,
      isActive: true,
    });

    return NextResponse.json({
      success: true,
      message: 'User created successfully',
      user: {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
      credentials: {
        email: user.email,
        password: userPassword,
        message: password ? 'Password set as provided' : 'Default password: password123',
      },
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating user:', error);
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0];
      return NextResponse.json({ 
        success: false,
        error: `${field} already exists`,
      }, { status: 400 });
    }

    return NextResponse.json({ 
      success: false,
      error: error.message || 'Failed to create user',
    }, { status: 500 });
  }
}

