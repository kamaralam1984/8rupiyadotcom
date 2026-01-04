import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Shop, { ShopStatus } from '@/models/Shop';
import Plan from '@/models/Plan';
import Payment, { PaymentStatus } from '@/models/Payment';
import { withAuth, AuthRequest } from '@/middleware/auth';
import { createRazorpayOrder } from '@/lib/razorpay';
import { UserRole } from '@/models/User';

export const POST = withAuth(async (req: AuthRequest) => {
  try {
    await connectDB();

    const user = req.user!;
    const { shopId, planId, shopData } = await req.json();

    if (!planId) {
      return NextResponse.json({ error: 'Plan ID is required' }, { status: 400 });
    }

    // ⚡ OPTIMIZATION: Fetch plan first (required for validation)
    const plan = await Plan.findById(planId);
    if (!plan || !plan.isActive) {
      return NextResponse.json({ error: 'Plan not found or inactive' }, { status: 404 });
    }

    let shop = null;
    let finalShopId = shopId;

    // If shopId provided, verify ownership
    if (shopId) {
      shop = await Shop.findById(shopId);
      if (!shop) {
        return NextResponse.json({ error: 'Shop not found' }, { status: 404 });
      }

      // Check if user owns the shop or is admin
      if (user.role !== UserRole.ADMIN) {
        // For agents, check agentId
        if (user.role === UserRole.AGENT && shop.agentId?.toString() !== user.userId) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
        // For shoppers, check shopperId
        if (user.role === UserRole.SHOPPER && shop.shopperId?.toString() !== user.userId) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
      }
      finalShopId = shop._id;
    } else if (shopData) {
      // Create temporary shop for payment (will be updated after payment success)
      // This allows payment before shop creation
      const tempShop = await Shop.create({
        name: shopData.name || 'Temporary Shop',
        description: shopData.description || '',
        category: shopData.category || '',
        address: shopData.address || '',
        area: shopData.area || '',
        city: shopData.city || '',
        state: shopData.state || '',
        pincode: shopData.pincode || '',
        phone: shopData.phone || '',
        email: shopData.email || '',
        location: shopData.latitude && shopData.longitude ? {
          type: 'Point',
          coordinates: [parseFloat(shopData.longitude), parseFloat(shopData.latitude)],
        } : undefined,
        agentId: user.role === UserRole.AGENT ? user.userId : undefined,
        shopperId: user.role === UserRole.SHOPPER ? user.userId : undefined,
        status: ShopStatus.PENDING,
        paymentStatus: PaymentStatus.PENDING,
        isTemporary: true, // Mark as temporary
      });
      finalShopId = tempShop._id;
    } else {
      // For existing shops, shopId is required
      return NextResponse.json({ 
        error: 'Either shopId or shopData is required' 
      }, { status: 400 });
    }

    // Create payment record
    const payment = await Payment.create({
      shopId: finalShopId,
      planId: plan._id,
      amount: plan.price,
      status: PaymentStatus.PENDING,
      userId: user.userId, // Track who made the payment
    });

    // Create Razorpay order
    const order = await createRazorpayOrder({
      amount: plan.price * 100, // Convert to paise
      receipt: `payment_${payment._id}`,
      notes: {
        shopId: finalShopId.toString(),
        planId: plan._id.toString(),
        paymentId: payment._id.toString(),
        userId: user.userId.toString(),
        userRole: user.role,
      },
    });

    // Update payment with order ID
    payment.razorpayOrderId = order.id;
    await payment.save();

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      paymentId: payment._id.toString(),
      shopId: finalShopId.toString(),
    });
  } catch (error: any) {
    console.error('Error creating payment order:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
});

