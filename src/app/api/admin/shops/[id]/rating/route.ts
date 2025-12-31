import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Shop from '@/models/Shop';
import { verifyToken } from '@/lib/auth';
import { UserRole } from '@/types/user';

// PUT /api/admin/shops/[id]/rating - Update shop rating
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '') || 
                 req.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || payload.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 });
    }

    await connectDB();

    const { rating, reviewCount } = await req.json();

    // Validate rating
    if (rating !== undefined && (rating < 0 || rating > 5)) {
      return NextResponse.json(
        { error: 'Rating must be between 0 and 5' },
        { status: 400 }
      );
    }

    // Validate reviewCount
    if (reviewCount !== undefined && reviewCount < 0) {
      return NextResponse.json(
        { error: 'Review count must be a positive number' },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (rating !== undefined) updateData.rating = rating;
    if (reviewCount !== undefined) updateData.reviewCount = reviewCount;

    const shop = await Shop.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true }
    )
      .populate('planId', 'name price duration')
      .populate('agentId', 'name email')
      .populate('operatorId', 'name email')
      .lean();

    if (!shop) {
      return NextResponse.json({ error: 'Shop not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Rating updated successfully',
      shop,
    });
  } catch (error: any) {
    console.error('Error updating shop rating:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

