import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Payment, { PaymentStatus } from '@/models/Payment';
import Shop, { ShopStatus, PaymentStatus as ShopPaymentStatus } from '@/models/Shop';
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

    // ⚡ OPTIMIZATION: Fetch shop and plan in parallel for faster processing
    const [shop, plan] = await Promise.all([
      Shop.findById(payment.shopId),
      Plan.findById(payment.planId)
    ]);

    if (shop && plan) {
      shop.planId = plan._id;
      shop.planExpiry = new Date(Date.now() + plan.duration * 24 * 60 * 60 * 1000);
      shop.rankScore = plan.rank;
      shop.isFeatured = plan.featuredTag;
      shop.homepagePriority = plan.listingPriority;
      shop.paymentStatus = ShopPaymentStatus.PAID; // Set payment status to paid
      
      // If shop was temporary, update it to approved
      if ((shop as any).isTemporary) {
        shop.status = ShopStatus.APPROVED;
        (shop as any).isTemporary = false;
      } else {
        // For existing shops, keep current status or set to approved
        if (shop.status === ShopStatus.PENDING) {
          shop.status = ShopStatus.APPROVED;
        }
      }
      
      await shop.save();
    }

    // ⚡ OPTIMIZATION: Return success immediately, process commission and cache in background
    // This makes payment verification much faster for the user
    const response = NextResponse.json({ 
      success: true, 
      payment,
      message: 'Payment verified successfully'
    });

    // Process commission and cache clearing in background (non-blocking)
    Promise.all([
      createCommission(payment._id.toString(), shop!._id.toString()).catch(err => {
        console.error('Background commission creation error:', err);
        // Don't fail the request if commission creation fails
      }),
      (async () => {
        try {
          const { cacheDel } = await import('@/lib/redis');
          await cacheDel(`shops:nearby:*`);
        } catch (err) {
          console.error('Background cache clearing error:', err);
          // Don't fail the request if cache clearing fails
        }
      })()
    ]).catch(err => {
      console.error('Background processing error:', err);
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

