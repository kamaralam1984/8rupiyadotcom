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
          // First, try to find approved AgentRequest for this agent
          const approvedRequest = await AgentRequest.findOne({
            agentId: shop.agentId,
            status: RequestStatus.APPROVED
          }).sort({ createdAt: 1 });
          
          if (approvedRequest) {
            operatorId = approvedRequest.operatorId;
            // Update shop with operatorId
            shop.operatorId = operatorId;
            await shop.save();
            console.log(`Updated shop ${shop._id} with operatorId ${operatorId} from AgentRequest`);
          } else {
            // If no AgentRequest, check if agent has any approved operator
            // This handles cases where agent was added directly without request
            const anyApprovedRequest = await AgentRequest.findOne({
              agentId: shop.agentId,
              status: RequestStatus.APPROVED
            });
            
            if (anyApprovedRequest) {
              operatorId = anyApprovedRequest.operatorId;
              shop.operatorId = operatorId;
              await shop.save();
              console.log(`Updated shop ${shop._id} with operatorId ${operatorId} from any AgentRequest`);
            }
          }
        }
        
        // Also check if commission exists but operatorId is missing
        if (commission && !commission.operatorId && operatorId) {
          commission.operatorId = operatorId;
          // Recalculate operator commission
          const breakdown = calculateCommission(
            payment.amount,
            shop.agentId?.toString(),
            operatorId.toString()
          );
          commission.operatorAmount = breakdown.operatorAmount;
          commission.companyAmount = breakdown.companyAmount;
          await commission.save();
          console.log(`Updated existing commission ${commission._id} with operatorId ${operatorId}`);
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

          // If operatorId is missing but we found one, update it
          if (!commission.operatorId && operatorId) {
            commission.operatorId = operatorId;
            needsUpdate = true;
            console.log(`Found missing operatorId for commission ${commission._id}, setting to ${operatorId}`);
          }

          // If operatorAmount is 0 but operatorId exists, recalculate
          if (commission.operatorAmount === 0 && (operatorId || commission.operatorId)) {
            const finalOperatorId = operatorId || commission.operatorId;
            const recalculatedBreakdown = calculateCommission(
              payment.amount,
              shop.agentId?.toString(),
              finalOperatorId?.toString()
            );
            commission.operatorAmount = recalculatedBreakdown.operatorAmount;
            commission.companyAmount = recalculatedBreakdown.companyAmount;
            needsUpdate = true;
            console.log(`Recalculated operator commission for ${commission._id}: ${recalculatedBreakdown.operatorAmount}`);
          }

          // If agentAmount is 0 but agentId exists, recalculate
          if (commission.agentAmount === 0 && shop.agentId) {
            commission.agentAmount = breakdown.agentAmount;
            needsUpdate = true;
          }

          // If companyAmount is 0, recalculate
          if (commission.companyAmount === 0) {
            const finalOperatorId = operatorId || commission.operatorId;
            const recalculatedBreakdown = calculateCommission(
              payment.amount,
              shop.agentId?.toString(),
              finalOperatorId?.toString()
            );
            commission.companyAmount = recalculatedBreakdown.companyAmount;
            needsUpdate = true;
          }

          // Also check if operatorId was set but operatorAmount is still 0
          if (commission.operatorId && commission.operatorAmount === 0) {
            const recalculatedBreakdown = calculateCommission(
              payment.amount,
              shop.agentId?.toString(),
              commission.operatorId.toString()
            );
            commission.operatorAmount = recalculatedBreakdown.operatorAmount;
            commission.companyAmount = recalculatedBreakdown.companyAmount;
            needsUpdate = true;
            console.log(`Fixed zero operatorAmount for commission ${commission._id} with operatorId ${commission.operatorId}`);
          }

          if (needsUpdate) {
            await commission.save();
            updated++;
            console.log(`Updated commission for payment ${payment._id}: Agent: ₹${commission.agentAmount}, Operator: ₹${commission.operatorAmount}`);
          }
        }
      } catch (error: any) {
        console.error(`Error processing payment ${payment._id}:`, error);
        errors++;
      }
    }

    // Post-processing: Fix all commissions that have operatorId but operatorAmount is 0
    console.log('\n=== Post-processing: Fixing commissions with operatorId but zero operatorAmount ===');
    const commissionsToFix = await Commission.find({
      operatorId: { $exists: true, $ne: null },
      operatorAmount: 0
    }).populate('paymentId').populate('shopId');

    let fixedCommissions = 0;
    for (const comm of commissionsToFix) {
      try {
        const payment = comm.paymentId as any;
        const shop = comm.shopId as any;
        
        if (payment && shop && payment.amount) {
          const breakdown = calculateCommission(
            payment.amount,
            shop.agentId?.toString(),
            comm.operatorId?.toString()
          );
          
          comm.operatorAmount = breakdown.operatorAmount;
          comm.companyAmount = breakdown.companyAmount;
          await comm.save();
          fixedCommissions++;
          console.log(`Fixed commission ${comm._id}: Operator: ₹${breakdown.operatorAmount}`);
        }
      } catch (error: any) {
        console.error(`Error fixing commission ${comm._id}:`, error.message);
      }
    }

    // Also fix commissions where shop has operatorId but commission doesn't
    console.log('\n=== Post-processing: Fixing commissions missing operatorId from shop ===');
    const shopsWithOperators = await Shop.find({
      operatorId: { $exists: true, $ne: null }
    }).select('_id operatorId agentId');

    let fixedFromShop = 0;
    for (const shop of shopsWithOperators) {
      const commissionsForShop = await Commission.find({
        shopId: shop._id,
        $or: [
          { operatorId: { $exists: false } },
          { operatorId: null },
          { operatorAmount: 0 }
        ]
      }).populate('paymentId');

      for (const comm of commissionsForShop) {
        try {
          const payment = comm.paymentId as any;
          if (payment && payment.amount) {
            if (!comm.operatorId) {
              comm.operatorId = shop.operatorId;
            }
            
            const breakdown = calculateCommission(
              payment.amount,
              shop.agentId?.toString(),
              shop.operatorId?.toString()
            );
            
            comm.operatorAmount = breakdown.operatorAmount;
            comm.companyAmount = breakdown.companyAmount;
            await comm.save();
            fixedFromShop++;
            console.log(`Fixed commission ${comm._id} from shop ${shop._id}: Operator: ₹${breakdown.operatorAmount}`);
          }
        } catch (error: any) {
          console.error(`Error fixing commission ${comm._id}:`, error.message);
        }
      }
    }

    // Get updated totals
    const operatorTotalResult = await Commission.aggregate([
      { $group: { _id: null, total: { $sum: { $ifNull: ['$operatorAmount', 0] } } } }
    ]);
    const operatorTotal = operatorTotalResult.length > 0 ? operatorTotalResult[0].total : 0;

    const totalFixed = fixedCommissions + fixedFromShop;
    console.log(`\n=== Summary ===`);
    console.log(`Created: ${created}`);
    console.log(`Updated: ${updated}`);
    console.log(`Fixed (post-processing): ${totalFixed}`);
    console.log(`Errors: ${errors}`);
    console.log(`Total Operator Commission: ₹${operatorTotal}`);

    return NextResponse.json({
      success: true,
      message: `Commission sync complete: ${created} created, ${updated} updated, ${totalFixed} fixed, ${errors} errors`,
      stats: {
        totalPayments: successfulPayments.length,
        created,
        updated,
        fixed: totalFixed,
        fixedCommissions,
        fixedFromShop,
        errors,
        operatorTotalCommission: operatorTotal,
      },
    });
  } catch (error: any) {
    console.error('Error syncing commissions:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}



