import Razorpay from 'razorpay';

const razorpayKeyId = process.env.RAZORPAY_KEY_ID || '';
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET || '';

export const razorpay = new Razorpay({
  key_id: razorpayKeyId,
  key_secret: razorpayKeySecret,
});

export interface CreateOrderParams {
  amount: number; // in paise
  currency?: string;
  receipt?: string;
  notes?: Record<string, string>;
}

export async function createRazorpayOrder(params: CreateOrderParams) {
  const options = {
    amount: params.amount,
    currency: params.currency || 'INR',
    receipt: params.receipt,
    notes: params.notes || {},
  };

  return await razorpay.orders.create(options);
}

export function verifyPaymentSignature(orderId: string, paymentId: string, signature: string): boolean {
  const crypto = require('crypto');
  const generatedSignature = crypto
    .createHmac('sha256', razorpayKeySecret)
    .update(orderId + '|' + paymentId)
    .digest('hex');

  return generatedSignature === signature;
}

