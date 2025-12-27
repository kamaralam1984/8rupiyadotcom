import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Advertisement from '@/models/Advertisement';

// POST /api/advertisements/[id]/click - Track ad click
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();

    const { id } = await params;
    const advertisement = await Advertisement.findByIdAndUpdate(
      id,
      { $inc: { clicks: 1 } },
      { new: true }
    );

    if (!advertisement) {
      return NextResponse.json({ error: 'Advertisement not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      clicks: advertisement.clicks,
    });
  } catch (error: any) {
    console.error('Error tracking click:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

