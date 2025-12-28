import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { verifyToken, hashPassword } from '@/lib/auth';
import { UserRole } from '@/models/User';

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '') || 
                 req.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || payload.role !== UserRole.OPERATOR) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await connectDB();

    const operator = await User.findById(payload.userId);
    if (!operator) {
      return NextResponse.json({ error: 'Operator not found' }, { status: 404 });
    }

    const body = await req.json();
    const { name, email, phone, password } = body;

    if (!name || !email || !phone || !password) {
      return NextResponse.json({ 
        error: 'All fields are required' 
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

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create shopper with operatorId automatically set
    const shopper = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.replace(/\s+/g, ''),
      password: hashedPassword,
      role: UserRole.SHOPPER,
      operatorId: operator._id,
      isActive: true,
    });

    return NextResponse.json({
      success: true,
      message: 'Shopper created successfully',
      shopper: {
        _id: shopper._id.toString(),
        name: shopper.name,
        email: shopper.email,
        phone: shopper.phone,
        role: shopper.role,
        operatorId: shopper.operatorId?.toString(),
      },
    });
  } catch (error: any) {
    console.error('Create shopper error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

