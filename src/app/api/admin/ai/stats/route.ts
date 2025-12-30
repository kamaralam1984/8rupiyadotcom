import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';
import { UserRole } from '@/types/user';
import AIInteraction, { InteractionType } from '@/models/AIInteraction';

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

    // Get total interactions
    const totalInteractions = await AIInteraction.countDocuments();

    // Get unique categories
    const categoriesResult = await AIInteraction.aggregate([
      { $match: { category: { $exists: true, $ne: null } } },
      { $group: { _id: '$category' } },
      { $count: 'total' }
    ]);
    const uniqueCategories = categoriesResult[0]?.total || 0;

    // Get active users (unique sessions)
    const activeUsersResult = await AIInteraction.aggregate([
      { $group: { _id: '$sessionId' } },
      { $count: 'total' }
    ]);
    const activeUsers = activeUsersResult[0]?.total || 0;

    // Calculate conversion rate
    const totalQueries = await AIInteraction.countDocuments({
      interactionType: InteractionType.QUERY
    });
    const conversions = await AIInteraction.countDocuments({
      conversion: true
    });
    const conversionRate = totalQueries > 0 ? ((conversions / totalQueries) * 100).toFixed(1) : '0.0';

    // Get most searched categories
    const categoryStats = await AIInteraction.aggregate([
      { $match: { category: { $exists: true, $ne: null } } },
      { 
        $group: { 
          _id: '$category',
          queries: { $sum: 1 }
        } 
      },
      { $sort: { queries: -1 } },
      { $limit: 10 }
    ]);

    const categoryData = categoryStats.map((cat: any) => ({
      name: cat._id.charAt(0).toUpperCase() + cat._id.slice(1),
      queries: cat.queries
    }));

    // Get top converting shops
    const topConvertingShops = await AIInteraction.aggregate([
      { 
        $match: { 
          selectedShopId: { $exists: true, $ne: null },
          conversion: true
        } 
      },
      { 
        $group: { 
          _id: '$selectedShopId',
          conversions: { $sum: 1 }
        } 
      },
      { $sort: { conversions: -1 } },
      { $limit: 10 }
    ]);

    // Get language distribution
    const languageStats = await AIInteraction.aggregate([
      { 
        $group: { 
          _id: '$queryLanguage',
          count: { $sum: 1 }
        } 
      },
      { $sort: { count: -1 } }
    ]);

    // Get hourly interaction patterns (last 24 hours)
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const hourlyStats = await AIInteraction.aggregate([
      { $match: { createdAt: { $gte: oneDayAgo } } },
      {
        $group: {
          _id: { $hour: '$createdAt' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get interactions trend (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const dailyStats = await AIInteraction.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
          conversions: {
            $sum: { $cond: ['$conversion', 1, 0] }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const trendData = dailyStats.map((day: any) => ({
      date: day._id,
      interactions: day.count,
      conversions: day.conversions
    }));

    return NextResponse.json({
      success: true,
      stats: {
        totalInteractions,
        uniqueCategories,
        activeUsers,
        conversionRate: `${conversionRate}%`,
        categoryData,
        topConvertingShops,
        languageStats,
        hourlyStats,
        trendData
      }
    });
  } catch (error: any) {
    console.error('Error fetching AI stats:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

