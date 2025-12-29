import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Shop from '@/models/Shop';
import { verifyToken } from '@/lib/auth';
import { UserRole } from '@/types/user';

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

    const shopId = params.id;
    const updates = await req.json();

    const shop = await Shop.findById(shopId);

    if (!shop) {
      return NextResponse.json({ error: 'Shop not found' }, { status: 404 });
    }

    // Update allowed fields
    const allowedFields = [
      'name',
      'category',
      'description',
      'isFeatured',
      'homepagePriority',
      'status',
      'planExpiry',
    ];

    allowedFields.forEach((field) => {
      if (updates[field] !== undefined) {
        (shop as any)[field] = updates[field];
      }
    });

    await shop.save();

    return NextResponse.json({
      success: true,
      message: 'Shop updated successfully',
      shop,
    });
  } catch (error: any) {
    console.error('Error updating shop:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
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

    const shopId = params.id;
    const shop = await Shop.findByIdAndDelete(shopId);

    if (!shop) {
      return NextResponse.json({ error: 'Shop not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Shop deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting shop:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

