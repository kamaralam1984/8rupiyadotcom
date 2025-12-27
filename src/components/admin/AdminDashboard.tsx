'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FiShoppingBag,
  FiClock,
  FiDollarSign,
  FiUsers,
  FiTrendingUp,
  FiEye,
} from 'react-icons/fi';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import ShopDrawer from './ShopDrawer';

interface DashboardStats {
  totalShops: number;
  activeShops: number;
  totalRevenue: number;
  agents: number;
  operators: number;
  todaySales: number;
}

interface PendingShop {
  _id: string;
  name: string;
  agentName: string;
  planName: string;
  planPrice: number;
  createdAt: string;
}

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [pendingShops, setPendingShops] = useState<PendingShop[]>([]);
  const [selectedShop, setSelectedShop] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [adminExists, setAdminExists] = useState<boolean | null>(null);
  const [initializing, setInitializing] = useState(false);
  const [initMessage, setInitMessage] = useState('');

  useEffect(() => {
    // Check if admin exists
    const checkAdmin = async () => {
      try {
        const response = await fetch('/api/admin/init');
        const data = await response.json();
        setAdminExists(data.exists || false);
      } catch (err) {
        console.error('Error checking admin:', err);
      }
    };
    checkAdmin();

    // Fetch dashboard data
    setTimeout(() => {
      setStats({
        totalShops: 1250,
        activeShops: 980,
        totalRevenue: 1250000,
        agents: 45,
        operators: 120,
        todaySales: 12500,
      });
      setPendingShops([
        { _id: '1', name: 'ABC Store', agentName: 'Rahul', planName: 'Pro', planPrice: 3000, createdAt: '2024-01-15' },
        { _id: '2', name: 'XYZ Shop', agentName: 'Mohit', planName: 'Basic', planPrice: 200, createdAt: '2024-01-16' },
        { _id: '3', name: 'Super Mart', agentName: 'Amit', planName: 'Business', planPrice: 4000, createdAt: '2024-01-17' },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const handleInitAdmin = async () => {
    setInitializing(true);
    setInitMessage('');

    try {
      const response = await fetch('/api/admin/init', {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setInitMessage(`✅ Admin created successfully!\n\nEmail: ${data.credentials.email}\nPassword: ${data.credentials.password}\n\n⚠️ Please change the password after first login.`);
        setAdminExists(true);
      } else {
        setInitMessage(`❌ ${data.error || data.message || 'Failed to create admin'}`);
      }
    } catch (err: any) {
      setInitMessage(`❌ Error: ${err.message || 'Something went wrong'}`);
    } finally {
      setInitializing(false);
    }
  };

  // Chart data
  const revenueData = [
    { name: 'Jan', revenue: 120000 },
    { name: 'Feb', revenue: 150000 },
    { name: 'Mar', revenue: 180000 },
    { name: 'Apr', revenue: 200000 },
    { name: 'May', revenue: 220000 },
    { name: 'Jun', revenue: 250000 },
  ];

  const shopsData = [
    { name: 'Mon', shops: 12 },
    { name: 'Tue', shops: 19 },
    { name: 'Wed', shops: 15 },
    { name: 'Thu', shops: 22 },
    { name: 'Fri', shops: 18 },
    { name: 'Sat', shops: 25 },
    { name: 'Sun', shops: 20 },
  ];

  const planData = [
    { name: 'Starter', value: 150 },
    { name: 'Basic', value: 200 },
    { name: 'Pro', value: 80 },
    { name: 'Business', value: 50 },
    { name: 'Enterprise', value: 30 },
  ];

  const statCards = [
    { icon: FiShoppingBag, label: 'Total Shops', value: stats?.totalShops || 0, color: 'from-blue-500 to-blue-600' },
    { icon: FiShoppingBag, label: 'Active Shops', value: stats?.activeShops || 0, color: 'from-green-500 to-emerald-600' },
    { icon: FiDollarSign, label: 'Total Revenue', value: `₹${(stats?.totalRevenue || 0).toLocaleString()}`, color: 'from-purple-500 to-pink-600' },
    { icon: FiUsers, label: 'Agents', value: stats?.agents || 0, color: 'from-orange-500 to-red-600' },
    { icon: FiUsers, label: 'Operators', value: stats?.operators || 0, color: 'from-indigo-500 to-blue-600' },
    { icon: FiTrendingUp, label: 'Today Sales', value: `₹${(stats?.todaySales || 0).toLocaleString()}`, color: 'from-teal-500 to-cyan-600' },
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
      {/* Admin Initialization Alert */}
      {adminExists === false && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                ⚠️ Admin User Not Found
              </h3>
              <p className="text-yellow-700 dark:text-yellow-300 mb-4">
                No admin user exists in the system. Create a default admin account to access admin features.
              </p>
              <button
                onClick={handleInitAdmin}
                disabled={initializing}
                className="px-6 py-3 bg-yellow-600 text-white rounded-lg font-semibold hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {initializing ? 'Creating Admin...' : 'Create Admin User'}
              </button>
            </div>
          </div>
          {initMessage && (
            <div className={`mt-4 p-4 rounded-lg whitespace-pre-line ${
              initMessage.includes('✅') 
                ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200' 
                : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
            }`}>
              {initMessage}
            </div>
          )}
        </div>
      )}

      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Welcome back! Here's what's happening.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Revenue Graph</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* New Shops Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">New Shops Per Day</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={shopsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="shops" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Plan Distribution */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Plan Distribution</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={planData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {planData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Pending Shops */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Pending Shops (Most Important)</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Review and approve shop listings</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Shop Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Agent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Plan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {pendingShops.map((shop) => (
                <motion.tr
                  key={shop._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {shop.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                    {shop.agentName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                    {shop.planName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                    ₹{shop.planPrice.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                    {shop.createdAt}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => setSelectedShop(shop._id)}
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1"
                    >
                      <FiEye />
                      View
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Shop Drawer */}
      {selectedShop && (
        <ShopDrawer shopId={selectedShop} onClose={() => setSelectedShop(null)} />
      )}
    </div>
  );
}
