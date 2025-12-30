import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Advertisement from '@/models/Advertisement';
import { verifyToken } from '@/lib/jwt';
import { UserRole } from '@/models/User';

// GET /api/admin/advertisements - Get all advertisements with filters
export async function GET(req: NextRequest) {
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

    const { searchParams } = new URL(req.url);
    const slot = searchParams.get('slot');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const query: any = {};

    if (slot && slot !== 'all') {
      query.slot = slot;
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { advertiserName: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [advertisements, total] = await Promise.all([
      Advertisement.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Advertisement.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      advertisements,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Error fetching advertisements:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/admin/advertisements - Create new advertisement
export async function POST(req: NextRequest) {
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

    if (!title || !image || !link || !slot) {
      return NextResponse.json(
        { error: 'Title, image, link, and slot are required' },
        { status: 400 }
      );
    }

    const advertisement = await Advertisement.create({
      title,
      description,
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
}
