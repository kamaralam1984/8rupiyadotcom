import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Shop from '@/models/Shop';
import Commission from '@/models/Commission';
import Payment from '@/models/Payment';
import { verifyToken } from '@/lib/auth';
import { UserRole } from '@/models/User';

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '') || 
                 req.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || payload.role !== UserRole.AGENT) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await connectDB();

    const agent = await User.findById(payload.userId);
    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get this month's date range
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);
    const nextMonth = new Date(currentMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    // Get agent's shops
    const totalShops = await Shop.countDocuments({ agentId: agent._id });
    const shopsToday = await Shop.countDocuments({ 
      agentId: agent._id,
      createdAt: { $gte: today, $lt: tomorrow }
    });
    const shopsThisMonth = await Shop.countDocuments({ 
      agentId: agent._id,
      createdAt: { $gte: currentMonth, $lt: nextMonth }
    });
    const activeShops = await Shop.countDocuments({ 
      agentId: agent._id, 
      status: { $in: ['active', 'approved'] } // Include both for backward compatibility
    });
    const pendingShops = await Shop.countDocuments({ 
      agentId: agent._id, 
      status: 'pending' 
    });

    // Get operators
    const operators = await User.countDocuments({ 
      agentId: agent._id, 
      role: UserRole.OPERATOR 
    });

    // Get agent's shop IDs
    const agentShopIds = await Shop.find({ agentId: agent._id }).distinct('_id');

    // Get total earnings from payments
    const payments = await Payment.find({ 
      shopId: { $in: agentShopIds },
      status: 'success'
    });
    const totalEarnings = payments.reduce((sum, p) => sum + p.amount, 0);

    // Get commissions from Commission model (preferred source)
    const commissions = await Commission.find({ agentId: agent._id });
    const totalCommissionFromModel = commissions.reduce((sum, c) => sum + c.agentAmount, 0);
    
    // Calculate commission as 20% of total earnings (fallback if no commission records)
    const calculatedCommission = totalEarnings * 0.20;
    const commission = totalCommissionFromModel > 0 ? totalCommissionFromModel : calculatedCommission;

    // Get monthly earnings (current month)
    const monthlyPayments = await Payment.find({
      shopId: { $in: agentShopIds },
      status: 'success',
      createdAt: { $gte: currentMonth }
    });
    const monthlyEarnings = monthlyPayments.reduce((sum, p) => sum + p.amount, 0);
    
    // Get monthly commissions from Commission model
    const monthlyCommissions = await Commission.find({
      agentId: agent._id,
      createdAt: { $gte: currentMonth }
    });
    const monthlyCommissionFromModel = monthlyCommissions.reduce((sum, c) => sum + c.agentAmount, 0);
    const monthlyCommission = monthlyCommissionFromModel > 0 ? monthlyCommissionFromModel : (monthlyEarnings * 0.20);

    // Get recent shops
    const recentShops = await Shop.find({ agentId: agent._id })
      .populate('planId', 'name')
      .sort({ createdAt: -1 })
      .limit(10)
      .select('name category pincode planId status createdAt');

    // Generate agent ID in format AG001, AG002, etc.
    // Use a simple format based on MongoDB ID or create a sequential format
    const agentIdNum = agent._id.toString().slice(-3);
    const agentId = `AG${parseInt(agentIdNum, 16).toString().padStart(3, '0')}`;

    return NextResponse.json({
      success: true,
      agent: {
        name: agent.name,
        agentId: agentId,
      },
      stats: {
        totalShops,
        shopsToday,
        shopsThisMonth,
        activeShops,
        pendingShops,
        commission, // 20% of total earnings
        totalEarnings, // Keep for reference
        operators,
        monthlyEarnings,
        monthlyCommission, // 20% of monthly earnings
      },
      recentShops: recentShops.map(shop => ({
        _id: shop._id.toString(),
        name: shop.name,
        category: shop.category,
        pincode: shop.pincode,
        plan: shop.planId?.name || 'N/A',
        status: shop.status,
        createdAt: shop.createdAt,
      })),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

