'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  FiPlus,
  FiShoppingBag,
  FiDollarSign,
  FiCheckCircle,
  FiClock,
  FiXCircle,
} from 'react-icons/fi';
import { useRouter } from 'next/navigation';

interface DashboardStats {
  totalShops: number;
  activeShops: number;
  pendingShops: number;
  totalRevenue: number;
}

interface RecentShop {
  _id: string;
  name: string;
  category: string;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  createdAt: string;
}

export default function ShopperDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentShops, setRecentShops] = useState<RecentShop[]>([]);
  const [loading, setLoading] = useState(true);
  const [shopper, setShopper] = useState({ name: 'Shopper', email: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }

        // Fetch shopper info
        const userResponse = await fetch('/api/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (userResponse.ok) {
          const userData = await userResponse.json();
          if (userData.success && userData.user) {
            setShopper({ name: userData.user.name, email: userData.user.email });
          }
        }

        // Fetch dashboard stats
        const response = await fetch('/api/shopper/dashboard', {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setStats(data.stats);
            setRecentShops(data.recentShops || []);
          } else {
            setStats({
              totalShops: 0,
              activeShops: 0,
              pendingShops: 0,
              totalRevenue: 0,
            });
            setRecentShops([]);
          }
        } else {
          setStats({
            totalShops: 0,
            activeShops: 0,
            pendingShops: 0,
            totalRevenue: 0,
          });
          setRecentShops([]);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setStats({
          totalShops: 0,
          activeShops: 0,
          pendingShops: 0,
          totalRevenue: 0,
        });
        setRecentShops([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
            Approved
          </span>
        );
      case 'pending':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
            Pending
          </span>
        );
      case 'rejected':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
            Rejected
          </span>
        );
      case 'expired':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
            Expired
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
            {status}
          </span>
        );
    }
  };

  const statCards = [
    {
      label: 'Total Shops',
      value: stats?.totalShops || 0,
      icon: FiShoppingBag,
      color: 'from-blue-500 to-blue-600',
    },
    {
      label: 'Active Shops',
      value: stats?.activeShops || 0,
      icon: FiCheckCircle,
      color: 'from-green-500 to-emerald-600',
    },
    {
      label: 'Pending Shops',
      value: stats?.pendingShops || 0,
      icon: FiClock,
      color: 'from-yellow-500 to-orange-600',
    },
    {
      label: 'Total Revenue',
      value: `₹${(stats?.totalRevenue || 0).toLocaleString()}`,
      icon: FiDollarSign,
      color: 'from-purple-500 to-pink-600',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg p-6 shadow-lg">
        <h1 className="text-2xl font-bold mb-1">Welcome, {shopper.name}</h1>
        <p className="text-green-100">Manage your shops and track your business</p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/shopper/shops/new"
            className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:shadow-lg transition-all"
          >
            <FiPlus className="text-2xl" />
            <div>
              <p className="font-semibold">Add New Shop</p>
              <p className="text-sm text-green-100">Create a new shop listing</p>
            </div>
          </Link>
          <Link
            href="/shopper/shops"
            className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:shadow-lg transition-all"
          >
            <FiShoppingBag className="text-2xl" />
            <div>
              <p className="font-semibold">View All Shops</p>
              <p className="text-sm text-blue-100">Manage your shop listings</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Shops */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Recent Shops</h2>
        
        {recentShops.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <FiShoppingBag className="text-4xl mx-auto mb-2 opacity-50" />
            <p>No shops yet. Add your first shop to get started!</p>
            <Link
              href="/shopper/shops/new"
              className="mt-4 inline-block px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Add Shop
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Shop Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Created</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {recentShops.map((shop) => (
                  <motion.tr
                    key={shop._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <td className="px-4 py-4">
                      <p className="font-medium text-gray-900 dark:text-white">{shop.name}</p>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{shop.category}</span>
                    </td>
                    <td className="px-4 py-4">
                      {getStatusBadge(shop.status)}
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(shop.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

