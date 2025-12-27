import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Advertisement from '@/models/Advertisement';
import { withAuth, AuthRequest } from '@/middleware/auth';
import { UserRole } from '@/models/User';

// GET /api/admin/advertisements/[id] - Get single advertisement
export const GET = withAuth(async (req: AuthRequest, context?: { params?: Promise<{ id: string }> }) => {
  try {
    await connectDB();

    const user = req.user!;
    
    if (user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const params = await context?.params;
    if (!params) {
      return NextResponse.json({ error: 'Missing params' }, { status: 400 });
    }
    const { id } = params;
    const advertisement = await Advertisement.findById(id);

    if (!advertisement) {
      return NextResponse.json({ error: 'Advertisement not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      advertisement,
    });
  } catch (error: any) {
    console.error('Error fetching advertisement:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}, [UserRole.ADMIN]);

// PUT /api/admin/advertisements/[id] - Update advertisement
export const PUT = withAuth(async (req: AuthRequest, context?: { params?: Promise<{ id: string }> }) => {
  try {
    await connectDB();

    const user = req.user!;
    
    if (user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const params = await context?.params;
    if (!params) {
      return NextResponse.json({ error: 'Missing params' }, { status: 400 });
    }
    const { id } = params;
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

    const advertisement = await Advertisement.findById(id);

    if (!advertisement) {
      return NextResponse.json({ error: 'Advertisement not found' }, { status: 404 });
    }

    // Update fields
    if (title !== undefined) advertisement.title = title;
    if (description !== undefined) advertisement.description = description;
    if (image !== undefined) advertisement.image = image;
    if (link !== undefined) advertisement.link = link;
    if (slot !== undefined) {
      const validSlots = ['homepage', 'category', 'search', 'shop', 'sidebar', 'sidebar-left', 'sidebar-right', 'header', 'footer'];
      if (!validSlots.includes(slot)) {
        return NextResponse.json({ error: 'Invalid slot' }, { status: 400 });
      }
      advertisement.slot = slot;
    }
    if (position !== undefined) advertisement.position = position;
    if (status !== undefined) advertisement.status = status;
    if (startDate !== undefined) advertisement.startDate = startDate ? new Date(startDate) : undefined;
    if (endDate !== undefined) advertisement.endDate = endDate ? new Date(endDate) : undefined;
    if (advertiserName !== undefined) advertisement.advertiserName = advertiserName;
    if (advertiserEmail !== undefined) advertisement.advertiserEmail = advertiserEmail;
    if (advertiserPhone !== undefined) advertisement.advertiserPhone = advertiserPhone;

    await advertisement.save();

    return NextResponse.json({
      success: true,
      message: 'Advertisement updated successfully',
      advertisement,
    });
  } catch (error: any) {
    console.error('Error updating advertisement:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}, [UserRole.ADMIN]);

// DELETE /api/admin/advertisements/[id] - Delete advertisement
export const DELETE = withAuth(async (req: AuthRequest, context?: { params?: Promise<{ id: string }> }) => {
  try {
    await connectDB();

    const user = req.user!;
    
    if (user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const params = await context?.params;
    if (!params) {
      return NextResponse.json({ error: 'Missing params' }, { status: 400 });
    }
    const { id } = params;
    const advertisement = await Advertisement.findByIdAndDelete(id);

    if (!advertisement) {
      return NextResponse.json({ error: 'Advertisement not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Advertisement deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting advertisement:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}, [UserRole.ADMIN]);

