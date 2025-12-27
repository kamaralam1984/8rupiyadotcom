import Commission from '@/models/Commission';
import Payment from '@/models/Payment';
import Shop from '@/models/Shop';

export interface CommissionBreakdown {
  agentAmount: number;
  operatorAmount: number;
  companyAmount: number;
  totalAmount: number;
}

export function calculateCommission(paymentAmount: number, agentId?: string, operatorId?: string): CommissionBreakdown {
  const totalAmount = paymentAmount;
  
  // Agent gets 20%
  const agentAmount = agentId ? totalAmount * 0.2 : 0;
  
  // Remaining after agent
  const remaining = totalAmount - agentAmount;
  
  // Operator gets 10% of remaining (80%)
  const operatorAmount = operatorId ? remaining * 0.1 : 0;
  
  // Company gets the rest
  const companyAmount = totalAmount - agentAmount - operatorAmount;

  return {
    agentAmount: Math.round(agentAmount * 100) / 100,
    operatorAmount: Math.round(operatorAmount * 100) / 100,
    companyAmount: Math.round(companyAmount * 100) / 100,
    totalAmount,
  };
}

export async function createCommission(paymentId: string, shopId: string): Promise<void> {
  const payment = await Payment.findById(paymentId).populate('shopId');
  if (!payment) throw new Error('Payment not found');

  const shop = await Shop.findById(shopId);
  if (!shop) throw new Error('Shop not found');

  const breakdown = calculateCommission(payment.amount, shop.agentId?.toString(), shop.operatorId?.toString());

  await Commission.create({
    paymentId: payment._id,
    shopId: shop._id,
    agentId: shop.agentId,
    operatorId: shop.operatorId,
    ...breakdown,
    status: 'pending',
  });
}

