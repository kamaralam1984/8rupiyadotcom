import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';
import { UserRole } from '@/types/user';
import Visitor from '@/models/Visitor';
import PageView from '@/models/PageView';

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

    // Get visitors by country
    const countryStats = await Visitor.aggregate([
      {
        $match: {
          lastVisit: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$country',
          visitors: { $sum: 1 },
          totalVisits: { $sum: '$totalVisits' },
          avgTimeSpent: { $avg: '$totalTimeSpent' }
        }
      },
      {
        $sort: { visitors: -1 }
      },
      {
        $limit: 20
      }
    ]);

    // Get visitors by state
    const stateStats = await Visitor.aggregate([
      {
        $match: {
          lastVisit: { $gte: startDate },
          state: { $ne: null }
        }
      },
      {
        $group: {
          _id: { country: '$country', state: '$state' },
          visitors: { $sum: 1 },
          totalVisits: { $sum: '$totalVisits' }
        }
      },
      {
        $sort: { visitors: -1 }
      },
      {
        $limit: 20
      }
    ]);

    // Get visitors by city
    const cityStats = await Visitor.aggregate([
      {
        $match: {
          lastVisit: { $gte: startDate },
          city: { $ne: null }
        }
      },
      {
        $group: {
          _id: { 
            country: '$country', 
            state: '$state',
            city: '$city' 
          },
          visitors: { $sum: 1 },
          totalVisits: { $sum: '$totalVisits' },
          avgTimeSpent: { $avg: '$totalTimeSpent' }
        }
      },
      {
        $sort: { visitors: -1 }
      },
      {
        $limit: 30
      }
    ]);

    // Page views by location
    const pageViewsByLocation = await PageView.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate },
          country: { $ne: null }
        }
      },
      {
        $group: {
          _id: '$country',
          pageViews: { $sum: 1 }
        }
      },
      {
        $sort: { pageViews: -1 }
      },
      {
        $limit: 15
      }
    ]);

    // Device breakdown by country
    const deviceByCountry = await Visitor.aggregate([
      {
        $match: {
          lastVisit: { $gte: startDate },
          country: { $ne: null }
        }
      },
      {
        $group: {
          _id: { country: '$country', device: '$deviceType' },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.country',
          devices: {
            $push: {
              device: '$_id.device',
              count: '$count'
            }
          },
          total: { $sum: '$count' }
        }
      },
      {
        $sort: { total: -1 }
      },
      {
        $limit: 10
      }
    ]);

    return NextResponse.json({
      success: true,
      geography: {
        countries: countryStats.map(c => ({
          country: c._id || 'Unknown',
          visitors: c.visitors,
          totalVisits: c.totalVisits,
          avgTimeSpent: Math.floor(c.avgTimeSpent || 0)
        })),
        states: stateStats.map(s => ({
          country: s._id.country || 'Unknown',
          state: s._id.state || 'Unknown',
          visitors: s.visitors,
          totalVisits: s.totalVisits
        })),
        cities: cityStats.map(c => ({
          country: c._id.country || 'Unknown',
          state: c._id.state || 'Unknown',
          city: c._id.city || 'Unknown',
          visitors: c.visitors,
          totalVisits: c.totalVisits,
          avgTimeSpent: Math.floor(c.avgTimeSpent || 0)
        })),
        pageViewsByLocation: pageViewsByLocation.map(p => ({
          country: p._id,
          pageViews: p.pageViews
        })),
        deviceByCountry: deviceByCountry.map(d => ({
          country: d._id,
          devices: d.devices,
          total: d.total
        }))
      }
    });
  } catch (error: any) {
    console.error('Geography analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to get geography analytics' },
      { status: 500 }
    );
  }
}

