import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';
import { UserRole } from '@/types/user';
import Shop from '@/models/Shop';
import User from '@/models/User';
import Payment from '@/models/Payment';
import Commission from '@/models/Commission';

// GET /api/admin/reports/generate - Generate report data
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

    const { searchParams } = new URL(req.url);
    const reportType = searchParams.get('type');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!reportType) {
      return NextResponse.json({ error: 'Report type is required' }, { status: 400 });
    }

    let data: any[] = [];
    let dateFilter: any = {};

    if (startDate) {
      dateFilter.createdAt = { $gte: new Date(startDate) };
    }
    if (endDate) {
      dateFilter.createdAt = { ...dateFilter.createdAt, $lte: new Date(endDate) };
    }

    switch (reportType) {
      case 'revenue':
        const payments = await Payment.find({ 
          status: 'success',
          ...dateFilter 
        })
          .populate('shopId', 'name')
          .populate('userId', 'name email')
          .sort({ createdAt: -1 })
          .lean();

        data = payments.map((p: any) => ({
          'Payment ID': p.razorpayPaymentId || p._id,
          'Shop': p.shopId?.name || 'N/A',
          'Customer': p.userId?.name || 'N/A',
          'Email': p.userId?.email || 'N/A',
          'Amount': p.amount,
          'Payment Mode': p.paymentMode || 'online',
          'Date': new Date(p.createdAt).toLocaleDateString(),
          'Time': new Date(p.createdAt).toLocaleTimeString(),
        }));
        break;

      case 'commissions':
        const commissions = await Commission.find(dateFilter)
          .populate('agentId', 'name email')
          .populate('operatorId', 'name email')
          .populate('shopId', 'name')
          .sort({ createdAt: -1 })
          .lean();

        data = commissions.map((c: any) => ({
          'Commission ID': c._id,
          'Shop': c.shopId?.name || 'N/A',
          'Agent': c.agentId?.name || 'N/A',
          'Agent Email': c.agentId?.email || 'N/A',
          'Agent Commission': c.agentAmount || 0,
          'Operator': c.operatorId?.name || 'N/A',
          'Operator Email': c.operatorId?.email || 'N/A',
          'Operator Commission': c.operatorAmount || 0,
          'Company Revenue': c.companyAmount || 0,
          'Total Amount': c.totalAmount,
          'Status': c.status,
          'Date': new Date(c.createdAt).toLocaleDateString(),
        }));
        break;

      case 'shops':
        const shops = await Shop.find(dateFilter)
          .populate('ownerId', 'name email phone')
          .populate('agentId', 'name')
          .populate('operatorId', 'name')
          .sort({ createdAt: -1 })
          .lean();

        data = shops.map((s: any) => ({
          'Shop ID': s._id,
          'Name': s.name,
          'Category': s.category,
          'Owner': s.ownerId?.name || 'N/A',
          'Email': s.ownerId?.email || 'N/A',
          'Phone': s.ownerId?.phone || 'N/A',
          'Agent': s.agentId?.name || 'N/A',
          'Operator': s.operatorId?.name || 'N/A',
          'City': s.address?.city || 'N/A',
          'Status': s.status,
          'Plan': s.currentPlan || 'None',
          'Created': new Date(s.createdAt).toLocaleDateString(),
        }));
        break;

      case 'users':
        const users = await User.find(dateFilter)
          .select('-password')
          .sort({ createdAt: -1 })
          .lean();

        data = users.map((u: any) => ({
          'User ID': u._id,
          'Name': u.name,
          'Email': u.email,
          'Phone': u.phone || 'N/A',
          'Role': u.role,
          'Status': u.isActive ? 'Active' : 'Inactive',
          'Verified': u.isVerified ? 'Yes' : 'No',
          'Registered': new Date(u.createdAt).toLocaleDateString(),
        }));
        break;

      case 'agents':
        const agents = await User.find({ 
          role: 'agent',
          ...dateFilter 
        })
          .select('-password')
          .lean();

        const agentData = await Promise.all(
          agents.map(async (a: any) => {
            const agentShops = await Shop.countDocuments({ agentId: a._id });
            const agentCommissions = await Commission.aggregate([
              { $match: { agentId: a._id } },
              { $group: { _id: null, total: { $sum: '$agentAmount' } } },
            ]);

            return {
              'Agent ID': a._id,
              'Name': a.name,
              'Email': a.email,
              'Phone': a.phone || 'N/A',
              'Total Shops': agentShops,
              'Total Commission': agentCommissions[0]?.total || 0,
              'Status': a.isActive ? 'Active' : 'Inactive',
              'Joined': new Date(a.createdAt).toLocaleDateString(),
            };
          })
        );
        data = agentData;
        break;

      case 'operators':
        const operators = await User.find({ 
          role: 'operator',
          ...dateFilter 
        })
          .select('-password')
          .lean();

        const operatorData = await Promise.all(
          operators.map(async (o: any) => {
            const operatorCommissions = await Commission.aggregate([
              { $match: { operatorId: o._id } },
              { $group: { _id: null, total: { $sum: '$operatorAmount' } } },
            ]);

            return {
              'Operator ID': o._id,
              'Name': o.name,
              'Email': o.email,
              'Phone': o.phone || 'N/A',
              'Total Commission': operatorCommissions[0]?.total || 0,
              'Status': o.isActive ? 'Active' : 'Inactive',
              'Joined': new Date(o.createdAt).toLocaleDateString(),
            };
          })
        );
        data = operatorData;
        break;

      default:
        return NextResponse.json({ error: 'Invalid report type' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data,
      count: data.length,
    });
  } catch (error: any) {
    console.error('Error generating report:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

