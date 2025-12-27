import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Shop, { ShopStatus } from '@/models/Shop';
import { withAuth, AuthRequest } from '@/middleware/auth';
import { UserRole } from '@/models/User';

// GET /api/shops - List shops (with filters)
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const searchParams = req.nextUrl.searchParams;
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const city = searchParams.get('city');
    const limit = parseInt(searchParams.get('limit') || '20');
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;

    let query: any = {};

    if (status) {
      if (status === 'pending') {
        // Pending shops = shops that are not approved (pending, rejected, or expired)
        query.status = { $ne: ShopStatus.APPROVED };
      } else {
        query.status = status;
      }
    } else {
      query.status = ShopStatus.APPROVED; // Default to approved for public
    }

    if (category) {
      query.category = { $regex: category, $options: 'i' };
    }

    if (city) {
      query.city = { $regex: city, $options: 'i' };
    }

    const shops = await Shop.find(query)
      .populate('planId')
      .populate('shopperId', 'name email phone')
      .sort({ rankScore: -1, createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const total = await Shop.countDocuments(query);

    return NextResponse.json({
      shops,
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/shops - Create shop
export const POST = withAuth(async (req: AuthRequest) => {
  try {
    await connectDB();

    const body = await req.json();
    const user = req.user!;

    // Only shoppers, agents, operators can create shops
    if (![UserRole.SHOPPER, UserRole.AGENT, UserRole.OPERATOR].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const shopData: any = {
      ...body,
      status: ShopStatus.PENDING,
      shopperId: user.role === UserRole.SHOPPER ? user.userId : body.shopperId,
    };

    // Set agent/operator IDs based on role
    if (user.role === UserRole.AGENT) {
      shopData.agentId = user.userId;
    } else if (user.role === UserRole.OPERATOR) {
      shopData.operatorId = user.userId;
      // Get agentId from operator's profile
      const User = (await import('@/models/User')).default;
      const operator = await User.findById(user.userId);
      if (operator?.agentId) {
        shopData.agentId = operator.agentId;
      }
    }

    const shop = await Shop.create(shopData);

    return NextResponse.json({ success: true, shop }, { status: 201 });
  } catch (error: any) {
    console.error('Shop creation error:', error);
    // Provide more detailed error message
    let errorMessage = error.message || 'Failed to create shop';
    
    // Handle Mongoose validation errors
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
}, [UserRole.SHOPPER, UserRole.AGENT, UserRole.OPERATOR]);

