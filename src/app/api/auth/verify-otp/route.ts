import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import OTP from '@/models/OTP';

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { email, otp, purpose = 'signup' } = await req.json();

    if (!email || !otp) {
      return NextResponse.json({ error: 'Email and OTP are required' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Find OTP record
    const otpRecord = await OTP.findOne({ 
      email: normalizedEmail, 
      otp, 
      purpose,
      verified: false 
    });

    if (!otpRecord) {
      return NextResponse.json({ 
        error: 'Invalid or expired OTP' 
      }, { status: 400 });
    }

    // Check if OTP is expired
    if (new Date() > otpRecord.expiresAt) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return NextResponse.json({ 
        error: 'OTP has expired. Please request a new one.' 
      }, { status: 400 });
    }

    // Mark OTP as verified
    otpRecord.verified = true;
    await otpRecord.save();

    return NextResponse.json({
      success: true,
      message: 'OTP verified successfully',
      verified: true,
    });
  } catch (error: any) {
    console.error('Error verifying OTP:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to verify OTP' 
    }, { status: 500 });
  }
}

