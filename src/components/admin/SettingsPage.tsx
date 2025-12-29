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
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage and configure settings</p>
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
