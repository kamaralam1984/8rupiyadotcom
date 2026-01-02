import { NextRequest, NextResponse } from 'next/server';
import connectMongo from '@/lib/mongodb';
import AdSpaceContent from '@/models/AdSpaceContent';

// GET - Fetch active ad space contents for public display
export async function GET(req: NextRequest) {
  try {
    await connectMongo();

    const { searchParams } = new URL(req.url);
    const rail = searchParams.get('rail'); // 'left' or 'right'

    const query: any = { isActive: true };
    if (rail) {
      query.rail = rail;
    }

    const contents = await AdSpaceContent.find(query)
      .sort({ rail: 1, position: 1 })
      .lean();

    return NextResponse.json({
      success: true,
      contents,
    });
  } catch (error: any) {
    console.error('Error fetching ad space contents:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch contents' },
      { status: 500 }
    );
  }
}

