import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';
import { UserRole } from '@/types/user';
import PageView from '@/models/PageView';

/**
 * GET /api/analytics/keywords
 * Get top keywords that led to website visits
 */
export async function GET(req: NextRequest) {
  try {
    // Verify admin access
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

    // Parse query parameters
    const { searchParams } = new URL(req.url);
    const range = searchParams.get('range') || '7days';

    // Calculate date range
    let startDate = new Date();
    switch (range) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        break;
      case '7days':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30days':
        startDate.setDate(startDate.getDate() - 30);
        break;
      default:
        startDate.setDate(startDate.getDate() - 7);
    }

    // Get top keywords
    const keywords = await PageView.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate },
          searchKeyword: { $exists: true, $ne: null }
        }
      },
      {
        $group: {
          _id: '$searchKeyword',
          count: { $sum: 1 },
          searchEngine: { $first: '$searchEngine' },
          avgTimeSpent: { $avg: '$timeSpent' },
          uniqueVisitors: { $addToSet: '$visitorId' }
        }
      },
      {
        $project: {
          keyword: '$_id',
          count: 1,
          searchEngine: 1,
          avgTimeSpent: { $round: ['$avgTimeSpent', 2] },
          uniqueVisitors: { $size: '$uniqueVisitors' },
          _id: 0
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 100
      }
    ]);

    // Get search engine breakdown
    const searchEngines = await PageView.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate },
          searchEngine: { $exists: true, $ne: null }
        }
      },
      {
        $group: {
          _id: '$searchEngine',
          count: { $sum: 1 },
          uniqueVisitors: { $addToSet: '$visitorId' }
        }
      },
      {
        $project: {
          engine: '$_id',
          count: 1,
          uniqueVisitors: { $size: '$uniqueVisitors' },
          _id: 0
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    return NextResponse.json({
      success: true,
      keywords,
      searchEngines,
      total: keywords.reduce((sum, k) => sum + k.count, 0)
    });
  } catch (error: any) {
    console.error('Keywords analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to get keywords analytics' },
      { status: 500 }
    );
  }
}

