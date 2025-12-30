import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Shop, { ShopStatus } from '@/models/Shop';
import Payment from '@/models/Payment';
import Plan from '@/models/Plan';
import Commission from '@/models/Commission';
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
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    await connectDB();

    // Verify user exists and is admin in database
    const dbUser = await User.findById(payload.userId);
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!dbUser.isActive) {
      return NextResponse.json({ error: 'Account is inactive' }, { status: 403 });
    }

    // Only admin can access this endpoint
    if (dbUser.role !== UserRole.ADMIN) {
      return NextResponse.json({ 
        error: 'Forbidden. Admin access required.',
        message: `Your current role is: ${dbUser.role}. Admin role is required.`
      }, { status: 403 });
    }

    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get total shops
    const totalShops = await Shop.countDocuments();
    
    // Get active shops (active or approved for backward compatibility)
    const activeShops = await Shop.countDocuments({ 
      status: { $in: [ShopStatus.ACTIVE, ShopStatus.APPROVED] }
    });

    // Get total revenue from successful payments - directly from database
    // Use aggregation for better performance and accuracy
    const totalRevenueResult = await Payment.aggregate([
      { $match: { status: 'success' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalRevenue = totalRevenueResult.length > 0 ? totalRevenueResult[0].total : 0;

    // Get today's sales - use aggregation for better accuracy
    // Check both paidAt and createdAt for today
    const todaySalesByPaidAt = await Payment.aggregate([
      {
        $match: {
          status: 'success',
          paidAt: { $gte: today, $lt: tomorrow }
        }
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    const todaySalesByCreatedAt = await Payment.aggregate([
      {
        $match: {
          status: 'success',
          $or: [{ paidAt: { $exists: false } }, { paidAt: null }],
          createdAt: { $gte: today, $lt: tomorrow }
        }
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    const todaySales = (todaySalesByPaidAt[0]?.total || 0) + (todaySalesByCreatedAt[0]?.total || 0);

    // Get agents count
    const agents = await User.countDocuments({ 
      role: UserRole.AGENT 
    });

    // Get operators count
    const operators = await User.countDocuments({ 
      role: UserRole.OPERATOR 
    });

    // Get total commissions from database using aggregation for better performance
    const totalAgentCommissionResult = await Commission.aggregate([
      { $group: { _id: null, total: { $sum: { $ifNull: ['$agentAmount', 0] } } } }
    ]);
    const totalAgentCommission = totalAgentCommissionResult.length > 0 ? totalAgentCommissionResult[0].total : 0;
    
    // Get total operator commission - sum all operatorAmount (even if operatorId is null, amount should be calculated)
    const totalOperatorCommissionResult = await Commission.aggregate([
      { $match: { operatorAmount: { $gt: 0 } } }, // Only count commissions with operator amount > 0
      { $group: { _id: null, total: { $sum: '$operatorAmount' } } }
    ]);
    let totalOperatorCommission = totalOperatorCommissionResult.length > 0 ? totalOperatorCommissionResult[0].total : 0;
    
    // Also calculate for commissions that might have operatorId but operatorAmount is 0
    // This happens when commission was created but not properly calculated
    const commissionsWithZeroOperatorAmount = await Commission.find({
      operatorId: { $exists: true, $ne: null },
      operatorAmount: 0
    }).populate('paymentId');
    
    for (const comm of commissionsWithZeroOperatorAmount) {
      if (comm.paymentId && (comm.paymentId as any).amount) {
        const paymentAmount = (comm.paymentId as any).amount;
        // Calculate operator commission: 10% of remaining after agent's 20%
        const agentAmount = paymentAmount * 0.20;
        const remaining = paymentAmount - agentAmount;
        const operatorAmount = remaining * 0.10;
        totalOperatorCommission += operatorAmount;
      }
    }
    
    const totalCompanyRevenueResult = await Commission.aggregate([
      { $group: { _id: null, total: { $sum: { $ifNull: ['$companyAmount', 0] } } } }
    ]);
    const totalCompanyRevenue = totalCompanyRevenueResult.length > 0 ? totalCompanyRevenueResult[0].total : 0;
    
    // Get today's commissions using aggregation
    const todayAgentCommissionResult = await Commission.aggregate([
      { $match: { createdAt: { $gte: today, $lt: tomorrow } } },
      { $group: { _id: null, total: { $sum: { $ifNull: ['$agentAmount', 0] } } } }
    ]);
    const todayAgentCommission = todayAgentCommissionResult.length > 0 ? todayAgentCommissionResult[0].total : 0;
    
    const todayOperatorCommissionResult = await Commission.aggregate([
      { $match: { createdAt: { $gte: today, $lt: tomorrow } } },
      { $group: { _id: null, total: { $sum: { $ifNull: ['$operatorAmount', 0] } } } }
    ]);
    const todayOperatorCommission = todayOperatorCommissionResult.length > 0 ? todayOperatorCommissionResult[0].total : 0;

    // Get pending shops with agent and plan info
    const pendingShops = await Shop.find({ status: ShopStatus.PENDING })
      .populate('agentId', 'name')
      .populate('planId', 'name price')
      .sort({ createdAt: -1 })
      .limit(10)
      .select('name agentId planId createdAt')
      .lean();

    const formattedPendingShops = pendingShops.map(shop => ({
      _id: shop._id.toString(),
      name: shop.name,
      agentName: shop.agentId ? (shop.agentId as any).name : 'N/A',
      planName: shop.planId ? (shop.planId as any).name : 'N/A',
      planPrice: shop.planId ? (shop.planId as any).price || 0 : 0,
      createdAt: (shop as any).createdAt,
    }));

    // Calculate monthly revenue data (last 6 months)
    const monthlyRevenue = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date();
      monthStart.setMonth(monthStart.getMonth() - i);
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);
      const monthEnd = new Date(monthStart);
      monthEnd.setMonth(monthEnd.getMonth() + 1);

      // Check both paidAt and createdAt for monthly revenue - use aggregation
      const monthRevenueByPaidAt = await Payment.aggregate([
        {
          $match: {
            status: 'success',
            paidAt: { $gte: monthStart, $lt: monthEnd }
          }
        },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);

      const monthRevenueByCreatedAt = await Payment.aggregate([
        {
          $match: {
            status: 'success',
            $or: [{ paidAt: { $exists: false } }, { paidAt: null }],
            createdAt: { $gte: monthStart, $lt: monthEnd }
          }
        },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);

      const monthRevenue = (monthRevenueByPaidAt[0]?.total || 0) + (monthRevenueByCreatedAt[0]?.total || 0);

      monthlyRevenue.push({
        name: monthNames[monthStart.getMonth()],
        revenue: monthRevenue,
      });
    }

    // Calculate daily shops data (last 7 days)
    const dailyShops = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date();
      dayStart.setDate(dayStart.getDate() - i);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const dayShopCount = await Shop.countDocuments({
        createdAt: { $gte: dayStart, $lt: dayEnd }
      });

      dailyShops.push({
        name: dayNames[dayStart.getDay()],
        shops: dayShopCount,
      });
    }

    // Calculate plan distribution
    const allShops = await Shop.find({ planId: { $exists: true, $ne: null } }).populate('planId', 'name');
    const planCounts: { [key: string]: number } = {};
    allShops.forEach(shop => {
      const planName = (shop.planId as any)?.name || 'No Plan';
      if (planName && planName !== 'No Plan') {
        planCounts[planName] = (planCounts[planName] || 0) + 1;
      }
    });

    const planDistribution = Object.entries(planCounts)
      .filter(([name]) => name && name !== 'No Plan')
      .map(([name, value]) => ({
        name,
        value,
      }))
      .sort((a, b) => b.value - a.value); // Sort by count descending

    console.log('Dashboard API Response:', {
      totalShops,
      activeShops,
      totalRevenue,
      pendingShopsCount: formattedPendingShops.length,
      monthlyRevenue: monthlyRevenue.map(m => ({ name: m.name, revenue: m.revenue })),
      dailyShops: dailyShops.map(d => ({ name: d.name, shops: d.shops })),
      planDistribution: planDistribution.map(p => ({ name: p.name, value: p.value }))
    });

    return NextResponse.json({
      success: true,
      stats: {
        totalShops,
        activeShops,
        totalRevenue,
        agents,
        operators,
        todaySales,
        // Commission data from database
        totalAgentCommission,
        totalOperatorCommission,
        totalCompanyRevenue,
        todayAgentCommission,
        todayOperatorCommission,
      },
      pendingShops: formattedPendingShops,
      charts: {
        monthlyRevenue,
        dailyShops,
        planDistribution,
      },
    });
  } catch (error: any) {
    console.error('Admin dashboard error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

