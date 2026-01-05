import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';
import { UserRole } from '@/types/user';
import PageView from '@/models/PageView';
import Visitor from '@/models/Visitor';

/**
 * GET /api/analytics/time-spent
 * Get detailed time spent analytics (seconds, minutes, hours breakdown)
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

    // Get time spent statistics from PageView
    const pageViewStats = await PageView.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate },
          timeSpent: { $gt: 0 }
        }
      },
      {
        $group: {
          _id: null,
          totalSeconds: { $sum: '$timeSpent' },
          avgSeconds: { $avg: '$timeSpent' },
          minSeconds: { $min: '$timeSpent' },
          maxSeconds: { $max: '$timeSpent' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Get visitor time spent statistics
    const visitorStats = await Visitor.aggregate([
      {
        $match: {
          lastVisit: { $gte: startDate },
          totalTimeSpent: { $gt: 0 }
        }
      },
      {
        $group: {
          _id: null,
          totalSeconds: { $sum: '$totalTimeSpent' },
          avgSeconds: { $avg: '$totalTimeSpent' },
          minSeconds: { $min: '$totalTimeSpent' },
          maxSeconds: { $max: '$totalTimeSpent' },
          count: { $sum: 1 }
        }
      }
    ]);

    const pageViewData = pageViewStats[0] || {
      totalSeconds: 0,
      avgSeconds: 0,
      minSeconds: 0,
      maxSeconds: 0,
      count: 0
    };

    const visitorData = visitorStats[0] || {
      totalSeconds: 0,
      avgSeconds: 0,
      minSeconds: 0,
      maxSeconds: 0,
      count: 0
    };

    // Time spent distribution (buckets)
    const timeDistribution = await PageView.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate },
          timeSpent: { $gt: 0 }
        }
      },
      {
        $bucket: {
          groupBy: '$timeSpent',
          boundaries: [0, 10, 30, 60, 120, 300, 600, 1800, 3600, Infinity],
          default: 'other',
          output: {
            count: { $sum: 1 },
            avgTime: { $avg: '$timeSpent' }
          }
        }
      }
    ]);

    // Time spent by page
    const timeByPage = await PageView.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate },
          timeSpent: { $gt: 0 }
        }
      },
      {
        $group: {
          _id: '$path',
          totalSeconds: { $sum: '$timeSpent' },
          avgSeconds: { $avg: '$timeSpent' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { totalSeconds: -1 }
      },
      {
        $limit: 20
      },
      {
        $project: {
          path: '$_id',
          totalSeconds: 1,
          avgSeconds: { $round: ['$avgSeconds', 2] },
          count: 1,
          totalMinutes: { $round: [{ $divide: ['$totalSeconds', 60] }, 2] },
          totalHours: { $round: [{ $divide: ['$totalSeconds', 3600] }, 2] },
          _id: 0
        }
      }
    ]);

    // Time spent by country
    const timeByCountry = await PageView.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate },
          timeSpent: { $gt: 0 },
          country: { $exists: true, $ne: null }
        }
      },
      {
        $group: {
          _id: '$country',
          totalSeconds: { $sum: '$timeSpent' },
          avgSeconds: { $avg: '$timeSpent' },
          count: { $sum: 1 },
          uniqueVisitors: { $addToSet: '$visitorId' }
        }
      },
      {
        $sort: { totalSeconds: -1 }
      },
      {
        $limit: 20
      },
      {
        $project: {
          country: '$_id',
          totalSeconds: 1,
          avgSeconds: { $round: ['$avgSeconds', 2] },
          count: 1,
          uniqueVisitors: { $size: '$uniqueVisitors' },
          totalMinutes: { $round: [{ $divide: ['$totalSeconds', 60] }, 2] },
          totalHours: { $round: [{ $divide: ['$totalSeconds', 3600] }, 2] },
          _id: 0
        }
      }
    ]);

    return NextResponse.json({
      success: true,
      stats: {
        pageView: {
          totalSeconds: Math.round(pageViewData.totalSeconds),
          totalMinutes: Math.round(pageViewData.totalSeconds / 60),
          totalHours: Math.round(pageViewData.totalSeconds / 3600 * 100) / 100,
          avgSeconds: Math.round(pageViewData.avgSeconds * 100) / 100,
          avgMinutes: Math.round(pageViewData.avgSeconds / 60 * 100) / 100,
          minSeconds: pageViewData.minSeconds,
          maxSeconds: pageViewData.maxSeconds,
          count: pageViewData.count
        },
        visitor: {
          totalSeconds: Math.round(visitorData.totalSeconds),
          totalMinutes: Math.round(visitorData.totalSeconds / 60),
          totalHours: Math.round(visitorData.totalSeconds / 3600 * 100) / 100,
          avgSeconds: Math.round(visitorData.avgSeconds * 100) / 100,
          avgMinutes: Math.round(visitorData.avgSeconds / 60 * 100) / 100,
          minSeconds: visitorData.minSeconds,
          maxSeconds: visitorData.maxSeconds,
          count: visitorData.count
        }
      },
      distribution: timeDistribution,
      byPage: timeByPage,
      byCountry: timeByCountry
    });
  } catch (error: any) {
    console.error('Time spent analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to get time spent analytics' },
      { status: 500 }
    );
  }
}

