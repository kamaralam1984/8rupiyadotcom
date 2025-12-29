'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiCpu, FiMessageSquare, FiTrendingUp, FiUsers, FiRefreshCw } from 'react-icons/fi';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

export default function AIAnalyticsPage() {
  const [loading, setLoading] = useState(false);
  
  const categoryData = [
    { name: 'Restaurant', queries: 450 },
    { name: 'Clothing', queries: 380 },
    { name: 'Electronics', queries: 320 },
    { name: 'Grocery', queries: 290 },
    { name: 'Pharmacy', queries: 210 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">AI & Golu Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Track AI assistant performance and insights</p>
        </div>
        <button
          onClick={() => setLoading(!loading)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg"
        >
          <FiRefreshCw className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Interactions', value: '12,450', icon: FiMessageSquare, color: 'blue' },
          { label: 'Categories Searched', value: '850', icon: FiCpu, color: 'purple' },
          { label: 'Active Users', value: '3,240', icon: FiUsers, color: 'green' },
          { label: 'Conversion Rate', value: '34.5%', icon: FiTrendingUp, color: 'yellow' },
        ].map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
          >
            <stat.icon className={`text-${stat.color}-600 text-xl mb-2`} />
            <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Most Searched Categories</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={categoryData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="queries" fill="#8b5cf6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
