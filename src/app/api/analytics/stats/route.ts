import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';
import { UserRole } from '@/types/user';
import Visitor from '@/models/Visitor';
import PageView from '@/models/PageView';
import ClickEvent from '@/models/ClickEvent';
import Shop from '@/models/Shop';

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

    // Get total visits
    const totalVisits = await PageView.countDocuments({
      timestamp: { $gte: startDate }
    });

    // Get unique visitors
    const uniqueVisitors = await PageView.distinct('visitorId', {
      timestamp: { $gte: startDate }
    });

    // Get returning visitors
    const returningVisitors = await Visitor.countDocuments({
      totalVisits: { $gt: 1 },
      lastVisit: { $gte: startDate }
    });

    // Get avg time spent
    const visitors = await Visitor.find({
      lastVisit: { $gte: startDate }
    });
    const totalTime = visitors.reduce((sum, v) => sum + v.totalTimeSpent, 0);
    const avgTimeSpent = visitors.length > 0 ? Math.floor(totalTime / visitors.length) : 0;

    // Get device breakdown
    const deviceBreakdown = await PageView.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$deviceType',
          count: { $sum: 1 }
        }
      }
    ]);

    const deviceStats = {
      mobile: deviceBreakdown.find(d => d._id === 'mobile')?.count || 0,
      desktop: deviceBreakdown.find(d => d._id === 'desktop')?.count || 0,
      tablet: deviceBreakdown.find(d => d._id === 'tablet')?.count || 0,
    };

    // Get traffic source
    const trafficSource = await Visitor.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $cond: {
              if: { $ne: ['$utmSource', null] },
              then: '$utmSource',
              else: 'direct'
            }
          },
          count: { $sum: 1 }
        }
      }
    ]);

    const sourceStats = {
      direct: trafficSource.find(s => s._id === 'direct')?.count || 0,
      search: trafficSource.find(s => ['google', 'bing', 'yahoo'].includes(s._id))?.count || 0,
      social: trafficSource.find(s => ['facebook', 'instagram', 'twitter', 'whatsapp'].includes(s._id))?.count || 0,
      referral: trafficSource.filter(s => !['direct', 'google', 'bing', 'yahoo', 'facebook', 'instagram', 'twitter', 'whatsapp'].includes(s._id)).reduce((sum, s) => sum + s.count, 0),
    };

    // Get shop stats
    const totalShops = await Shop.countDocuments();
    const activeShops = await Shop.countDocuments({
      status: 'active',
      planExpiry: { $gte: new Date() }
    });
    const inactiveShops = totalShops - activeShops;

    // Get top pages
    const topPages = await PageView.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$path',
          views: { $sum: 1 }
        }
      },
      {
        $sort: { views: -1 }
      },
      {
        $limit: 10
      }
    ]);

    // Get daily trend
    const dailyTrend = await PageView.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$timestamp'
            }
          },
          visits: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Get hourly pattern (for today)
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const hourlyPattern = await PageView.aggregate([
      {
        $match: {
          timestamp: { $gte: todayStart }
        }
      },
      {
        $group: {
          _id: { $hour: '$timestamp' },
          visits: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    return NextResponse.json({
      success: true,
      stats: {
        totalVisits,
        uniqueVisitors: uniqueVisitors.length,
        returningVisitors,
        avgTimeSpent,
        bounceRate: 0, // Calculate based on single-page sessions
        totalShops,
        activeShops,
        inactiveShops,
        deviceBreakdown: deviceStats,
        trafficSource: sourceStats,
        topPages: topPages.map(p => ({
          path: p._id,
          views: p.views
        })),
        trends: {
          daily: dailyTrend.map(d => ({
            date: d._id,
            visits: d.visits
          })),
          hourly: hourlyPattern.map(h => ({
            hour: h._id,
            visits: h.visits
          }))
        }
      }
    });
  } catch (error: any) {
    console.error('Analytics stats error:', error);
    return NextResponse.json(
      { error: 'Failed to get analytics stats' },
      { status: 500 }
    );
  }
}

