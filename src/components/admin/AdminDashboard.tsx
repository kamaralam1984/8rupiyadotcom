'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  FiShoppingBag,
  FiDollarSign,
  FiUsers,
  FiTrendingUp,
  FiRefreshCw,
  FiZap,
  FiCheckCircle,
  FiClock,
} from 'react-icons/fi';
import {
  AreaChart,
  Area,
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

interface DashboardStats {
  totalShops: number;
  activeShops: number;
  totalRevenue: number;
  agents: number;
  operators: number;
  todaySales: number;
  totalAgentCommission: number;
  totalOperatorCommission: number;
  totalCompanyRevenue: number;
  todayAgentCommission: number;
  todayOperatorCommission: number;
}

interface PendingShop {
  _id: string;
  name: string;
  agentName: string;
  planName: string;
  planPrice: number;
  createdAt: string;
}

interface ChartData {
  monthlyRevenue: Array<{ name: string; revenue: number }>;
  dailyShops: Array<{ name: string; shops: number }>;
  planDistribution: Array<{ name: string; value: number }>;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [pendingShops, setPendingShops] = useState<PendingShop[]>([]);
  const [charts, setCharts] = useState<ChartData>({
    monthlyRevenue: [],
    dailyShops: [],
    planDistribution: [],
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setStats(data.stats);
          setPendingShops(data.pendingShops || []);
          setCharts(data.charts || { monthlyRevenue: [], dailyShops: [], planDistribution: [] });
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const statCards = [
    {
      icon: FiShoppingBag,
      label: 'Total Shops',
      value: stats?.totalShops || 0,
      change: '+12%',
      trend: 'up',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      iconColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      icon: FiCheckCircle,
      label: 'Active Shops',
      value: stats?.activeShops || 0,
      change: '+8%',
      trend: 'up',
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      iconColor: 'text-green-600 dark:text-green-400',
    },
    {
      icon: FiDollarSign,
      label: 'Total Revenue',
      value: `₹${(stats?.totalRevenue || 0).toLocaleString()}`,
      change: `+${stats?.totalRevenue ? Math.round((stats.totalRevenue / 1000) * 0.1) : 0}%`,
      trend: stats?.totalRevenue && stats.totalRevenue > 0 ? 'up' : 'down',
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      iconColor: 'text-purple-600 dark:text-purple-400',
    },
    {
      icon: FiUsers,
      label: 'Total Agents',
      value: stats?.agents || 0,
      change: '+5%',
      trend: 'up',
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      iconColor: 'text-orange-600 dark:text-orange-400',
    },
    {
      icon: FiUsers,
      label: 'Operators',
      value: stats?.operators || 0,
      change: '+3%',
      trend: 'up',
      color: 'from-indigo-500 to-blue-500',
      bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
      iconColor: 'text-indigo-600 dark:text-indigo-400',
    },
    {
      icon: FiTrendingUp,
      label: 'Today Sales',
      value: `₹${(stats?.todaySales || 0).toLocaleString()}`,
      change: '+15%',
      trend: 'up',
      color: 'from-teal-500 to-cyan-500',
      bgColor: 'bg-teal-50 dark:bg-teal-900/20',
      iconColor: 'text-teal-600 dark:text-teal-400',
    },
  ];

  // Commission cards from database
  const commissionCards = [
    {
      icon: FiDollarSign,
      label: 'Total Agent Commission',
      value: `₹${(stats?.totalAgentCommission || 0).toLocaleString()}`,
      change: stats?.todayAgentCommission ? `+₹${stats.todayAgentCommission.toLocaleString()} today` : 'No change',
      trend: 'up',
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      iconColor: 'text-green-600 dark:text-green-400',
    },
    {
      icon: FiDollarSign,
      label: 'Total Operator Commission',
      value: `₹${(stats?.totalOperatorCommission || 0).toLocaleString()}`,
      change: stats?.todayOperatorCommission ? `+₹${stats.todayOperatorCommission.toLocaleString()} today` : 'No change',
      trend: 'up',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      iconColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      icon: FiDollarSign,
      label: 'Company Revenue',
      value: `₹${(stats?.totalCompanyRevenue || 0).toLocaleString()}`,
      change: 'From commissions',
      trend: 'up',
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      iconColor: 'text-purple-600 dark:text-purple-400',
    },
  ];

  const quickActions = [
    {
      icon: FiShoppingBag,
      label: 'Manage Shops',
      description: 'View all shops',
      href: '/admin/shops',
      color: 'from-blue-500 to-blue-600',
    },
    {
      icon: FiUsers,
      label: 'Agents',
      description: 'Manage agents',
      href: '/admin/agents',
      color: 'from-green-500 to-emerald-600',
    },
    {
      icon: FiDollarSign,
      label: 'Payments',
      description: 'View payments',
      href: '/admin/payments',
      color: 'from-purple-500 to-pink-600',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Welcome back! Here's your business overview.</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <FiRefreshCw className={refreshing ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`${stat.bgColor} rounded-xl p-6 border border-gray-200 dark:border-gray-700`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{stat.label}</p>
                <p className={`text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                  {stat.value}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <span className={`text-xs ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.change}
                  </span>
                </div>
              </div>
              <div className={`p-4 rounded-xl bg-gradient-to-r ${stat.color}`}>
                <stat.icon className="text-white text-2xl" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Commission Overview */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <FiDollarSign className="text-green-600 text-xl" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            $ Commission Overview (From Database)
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {commissionCards.map((card, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              className={`${card.bgColor} rounded-xl p-6 border border-gray-200 dark:border-gray-700`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{card.label}</p>
                  <p className={`text-3xl font-bold bg-gradient-to-r ${card.color} bg-clip-text text-transparent`}>
                    {card.value}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{card.change}</p>
                </div>
                <div className={`p-4 rounded-xl bg-gradient-to-r ${card.color}`}>
                  <card.icon className="text-white text-2xl" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
        >
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Revenue Overview</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={charts.monthlyRevenue}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value: number | undefined) => value ? `₹${value.toLocaleString()}` : '₹0'} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#3b82f6"
                fillOpacity={1}
                fill="url(#colorRevenue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* New Shops This Week */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
        >
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">New Shops This Week</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={charts.dailyShops}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="shops" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Plan Distribution */}
      {charts.planDistribution && charts.planDistribution.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
        >
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Plan Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={charts.planDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(props: any) => `${props.name || ''} ${props.percent ? (props.percent * 100).toFixed(0) : 0}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {charts.planDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* Quick Actions */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <FiZap className="text-blue-600 text-xl" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Quick Actions</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickActions.map((action, index) => (
            <Link key={index} href={action.href}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 + index * 0.1 }}
                whileHover={{ scale: 1.02, y: -5 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white mb-1">{action.label}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{action.description}</p>
                  </div>
                  <div className={`p-3 rounded-lg bg-gradient-to-r ${action.color}`}>
                    <action.icon className="text-white text-xl" />
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>

      {/* Pending Shops */}
      {pendingShops.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FiClock className="text-yellow-600 text-xl" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Pending Shops</h2>
            </div>
            <Link
              href="/admin/shops"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              View All
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Shop Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Agent
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Plan
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Price
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {pendingShops.slice(0, 10).map((shop) => (
                  <tr key={shop._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                      {shop.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {shop.agentName}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {shop.planName}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      ₹{shop.planPrice.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {new Date(shop.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
}

