import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Payment from '@/models/Payment';
import Shop from '@/models/Shop';
import Commission from '@/models/Commission';
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
    if (!payload || payload.role !== UserRole.OPERATOR) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await connectDB();

    const operator = await User.findById(payload.userId);
    if (!operator) {
      return NextResponse.json({ error: 'Operator not found' }, { status: 404 });
    }

    // Get approved agents for this operator
    const AgentRequest = (await import('@/models/AgentRequest')).default;
    const RequestStatus = (await import('@/models/AgentRequest')).RequestStatus;
    
    const approvedRequests = await AgentRequest.find({
      operatorId: operator._id,
      status: RequestStatus.APPROVED
    });
    
    const approvedAgentIds = approvedRequests.map(req => req.agentId.toString());
    let allAgentIds = new Set(approvedAgentIds);
    if (operator.agentId) {
      allAgentIds.add(operator.agentId.toString());
    }
    
    const mongoose = await import('mongoose');
    const agentObjectIds = Array.from(allAgentIds).map(id => new mongoose.Types.ObjectId(id));
    
    // Get operator's shops (including shops where operatorId matches OR operatorId is null but agentId matches approved agents)
    const shopQuery: any = {
      $or: [
        { operatorId: operator._id }
      ]
    };
    
    if (agentObjectIds.length > 0) {
      shopQuery.$or.push({
        agentId: { $in: agentObjectIds },
        $or: [
          { operatorId: { $exists: false } },
          { operatorId: null }
        ]
      });
    }
    
    const operatorShops = await Shop.find(shopQuery).select('_id');
    const shopIds = operatorShops.map(shop => shop._id);

    // Get payments for operator's shops
    const payments = await Payment.find({ shopId: { $in: shopIds } })
      .populate('shopId', 'name planId agentId')
      .populate('planId', 'name price')
      .sort({ createdAt: -1 });

    // Create a map of commissions by paymentId for faster lookup
    const allCommissions = await Commission.find({
      $or: [
        { operatorId: operator._id },
        { shopId: { $in: shopIds } }
      ]
    });
    
    const commissionByPaymentId = new Map();
    allCommissions.forEach(c => {
      const paymentIdStr = c.paymentId.toString();
      if (!commissionByPaymentId.has(paymentIdStr)) {
        commissionByPaymentId.set(paymentIdStr, []);
      }
      commissionByPaymentId.get(paymentIdStr).push(c);
    });

    // Map payments with commission info
    const paymentsWithCommission = await Promise.all(
      payments.map(async (payment) => {
        const paymentId = payment._id;
        const paymentIdStr = paymentId.toString();
        const shopIdObj = (payment.shopId as any)?._id || (payment.shopId as any) || payment.shopId;
        const shopId = shopIdObj?.toString() || shopIdObj;
        
        // Get shop info
        const shopAgentId = (payment.shopId as any)?.agentId?.toString() || null;
        const shopOperatorId = (payment.shopId as any)?.operatorId?.toString() || null;
        
        // Find commission from map
        const commissions = commissionByPaymentId.get(paymentIdStr) || [];
        let commission = null;
        
        // First, try to find commission with matching operatorId
        commission = commissions.find((c: any) => 
          c.operatorId?.toString() === operator._id.toString()
        );
        
        // If not found, try to find commission for this shop (even without operatorId)
        if (!commission && shopId) {
          commission = commissions.find((c: any) => 
            c.shopId?.toString() === shopId
          );
        }
        
        // If still not found, use first commission for this payment
        if (!commission && commissions.length > 0) {
          commission = commissions[0];
        }
        
        // Use commission from database if found and valid
        let operatorCommission = 0;
        let agentCommission = 0;
        
        if (commission) {
          // Verify this commission belongs to this operator
          const commOperatorId = commission.operatorId?.toString();
          const commShopId = commission.shopId?.toString();
          
          // Check if commission belongs to this operator
          const belongsToOperator = 
            commOperatorId === operator._id.toString() ||
            (shopOperatorId === operator._id.toString()) ||
            (shopAgentId && agentObjectIds.some(id => id.toString() === shopAgentId));
          
          if (belongsToOperator) {
            operatorCommission = commission.operatorAmount || 0;
            agentCommission = commission.agentAmount || 0;
          }
        }
        
        // If no commission found or payment is successful but commission is 0, calculate on the fly
        if (payment.status === 'success' && operatorCommission === 0) {
          // Get shop details if needed
          let finalAgentId = shopAgentId;
          let finalOperatorId = shopOperatorId;
          
          if (!finalAgentId && !finalOperatorId && shopId) {
            const shop = await Shop.findById(shopId);
            if (shop) {
              finalAgentId = shop.agentId?.toString() || null;
              finalOperatorId = shop.operatorId?.toString() || null;
            }
          }
          
          // Check if this shop belongs to an approved agent or this operator
          if (finalAgentId) {
            const isApprovedAgent = agentObjectIds.some(id => id.toString() === finalAgentId);
            const isOperatorShop = finalOperatorId === operator._id.toString();
            
            if (isApprovedAgent || isOperatorShop) {
              // Calculate commission: Agent 20%, Operator 10% of remaining
              agentCommission = payment.amount * 0.20;
              const remainingAfterAgent = payment.amount - agentCommission;
              operatorCommission = remainingAfterAgent * 0.10;
            }
          } else if (finalOperatorId === operator._id.toString()) {
            // Shop directly belongs to operator (no agent)
            // Operator gets 10% of total
            operatorCommission = payment.amount * 0.10;
          }
        }
        
        return {
          _id: payment._id.toString(),
          shopName: (payment.shopId as any)?.name || 'N/A',
          shopId: shopId,
          planName: (payment.planId as any)?.name || 'N/A',
          planPrice: (payment.planId as any)?.price || 0,
          amount: payment.amount,
          status: payment.status === 'success' ? 'success' : payment.status === 'pending' ? 'pending' : 'failed',
          paymentMode: (payment.shopId as any)?.paymentMode || 'online',
          operatorCommission: Math.round(operatorCommission * 100) / 100,
          agentCommission: Math.round(agentCommission * 100) / 100,
          date: payment.paidAt || payment.createdAt,
          transactionId: payment.razorpayOrderId || payment.razorpayPaymentId || payment._id.toString(),
        };
      })
    );

    // Calculate total commission from payments (including calculated ones)
    const totalCommissionFromPayments = paymentsWithCommission
      .filter(p => p.status === 'success')
      .reduce((sum, p) => sum + p.operatorCommission, 0);
    
    // Use the calculated value from payments (it includes both DB and calculated commissions)
    const totalCommission = totalCommissionFromPayments;

    return NextResponse.json({
      success: true,
      payments: paymentsWithCommission,
      totalCommission,
    });
  } catch (error: any) {
    console.error('Operator payments error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

