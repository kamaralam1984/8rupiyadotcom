import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';
import { UserRole } from '@/types/user';
import JyotishPandit from '@/models/JyotishPandit';
import JyotishBooking from '@/models/JyotishBooking';

// GET /api/admin/jyotish/stats - Get Jyotish statistics
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
      totalPandits,
      activePandits,
      pendingPandits,
      totalBookings,
      totalEarnings,
      avgRating,
      servicesData,
      earningsData,
    ] = await Promise.all([
      JyotishPandit.countDocuments(),
      JyotishPandit.countDocuments({ isActive: true, isVerified: true }),
      JyotishPandit.countDocuments({ isActive: false, isVerified: false }),
      JyotishBooking.countDocuments(),
      JyotishBooking.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$price' } } },
      ]),
      JyotishPandit.aggregate([
        { $group: { _id: null, avgRating: { $avg: '$rating' } } },
      ]),
      // Services distribution
      JyotishPandit.aggregate([
        { $unwind: '$specialties' },
        { $group: { _id: '$specialties', value: { $sum: 1 } } },
        { $project: { name: '$_id', value: 1, _id: 0 } },
      ]),
      // Last 6 months earnings
      JyotishBooking.aggregate([
        {
          $match: {
            paymentStatus: 'paid',
            createdAt: {
              $gte: new Date(new Date().setMonth(new Date().getMonth() - 6)),
            },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
            },
            earnings: { $sum: '$price' },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
        {
          $project: {
            month: {
              $arrayElemAt: [
                ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                { $subtract: ['$_id.month', 1] },
              ],
            },
            earnings: 1,
            _id: 0,
          },
        },
      ]),
    ]);

    return NextResponse.json({
      success: true,
      stats: {
        totalPandits,
        activePandits,
        pendingApproval: pendingPandits,
        totalBookings,
        totalEarnings: totalEarnings[0]?.total || 0,
        avgRating: avgRating[0]?.avgRating?.toFixed(1) || '0.0',
        servicesData,
        earningsData,
      },
    });
  } catch (error: any) {
    console.error('Error fetching Jyotish stats:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


