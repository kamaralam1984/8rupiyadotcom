import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Payment from '@/models/Payment';
import Shop from '@/models/Shop';
import { verifyToken } from '@/lib/auth';
import { UserRole } from '@/types/user';

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '') || 
                 req.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || (payload.role !== UserRole.ADMIN && payload.role !== 'accountant')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    // Build date filter
    const dateFilter: any = {};
    if (dateFrom || dateTo) {
      dateFilter.createdAt = {};
      if (dateFrom) dateFilter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) {
        const endDate = new Date(dateTo);
        endDate.setHours(23, 59, 59, 999);
        dateFilter.createdAt.$lte = endDate;
      }
    }

    // Basic stats
    const totalRevenueResult = await Payment.aggregate([
      { $match: { status: 'success', ...dateFilter } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalRevenue = totalRevenueResult.length > 0 ? totalRevenueResult[0].total : 0;

    // Online payments have razorpayPaymentId, cash payments don't (or have CASH- prefix)
    const onlinePaymentsResult = await Payment.aggregate([
      {
        $match: {
          status: 'success',
          razorpayPaymentId: { $exists: true, $ne: null },
          razorpayOrderId: { $not: /^CASH-/ },
          ...dateFilter
        }
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const onlinePayments = onlinePaymentsResult.length > 0 ? onlinePaymentsResult[0].total : 0;

    const cashPaymentsResult = await Payment.aggregate([
      {
        $match: {
          status: 'success',
          $or: [
            { razorpayPaymentId: { $exists: false } },
            { razorpayPaymentId: null },
            { razorpayOrderId: /^CASH-/ }
          ],
          ...dateFilter
        }
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const cashPayments = cashPaymentsResult.length > 0 ? cashPaymentsResult[0].total : 0;

    const successCount = await Payment.countDocuments({ status: 'success', ...dateFilter });
    const failedCount = await Payment.countDocuments({ status: 'failed', ...dateFilter });
    const pendingCount = await Payment.countDocuments({ status: 'pending', ...dateFilter });

    // Date calculations
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(today);
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    const todayRevenueResult = await Payment.aggregate([
      { $match: { status: 'success', createdAt: { $gte: today }, ...dateFilter } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const todayRevenue = todayRevenueResult.length > 0 ? todayRevenueResult[0].total : 0;

    const weekRevenueResult = await Payment.aggregate([
      { $match: { status: 'success', createdAt: { $gte: weekAgo }, ...dateFilter } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const weekRevenue = weekRevenueResult.length > 0 ? weekRevenueResult[0].total : 0;

    const monthRevenueResult = await Payment.aggregate([
      { $match: { status: 'success', createdAt: { $gte: monthAgo }, ...dateFilter } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const monthRevenue = monthRevenueResult.length > 0 ? monthRevenueResult[0].total : 0;

    // Average transaction
    const avgResult = await Payment.aggregate([
      { $match: { status: 'success', ...dateFilter } },
      { $group: { _id: null, avg: { $avg: '$amount' }, count: { $sum: 1 } } }
    ]);
    const averageTransaction = avgResult.length > 0 ? (avgResult[0].avg || 0) : 0;

    // Growth rate (compare this month with last month)
    const lastMonthStart = new Date(monthAgo);
    lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);
    const lastMonthEnd = new Date(monthAgo);

    const lastMonthRevenueResult = await Payment.aggregate([
      {
        $match: {
          status: 'success',
          createdAt: { $gte: lastMonthStart, $lt: lastMonthEnd },
          ...dateFilter
        }
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const lastMonthRevenue = lastMonthRevenueResult.length > 0 ? lastMonthRevenueResult[0].total : 0;
    const growthRate = lastMonthRevenue > 0
      ? ((monthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
      : 0;

    // Daily data for last 30 days
    const dailyData = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const dayResult = await Payment.aggregate([
        {
          $match: {
            status: 'success',
            createdAt: { $gte: date, $lt: nextDate },
            ...dateFilter
          }
        },
        {
          $group: {
            _id: null,
            revenue: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        }
      ]);

      dailyData.push({
        date: date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
        revenue: dayResult.length > 0 ? dayResult[0].revenue : 0,
        count: dayResult.length > 0 ? dayResult[0].count : 0,
      });
    }

    // Category data
    const categoryDataResult = await Payment.aggregate([
      {
        $match: { status: 'success', ...dateFilter },
        $lookup: {
          from: 'shops',
          localField: 'shopId',
          foreignField: '_id',
          as: 'shop'
        }
      },
      { $unwind: { path: '$shop', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: '$shop.category',
          revenue: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { revenue: -1 } },
      { $limit: 10 }
    ]);

    const categoryData = categoryDataResult.map(item => ({
      category: item._id || 'Unknown',
      revenue: item.revenue || 0,
      count: item.count || 0,
    }));

    // Plan data
    const planDataResult = await Payment.aggregate([
      {
        $match: { status: 'success', ...dateFilter },
        $lookup: {
          from: 'plans',
          localField: 'planId',
          foreignField: '_id',
          as: 'plan'
        }
      },
      { $unwind: { path: '$plan', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: '$plan.name',
          revenue: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { revenue: -1 } }
    ]);

    const planData = planDataResult.map(item => ({
      plan: item._id || 'Unknown',
      revenue: item.revenue || 0,
      count: item.count || 0,
    }));

    // Status data
    const statusDataResult = await Payment.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          revenue: {
            $sum: {
              $cond: [{ $eq: ['$status', 'success'] }, '$amount', 0]
            }
          }
        }
      }
    ]);

    const statusData = statusDataResult.map(item => ({
      status: item._id || 'unknown',
      count: item.count || 0,
      revenue: item.revenue || 0,
    }));

    // Hourly data
    const hourlyData = [];
    for (let hour = 0; hour < 24; hour++) {
      const hourResult = await Payment.aggregate([
        {
          $match: {
            status: 'success',
            ...dateFilter,
            $expr: {
              $eq: [{ $hour: '$createdAt' }, hour]
            }
          }
        },
        {
          $group: {
            _id: null,
            revenue: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        }
      ]);

      hourlyData.push({
        hour: `${hour}:00`,
        revenue: hourResult.length > 0 ? hourResult[0].revenue : 0,
        count: hourResult.length > 0 ? hourResult[0].count : 0,
      });
    }

    return NextResponse.json({
      success: true,
      stats: {
        totalRevenue,
        onlinePayments,
        cashPayments,
        successCount,
        failedCount,
        pendingCount,
        todayRevenue,
        weekRevenue,
        monthRevenue,
        averageTransaction,
        growthRate,
        dailyData,
        categoryData,
        planData,
        statusData,
        hourlyData,
      },
    });
  } catch (error: any) {
    console.error('Error fetching payment stats:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
