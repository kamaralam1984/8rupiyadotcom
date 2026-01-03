import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Shop, { ShopStatus } from '@/models/Shop';

/**
 * POST /api/shops/increment-visitors
 * Increment visitor count for all active shops by 1
 * This is called automatically when homepage loads
 */
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    // Increment visitor count for all active/approved shops using bulk update
    // This is efficient and fast
    const result = await Shop.updateMany(
      {
        status: { $in: [ShopStatus.ACTIVE, ShopStatus.APPROVED] }
      },
      {
        $inc: { visitorCount: 1 }
      }
    );

    return NextResponse.json({
      success: true,
      message: `Visitor count incremented for ${result.modifiedCount} shops`,
      modifiedCount: result.modifiedCount,
    });
  } catch (error: any) {
    console.error('Error incrementing visitor count:', error);
    // Don't fail the request - this is a background operation
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to increment visitor count',
    }, { status: 500 });
  }
}

// GET - Health check (optional)
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Visitor increment API is active',
  });
}

