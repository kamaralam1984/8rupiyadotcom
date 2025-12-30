import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';
import { UserRole } from '@/types/user';
import JyotishPandit from '@/models/JyotishPandit';

// GET /api/admin/jyotish/pandits - Get all pandits
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

    const pandits = await JyotishPandit.find()
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      pandits,
    });
  } catch (error: any) {
    console.error('Error fetching pandits:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


