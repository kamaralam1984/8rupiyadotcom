import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Advertisement from '@/models/Advertisement';

// GET /api/advertisements - Get active advertisements for a specific slot (public endpoint)
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const slot = searchParams.get('slot');

    if (!slot) {
      return NextResponse.json({ error: 'Slot parameter is required' }, { status: 400 });
    }

    const validSlots = ['homepage', 'category', 'search', 'shop', 'sidebar', 'sidebar-left', 'sidebar-right', 'header', 'footer'];
    if (!validSlots.includes(slot)) {
      return NextResponse.json({ error: 'Invalid slot' }, { status: 400 });
    }

    const now = new Date();
    
    // If slot is 'sidebar', also include 'sidebar-left' and 'sidebar-right' for backward compatibility
    let querySlot: any = slot;
    if (slot === 'sidebar') {
      querySlot = { $in: ['sidebar', 'sidebar-left', 'sidebar-right'] };
    }
    
    const query: any = {
      slot: querySlot,
      status: 'active',
    };

    // Date filtering - only apply if dates exist
    const dateConditions: any[] = [];
    
    // Start date condition: either doesn't exist or is in the past
    dateConditions.push({
      $or: [
        { startDate: { $exists: false } },
        { startDate: null },
        { startDate: { $lte: now } },
      ],
    });

    // End date condition: either doesn't exist or is in the future
    dateConditions.push({
      $or: [
        { endDate: { $exists: false } },
        { endDate: null },
        { endDate: { $gte: now } },
      ],
    });

    if (dateConditions.length > 0) {
      query.$and = dateConditions;
    }

    const advertisements = await Advertisement.find(query)
      .sort({ position: 1, createdAt: -1 })
      .lean();

    // Update impressions
    if (advertisements.length > 0) {
      await Advertisement.updateMany(
        { _id: { $in: advertisements.map((ad: any) => ad._id) } },
        { $inc: { impressions: 1 } }
      );
    }

    return NextResponse.json({
      success: true,
      advertisements,
    });
  } catch (error: any) {
    console.error('Error fetching advertisements:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

