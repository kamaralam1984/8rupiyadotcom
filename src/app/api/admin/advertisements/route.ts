import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Advertisement from '@/models/Advertisement';
import { withAuth, AuthRequest } from '@/middleware/auth';
import { UserRole } from '@/models/User';

// GET /api/admin/advertisements - Get all advertisements
export const GET = withAuth(async (req: AuthRequest) => {
  try {
    await connectDB();

    const user = req.user!;
    
    if (user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const slot = searchParams.get('slot');
    const status = searchParams.get('status');

    const query: any = {};
    if (slot) query.slot = slot;
    if (status) query.status = status;

    const advertisements = await Advertisement.find(query)
      .sort({ position: 1, createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      advertisements,
    });
  } catch (error: any) {
    console.error('Error fetching advertisements:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}, [UserRole.ADMIN]);

// POST /api/admin/advertisements - Create new advertisement
export const POST = withAuth(async (req: AuthRequest) => {
  try {
    await connectDB();

    const user = req.user!;
    
    if (user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const {
      title,
      description,
      image,
      link,
      slot,
      position,
      status,
      startDate,
      endDate,
      advertiserName,
      advertiserEmail,
      advertiserPhone,
    } = body;

    // Validation
    if (!title || !image || !link || !slot) {
      return NextResponse.json(
        { error: 'Title, image, link, and slot are required' },
        { status: 400 }
      );
    }

    const validSlots = ['homepage', 'category', 'search', 'shop', 'sidebar', 'sidebar-left', 'sidebar-right', 'header', 'footer'];
    if (!validSlots.includes(slot)) {
      return NextResponse.json({ error: 'Invalid slot' }, { status: 400 });
    }

    const advertisement = await Advertisement.create({
      title,
      description: description || '',
      image,
      link,
      slot,
      position: position || 0,
      status: status || 'active',
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      advertiserName,
      advertiserEmail,
      advertiserPhone,
      clicks: 0,
      impressions: 0,
    });

    return NextResponse.json({
      success: true,
      message: 'Advertisement created successfully',
      advertisement,
    });
  } catch (error: any) {
    console.error('Error creating advertisement:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}, [UserRole.ADMIN]);

