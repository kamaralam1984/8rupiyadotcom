'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  FiDollarSign,
  FiTrendingUp,
  FiClock,
  FiFileText,
  FiDownload,
  FiRefreshCw,
  FiSettings,
  FiUsers,
} from 'react-icons/fi';

interface DashboardStats {
  totalPayments: number;
  pendingWithdrawals: number;
  totalRevenue: number;
  todayPayments: number;
}

export default function AccountantDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [accountant, setAccountant] = useState({ name: 'Accountant', email: 'accountant@8rupiya.com' });

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    // Fetch accountant data
    fetch('/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user) {
          setAccountant({ name: data.user.name, email: data.user.email });
        }
      })
      .catch((err) => console.error('Error fetching accountant:', err));

    // Fetch dashboard stats (mock data for now)
    setTimeout(() => {
      setStats({
        totalPayments: 1250000,
        pendingWithdrawals: 45000,
        totalRevenue: 2500000,
        todayPayments: 12500,
      });
      setLoading(false);
    }, 1000);
  }, [router]);

  const statCards = [
    { icon: FiDollarSign, label: 'Total Payments', value: `₹${(stats?.totalPayments || 0).toLocaleString()}`, color: 'from-blue-500 to-blue-600' },
    { icon: FiClock, label: 'Pending Withdrawals', value: `₹${(stats?.pendingWithdrawals || 0).toLocaleString()}`, color: 'from-yellow-500 to-orange-600' },
    { icon: FiTrendingUp, label: 'Total Revenue', value: `₹${(stats?.totalRevenue || 0).toLocaleString()}`, color: 'from-green-500 to-emerald-600' },
    { icon: FiDollarSign, label: 'Today Payments', value: `₹${(stats?.todayPayments || 0).toLocaleString()}`, color: 'from-purple-500 to-pink-600' },
  ];

  const actionButtons = [
    { icon: FiDollarSign, label: 'Payments', href: '/accountant/payments', color: 'bg-blue-600 hover:bg-blue-700' },
    { icon: FiRefreshCw, label: 'Withdrawals', href: '/accountant/withdrawals', color: 'bg-yellow-600 hover:bg-yellow-700' },
    { icon: FiFileText, label: 'Reports', href: '/accountant/reports', color: 'bg-green-600 hover:bg-green-700' },
    { icon: FiDownload, label: 'Export Data', href: '/accountant/export', color: 'bg-purple-600 hover:bg-purple-700' },
    { icon: FiUsers, label: 'Agents', href: '/accountant/agents', color: 'bg-indigo-600 hover:bg-indigo-700' },
    { icon: FiSettings, label: 'Settings', href: '/accountant/settings', color: 'bg-gray-600 hover:bg-gray-700' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-indigo-600 text-white rounded-lg p-6 shadow-lg">
        <h1 className="text-2xl font-bold mb-1">Welcome, {accountant.name}</h1>
        <p className="text-indigo-100">{accountant.email}</p>
      </div>

      {/* Key Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02, y: -5 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{stat.label}</p>
                <p className={`text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                  {stat.value}
                </p>
              </div>
              <div className={`p-4 rounded-xl bg-gradient-to-r ${stat.color} shadow-lg`}>
                <stat.icon className="text-white text-2xl" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {actionButtons.map((action, index) => (
            <motion.button
              key={index}
              onClick={() => router.push(action.href)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`${action.color} text-white p-4 rounded-lg flex flex-col items-center justify-center space-y-2 transition-all shadow-md hover:shadow-lg`}
            >
              <action.icon className="text-2xl" />
              <span className="text-sm font-medium">{action.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Recent Activity</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Payment processed</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">₹5,000 - 2 hours ago</p>
            </div>
            <FiDollarSign className="text-gray-400" />
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Withdrawal request received</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">₹10,000 - 5 hours ago</p>
            </div>
            <FiRefreshCw className="text-gray-400" />
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Report generated</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Monthly report - 1 day ago</p>
            </div>
            <FiFileText className="text-gray-400" />
          </div>
        </div>
      </div>
    </div>
  );
}

