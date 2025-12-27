import { NextRequest, NextResponse } from 'next/server';
import { sendOTPEmail } from '@/lib/email';

// Test email endpoint - for development only
export async function POST(req: NextRequest) {
  try {
    // Only allow in development
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
    }

    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const testOTP = '123456';
    const result = await sendOTPEmail(email, testOTP);

    if (result) {
      return NextResponse.json({
        success: true,
        message: 'Test email sent successfully',
        otp: testOTP,
        note: 'Check your inbox. If not received, check SMTP configuration.',
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'Failed to send email. Check SMTP configuration.',
        note: 'OTP logged to console in development mode.',
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Test email error:', error);
    return NextResponse.json({
      error: error.message || 'Failed to send test email',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    }, { status: 500 });
  }
}

