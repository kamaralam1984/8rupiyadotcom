import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';
import { UserRole } from '@/types/user';
import Visitor from '@/models/Visitor';
import PageView from '@/models/PageView';
import ClickEvent from '@/models/ClickEvent';
import User from '@/models/User';

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

    const now = new Date();
    
    // Active users in last 5 minutes
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    
    // Online users (last 5 minutes activity)
    const activeVisitors = await Visitor.find({
      lastVisit: { $gte: fiveMinutesAgo }
    }).select('visitorId deviceType country city lastVisit userId');

    const onlineUsers = activeVisitors.length;
    
    // Logged-in users (have userId and active in last 5 minutes)
    const loggedInUsers = activeVisitors.filter(v => v.userId).length;
    
    // Anonymous users
    const anonymousUsers = onlineUsers - loggedInUsers;

    // Current pages being viewed
    const currentPages = await PageView.aggregate([
      {
        $match: {
          timestamp: { $gte: fiveMinutesAgo }
        }
      },
      {
        $group: {
          _id: '$path',
          users: { $sum: 1 }
        }
      },
      {
        $sort: { users: -1 }
      },
      {
        $limit: 10
      }
    ]);

    // Recent activity (last 10 clicks)
    const recentClicks = await ClickEvent.find({
      timestamp: { $gte: fiveMinutesAgo }
    })
      .sort({ timestamp: -1 })
      .limit(10)
      .select('clickType shopId timestamp visitorId deviceType');

    // Device breakdown of online users
    const deviceBreakdown = {
      mobile: activeVisitors.filter(v => v.deviceType === 'mobile').length,
      desktop: activeVisitors.filter(v => v.deviceType === 'desktop').length,
      tablet: activeVisitors.filter(v => v.deviceType === 'tablet').length,
    };

    // Location breakdown of online users
    const locationBreakdown = activeVisitors.reduce((acc: any, visitor) => {
      const country = visitor.country || 'Unknown';
      const city = visitor.city || 'Unknown';
      
      if (!acc[country]) {
        acc[country] = { total: 0, cities: {} };
      }
      acc[country].total += 1;
      
      if (!acc[country].cities[city]) {
        acc[country].cities[city] = 0;
      }
      acc[country].cities[city] += 1;
      
      return acc;
    }, {});

    // Format location data
    const topCountries = Object.entries(locationBreakdown)
      .map(([country, data]: [string, any]) => ({
        country,
        users: data.total,
        cities: Object.entries(data.cities)
          .map(([city, count]) => ({ city, count }))
          .sort((a: any, b: any) => b.count - a.count)
          .slice(0, 5)
      }))
      .sort((a, b) => b.users - a.users)
      .slice(0, 10);

    // Recent visitors details
    const recentVisitors = activeVisitors
      .sort((a, b) => b.lastVisit.getTime() - a.lastVisit.getTime())
      .slice(0, 20)
      .map(v => ({
        visitorId: v.visitorId.substring(0, 8),
        device: v.deviceType,
        country: v.country || 'Unknown',
        city: v.city || 'Unknown',
        isLoggedIn: !!v.userId,
        lastSeen: v.lastVisit,
        timeAgo: Math.floor((now.getTime() - v.lastVisit.getTime()) / 1000)
      }));

    return NextResponse.json({
      success: true,
      realtime: {
        onlineUsers,
        loggedInUsers,
        anonymousUsers,
        deviceBreakdown,
        currentPages: currentPages.map(p => ({
          path: p._id,
          users: p.users
        })),
        topCountries,
        recentVisitors,
        recentClicks: recentClicks.map(c => ({
          type: c.clickType,
          shopId: c.shopId,
          timestamp: c.timestamp,
          device: c.deviceType
        })),
        lastUpdated: now
      }
    });
  } catch (error: any) {
    console.error('Realtime analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to get realtime analytics' },
      { status: 500 }
    );
  }
}

