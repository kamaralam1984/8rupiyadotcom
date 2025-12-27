'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiEdit, FiTrash2, FiUser, FiMail, FiPhone } from 'react-icons/fi';

interface Operator {
  _id: string;
  name: string;
  email: string;
  phone: string;
  shops: number;
  isActive: boolean;
  createdAt: string;
}

export default function AgentOperatorsPage() {
  const [operators, setOperators] = useState<Operator[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    // Fetch operators
    const fetchOperators = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch('/api/agent/operators', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setOperators(data.operators || []);
        } else {
          // Mock data
          setOperators([
            {
              _id: '1',
              name: 'John Doe',
              email: 'john@example.com',
              phone: '+91 9876543210',
              shops: 5,
              isActive: true,
              createdAt: '2024-01-10',
            },
            {
              _id: '2',
              name: 'Jane Smith',
              email: 'jane@example.com',
              phone: '+91 9876543211',
              shops: 3,
              isActive: true,
              createdAt: '2024-01-12',
            },
          ]);
        }
      } catch (err) {
        console.error('Failed to fetch operators:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOperators();
  }, []);

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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Operators</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your operators</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all"
        >
          <FiPlus />
          Add Operator
        </button>
      </div>

      {/* Operators Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {operators.map((operator) => (
          <motion.div
            key={operator._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                  {operator.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{operator.name}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    operator.isActive
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                  }`}>
                    {operator.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <FiMail />
                <span>{operator.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <FiPhone />
                <span>{operator.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <FiUser />
                <span>{operator.shops} shops</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button className="flex-1 px-4 py-2 text-sm bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors flex items-center justify-center gap-2">
                <FiEdit />
                Edit
              </button>
              <button className="px-4 py-2 text-sm bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
                <FiTrash2 />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {operators.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400">No operators found</p>
        </div>
      )}
    </div>
  );
}

