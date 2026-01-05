import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Shop from '@/models/Shop';
import Plan from '@/models/Plan';
import { verifyToken } from '@/lib/auth';
import { UserRole } from '@/types/user';

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '') || 
                 req.cookies.get('token')?.value;

    if (!token) {
      console.error('No token provided in request');
      return NextResponse.json({ 
        error: 'Unauthorized',
        message: 'No authentication token provided. Please login again.'
      }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      console.error('Token verification failed. Token:', token?.substring(0, 20) + '...');
      return NextResponse.json({ 
        error: 'Invalid token',
        message: 'Token verification failed. Please login again.'
      }, { status: 401 });
    }

    console.log('Token payload:', { userId: payload.userId, role: payload.role });
    
    await connectDB();

    // Verify user exists and has correct role in database
    const agent = await User.findById(payload.userId);
    if (!agent) {
      console.error('User not found in database:', payload.userId);
      return NextResponse.json({ 
        error: 'User not found',
        message: 'User account not found. Please login again.'
      }, { status: 404 });
    }

    if (!agent.isActive) {
      return NextResponse.json({ 
        error: 'Account inactive',
        message: 'Your account is inactive. Please contact administrator.'
      }, { status: 403 });
    }
    
    if (agent.role !== UserRole.AGENT) {
      console.error('Role mismatch:', { 
        expected: UserRole.AGENT, 
        actual: agent.role,
        tokenRole: payload.role 
      });
      return NextResponse.json({ 
        error: 'Forbidden',
        message: `Only agents can access this endpoint. Your role: ${agent.role}`
      }, { status: 403 });
    }

    // ⚡ Optimized query with lean() and select() for 1-second performance
    const shops = await Shop.find({ agentId: agent._id })
      .select('name category address city status planId paymentStatus createdAt')
      .populate('planId', 'name price maxPhotos maxOffers pageLimit position seoEnabled')
      .sort({ createdAt: -1 })
      .lean(); // ⚡ Use lean() for 5-10x faster queries

    // ⚡ Optimized mapping - shops are already lean objects
    return NextResponse.json({
      success: true,
      shops: shops.map((shop: any) => ({
        _id: shop._id.toString(),
        name: shop.name,
        category: shop.category,
        address: shop.address,
        city: shop.city,
        status: shop.status,
        planName: shop.planId?.name || 'N/A',
        planId: shop.planId ? {
          _id: shop.planId._id?.toString() || shop.planId._id,
          name: shop.planId.name,
          price: shop.planId.price,
        } : null,
        paymentStatus: shop.paymentStatus || 'pending',
        createdAt: new Date(shop.createdAt).toISOString(),
      })),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

