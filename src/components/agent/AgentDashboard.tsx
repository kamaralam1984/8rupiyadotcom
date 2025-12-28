'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  FiPlus,
  FiShoppingBag,
  FiCreditCard,
  FiBarChart2,
  FiSettings,
  FiEye,
} from 'react-icons/fi';
import { FiCalendar, FiDollarSign } from 'react-icons/fi';

interface DashboardStats {
  totalShops: number;
  shopsToday: number;
  shopsThisMonth: number;
  commission: number; // 20% of total earnings
  totalEarnings: number; // Keep for reference
}

interface RecentShop {
  _id: string;
  name: string;
  category: string;
  pincode: string;
  plan: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

interface AgentInfo {
  name: string;
  agentId: string;
}

export default function AgentDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [agent, setAgent] = useState<AgentInfo | null>(null);
  const [recentShops, setRecentShops] = useState<RecentShop[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch('/api/agent/dashboard', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setStats(data.stats);
            setAgent(data.agent);
            setRecentShops(data.recentShops || []);
          } else {
            // Set default values on error
            setStats({
              totalShops: 0,
              shopsToday: 0,
              shopsThisMonth: 0,
              commission: 0,
              totalEarnings: 0,
            });
            setAgent(null);
            setRecentShops([]);
          }
        } else {
          // Set default values on API error
          setStats({
            totalShops: 0,
            shopsToday: 0,
            shopsThisMonth: 0,
            commission: 0,
            totalEarnings: 0,
          });
          setAgent(null);
          setRecentShops([]);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        // Set default values on error
        setStats({
          totalShops: 0,
          shopsToday: 0,
          shopsThisMonth: 0,
          commission: 0,
          totalEarnings: 0,
        });
        setAgent(null);
        setRecentShops([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!stats || !agent) {
    return <div>No data available</div>;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'approved':
        return 'PAID';
      case 'pending':
        return 'PENDING';
      case 'rejected':
        return 'REJECTED';
      default:
        return status.toUpperCase();
    }
  };

  const actionButtons = [
    { icon: FiPlus, label: 'Add New Shop', href: '/agent/shops/new', color: 'bg-blue-600 hover:bg-blue-700' },
    { icon: FiShoppingBag, label: 'My Shops', href: '/agent/shops', color: 'bg-blue-600 hover:bg-blue-700' },
    { icon: FiCreditCard, label: 'Payments', href: '/agent/payments', color: 'bg-blue-600 hover:bg-blue-700' },
    { icon: FiSettings, label: 'Settings', href: '/agent/settings', color: 'bg-blue-600 hover:bg-blue-700' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      {agent && (
        <div className="bg-blue-600 text-white rounded-lg p-6 shadow-lg">
          <h1 className="text-2xl font-bold mb-1">Welcome, {agent.name}</h1>
          <p className="text-blue-100">Agent ID: {agent.agentId}</p>
        </div>
      )}

      {/* Key Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Shops Today</p>
                <p className="text-2xl font-bold text-gray-900">{stats.shopsToday || 0}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <FiBarChart2 className="text-blue-600 text-xl" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">This Month</p>
                <p className="text-2xl font-bold text-gray-900">{stats.shopsThisMonth || 0}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <FiCalendar className="text-blue-600 text-xl" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Shops</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalShops || 0}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <FiShoppingBag className="text-blue-600 text-xl" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Commission</p>
                <p className="text-2xl font-bold text-gray-900">₹{(stats.commission || 0).toLocaleString('en-IN')}</p>
                <p className="text-xs text-gray-500 mt-1">20% of Total Earnings</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <FiDollarSign className="text-blue-600 text-xl" />
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Action Buttons Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {actionButtons.map((button, index) => (
          <Link key={index} href={button.href}>
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`w-full ${button.color} text-white rounded-lg p-6 shadow-md hover:shadow-lg transition-all flex flex-col items-center gap-3`}
            >
              <button.icon className="text-3xl" />
              <span className="font-medium text-sm">{button.label}</span>
            </motion.button>
          </Link>
        ))}
      </div>

      {/* Recent Shops Table */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Recent Shops</h2>
          <Link href="/agent/shops" className="text-blue-600 hover:text-blue-800 font-medium text-sm">
            View All
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Shop Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Pincode
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Plan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {recentShops.map((shop) => (
                <motion.tr
                  key={shop._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold text-sm">
                          {shop.name.substring(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <span className="font-medium text-gray-900">{shop.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">{shop.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">{shop.pincode}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700 font-medium">{shop.plan}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                        shop.status
                      )}`}
                    >
                      {getStatusLabel(shop.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link
                      href={`/agent/shops/${shop._id}`}
                      className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                    >
                      View Details
                    </Link>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {recentShops.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No shops found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
