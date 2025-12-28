'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiDollarSign, FiUser } from 'react-icons/fi';

interface Commission {
  _id: string;
  agentName: string;
  operatorName?: string;
  shopName: string;
  agentAmount: number;
  operatorAmount: number;
  companyAmount: number;
  totalAmount: number;
  status: string;
  createdAt: string;
}

export default function CommissionsPage() {
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setCommissions([
        {
          _id: '1',
          agentName: 'Rahul Sharma',
          operatorName: 'Amit Kumar',
          shopName: 'ABC Store',
          agentAmount: 600,
          operatorAmount: 240,
          companyAmount: 2160,
          totalAmount: 3000,
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Commissions</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">View and manage commission payouts</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Shop
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Agent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Operator
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Agent Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Operator Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Company Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {commissions.map((comm) => (
                <motion.tr
                  key={comm._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                    {comm.shopName}
                  </td>
                  <td className="px-6 py-4 text-gray-900 dark:text-white">{comm.agentName}</td>
                  <td className="px-6 py-4 text-gray-900 dark:text-white">
                    {comm.operatorName || 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-green-600 dark:text-green-400 font-semibold">
                    ₹{comm.agentAmount}
                  </td>
                  <td className="px-6 py-4 text-blue-600 dark:text-blue-400 font-semibold">
                    ₹{comm.operatorAmount}
                  </td>
                  <td className="px-6 py-4 text-purple-600 dark:text-purple-400 font-semibold">
                    ₹{comm.companyAmount}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        comm.status === 'paid'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                      }`}
                    >
                      {comm.status}
                    </span>
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

