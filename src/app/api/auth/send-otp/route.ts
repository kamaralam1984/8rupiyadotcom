import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import OTP from '@/models/OTP';
import User from '@/models/User';
import { sendOTPEmail } from '@/lib/email';

// Generate 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { email, purpose = 'signup' } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // For signup, check if user already exists
    if (purpose === 'signup') {
      const existingUser = await User.findOne({ email: normalizedEmail });
      if (existingUser) {
        return NextResponse.json({ 
          error: 'User with this email already exists. Please login instead.' 
        }, { status: 400 });
      }
    }

    // Delete any existing OTPs for this email and purpose
    await OTP.deleteMany({ email: normalizedEmail, purpose });

    // Generate new OTP
    const otp = generateOTP();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10); // OTP expires in 10 minutes

    // Save OTP to database
    await OTP.create({
      email: normalizedEmail,
      otp,
      purpose,
      expiresAt,
      verified: false,
    });

    // Send OTP via email
    console.log(`\n🔐 Generating OTP for: ${normalizedEmail}`);
    const emailSent = await sendOTPEmail(normalizedEmail, otp);

    // Check if SMTP is configured
    const hasSMTPConfig = !!(process.env.SMTP_USER && process.env.SMTP_PASS) || 
                          !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

    if (!emailSent && hasSMTPConfig) {
      console.error('❌ Failed to send OTP email (SMTP configured but failed)');
      return NextResponse.json({ 
        error: 'Failed to send OTP email. Please check server logs for details.',
        hint: 'Check your SMTP configuration in .env.local'
      }, { status: 500 });
    }

    if (emailSent) {
      if (hasSMTPConfig) {
        console.log(`✅ OTP email sent successfully to ${normalizedEmail}\n`);
      } else {
        console.log(`⚠️  OTP generated but email not sent (SMTP not configured)\n`);
      }
    }

    return NextResponse.json({
      success: true,
      message: hasSMTPConfig 
        ? 'OTP sent successfully to your email. Please check your inbox.' 
        : 'OTP generated. Please check server console (SMTP not configured).',
      expiresIn: 10, // minutes
      // In development without SMTP, also return OTP in response (for testing)
      ...(process.env.NODE_ENV === 'development' && !hasSMTPConfig && { 
        otp: otp, 
        note: 'SMTP not configured. OTP shown here for testing. Check server console for OTP. See EMAIL_SETUP.md to configure email.' 
      }),
      emailConfigured: hasSMTPConfig,
    });
  } catch (error: any) {
    console.error('Error sending OTP:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to send OTP' 
    }, { status: 500 });
  }
}

