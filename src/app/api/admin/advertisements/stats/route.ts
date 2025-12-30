import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Advertisement from '@/models/Advertisement';
import { verifyToken } from '@/lib/jwt';
import { UserRole } from '@/models/User';

// GET /api/admin/advertisements/stats - Get advertisement statistics
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

    const [
      totalAds,
      activeAds,
      inactiveAds,
      expiredAds,
      totalClicks,
      totalImpressions,
      allAds,
    ] = await Promise.all([
      Advertisement.countDocuments(),
      Advertisement.countDocuments({ status: 'active' }),
      Advertisement.countDocuments({ status: 'inactive' }),
      Advertisement.countDocuments({ status: 'expired' }),
      Advertisement.aggregate([
        { $group: { _id: null, total: { $sum: '$clicks' } } },
      ]),
      Advertisement.aggregate([
        { $group: { _id: null, total: { $sum: '$impressions' } } },
      ]),
      Advertisement.find().lean(),
    ]);

    // Calculate total revenue (assuming each click = ₹10)
    const revenuePerClick = 10;
    const totalRevenue = (totalClicks[0]?.total || 0) * revenuePerClick;

    // Calculate average CTR
    const avgCTR = totalImpressions[0]?.total 
      ? ((totalClicks[0]?.total || 0) / totalImpressions[0].total * 100).toFixed(2)
      : '0.00';

    // Get last 7 days data for charts
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const dailyStats = await Advertisement.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          clicks: { $sum: '$clicks' },
          impressions: { $sum: '$impressions' },
          revenue: { $sum: { $multiply: ['$clicks', revenuePerClick] } },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return NextResponse.json({
      success: true,
      stats: {
        totalAds,
        activeAds,
        inactiveAds,
        expiredAds,
        totalClicks: totalClicks[0]?.total || 0,
        totalImpressions: totalImpressions[0]?.total || 0,
        totalRevenue,
        avgCTR,
        dailyStats,
      },
    });
  } catch (error: any) {
    console.error('Error fetching advertisement stats:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

