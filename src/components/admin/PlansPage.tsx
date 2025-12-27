'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiEdit, FiCheck, FiX, FiPlus, FiRefreshCw } from 'react-icons/fi';

interface Plan {
  _id: string;
  name: string;
  price: number;
  expiryDays: number;
  rank: string;
  homepageVisibility: boolean;
}

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login again');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/plans', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        setPlans(data.plans || []);
      } else {
        setError(data.error || 'Failed to fetch plans');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch plans');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleInitializePlans = async () => {
    setInitializing(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login again');
        setInitializing(false);
        return;
      }

      // Try admin endpoint first
      let response = await fetch('/api/admin/plans/init', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      // If admin endpoint fails, try public endpoint
      if (!response.ok) {
        response = await fetch('/api/plans/init', {
          method: 'POST',
        });
      }

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(data.message || 'Plans initialized successfully');
        // Refresh plans list
        fetchPlans();
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error || 'Failed to initialize plans');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setInitializing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Plans Manager</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage subscription plans</p>
        </div>
        <button
          onClick={handleInitializePlans}
          disabled={initializing}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <FiRefreshCw className={initializing ? 'animate-spin' : ''} />
          {initializing ? 'Initializing...' : 'Initialize Plans'}
        </button>
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Plan Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Days</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Rank</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Homepage</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {plans.map((plan) => (
                <motion.tr
                  key={plan._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{plan.name}</td>
                  <td className="px-6 py-4 text-gray-900 dark:text-white">₹{plan.price.toLocaleString()}</td>
                  <td className="px-6 py-4 text-gray-900 dark:text-white">{plan.expiryDays}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      plan.rank === 'VIP' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' :
                      plan.rank === 'Top' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                      plan.rank === 'High' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                      plan.rank === 'Mid' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {plan.rank}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {plan.homepageVisibility ? (
                      <FiCheck className="text-green-600 text-xl" />
                    ) : (
                      <FiX className="text-gray-400 text-xl" />
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-blue-600 hover:text-blue-800 dark:text-blue-400 flex items-center gap-1">
                      <FiEdit />
                      Edit
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

