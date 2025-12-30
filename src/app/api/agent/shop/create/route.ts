import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Shop, { ShopStatus, PaymentStatus } from '@/models/Shop';
import Plan from '@/models/Plan';
import Payment, { PaymentStatus as PaymentStatusEnum } from '@/models/Payment';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth';
import { UserRole } from '@/models/User';
import { createCommission } from '@/lib/commission';

// POST /api/agent/shop/create - Create shop with plan selection
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    // Get token from Authorization header or cookie
    const token = req.headers.get('authorization')?.replace('Bearer ', '') || 
                 req.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify token
    const payload = verifyToken(token);
    if (!payload) {
      console.error('Token verification failed. Token:', token?.substring(0, 20) + '...');
      return NextResponse.json({ 
        error: 'Invalid token',
        message: 'Token verification failed. Please login again.'
      }, { status: 401 });
    }

    console.log('Token payload:', { userId: payload.userId, role: payload.role });

    // Verify user exists and has correct role in database
    const user = await User.findById(payload.userId);
    if (!user) {
      console.error('User not found in database:', payload.userId);
      return NextResponse.json({ 
        error: 'User not found',
        message: 'User account not found. Please login again.'
      }, { status: 401 });
    }

    if (!user.isActive) {
      return NextResponse.json({ 
        error: 'Account inactive',
        message: 'Your account is inactive. Please contact administrator.'
      }, { status: 403 });
    }

    // Only agents can create shops
    if (user.role !== UserRole.AGENT) {
      console.error('Role mismatch:', { 
        expected: UserRole.AGENT, 
        actual: user.role,
        tokenRole: payload.role 
      });
      return NextResponse.json({ 
        error: 'Forbidden',
        message: `Only agents can create shops. Your role: ${user.role}`
      }, { status: 403 });
    }

    const body = await req.json();

    // Validate required fields
    const { shopName, category, address, area, latitude, longitude, city, state, pincode, planId, paymentMode } = body;

    if (!shopName || !category || !address || !latitude || !longitude || !pincode || !planId || !paymentMode) {
      return NextResponse.json({ 
        error: 'Missing required fields: shopName, category, address, latitude, longitude, pincode, planId, paymentMode' 
      }, { status: 400 });
    }

    // Validate plan exists
    const plan = await Plan.findById(planId);
    if (!plan || !plan.isActive) {
      return NextResponse.json({ error: 'Invalid or inactive plan' }, { status: 400 });
    }

    // Calculate plan expiry (today + duration days)
    const planExpiry = new Date();
    planExpiry.setDate(planExpiry.getDate() + plan.duration);

    // Find approved operators for this agent
    const AgentRequest = (await import('@/models/AgentRequest')).default;
    const RequestStatus = (await import('@/models/AgentRequest')).RequestStatus;
    const approvedRequest = await AgentRequest.findOne({
      agentId: user._id,
      status: RequestStatus.APPROVED
    }).sort({ createdAt: 1 }); // Get the first approved operator

    // Create shop with all data
    const shopData: any = {
      name: shopName.trim(),
      description: address.trim(),
      category: category.trim(),
      address: address.trim(),
      area: area?.trim() || '',
      city: city?.trim() || 'Patna',
      state: state?.trim() || 'Bihar',
      pincode: pincode.trim(),
      phone: body.phone?.trim() || `+91${Date.now()}`,
      email: body.email?.trim() || `${shopName.replace(/\s+/g, '').toLowerCase()}@shop.8rupiya.com`,
      location: {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)], // [longitude, latitude]
      },
      images: body.images || [], // Array of image URLs
      photos: body.images || [], // Same as images for plan-based system
      offers: [],
      pages: [],
      // All shops start as pending, require admin/accountant approval - cannot be overridden
      status: ShopStatus.PENDING,
      paymentStatus: paymentMode === 'upi' ? PaymentStatus.PENDING : PaymentStatus.PENDING, // Payment status updated after verification
      paymentMode: paymentMode === 'upi' ? 'online' : paymentMode,
      shopperId: user._id.toString(), // Use agent's ID as shopperId
      agentId: user._id.toString(),
      operatorId: approvedRequest?.operatorId?.toString() || undefined, // Set operatorId if agent has approved operator
      planId: plan._id,
      planExpiry: planExpiry,
      rankScore: plan.rank || plan.priority || 0,
      isFeatured: plan.featuredTag || plan.priority >= 6,
      homepagePriority: plan.listingPriority || plan.priority || 0,
      // SEO fields if plan has SEO enabled
      ...(plan.seoEnabled && {
        seoTitle: `${shopName} - ${category} in ${body.city || 'Patna'}`,
        seoDescription: `Find ${shopName}, a ${category} shop in ${body.city || 'Patna'}, ${body.state || 'Bihar'}.`,
        seoKeywords: `${shopName}, ${category}, ${body.city || 'Patna'}, ${body.pincode || ''}`,
      }),
    };
    
    // Ensure status is always PENDING (override any status that might have been set)
    shopData.status = ShopStatus.PENDING;

    const shop = await Shop.create(shopData) as any;

    // Note: For online/UPI payments, payment record and commission will be created
    // by /api/payments/verify route after successful Razorpay payment verification
    // Cash payments are recorded separately via agent payment recording

    return NextResponse.json({
      success: true,
      shop: {
        _id: shop._id?.toString() || shop._id,
        name: shop.name,
        category: shop.category,
        planId: shop.planId?.toString() || shop.planId,
        planExpiry: shop.planExpiry,
        paymentStatus: shop.paymentStatus,
        paymentMode: shop.paymentMode,
        status: shop.status,
      },
      message: 'Shop created successfully. Pending admin approval.',
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating shop:', error);
    
    // Handle Mongoose validation errors
    let errorMessage = error.message || 'Failed to create shop';
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors || {}).map((err: any) => err.message);
      errorMessage = `Validation error: ${validationErrors.join(', ')}`;
    }
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0];
      errorMessage = `${field} already exists`;
    }

    return NextResponse.json({ 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}

