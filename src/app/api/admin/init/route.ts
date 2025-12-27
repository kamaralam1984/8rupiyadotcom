import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User, { UserRole } from '@/models/User';
import { hashPassword } from '@/lib/auth';

// POST /api/admin/init - Create default admin user (public endpoint for initial setup)
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { reset } = await req.json().catch(() => ({}));

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: UserRole.ADMIN });
    if (existingAdmin && !reset) {
      return NextResponse.json({ 
        success: false,
        message: 'Admin user already exists',
        admin: {
          email: existingAdmin.email,
          name: existingAdmin.name,
        },
        note: 'Send { "reset": true } in body to reset admin password'
      });
    }

    // If reset is true, delete existing admin
    if (existingAdmin && reset) {
      await User.deleteOne({ _id: existingAdmin._id });
    }

    // Create default admin user
    const defaultPassword = 'admin123';
    const hashedPassword = await hashPassword(defaultPassword);

    const admin = await User.create({
      name: 'Admin',
      email: 'admin@8rupiya.com',
      phone: '9999999999',
      password: hashedPassword,
      role: UserRole.ADMIN,
      isActive: true,
    });

    return NextResponse.json({
      success: true,
      message: 'Admin user created successfully',
      admin: {
        _id: admin._id.toString(),
        name: admin.name,
        email: admin.email,
        phone: admin.phone,
        role: admin.role,
      },
      credentials: {
        email: 'admin@8rupiya.com',
        password: 'admin123',
        message: 'Please change the password after first login',
      },
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating admin:', error);
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0];
      return NextResponse.json({ 
        success: false,
        error: `${field} already exists. Admin may already be created.`,
      }, { status: 400 });
    }

    return NextResponse.json({ 
      success: false,
      error: error.message || 'Failed to create admin user',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}

// GET /api/admin/init - Check if admin exists
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const admin = await User.findOne({ role: UserRole.ADMIN });

    if (admin) {
      return NextResponse.json({
        success: true,
        exists: true,
        admin: {
          email: admin.email,
          name: admin.name,
        },
        message: 'Admin user exists',
      });
    }

    return NextResponse.json({
      success: true,
      exists: false,
      message: 'No admin user found. Use POST /api/admin/init to create one.',
    });
  } catch (error: any) {
    return NextResponse.json({ 
      success: false,
      error: error.message 
    }, { status: 500 });
  }
}

