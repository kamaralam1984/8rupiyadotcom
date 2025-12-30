import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth';
import { UserRole } from '@/types/user';

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '') || 
                 req.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || (payload.role !== UserRole.ADMIN && payload.role !== 'accountant')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await connectDB();

    // Get user statistics
    const total = await User.countDocuments();
    const admins = await User.countDocuments({ role: UserRole.ADMIN });
    const agents = await User.countDocuments({ role: UserRole.AGENT });
    const operators = await User.countDocuments({ role: UserRole.OPERATOR });
    const shoppers = await User.countDocuments({ role: UserRole.SHOPPER });

    return NextResponse.json({
      success: true,
      stats: {
        total,
        admins,
        agents,
        operators,
        shoppers,
      },
    });
  } catch (error: any) {
    console.error('Error fetching user stats:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}



