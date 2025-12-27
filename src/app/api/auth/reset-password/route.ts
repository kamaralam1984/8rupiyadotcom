import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import OTP from '@/models/OTP';
import { hashPassword } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { email, otp, newPassword } = await req.json();

    if (!email || !otp || !newPassword) {
      return NextResponse.json({ 
        error: 'Email, OTP, and new password are required' 
      }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ 
        error: 'Password must be at least 6 characters long' 
      }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Verify OTP
    const otpRecord = await OTP.findOne({ 
      email: normalizedEmail, 
      otp, 
      purpose: 'reset-password',
      verified: true 
    });

    if (!otpRecord) {
      return NextResponse.json({ 
        error: 'Invalid or unverified OTP. Please verify your OTP first.' 
      }, { status: 400 });
    }

    // Check if OTP is expired
    if (new Date() > otpRecord.expiresAt) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return NextResponse.json({ 
        error: 'OTP has expired. Please request a new one.' 
      }, { status: 400 });
    }

    // Find user
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return NextResponse.json({ 
        error: 'User not found' 
      }, { status: 404 });
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password
    user.password = hashedPassword;
    await user.save();

    // Delete used OTP
    await OTP.deleteOne({ _id: otpRecord._id });

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully',
    });
  } catch (error: any) {
    console.error('Error resetting password:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to reset password' 
    }, { status: 500 });
  }
}

