'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  FiUser,
  FiShoppingBag,
  FiHeart,
  FiSettings,
  FiMapPin,
  FiSearch,
} from 'react-icons/fi';

interface DashboardStats {
  savedShops: number;
  recentSearches: number;
  visitedShops: number;
}

export default function UserDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState({ name: 'User', email: 'user@example.com' });

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    // Fetch user data
    fetch('/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user) {
          setUser({ name: data.user.name, email: data.user.email });
        }
      })
      .catch((err) => console.error('Error fetching user:', err));

    // Fetch dashboard stats (mock data for now)
    setTimeout(() => {
      setStats({
        savedShops: 12,
        recentSearches: 8,
        visitedShops: 45,
      });
      setLoading(false);
    }, 1000);
  }, [router]);

  const statCards = [
    { icon: FiHeart, label: 'Saved Shops', value: stats?.savedShops || 0, color: 'from-red-500 to-pink-600' },
    { icon: FiSearch, label: 'Recent Searches', value: stats?.recentSearches || 0, color: 'from-blue-500 to-blue-600' },
    { icon: FiShoppingBag, label: 'Visited Shops', value: stats?.visitedShops || 0, color: 'from-green-500 to-emerald-600' },
  ];

  const actionButtons = [
    { icon: FiSearch, label: 'Search Shops', href: '/', color: 'bg-blue-600 hover:bg-blue-700' },
    { icon: FiMapPin, label: 'Nearby Shops', href: '/', color: 'bg-green-600 hover:bg-green-700' },
    { icon: FiHeart, label: 'Saved Shops', href: '/user/saved', color: 'bg-red-600 hover:bg-red-700' },
    { icon: FiUser, label: 'Profile', href: '/user/profile', color: 'bg-purple-600 hover:bg-purple-700' },
    { icon: FiSettings, label: 'Settings', href: '/user/settings', color: 'bg-gray-600 hover:bg-gray-700' },
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
      <div className="bg-blue-600 text-white rounded-lg p-6 shadow-lg">
        <h1 className="text-2xl font-bold mb-1">Welcome, {user.name}</h1>
        <p className="text-blue-100">{user.email}</p>
      </div>

      {/* Key Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              <p className="font-medium text-gray-900 dark:text-white">Shop saved</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">ABC Store - 2 hours ago</p>
            </div>
            <FiHeart className="text-gray-400" />
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Search performed</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Grocery stores - 5 hours ago</p>
            </div>
            <FiSearch className="text-gray-400" />
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Shop visited</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">XYZ Shop - 1 day ago</p>
            </div>
            <FiShoppingBag className="text-gray-400" />
          </div>
        </div>
      </div>
    </div>
  );
}

