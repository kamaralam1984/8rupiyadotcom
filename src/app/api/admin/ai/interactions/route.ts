import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';
import { UserRole } from '@/types/user';
import AIInteraction from '@/models/AIInteraction';

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded || (decoded.role !== UserRole.ADMIN && decoded.role !== UserRole.ACCOUNTANT)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const category = searchParams.get('category');
    const language = searchParams.get('language');
    const converted = searchParams.get('converted');

    const skip = (page - 1) * limit;

    // Build query
    const query: any = {};
    if (category) query.category = category;
    if (language) query.queryLanguage = language;
    if (converted === 'true') query.conversion = true;
    if (converted === 'false') query.conversion = false;

    const [interactions, total] = await Promise.all([
      AIInteraction.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      AIInteraction.countDocuments(query)
    ]);

    return NextResponse.json({
      success: true,
      interactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error: any) {
    console.error('Error fetching interactions:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

