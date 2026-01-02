import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Shop from '@/models/Shop';
import { verifyToken } from '@/lib/auth';
import { UserRole } from '@/types/user';

// PUT /api/admin/shops/[id]/visitors-likes - Update shop visitor count and like count
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params (Next.js 16+ requirement)
    const { id } = await params;
    
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

    const { visitorCount, likeCount } = await req.json();

    // Validate visitorCount
    if (visitorCount !== undefined && (visitorCount < 0 || !Number.isInteger(visitorCount))) {
      return NextResponse.json(
        { error: 'Visitor count must be a non-negative integer' },
        { status: 400 }
      );
    }

    // Validate likeCount
    if (likeCount !== undefined && (likeCount < 0 || !Number.isInteger(likeCount))) {
      return NextResponse.json(
        { error: 'Like count must be a non-negative integer' },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (visitorCount !== undefined) updateData.visitorCount = visitorCount;
    if (likeCount !== undefined) updateData.likeCount = likeCount;

    const shop = await Shop.findByIdAndUpdate(
      id,
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
      message: 'Visitor and like counts updated successfully',
      shop,
    });
  } catch (error: any) {
    console.error('Error updating shop visitors/likes:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

