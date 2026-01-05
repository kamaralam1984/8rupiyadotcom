import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Payment from '@/models/Payment';
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
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const mode = searchParams.get('mode') || '';
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const category = searchParams.get('category') || '';
    const plan = searchParams.get('plan') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Build query
    const query: any = {};

    if (status) {
      query.status = status;
    }

    // Mode filtering: online has razorpayPaymentId, cash doesn't (or has CASH- prefix)
    if (mode === 'online') {
      query.razorpayPaymentId = { $exists: true, $ne: null };
      query.razorpayOrderId = { $not: /^CASH-/ };
    } else if (mode === 'cash') {
      query.$or = [
        { razorpayPaymentId: { $exists: false } },
        { razorpayPaymentId: null },
        { razorpayOrderId: /^CASH-/ }
      ];
    }

    // Date filtering
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) {
        const endDate = new Date(dateTo);
        endDate.setHours(23, 59, 59, 999);
        query.createdAt.$lte = endDate;
      }
    }

    // Fetch payments
    let payments = await Payment.find(query)
      .populate({
        path: 'shopId',
        select: 'name category shopperId agentId',
        populate: [
          { path: 'shopperId', select: 'name email', model: 'User' },
          { path: 'agentId', select: 'name email', model: 'User' }
        ]
      })
      .populate('planId', 'name')
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    // Transform payments to include userId from payment or shop
    payments = payments.map((payment: any) => {
      // Use userId from payment if available, otherwise get from shop
      if (!payment.userId && payment.shopId) {
        payment.userId = payment.shopId.shopperId || payment.shopId.agentId || null;
      }
      return payment;
    });

    // Add mode field and filter by category/plan if needed
    payments = payments.map((payment: any) => {
      const isOnline = payment.razorpayPaymentId && !payment.razorpayOrderId?.startsWith('CASH-');
      payment.mode = isOnline ? 'online' : 'cash';
      return payment;
    });

    // Filter by category if provided
    if (category) {
      payments = payments.filter((p: any) => p.shopId?.category === category);
    }

    // Filter by plan if provided
    if (plan) {
      payments = payments.filter((p: any) => p.planId?.name === plan);
    }

    // Search filtering
    if (search) {
      const searchLower = search.toLowerCase();
      payments = payments.filter((p: any) =>
        p.shopId?.name?.toLowerCase().includes(searchLower) ||
        p.userId?.name?.toLowerCase().includes(searchLower) ||
        p.userId?.email?.toLowerCase().includes(searchLower) ||
        p.razorpayPaymentId?.toLowerCase().includes(searchLower) ||
        p.razorpayOrderId?.toLowerCase().includes(searchLower)
      );
    }

    const total = payments.length;

    return NextResponse.json({
      success: true,
      payments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Error fetching payments:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}



