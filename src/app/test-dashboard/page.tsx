'use client';

import { useState } from 'react';
import { FiZap, FiRefreshCw } from 'react-icons/fi';

export default function TestDashboard() {
  const [syncing, setSyncing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleSync = () => {
    setSyncing(true);
    setTimeout(() => setSyncing(false), 2000);
    alert('Sync Commissions button is working!');
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 2000);
    alert('Refresh button is working!');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Button Test Page
          </h1>
          
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            This page tests if the buttons are working correctly.
          </p>

          {/* Header with Buttons - Same as Admin Dashboard */}
          <div className="flex justify-between items-center p-6 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Dashboard</h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Welcome back! Here's your business overview.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleSync}
                disabled={syncing}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                <FiZap className={syncing ? 'animate-pulse' : ''} />
                {syncing ? 'Syncing...' : 'Sync Commissions'}
              </button>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <FiRefreshCw className={refreshing ? 'animate-spin' : ''} />
                Refresh
              </button>
            </div>
          </div>

          <div className="mt-8 p-6 bg-blue-100 dark:bg-blue-900/20 border border-blue-400 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-400 mb-2">
              ✅ If you can see both buttons above:
            </h3>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-2 ml-4 list-disc">
              <li>Green "Sync Commissions" button on the left</li>
              <li>Blue "Refresh" button on the right</li>
              <li>Click them to test if they work</li>
            </ul>
          </div>

          <div className="mt-6 p-6 bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-400 rounded-lg">
            <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-400 mb-2">
              ⚠️ If buttons are NOT visible:
            </h3>
            <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-2 ml-4 list-disc">
              <li>Press Ctrl+Shift+R to hard refresh</li>
              <li>Clear browser cache</li>
              <li>Try a different browser</li>
              <li>Check browser console (F12) for errors</li>
            </ul>
          </div>

          <div className="mt-6 p-6 bg-green-100 dark:bg-green-900/20 border border-green-400 rounded-lg">
            <h3 className="text-lg font-semibold text-green-800 dark:text-green-400 mb-2">
              📍 Location in Real Dashboard:
            </h3>
            <p className="text-sm text-green-700 dark:text-green-300">
              These buttons should appear at the top-right of the Admin Dashboard page 
              (<code>/admin</code>) in exactly the same position as shown above.
            </p>
          </div>

          <div className="mt-8 text-center">
            <a
              href="/admin"
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
            >
              Go to Real Admin Dashboard →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

