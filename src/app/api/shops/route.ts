import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Shop, { ShopStatus } from '@/models/Shop';
import Plan from '@/models/Plan';
import { withAuth, AuthRequest } from '@/middleware/auth';
import { UserRole } from '@/types/user';

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
        // Only return shops with pending status
        query.status = ShopStatus.PENDING;
      } else if (status === 'active') {
        // Active shops (approved by admin/accountant) - include both active and approved for backward compatibility
        query.status = { $in: [ShopStatus.ACTIVE, ShopStatus.APPROVED] };
      } else if (status === 'approved') {
        // For backward compatibility, also include 'approved' status
        query.status = { $in: [ShopStatus.ACTIVE, ShopStatus.APPROVED] };
      } else if (status === 'expired') {
        // Expired shops = active/approved shops with expired plan
        query.status = { $in: [ShopStatus.ACTIVE, ShopStatus.APPROVED] };
        query.planExpiry = { $lt: new Date() };
      } else {
        // For rejected - use exact status match
        query.status = status;
      }
    } else {
      // Default to active shops for public (website) - include both active and approved
      query.status = { $in: [ShopStatus.ACTIVE, ShopStatus.APPROVED] };
    }

    if (category) {
      query.category = { $regex: category, $options: 'i' };
    }

    if (city) {
      query.city = { $regex: city, $options: 'i' };
    }

    // Debug logging in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Shops API Query:', JSON.stringify(query, null, 2));
    }

    const shops = await Shop.find(query)
      .populate('planId')
      .populate('shopperId', 'name email phone')
      .sort({ rankScore: -1, createdAt: -1 })
      .limit(limit)
      .skip(skip);

    // Additional client-side filtering to ensure correct status
    let filteredShops = shops;
    if (status === 'pending') {
      filteredShops = shops.filter(s => s.status === ShopStatus.PENDING);
    } else if (status === 'active' || status === 'approved') {
      // Show both active and approved shops (for backward compatibility)
      filteredShops = shops.filter(s => s.status === ShopStatus.ACTIVE || s.status === ShopStatus.APPROVED);
    } else if (status === 'expired') {
      filteredShops = shops.filter(s => {
        return (s.status === ShopStatus.ACTIVE || s.status === ShopStatus.APPROVED) && s.planExpiry && new Date(s.planExpiry) < new Date();
      });
    } else if (status === 'rejected') {
      filteredShops = shops.filter(s => s.status === ShopStatus.REJECTED);
    }

    // Calculate total count based on the actual filtered results
    // Build count query separately to ensure accuracy
    let countQuery: any = {};
    
    if (status === 'pending') {
      countQuery.status = ShopStatus.PENDING;
    } else if (status === 'active' || status === 'approved') {
      // Count both active and approved shops (for backward compatibility)
      countQuery.status = { $in: [ShopStatus.ACTIVE, ShopStatus.APPROVED] };
    } else if (status === 'expired') {
      // Count active/approved shops with expired planExpiry
      countQuery.status = { $in: [ShopStatus.ACTIVE, ShopStatus.APPROVED] };
      countQuery.planExpiry = { $lt: new Date() };
    } else if (status === 'rejected') {
      countQuery.status = ShopStatus.REJECTED;
    } else {
      countQuery = query;
    }
    
    // Apply category and city filters to count query
    if (category) {
      countQuery.category = { $regex: category, $options: 'i' };
    }
    if (city) {
      countQuery.city = { $regex: city, $options: 'i' };
    }
    
    const total = await Shop.countDocuments(countQuery);

    return NextResponse.json({
      shops: filteredShops,
      page,
      limit,
      total: total,
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
      // Always set status to PENDING for new shops - cannot be overridden
      status: ShopStatus.PENDING,
      shopperId: user.role === UserRole.SHOPPER ? user.userId : body.shopperId,
    };
    
    // Ensure status is always PENDING (override any status from body)
    shopData.status = ShopStatus.PENDING;

    // Set agent/operator IDs based on role
    if (user.role === UserRole.AGENT) {
      shopData.agentId = user.userId;
      // Find approved operator for this agent
      const AgentRequest = (await import('@/models/AgentRequest')).default;
      const RequestStatus = (await import('@/models/AgentRequest')).RequestStatus;
      const approvedRequest = await AgentRequest.findOne({
        agentId: user.userId,
        status: RequestStatus.APPROVED
      }).sort({ createdAt: 1 }); // Get the first approved operator
      
      if (approvedRequest) {
        shopData.operatorId = approvedRequest.operatorId;
      }
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

