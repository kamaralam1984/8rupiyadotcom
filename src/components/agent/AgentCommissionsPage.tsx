'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiDollarSign, FiDownload, FiFilter } from 'react-icons/fi';

interface Commission {
  _id: string;
  shopName: string;
  planName: string;
  amount: number;
  status: 'pending' | 'paid';
  date: string;
}

export default function AgentCommissionsPage() {
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCommission, setTotalCommission] = useState(0);
  const [paidCommission, setPaidCommission] = useState(0);
  const [pendingCommission, setPendingCommission] = useState(0);

  useEffect(() => {
    // Fetch commissions
    const fetchCommissions = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch('/api/agent/commissions', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setCommissions(data.commissions || []);
          setTotalCommission(data.total || 0);
          setPaidCommission(data.paid || 0);
          setPendingCommission(data.pending || 0);
        } else {
          // Mock data
          const mockCommissions: Commission[] = [
            {
              _id: '1',
              shopName: 'ABC Store',
              planName: 'Pro',
              amount: 5000,
              status: 'paid' as const,
              date: '2024-01-15',
            },
            {
              _id: '2',
              shopName: 'XYZ Shop',
              planName: 'Basic',
              amount: 2000,
              status: 'pending' as const,
              date: '2024-01-16',
            },
          ];
          setCommissions(mockCommissions);
          setTotalCommission(7000);
          setPaidCommission(5000);
          setPendingCommission(2000);
        }
      } catch (err) {
        console.error('Failed to fetch commissions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCommissions();
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
        <p className="text-gray-600 dark:text-gray-400 mt-1">Track your commission earnings</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Total Commission</p>
              <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                ₹{totalCommission.toLocaleString()}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg">
              <FiDollarSign className="text-white text-2xl" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Paid</p>
              <p className="text-3xl font-bold bg-gradient-to-r from-green-500 to-green-600 bg-clip-text text-transparent">
                ₹{paidCommission.toLocaleString()}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-r from-green-500 to-green-600 shadow-lg">
              <FiDollarSign className="text-white text-2xl" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Pending</p>
              <p className="text-3xl font-bold bg-gradient-to-r from-yellow-500 to-yellow-600 bg-clip-text text-transparent">
                ₹{pendingCommission.toLocaleString()}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-r from-yellow-500 to-yellow-600 shadow-lg">
              <FiDollarSign className="text-white text-2xl" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Commissions Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Commission History</h3>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
            <FiDownload />
            Export
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Shop</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Plan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {commissions.map((commission) => (
                <motion.tr
                  key={commission._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{commission.shopName}</td>
                  <td className="px-6 py-4 text-gray-900 dark:text-white">{commission.planName}</td>
                  <td className="px-6 py-4 text-gray-900 dark:text-white">₹{commission.amount.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      commission.status === 'paid'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                    }`}>
                      {commission.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-900 dark:text-white">{commission.date}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

