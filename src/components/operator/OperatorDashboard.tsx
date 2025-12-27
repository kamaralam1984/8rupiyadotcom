'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  FiShoppingBag,
  FiClock,
  FiDollarSign,
  FiUsers,
  FiTrendingUp,
  FiPlus,
  FiSettings,
} from 'react-icons/fi';

interface DashboardStats {
  totalShops: number;
  activeShops: number;
  totalRevenue: number;
  todaySales: number;
}

export default function OperatorDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [operator, setOperator] = useState({ name: 'Operator', operatorId: 'OP001' });

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    // Fetch operator data
    fetch('/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user) {
          setOperator({ name: data.user.name, operatorId: data.user.id });
        }
      })
      .catch((err) => console.error('Error fetching operator:', err));

    // Fetch dashboard stats (mock data for now)
    setTimeout(() => {
      setStats({
        totalShops: 45,
        activeShops: 38,
        totalRevenue: 125000,
        todaySales: 3500,
      });
      setLoading(false);
    }, 1000);
  }, [router]);

  const statCards = [
    { icon: FiShoppingBag, label: 'Total Shops', value: stats?.totalShops || 0, color: 'from-blue-500 to-blue-600' },
    { icon: FiShoppingBag, label: 'Active Shops', value: stats?.activeShops || 0, color: 'from-green-500 to-emerald-600' },
    { icon: FiDollarSign, label: 'Total Revenue', value: `₹${(stats?.totalRevenue || 0).toLocaleString()}`, color: 'from-purple-500 to-pink-600' },
    { icon: FiTrendingUp, label: 'Today Sales', value: `₹${(stats?.todaySales || 0).toLocaleString()}`, color: 'from-teal-500 to-cyan-600' },
  ];

  const actionButtons = [
    { icon: FiShoppingBag, label: 'Manage Shops', href: '/operator/shops', color: 'bg-blue-600 hover:bg-blue-700' },
    { icon: FiUsers, label: 'Shoppers', href: '/operator/shoppers', color: 'bg-green-600 hover:bg-green-700' },
    { icon: FiDollarSign, label: 'Payments', href: '/operator/payments', color: 'bg-purple-600 hover:bg-purple-700' },
    { icon: FiSettings, label: 'Settings', href: '/operator/settings', color: 'bg-gray-600 hover:bg-gray-700' },
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
      <div className="bg-green-600 text-white rounded-lg p-6 shadow-lg">
        <h1 className="text-2xl font-bold mb-1">Welcome, {operator.name}</h1>
        <p className="text-green-100">Operator ID: {operator.operatorId}</p>
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
              <p className="font-medium text-gray-900 dark:text-white">New shop added</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">2 hours ago</p>
            </div>
            <FiClock className="text-gray-400" />
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Payment received</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">5 hours ago</p>
            </div>
            <FiDollarSign className="text-gray-400" />
          </div>
        </div>
      </div>
    </div>
  );
}

