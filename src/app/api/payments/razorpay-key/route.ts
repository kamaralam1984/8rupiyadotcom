import { NextRequest, NextResponse } from 'next/server';

// GET /api/payments/razorpay-key - Get Razorpay public key
export async function GET(req: NextRequest) {
  try {
    const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '';

    if (!keyId) {
      return NextResponse.json(
        { error: 'Razorpay key not configured' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      keyId,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

