'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiDollarSign, FiCheck, FiX } from 'react-icons/fi';

interface Withdrawal {
  _id: string;
  userName: string;
  amount: number;
  accountNumber: string;
  bankName: string;
  status: string;
  createdAt: string;
}

export default function WithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setWithdrawals([
        {
          _id: '1',
          userName: 'Rahul Sharma',
          amount: 5000,
          accountNumber: '****1234',
          bankName: 'SBI',
          status: 'pending',
          createdAt: '2024-01-15',
        },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Withdraw Requests</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Approve or reject withdrawal requests</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Bank Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {withdrawals.map((withdrawal) => (
                <motion.tr
                  key={withdrawal._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                    {withdrawal.userName}
                  </td>
                  <td className="px-6 py-4 text-gray-900 dark:text-white font-semibold">
                    ₹{withdrawal.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-gray-900 dark:text-white">
                    <div>
                      <p className="text-sm">{withdrawal.bankName}</p>
                      <p className="text-xs text-gray-500">{withdrawal.accountNumber}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        withdrawal.status === 'approved'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                          : withdrawal.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                      }`}
                    >
                      {withdrawal.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {withdrawal.status === 'pending' && (
                      <div className="flex gap-2">
                        <button className="text-green-600 hover:text-green-800 dark:text-green-400 flex items-center gap-1">
                          <FiCheck />
                          Approve
                        </button>
                        <button className="text-red-600 hover:text-red-800 dark:text-red-400 flex items-center gap-1">
                          <FiX />
                          Reject
                        </button>
                      </div>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

