import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Shop from '@/models/Shop';
import { verifyToken } from '@/lib/auth';
import { UserRole } from '@/models/User';

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '') || 
                 req.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ 
        error: 'Unauthorized',
        message: 'No authentication token provided. Please login again.'
      }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ 
        error: 'Invalid token',
        message: 'Token verification failed. Please login again.'
      }, { status: 401 });
    }
    
    await connectDB();

    const operator = await User.findById(payload.userId);
    if (!operator) {
      return NextResponse.json({ 
        error: 'User not found',
        message: 'User account not found. Please login again.'
      }, { status: 404 });
    }

    if (!operator.isActive) {
      return NextResponse.json({ 
        error: 'Account inactive',
        message: 'Your account is inactive. Please contact administrator.'
      }, { status: 403 });
    }
    
    if (operator.role !== UserRole.OPERATOR) {
      return NextResponse.json({ 
        error: 'Forbidden',
        message: `Only operators can access this endpoint. Your role: ${operator.role}`
      }, { status: 403 });
    }

    // Get approved agents for this operator
    const AgentRequest = (await import('@/models/AgentRequest')).default;
    const RequestStatus = (await import('@/models/AgentRequest')).RequestStatus;
    
    const approvedRequests = await AgentRequest.find({
      operatorId: operator._id,
      status: RequestStatus.APPROVED
    });
    
    const approvedAgentIds = approvedRequests.map(req => req.agentId.toString());
    let allAgentIds = new Set(approvedAgentIds);
    if (operator.agentId) {
      allAgentIds.add(operator.agentId.toString());
    }
    
    const mongoose = await import('mongoose');
    const agentObjectIds = Array.from(allAgentIds).map(id => new mongoose.Types.ObjectId(id));
    
    // Get shops (including shops where operatorId matches OR operatorId is null but agentId matches approved agents)
    const shopQuery: any = {
      $or: [
        { operatorId: operator._id }
      ]
    };
    
    if (agentObjectIds.length > 0) {
      shopQuery.$or.push({
        agentId: { $in: agentObjectIds },
        $or: [
          { operatorId: { $exists: false } },
          { operatorId: null }
        ]
      });
    }
    
    const shops = await Shop.find(shopQuery)
      .populate('planId', 'name price')
      .populate('agentId', 'name email')
      .populate('shopperId', 'name email phone')
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      shops: shops.map(shop => ({
        _id: shop._id,
        name: shop.name,
        description: shop.description,
        category: shop.category,
        address: shop.address,
        city: shop.city,
        state: shop.state,
        pincode: shop.pincode,
        phone: shop.phone,
        email: shop.email,
        website: shop.website,
        images: shop.images || shop.photos || [],
        status: shop.status,
        planName: shop.planId?.name || 'N/A',
        planId: shop.planId ? {
          _id: shop.planId._id.toString(),
          name: shop.planId.name,
          price: shop.planId.price,
        } : null,
        planExpiry: shop.planExpiry,
        paymentStatus: shop.paymentStatus || 'pending',
        paymentMode: shop.paymentMode,
        agentId: shop.agentId ? {
          _id: shop.agentId._id.toString(),
          name: (shop.agentId as any).name,
        } : null,
        shopperId: shop.shopperId ? {
          _id: shop.shopperId._id.toString(),
          name: (shop.shopperId as any).name,
        } : null,
        isFeatured: shop.isFeatured,
        rating: shop.rating,
        reviewCount: shop.reviewCount,
        createdAt: shop.createdAt,
      })),
    });
  } catch (error: any) {
    console.error('Operator shops error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

