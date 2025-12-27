import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Shop, { PaymentStatus as ShopPaymentStatus } from '@/models/Shop';
import Plan from '@/models/Plan';
import Payment, { PaymentStatus } from '@/models/Payment';
import { withAuth, AuthRequest } from '@/middleware/auth';
import { UserRole } from '@/models/User';
import { createCommission } from '@/lib/commission';

export const POST = withAuth(async (req: AuthRequest) => {
  try {
    await connectDB();

    const user = req.user!;
    const { shopId, planId, amount, receiptNo, sendSmsReceipt } = await req.json();

    if (!shopId || !planId) {
      return NextResponse.json({ error: 'Shop ID and Plan ID required' }, { status: 400 });
    }

    const shop = await Shop.findById(shopId);
    if (!shop) {
      return NextResponse.json({ error: 'Shop not found' }, { status: 404 });
    }

    // Check if user owns the shop or is admin/agent
    if (
      user.role !== UserRole.ADMIN &&
      user.role !== UserRole.AGENT &&
      shop.shopperId.toString() !== user.userId &&
      shop.agentId?.toString() !== user.userId
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const plan = await Plan.findById(planId);
    if (!plan || !plan.isActive) {
      return NextResponse.json({ error: 'Plan not found or inactive' }, { status: 404 });
    }

    // Create cash payment record
    const payment = await Payment.create({
      shopId: shop._id,
      planId: plan._id,
      amount: amount || plan.price,
      status: PaymentStatus.SUCCESS,
      paidAt: new Date(),
      razorpayOrderId: receiptNo ? `CASH-${receiptNo}` : `CASH-${Date.now()}`,
    });

    // Update shop with plan and payment status
    shop.planId = plan._id;
    shop.planExpiry = new Date(Date.now() + plan.expiryDays * 24 * 60 * 60 * 1000);
    shop.rankScore = plan.rank;
    shop.isFeatured = plan.featuredTag;
    shop.homepagePriority = plan.listingPriority;
    shop.paymentStatus = ShopPaymentStatus.PAID; // Set payment status to paid
    shop.status = 'approved' as any; // Set shop status to approved after payment
    await shop.save();

    // Create commission
    await createCommission(payment._id.toString(), shop._id.toString());

    // Clear cache
    try {
      const { cacheDel } = await import('@/lib/redis');
      await cacheDel(`shops:nearby:*`);
    } catch (err) {
      // Redis might not be available, continue
    }

    return NextResponse.json({
      success: true,
      payment: {
        _id: payment._id,
        shopId: shop._id,
        planId: plan._id,
        amount: payment.amount,
        status: payment.status,
        receiptNo: payment.razorpayOrderId,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}, [UserRole.ADMIN, UserRole.AGENT, UserRole.OPERATOR, UserRole.SHOPPER]);

