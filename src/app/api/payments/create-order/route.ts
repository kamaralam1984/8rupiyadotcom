import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Shop from '@/models/Shop';
import Plan from '@/models/Plan';
import Payment, { PaymentStatus } from '@/models/Payment';
import { withAuth, AuthRequest } from '@/middleware/auth';
import { createRazorpayOrder } from '@/lib/razorpay';
import { UserRole } from '@/models/User';

export const POST = withAuth(async (req: AuthRequest) => {
  try {
    await connectDB();

    const user = req.user!;
    const { shopId, planId } = await req.json();

    if (!shopId || !planId) {
      return NextResponse.json({ error: 'Shop ID and Plan ID required' }, { status: 400 });
    }

    const shop = await Shop.findById(shopId);
    if (!shop) {
      return NextResponse.json({ error: 'Shop not found' }, { status: 404 });
    }

    // Check if user owns the shop or is admin
    if (user.role !== UserRole.ADMIN && shop.shopperId.toString() !== user.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const plan = await Plan.findById(planId);
    if (!plan || !plan.isActive) {
      return NextResponse.json({ error: 'Plan not found or inactive' }, { status: 404 });
    }

    // Create payment record
    const payment = await Payment.create({
      shopId: shop._id,
      planId: plan._id,
      amount: plan.price,
      status: PaymentStatus.PENDING,
    });

    // Create Razorpay order
    const order = await createRazorpayOrder({
      amount: plan.price * 100, // Convert to paise
      receipt: `payment_${payment._id}`,
      notes: {
        shopId: shop._id.toString(),
        planId: plan._id.toString(),
        paymentId: payment._id.toString(),
      },
    });

    // Update payment with order ID
    payment.razorpayOrderId = order.id;
    await payment.save();

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      paymentId: payment._id,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
});

