import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Commission from '@/models/Commission';
import Payment from '@/models/Payment';
import Shop from '@/models/Shop';
import AgentRequest, { RequestStatus } from '@/models/AgentRequest';
import { verifyToken } from '@/lib/auth';
import { UserRole } from '@/types/user';
import { calculateCommission } from '@/lib/commission';

export async function POST(req: NextRequest) {
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

    let created = 0;
    let updated = 0;
    let errors = 0;

    // Get all successful payments
    const successfulPayments = await Payment.find({ status: 'success' }).lean();

    console.log(`Found ${successfulPayments.length} successful payments`);

    for (const payment of successfulPayments) {
      try {
        // Check if commission already exists
        let commission = await Commission.findOne({ paymentId: payment._id });

        // Get shop details
        const shop = await Shop.findById(payment.shopId);
        if (!shop) {
          console.log(`Shop not found for payment ${payment._id}`);
          errors++;
          continue;
        }

        // Find operatorId if missing
        let operatorId = shop.operatorId;
        if (!operatorId && shop.agentId) {
          const approvedRequest = await AgentRequest.findOne({
            agentId: shop.agentId,
            status: RequestStatus.APPROVED
          }).sort({ createdAt: 1 });
          
          if (approvedRequest) {
            operatorId = approvedRequest.operatorId;
            // Update shop with operatorId
            shop.operatorId = operatorId;
            await shop.save();
            console.log(`Updated shop ${shop._id} with operatorId ${operatorId}`);
          }
        }

        // Calculate commission breakdown
        const breakdown = calculateCommission(
          payment.amount,
          shop.agentId?.toString(),
          operatorId?.toString()
        );

        if (!commission) {
          // Create new commission
          commission = await Commission.create({
            paymentId: payment._id,
            shopId: shop._id,
            agentId: shop.agentId,
            operatorId: operatorId,
            agentAmount: breakdown.agentAmount,
            operatorAmount: breakdown.operatorAmount,
            companyAmount: breakdown.companyAmount,
            totalAmount: breakdown.totalAmount,
            status: 'pending',
          });
          created++;
          console.log(`Created commission for payment ${payment._id}: Agent: ${breakdown.agentAmount}, Operator: ${breakdown.operatorAmount}`);
        } else {
          // Update existing commission if operatorId or amounts are missing/wrong
          let needsUpdate = false;

          if (!commission.operatorId && operatorId) {
            commission.operatorId = operatorId;
            needsUpdate = true;
          }

          if (commission.operatorAmount === 0 && operatorId) {
            commission.operatorAmount = breakdown.operatorAmount;
            needsUpdate = true;
          }

          if (commission.agentAmount === 0 && shop.agentId) {
            commission.agentAmount = breakdown.agentAmount;
            needsUpdate = true;
          }

          if (commission.companyAmount === 0) {
            commission.companyAmount = breakdown.companyAmount;
            needsUpdate = true;
          }

          if (needsUpdate) {
            await commission.save();
            updated++;
            console.log(`Updated commission for payment ${payment._id}: Agent: ${breakdown.agentAmount}, Operator: ${breakdown.operatorAmount}`);
          }
        }
      } catch (error: any) {
        console.error(`Error processing payment ${payment._id}:`, error);
        errors++;
      }
    }

    // Get updated totals
    const operatorTotalResult = await Commission.aggregate([
      { $group: { _id: null, total: { $sum: { $ifNull: ['$operatorAmount', 0] } } } }
    ]);
    const operatorTotal = operatorTotalResult.length > 0 ? operatorTotalResult[0].total : 0;

    return NextResponse.json({
      success: true,
      message: `Commission sync complete: ${created} created, ${updated} updated, ${errors} errors`,
      stats: {
        totalPayments: successfulPayments.length,
        created,
        updated,
        errors,
        operatorTotalCommission: operatorTotal,
      },
    });
  } catch (error: any) {
    console.error('Error syncing commissions:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

