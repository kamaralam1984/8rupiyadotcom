import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Commission from '@/models/Commission';
import { verifyToken } from '@/lib/auth';
import { UserRole } from '@/types/user';

export async function POST(
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
    const commissionId = id;
    const commission = await Commission.findById(commissionId);

    if (!commission) {
      return NextResponse.json({ error: 'Commission not found' }, { status: 404 });
    }

    commission.status = 'paid';
    await commission.save();

    return NextResponse.json({
      success: true,
      message: 'Commission marked as paid',
      commission,
    });
  } catch (error: any) {
    console.error('Error marking commission as paid:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

