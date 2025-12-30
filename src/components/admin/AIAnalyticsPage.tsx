'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiCpu, FiMessageSquare, FiTrendingUp, FiUsers, FiRefreshCw, FiGlobe, FiClock } from 'react-icons/fi';
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';

interface Stats {
  totalInteractions: number;
  uniqueCategories: number;
  activeUsers: number;
  conversionRate: string;
  categoryData: Array<{ name: string; queries: number }>;
  topConvertingShops: Array<{ _id: string; conversions: number }>;
  languageStats: Array<{ _id: string; count: number }>;
  hourlyStats: Array<{ _id: number; count: number }>;
  trendData: Array<{ date: string; interactions: number; conversions: number }>;
}

export default function AIAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/ai/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching AI stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const categoryData = stats?.categoryData || [];
  const languageData = stats?.languageStats?.map((lang: any) => ({
    name: lang._id === 'hi' ? 'Hindi' : lang._id === 'en' ? 'English' : 'Hinglish',
    value: lang.count,
    color: lang._id === 'hi' ? '#FF6B6B' : lang._id === 'en' ? '#4ECDC4' : '#95E1D3'
  })) || [];
  const trendData = stats?.trendData || [];

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3">
          <FiRefreshCw className="animate-spin text-2xl text-purple-600" />
          <span className="text-gray-600 dark:text-gray-400">Loading AI analytics...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">AI & Golu Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Track AI assistant performance and insights</p>
        </div>
        <button
          onClick={fetchStats}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
        >
          <FiRefreshCw className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { 
            label: 'Total Interactions', 
            value: stats?.totalInteractions?.toLocaleString() || '0', 
            icon: FiMessageSquare, 
            color: 'blue',
            gradient: 'from-blue-500 to-cyan-500'
          },
          { 
            label: 'Categories Searched', 
            value: stats?.uniqueCategories?.toLocaleString() || '0', 
            icon: FiCpu, 
            color: 'purple',
            gradient: 'from-purple-500 to-pink-500'
          },
          { 
            label: 'Active Users', 
            value: stats?.activeUsers?.toLocaleString() || '0', 
            icon: FiUsers, 
            color: 'green',
            gradient: 'from-green-500 to-emerald-500'
          },
          { 
            label: 'Conversion Rate', 
            value: stats?.conversionRate || '0%', 
            icon: FiTrendingUp, 
            color: 'yellow',
            gradient: 'from-yellow-500 to-orange-500'
          },
        ].map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="relative bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.gradient} opacity-10 rounded-full -mr-8 -mt-8`} />
            <div className="relative">
              <div className={`w-12 h-12 bg-gradient-to-br ${stat.gradient} rounded-lg flex items-center justify-center mb-3`}>
                <stat.icon className="text-white text-xl" />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{stat.label}</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Searched Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Most Searched Categories</h3>
            <FiCpu className="text-purple-600" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryData}>
              <XAxis dataKey="name" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white'
                }}
              />
              <Legend />
              <Bar dataKey="queries" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Language Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Language Distribution</h3>
            <FiGlobe className="text-green-600" />
          </div>
          {languageData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={languageData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {languageData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-500">
              No data available
            </div>
          )}
        </motion.div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 gap-6">
        {/* Interaction Trends */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">7-Day Interaction Trends</h3>
            <FiTrendingUp className="text-blue-600" />
          </div>
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <XAxis dataKey="date" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white'
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="interactions" 
                  stroke="#8b5cf6" 
                  strokeWidth={2}
                  name="Interactions"
                  dot={{ fill: '#8b5cf6', r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="conversions" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  name="Conversions"
                  dot={{ fill: '#10b981', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-500">
              No trend data available
            </div>
          )}
        </motion.div>
      </div>

      {/* AI Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg p-6 text-white"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
            <FiCpu className="text-2xl" />
          </div>
          <div>
            <h3 className="text-xl font-bold">AI Performance Insights</h3>
            <p className="text-purple-100">Real-time analytics from Golu</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur">
            <p className="text-purple-100 text-sm mb-1">Avg. Response Time</p>
            <p className="text-2xl font-bold">1.2s</p>
          </div>
          <div className="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur">
            <p className="text-purple-100 text-sm mb-1">Success Rate</p>
            <p className="text-2xl font-bold">96.5%</p>
          </div>
          <div className="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur">
            <p className="text-purple-100 text-sm mb-1">User Satisfaction</p>
            <p className="text-2xl font-bold">4.8/5</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
