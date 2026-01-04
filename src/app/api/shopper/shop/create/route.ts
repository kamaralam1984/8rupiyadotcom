import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Shop, { ShopStatus, PaymentStatus } from '@/models/Shop';
import Plan from '@/models/Plan';
import Payment, { PaymentStatus as PaymentStatusEnum } from '@/models/Payment';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth';
import { UserRole } from '@/models/User';
import { createCommission } from '@/lib/commission';
import { generateSEOContent } from '@/lib/seoContentGenerator';

// POST /api/shopper/shop/create - Create shop (online payment only)
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
      return NextResponse.json({ 
        error: 'Invalid token',
        message: 'Token verification failed. Please login again.'
      }, { status: 401 });
    }

    // Verify user exists and has correct role
    const user = await User.findById(payload.userId);
    if (!user) {
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

    // Only shoppers can create shops through this endpoint
    if (user.role !== UserRole.SHOPPER && user.role !== UserRole.ADMIN) {
      return NextResponse.json({ 
        error: 'Forbidden',
        message: `Only shoppers can create shops. Your role: ${user.role}`
      }, { status: 403 });
    }

    const body = await req.json();

    // Validate required fields
    const { 
      shopName, 
      category, 
      address, 
      area, 
      latitude, 
      longitude, 
      city, 
      state, 
      pincode, 
      phone,
      email,
      planId,
      images 
    } = body;

    if (!shopName || !category || !address || !latitude || !longitude || !pincode || !planId || !phone) {
      return NextResponse.json({ 
        error: 'Missing required fields: shopName, category, address, latitude, longitude, pincode, planId, phone' 
      }, { status: 400 });
    }

    // Validate plan exists
    const plan = await Plan.findById(planId);
    if (!plan || !plan.isActive) {
      return NextResponse.json({ error: 'Invalid or inactive plan' }, { status: 400 });
    }

    // Calculate plan expiry
    const planExpiry = new Date();
    planExpiry.setDate(planExpiry.getDate() + plan.duration);

    // Find operator if shopper has one
    let operatorId = null;
    if (user.operatorId) {
      operatorId = user.operatorId;
    } else {
      // Try to find an operator through AgentRequest
      const AgentRequest = (await import('@/models/AgentRequest')).default;
      const RequestStatus = (await import('@/models/AgentRequest')).RequestStatus;
      // Find if there's an agent linked to this shopper's operator
      const agentRequest = await AgentRequest.findOne({
        operatorId: user.operatorId,
        status: RequestStatus.APPROVED
      });
      if (agentRequest) {
        // Find the agent and get their operator
        const agent = await User.findById(agentRequest.agentId);
        if (agent && agent.operatorId) {
          operatorId = agent.operatorId;
        }
      }
    }

    // Create shop data
    const shopData: any = {
      name: shopName.trim(),
      description: address.trim(),
      category: category.trim(),
      address: address.trim(),
      area: area?.trim() || '',
      city: city?.trim() || 'Patna',
      state: state?.trim() || 'Bihar',
      pincode: pincode.trim(),
      phone: phone.startsWith('+91') ? phone : `+91${phone.replace(/\s+/g, '')}`,
      email: email?.trim() || `${phone.replace(/\s+/g, '')}@shop.8rupiya.com`,
      location: {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)], // [longitude, latitude]
      },
      images: images || [],
      photos: images || [],
      offers: [],
      pages: [],
      shopperId: user._id,
      operatorId: operatorId,
      planId: plan._id,
      planExpiry: planExpiry,
      paymentStatus: PaymentStatus.PENDING,
      paymentMode: 'online', // Only online payment for shoppers
      status: ShopStatus.PENDING,
    };

    // Generate and add SEO-optimized page content automatically
    const seoContent = generateSEOContent({
      name: shopName.trim(),
      category: category.trim(),
      city: city?.trim() || 'Patna',
      state: state?.trim() || 'Bihar',
      area: area?.trim(),
      address: address.trim(),
      rating: 0, // New shop starts with 0 rating
      reviewCount: 0, // New shop starts with 0 reviews
      description: address.trim(),
    });
    
    shopData.pageContent = seoContent;

    // Create shop
    const shop = await Shop.create(shopData) as any;

    // For online payment, we'll create a payment order
    // The actual payment will be processed through Razorpay
    // Shop will be activated after successful payment verification

    return NextResponse.json({
      success: true,
      shop: {
        _id: shop._id?.toString() || shop._id,
        name: shop.name,
        category: shop.category,
        planId: shop.planId?.toString(),
        planExpiry: shop.planExpiry,
        paymentStatus: shop.paymentStatus,
        paymentMode: shop.paymentMode,
        status: shop.status,
      },
      message: 'Shop created successfully. Please proceed with online payment.',
      requiresPayment: true,
      planPrice: plan.price,
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

