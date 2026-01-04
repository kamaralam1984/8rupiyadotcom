import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Shop from '@/models/Shop';
import { verifyToken } from '@/lib/auth';
import { UserRole } from '@/types/user';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const { id } = await params;
    const shopId = id;
    const { pageContent } = await req.json();

    const shop = await Shop.findById(shopId);

    if (!shop) {
      return NextResponse.json({ error: 'Shop not found' }, { status: 404 });
    }

    // Update page content
    (shop as any).pageContent = pageContent || {};

    await shop.save();

    return NextResponse.json({
      success: true,
      message: 'Page content updated successfully',
      shop: shop.toObject(),
    });
  } catch (error: any) {
    console.error('Error updating page content:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const { id } = await params;
    const shopId = id;

    const shop = await Shop.findById(shopId).select('pageContent name');

    if (!shop) {
      return NextResponse.json({ error: 'Shop not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      pageContent: (shop as any).pageContent || {},
    });
  } catch (error: any) {
    console.error('Error fetching page content:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

