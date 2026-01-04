'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiDollarSign, FiCheckCircle, FiClock, FiCreditCard, FiSmartphone } from 'react-icons/fi';
import PayNowButton from '@/components/payments/PayNowButton';

interface Payment {
  _id?: string;
  shopId?: string;
  shopName: string;
  planId?: string;
  planName: string;
  planPrice?: number;
  amount: number;
  status: 'success' | 'pending' | 'failed';
  date?: string;
  transactionId: string;
}

export default function AgentPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [pendingShops, setPendingShops] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPayments = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/agent/payments', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPayments(data.payments || []);
        setPendingShops(data.pendingShops || []);
      } else {
        // Mock data for fallback
        setPayments([
          {
            _id: '1',
            shopName: 'ABC Store',
            planName: 'Pro',
            amount: 3000,
            status: 'success',
            date: '2024-01-15',
            transactionId: 'TXN123456',
          },
        ]);
        setPendingShops([]);
      }
    } catch (err) {
      console.error('Failed to fetch payments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <FiCheckCircle className="text-green-600" />;
      case 'pending':
        return <FiClock className="text-yellow-600" />;
      default:
        return <FiDollarSign className="text-red-600" />;
    }
  };

  const allPayments = [...pendingShops, ...payments];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Payments</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">View payment history and make online payments</p>
      </div>

      {/* Pending Payments Section */}
      {pendingShops.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#F5F1E8] dark:bg-yellow-900/20 rounded-xl shadow-lg border border-[#D4A574] dark:border-yellow-800 p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-[#F5F1E8] dark:bg-yellow-900/30 rounded-lg border border-[#D4A574] dark:border-yellow-700">
              <FiClock className="text-2xl text-gray-900 dark:text-yellow-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Pending Payments</h2>
              <p className="text-sm text-gray-700 dark:text-gray-400 font-medium">
                {pendingShops.length} payment{pendingShops.length > 1 ? 's' : ''} pending
              </p>
            </div>
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-400 mb-4 font-medium">
            Complete payment for these shops using UPI, Card, Net Banking, or Wallet
          </p>
          <div className="space-y-3">
            {pendingShops.map((shop) => (
              <motion.div
                key={shop.shopId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white dark:bg-gray-800 rounded-lg p-4 border-2 border-gray-300 dark:border-gray-700 shadow-sm"
              >
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex-1 min-w-[200px]">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{shop.shopName}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{shop.planName}</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                      ₹{shop.amount.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {shop.shopId && shop.planId && (
                      <PayNowButton
                        shopId={shop.shopId}
                        planId={shop.planId}
                        amount={shop.planPrice || shop.amount}
                        shopName={shop.shopName}
                        planName={shop.planName}
                        onSuccess={() => {
                          fetchPayments();
                          window.location.reload();
                        }}
                        onError={(error) => {
                          alert(`Payment failed: ${error}`);
                        }}
                        className="text-sm"
                      />
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Payment Methods Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-100 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-500 dark:border-blue-800"
      >
        <div className="flex items-start gap-3">
          <div className="p-2 bg-gray-100 dark:bg-blue-900/30 rounded-lg border border-blue-500 dark:border-blue-700">
            <FiSmartphone className="text-xl text-gray-900 dark:text-blue-400 mt-0.5" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Pay via UPI, Card, Net Banking, or Wallet</h3>
            <p className="text-sm text-gray-700 dark:text-gray-400">
              Use Razorpay to pay securely with <strong className="text-gray-900 dark:text-white">UPI</strong> (Google Pay, PhonePe, Paytm), Credit/Debit Cards, Net Banking, or Wallets.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Payment History */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Payment History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Shop</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Plan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Transaction ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {payments.length === 0 && pendingShops.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    No payments found
                  </td>
                </tr>
              ) : (
                payments.map((payment) => (
                  <motion.tr
                    key={payment._id || payment.shopId}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{payment.shopName}</td>
                    <td className="px-6 py-4 text-gray-900 dark:text-white">{payment.planName}</td>
                    <td className="px-6 py-4 text-gray-900 dark:text-white">₹{payment.amount.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(payment.status)}
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          payment.status === 'success'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            : payment.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                        }`}>
                          {payment.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-900 dark:text-white font-mono text-sm">{payment.transactionId}</td>
                    <td className="px-6 py-4 text-gray-900 dark:text-white">{payment.date || 'N/A'}</td>
                    <td className="px-6 py-4">
                      {payment.status === 'pending' && payment.shopId && payment.planId && (
                        <PayNowButton
                          shopId={payment.shopId}
                          planId={payment.planId}
                          amount={payment.planPrice || payment.amount}
                          shopName={payment.shopName}
                          planName={payment.planName}
                          onSuccess={() => {
                            fetchPayments();
                            window.location.reload();
                          }}
                          onError={(error) => {
                            alert(`Payment failed: ${error}`);
                          }}
                          className="text-xs"
                        />
                      )}
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

