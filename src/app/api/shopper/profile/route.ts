import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { User } from '@/models';
import { verifyToken } from '@/lib/auth';
import { UserRole } from '@/types/user';

export async function PUT(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '') || 
                 req.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || payload.role !== UserRole.SHOPPER) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await connectDB();

    const { name, phone } = await req.json();

    if (!name || !phone) {
      return NextResponse.json({ error: 'Name and phone are required' }, { status: 400 });
    }

    const user = await User.findById(payload.userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    user.name = name;
    user.phone = phone;
    await user.save();

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
    });
  } catch (error: any) {
    console.error('Update profile error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

