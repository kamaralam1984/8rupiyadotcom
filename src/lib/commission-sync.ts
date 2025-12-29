import connectDB from '@/lib/mongodb';
import Payment from '@/models/Payment';
import Commission from '@/models/Commission';
import Shop from '@/models/Shop';
import { createCommission, calculateCommission } from '@/lib/commission';

/**
 * Syncs and calculates all commissions for payments
 * This function ensures all successful payments have proper commission records
 */
export async function syncAllCommissions(): Promise<{
  created: number;
  updated: number;
  errors: number;
}> {
  try {
    await connectDB();

    let created = 0;
    let updated = 0;
    let errors = 0;

    // Get all successful payments
    const successfulPayments = await Payment.find({ status: 'success' });

    for (const payment of successfulPayments) {
      try {
        // Check if commission already exists
        const existingCommission = await Commission.findOne({ paymentId: payment._id });

        if (existingCommission) {
          // Commission exists, check if it needs updating
          const shop = await Shop.findById(payment.shopId);
          if (!shop) {
            errors++;
            continue;
          }

          // Check if operatorId is missing but should be set
          let operatorId = shop.operatorId;
          
          if (!operatorId && shop.agentId) {
            // Try to find approved operator for this agent
            const AgentRequest = (await import('@/models/AgentRequest')).default;
            const RequestStatus = (await import('@/models/AgentRequest')).RequestStatus;
            const approvedRequest = await AgentRequest.findOne({
              agentId: shop.agentId,
              status: RequestStatus.APPROVED
            }).sort({ createdAt: 1 });
            
            if (approvedRequest) {
              operatorId = approvedRequest.operatorId;
              // Update shop to set operatorId for future queries
              shop.operatorId = operatorId;
              await shop.save();
            }
          }

          // Recalculate commission if operatorId was found or if amounts are 0
          if (operatorId && (!existingCommission.operatorId || existingCommission.operatorAmount === 0)) {
            const breakdown = calculateCommission(
              payment.amount,
              shop.agentId?.toString(),
              operatorId.toString()
            );

            existingCommission.operatorId = operatorId;
            existingCommission.agentAmount = breakdown.agentAmount;
            existingCommission.operatorAmount = breakdown.operatorAmount;
            existingCommission.companyAmount = breakdown.companyAmount;
            await existingCommission.save();
            updated++;
          } else if (!existingCommission.operatorId && operatorId) {
            // Just update operatorId if missing
            existingCommission.operatorId = operatorId;
            const breakdown = calculateCommission(
              payment.amount,
              shop.agentId?.toString(),
              operatorId.toString()
            );
            existingCommission.operatorAmount = breakdown.operatorAmount;
            existingCommission.companyAmount = breakdown.companyAmount;
            await existingCommission.save();
            updated++;
          }
        } else {
          // Commission doesn't exist, create it
          try {
            await createCommission(payment._id.toString(), payment.shopId.toString());
            created++;
          } catch (createError: any) {
            console.error(`Error creating commission for payment ${payment._id}:`, createError.message);
            errors++;
          }
        }
      } catch (error: any) {
        console.error(`Error processing payment ${payment._id}:`, error.message);
        errors++;
      }
    }

    return { created, updated, errors };
  } catch (error: any) {
    console.error('Error syncing commissions:', error);
    throw error;
  }
}

/**
 * Syncs commissions for a specific user (agent/operator)
 * This is called on login to ensure their commissions are up to date
 */
export async function syncUserCommissions(userId: string, userRole: string): Promise<void> {
  try {
    await connectDB();

    const User = (await import('@/models/User')).default;
    const user = await User.findById(userId);
    if (!user) return;

    // Get shops related to this user
    let shopQuery: any = {};
    
    if (userRole === 'agent' || user.role === 'agent') {
      shopQuery.agentId = userId;
    } else if (userRole === 'operator' || user.role === 'operator') {
      // Get approved agents for this operator
      const AgentRequest = (await import('@/models/AgentRequest')).default;
      const RequestStatus = (await import('@/models/AgentRequest')).RequestStatus;
      const approvedRequests = await AgentRequest.find({
        operatorId: userId,
        status: RequestStatus.APPROVED
      });
      const agentIds = approvedRequests.map(req => req.agentId);
      
      shopQuery = {
        $or: [
          { operatorId: userId },
          { agentId: { $in: agentIds } }
        ]
      };
    } else if (userRole === 'admin' || user.role === 'admin') {
      // Admin: sync all commissions
      await syncAllCommissions();
      return;
    } else {
      // Shopper or other roles: no commission sync needed
      return;
    }

    // Get shops for this user
    const shops = await Shop.find(shopQuery);
    const shopIds = shops.map(s => s._id);

    if (shopIds.length === 0) return;

    // Get payments for these shops
    const payments = await Payment.find({
      shopId: { $in: shopIds },
      status: 'success'
    });

    // Sync commissions for these payments
    for (const payment of payments) {
      try {
        const existingCommission = await Commission.findOne({ paymentId: payment._id });
        
        if (!existingCommission) {
          // Create commission if it doesn't exist
          await createCommission(payment._id.toString(), payment.shopId.toString());
        } else {
          // Update commission if operatorId is missing
          const shop = await Shop.findById(payment.shopId);
          if (shop && !existingCommission.operatorId && shop.agentId) {
            let operatorId = shop.operatorId;
            
            if (!operatorId) {
              const AgentRequest = (await import('@/models/AgentRequest')).default;
              const RequestStatus = (await import('@/models/AgentRequest')).RequestStatus;
              const approvedRequest = await AgentRequest.findOne({
                agentId: shop.agentId,
                status: RequestStatus.APPROVED
              }).sort({ createdAt: 1 });
              
              if (approvedRequest) {
                operatorId = approvedRequest.operatorId;
                shop.operatorId = operatorId;
                await shop.save();
              }
            }

            if (operatorId) {
              const breakdown = calculateCommission(
                payment.amount,
                shop.agentId?.toString(),
                operatorId.toString()
              );
              
              existingCommission.operatorId = operatorId;
              existingCommission.operatorAmount = breakdown.operatorAmount;
              existingCommission.companyAmount = breakdown.companyAmount;
              await existingCommission.save();
            }
          }
        }
      } catch (error: any) {
        console.error(`Error syncing commission for payment ${payment._id}:`, error.message);
      }
    }
  } catch (error: any) {
    console.error('Error syncing user commissions:', error);
    // Don't throw error, just log it so login doesn't fail
  }
}

