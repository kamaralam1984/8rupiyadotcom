import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Payment, { PaymentStatus } from '@/models/Payment';
import Shop, { PaymentStatus as ShopPaymentStatus } from '@/models/Shop';
import Plan from '@/models/Plan';
import { verifyPaymentSignature } from '@/lib/razorpay';
import { createCommission } from '@/lib/commission';

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: 'Payment details required' }, { status: 400 });
    }

    // Verify signature
    const isValid = verifyPaymentSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
    }

    // Find payment
    const payment = await Payment.findOne({ razorpayOrderId: razorpay_order_id });
    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    if (payment.status === PaymentStatus.SUCCESS) {
      return NextResponse.json({ success: true, message: 'Payment already verified' });
    }

    // Update payment
    payment.razorpayPaymentId = razorpay_payment_id;
    payment.razorpaySignature = razorpay_signature;
    payment.status = PaymentStatus.SUCCESS;
    payment.paidAt = new Date();
    await payment.save();

    // Update shop with plan
    const shop = await Shop.findById(payment.shopId);
    const plan = await Plan.findById(payment.planId);

    if (shop && plan) {
      shop.planId = plan._id;
      shop.planExpiry = new Date(Date.now() + plan.expiryDays * 24 * 60 * 60 * 1000);
      shop.rankScore = plan.rank;
      shop.isFeatured = plan.featuredTag;
      shop.homepagePriority = plan.listingPriority;
      shop.paymentStatus = ShopPaymentStatus.PAID; // Set payment status to paid
      shop.status = 'approved' as any; // Set shop status to approved after payment
      await shop.save();
    }

    // Create commission
    await createCommission(payment._id.toString(), shop!._id.toString());

    // Clear cache
    const { cacheDel } = await import('@/lib/redis');
    await cacheDel(`shops:nearby:*`);

    return NextResponse.json({ success: true, payment });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

