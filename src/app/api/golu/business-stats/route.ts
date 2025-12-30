import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Shop from '@/models/Shop';
import Payment from '@/models/Payment';
import mongoose from 'mongoose';

// Business statistics for shop owners
export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    await connectDB();

    // Get user's shops
    const shops = await Shop.find({ ownerId: decoded.userId, status: 'active' });

    if (shops.length === 0) {
      return NextResponse.json({
        success: true,
        hasShops: false,
        message: 'Aapka koi shop registered nahi hai.',
      });
    }

    const shopIds = shops.map((s) => s._id);

    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get this month's date range
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const firstDayOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);

    // Get payments
    const todayPayments = await Payment.find({
      shopId: { $in: shopIds },
      createdAt: { $gte: today, $lt: tomorrow },
      status: 'completed',
    });

    const monthPayments = await Payment.find({
      shopId: { $in: shopIds },
      createdAt: { $gte: firstDayOfMonth, $lt: firstDayOfNextMonth },
      status: 'completed',
    });

    const allPayments = await Payment.find({
      shopId: { $in: shopIds },
      status: 'completed',
    });

    // Calculate totals
    const todaySales = todayPayments.reduce((sum, p) => sum + p.amount, 0);
    const monthSales = monthPayments.reduce((sum, p) => sum + p.amount, 0);
    const totalSales = allPayments.reduce((sum, p) => sum + p.amount, 0);

    // Count new customers today (simplified - count unique payments)
    const todayCustomers = todayPayments.length;
    const monthCustomers = monthPayments.length;

    // Get shop ratings
    const avgRating =
      shops.reduce((sum, s) => sum + (s.rating?.average || 0), 0) / shops.length;

    // Calculate growth (compare with last month)
    const lastMonthStart = new Date(firstDayOfMonth);
    lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);
    
    const lastMonthPayments = await Payment.find({
      shopId: { $in: shopIds },
      createdAt: { $gte: lastMonthStart, $lt: firstDayOfMonth },
      status: 'completed',
    });

    const lastMonthSales = lastMonthPayments.reduce((sum, p) => sum + p.amount, 0);
    const growth = lastMonthSales > 0
      ? ((monthSales - lastMonthSales) / lastMonthSales) * 100
      : 0;

    // Top performing shop
    const shopPerformance = await Promise.all(
      shops.map(async (shop) => {
        const shopPayments = allPayments.filter(
          (p) => p.shopId.toString() === shop._id.toString()
        );
        const shopRevenue = shopPayments.reduce((sum, p) => sum + p.amount, 0);
        return {
          shopName: shop.name,
          revenue: shopRevenue,
          customers: shopPayments.length,
        };
      })
    );

    shopPerformance.sort((a, b) => b.revenue - a.revenue);

    // Generate insights
    const insights = [];
    
    if (todayCustomers > 5) {
      insights.push('🎉 Aaj achhi sale chal rahi hai!');
    }
    
    if (growth > 10) {
      insights.push(`📈 Last month se ${growth.toFixed(1)}% growth! Bahut achha!`);
    } else if (growth < -10) {
      insights.push(`📉 Sales thodi kam hai. Marketing par dhyan de.`);
    }

    if (avgRating < 3.5) {
      insights.push('⭐ Rating improve karne ki zarurat hai. Customer service par focus kare.');
    } else if (avgRating > 4.5) {
      insights.push('⭐ Bahut achhi rating! Customers khush hain.');
    }

    // Response
    const response = {
      success: true,
      hasShops: true,
      stats: {
        today: {
          sales: todaySales,
          customers: todayCustomers,
          formatted: `Aaj ₹${todaySales.toLocaleString('en-IN')} ki sale hui, ${todayCustomers} customers aaye`,
        },
        month: {
          sales: monthSales,
          customers: monthCustomers,
          growth: growth.toFixed(1),
          formatted: `Is mahine ₹${monthSales.toLocaleString('en-IN')} ki sale, ${monthCustomers} customers`,
        },
        overall: {
          totalSales,
          totalShops: shops.length,
          avgRating: avgRating.toFixed(1),
          formatted: `Total ${shops.length} shops, ₹${totalSales.toLocaleString('en-IN')} revenue`,
        },
      },
      topShop: shopPerformance[0],
      insights,
      shops: shopPerformance,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching business stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch business statistics' },
      { status: 500 }
    );
  }
}

