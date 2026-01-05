import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';
import { UserRole } from '@/types/user';
import PageView from '@/models/PageView';
import Visitor from '@/models/Visitor';

/**
 * GET /api/analytics/countries
 * Get detailed country-wise analytics
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

    // Get country-wise statistics
    const countryStats = await PageView.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate },
          country: { $exists: true, $ne: null }
        }
      },
      {
        $group: {
          _id: '$country',
          totalVisits: { $sum: 1 },
          uniqueVisitors: { $addToSet: '$visitorId' },
          totalTimeSpent: { $sum: '$timeSpent' },
          avgTimeSpent: { $avg: '$timeSpent' },
          pages: { $addToSet: '$path' },
          cities: { $addToSet: '$city' },
          devices: {
            $push: '$deviceType'
          }
        }
      },
      {
        $project: {
          country: '$_id',
          totalVisits: 1,
          uniqueVisitors: { $size: '$uniqueVisitors' },
          totalTimeSpent: 1,
          totalTimeMinutes: { $round: [{ $divide: ['$totalTimeSpent', 60] }, 2] },
          totalTimeHours: { $round: [{ $divide: ['$totalTimeSpent', 3600] }, 2] },
          avgTimeSpent: { $round: ['$avgTimeSpent', 2] },
          avgTimeMinutes: { $round: [{ $divide: ['$avgTimeSpent', 60] }, 2] },
          pagesCount: { $size: '$pages' },
          citiesCount: { $size: { $filter: { input: '$cities', as: 'city', cond: { $ne: ['$$city', null] } } } },
          mobile: {
            $size: {
              $filter: { input: '$devices', as: 'device', cond: { $eq: ['$$device', 'mobile'] } }
            }
          },
          desktop: {
            $size: {
              $filter: { input: '$devices', as: 'device', cond: { $eq: ['$$device', 'desktop'] } }
            }
          },
          tablet: {
            $size: {
              $filter: { input: '$devices', as: 'device', cond: { $eq: ['$$device', 'tablet'] } }
            }
          },
          _id: 0
        }
      },
      {
        $sort: { totalVisits: -1 }
      }
    ]);

    // Get top cities by country
    const cityStats = await PageView.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate },
          country: { $exists: true, $ne: null },
          city: { $exists: true, $ne: null }
        }
      },
      {
        $group: {
          _id: {
            country: '$country',
            city: '$city'
          },
          totalVisits: { $sum: 1 },
          uniqueVisitors: { $addToSet: '$visitorId' },
          totalTimeSpent: { $sum: '$timeSpent' },
          avgTimeSpent: { $avg: '$timeSpent' }
        }
      },
      {
        $project: {
          country: '$_id.country',
          city: '$_id.city',
          totalVisits: 1,
          uniqueVisitors: { $size: '$uniqueVisitors' },
          totalTimeSpent: 1,
          totalTimeMinutes: { $round: [{ $divide: ['$totalTimeSpent', 60] }, 2] },
          totalTimeHours: { $round: [{ $divide: ['$totalTimeSpent', 3600] }, 2] },
          avgTimeSpent: { $round: ['$avgTimeSpent', 2] },
          _id: 0
        }
      },
      {
        $sort: { totalVisits: -1 }
      },
      {
        $limit: 50
      }
    ]);

    // Get country-wise search keywords
    const countryKeywords = await PageView.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate },
          country: { $exists: true, $ne: null },
          searchKeyword: { $exists: true, $ne: null }
        }
      },
      {
        $group: {
          _id: {
            country: '$country',
            keyword: '$searchKeyword'
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.country',
          keywords: {
            $push: {
              keyword: '$_id.keyword',
              count: '$count'
            }
          }
        }
      },
      {
        $project: {
          country: '$_id',
          keywords: {
            $slice: [
              {
                $sortArray: {
                  input: '$keywords',
                  sortBy: { count: -1 }
                }
              },
              10
            ]
          },
          _id: 0
        }
      }
    ]);

    return NextResponse.json({
      success: true,
      countries: countryStats,
      cities: cityStats,
      keywords: countryKeywords,
      total: countryStats.length
    });
  } catch (error: any) {
    console.error('Country analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to get country analytics' },
      { status: 500 }
    );
  }
}

