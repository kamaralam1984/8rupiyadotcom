import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Plan from '@/models/Plan';
import { verifyToken } from '@/lib/auth';
import { UserRole } from '@/models/User';

// GET /api/agent/plans - Get all active plans for agent dropdown
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    // Get JWT token from Authorization header or cookie
    const token = req.headers.get('authorization')?.replace('Bearer ', '') || 
                 req.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify token
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Only agents and admins can access this endpoint
    if (payload.role !== UserRole.AGENT && payload.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch all active plans from database
    const plans = await Plan.find({ isActive: true })
      .select('_id name price duration expiryDays maxPhotos maxOffers slotType seoEnabled pageHosting priority listingPriority rank homepageVisibility featuredTag pageLimit position photos slots seo offers')
      .sort({ priority: 1, listingPriority: 1 });

    return NextResponse.json({
      success: true,
      plans: plans.map(plan => ({
        _id: plan._id.toString(),
        name: plan.name,
        price: plan.price,
        duration: plan.duration || plan.expiryDays || 365,
        maxPhotos: plan.maxPhotos || plan.photos || 1,
        maxOffers: plan.maxOffers || plan.offers || 0,
        slotType: plan.slotType,
        seoEnabled: plan.seoEnabled || plan.seo || false,
        pageHosting: plan.pageHosting || plan.pageLimit || 0,
        priority: plan.priority || plan.listingPriority || 0,
        // Additional fields for display
        listingPriority: plan.listingPriority,
        rank: plan.rank,
        homepageVisibility: plan.homepageVisibility,
        featuredTag: plan.featuredTag,
        pageLimit: plan.pageLimit,
        position: plan.position,
      })),
    });
  } catch (error: any) {
    console.error('Error fetching plans:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

