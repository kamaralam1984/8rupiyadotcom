import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User, { UserRole } from '@/models/User';
import { hashPassword } from '@/lib/auth';

// POST /api/admin/reset-password - Reset admin password (public endpoint for development)
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { email, newPassword } = await req.json();
    const targetEmail = email || 'admin@8rupiya.com';
    const password = newPassword || 'admin123';

    // Find admin user
    const admin = await User.findOne({ 
      email: targetEmail.toLowerCase(),
      role: UserRole.ADMIN 
    });

    if (!admin) {
      return NextResponse.json({ 
        success: false,
        error: 'Admin user not found',
      }, { status: 404 });
    }

    // Hash new password
    const hashedPassword = await hashPassword(password);
    
    // Update password
    admin.password = hashedPassword;
    admin.isActive = true;
    await admin.save();

    return NextResponse.json({
      success: true,
      message: 'Admin password reset successfully',
      admin: {
        email: admin.email,
        name: admin.name,
      },
      credentials: {
        email: admin.email,
        password: password,
      },
    });
  } catch (error: any) {
    console.error('Error resetting password:', error);
    return NextResponse.json({ 
      success: false,
      error: error.message || 'Failed to reset password',
    }, { status: 500 });
  }
}

