import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';
import { UserRole } from '@/types/user';
import GoogleBusinessAccount, { GoogleBusinessStatus } from '@/models/GoogleBusinessAccount';

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '') || 
                 req.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || payload.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    await connectDB();

    const total = await GoogleBusinessAccount.countDocuments();
    const connected = await GoogleBusinessAccount.countDocuments({ status: GoogleBusinessStatus.CONNECTED });
    const verified = await GoogleBusinessAccount.countDocuments({ 
      status: GoogleBusinessStatus.VERIFIED,
      verificationStatus: 'verified'
    });
    const pending = await GoogleBusinessAccount.countDocuments({ status: GoogleBusinessStatus.PENDING });
    const failed = await GoogleBusinessAccount.countDocuments({ status: GoogleBusinessStatus.FAILED });

    return NextResponse.json({
      success: true,
      stats: {
        total,
        connected,
        verified,
        pending,
        failed,
      },
    });
  } catch (error: any) {
    console.error('Error fetching Google Business stats:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

