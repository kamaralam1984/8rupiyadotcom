import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User, { UserRole } from '@/models/User';
import { hashPassword } from '@/lib/auth';

// POST /api/admin/update-user - Update user (public endpoint for setup)
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const { 
      email,
      name,
      phone,
      password,
      role,
      isActive
    } = body;

    if (!email) {
      return NextResponse.json({ 
        error: 'Email is required' 
      }, { status: 400 });
    }

    // Find user
    const user = await User.findOne({ 
      email: email.toLowerCase() 
    });

    if (!user) {
      return NextResponse.json({ 
        success: false,
        error: 'User not found',
      }, { status: 404 });
    }

    // Update fields
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (role && Object.values(UserRole).includes(role)) {
      user.role = role as UserRole;
    }
    if (isActive !== undefined) user.isActive = isActive;
    
    if (password) {
      user.password = await hashPassword(password);
    }

    await user.save();

    return NextResponse.json({
      success: true,
      message: 'User updated successfully',
      user: {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (error: any) {
    console.error('Error updating user:', error);
    return NextResponse.json({ 
      success: false,
      error: error.message || 'Failed to update user',
    }, { status: 500 });
  }
}

