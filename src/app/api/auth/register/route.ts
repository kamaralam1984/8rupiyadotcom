import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User, { UserRole } from '@/models/User';
import OTP from '@/models/OTP';
import { hashPassword, generateToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const { name, email, phone, password, role, otp } = body;

    if (!name || !email || !phone || !password) {
      return NextResponse.json({ error: 'All fields required' }, { status: 400 });
    }

    // Verify OTP if provided
    if (otp) {
      const normalizedEmail = email.toLowerCase().trim();
      const otpRecord = await OTP.findOne({ 
        email: normalizedEmail, 
        otp, 
        purpose: 'signup',
        verified: true 
      });

      if (!otpRecord) {
        return NextResponse.json({ 
          error: 'Invalid or unverified OTP. Please verify your email first.' 
        }, { status: 400 });
      }

      // Delete used OTP
      await OTP.deleteOne({ _id: otpRecord._id });
    } else {
      // OTP is required for registration
      return NextResponse.json({ 
        error: 'OTP verification required. Please verify your email first.' 
      }, { status: 400 });
    }

    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { phone }],
    });

    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    const hashedPassword = await hashPassword(password);
    const userRole = role || UserRole.USER;

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      phone,
      password: hashedPassword,
      role: userRole,
    });

    const token = generateToken({
      userId: user._id.toString(),
      role: user.role,
      email: user.email,
    });

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    
    // Handle MongoDB connection errors
    if (error.message?.includes('port number') || error.message?.includes('mongodb+srv')) {
      return NextResponse.json(
        { 
          error: 'Database connection error: mongodb+srv URIs cannot have port numbers. Please check your MONGODB_URI in .env.local file.' 
        },
        { status: 500 }
      );
    }
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'User with this email or phone already exists' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || 'Registration failed. Please try again.' },
      { status: 500 }
    );
  }
}
