#!/bin/bash

# This script creates placeholder components for all remaining admin pages
# Run this to fix all build errors immediately

echo "Creating remaining admin components..."

# Create AIAnalyticsPage.tsx
cat > src/components/admin/AIAnalyticsPage.tsx << 'COMPONENT'
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
COMPONENT

# Create JyotishAdminPage.tsx
cat > src/components/admin/JyotishAdminPage.tsx << 'COMPONENT'
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiRefreshCw } from 'react-icons/fi';

export default function JyotishAdminPage() {
  const [loading, setLoading] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Jyotish Admin</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage and configure Jyotish settings</p>
        </div>
        <button
          onClick={() => setLoading(!loading)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          <FiRefreshCw className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <p className="text-gray-600 dark:text-gray-400">
          Jyotish Admin page is ready. Features will be implemented soon.
        </p>
      </div>
    </div>
  );
}
COMPONENT

# Create ReportsPage.tsx
cat > src/components/admin/ReportsPage.tsx << 'COMPONENT'
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiRefreshCw } from 'react-icons/fi';

export default function ReportsPage() {
  const [loading, setLoading] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reports</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">View and manage system reports</p>
        </div>
        <button
          onClick={() => setLoading(!loading)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          <FiRefreshCw className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <p className="text-gray-600 dark:text-gray-400">
          Reports page is ready. Features will be implemented soon.
        </p>
      </div>
    </div>
  );
}
COMPONENT

# Create DatabasePage.tsx
cat > src/components/admin/DatabasePage.tsx << 'COMPONENT'
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiRefreshCw } from 'react-icons/fi';

export default function DatabasePage() {
  const [loading, setLoading] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Database</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage database operations</p>
        </div>
        <button
          onClick={() => setLoading(!loading)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          <FiRefreshCw className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <p className="text-gray-600 dark:text-gray-400">
          Database page is ready. Features will be implemented soon.
        </p>
      </div>
    </div>
  );
}
COMPONENT

# Create SettingsPage.tsx
cat > src/components/admin/SettingsPage.tsx << 'COMPONENT'
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiRefreshCw } from 'react-icons/fi';

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage and configure system settings</p>
        </div>
        <button
          onClick={() => setLoading(!loading)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          <FiRefreshCw className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <p className="text-gray-600 dark:text-gray-400">
          Settings page is ready. Features will be implemented soon.
        </p>
      </div>
    </div>
  );
}
COMPONENT

echo "✅ All components created successfully!"
echo "Run: npm run dev to start the server"
