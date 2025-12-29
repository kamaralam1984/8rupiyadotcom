'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  FiShoppingBag,
  FiDollarSign,
  FiUsers,
  FiTrendingUp,
  FiEye,
  FiMail,
  FiPhone,
} from 'react-icons/fi';

interface DashboardStats {
  totalShops: number;
  activeShops: number;
  totalRevenue: number;
  todaySales: number;
  totalOperatorCommission: number;
  totalAgents: number;
}

interface Agent {
  _id: string;
  name: string;
  email: string;
  phone: string;
  totalShops: number;
  activeShops: number;
  totalRevenue: number;
  agentCommission: number;
  agentCommissionPercent: number;
  remainingAfterAgent: number;
  operatorCommission: number;
  operatorCommissionPercent: number;
  createdAt: string;
}

interface Operator {
  name: string;
  email: string;
  operatorId: string;
}

export default function OperatorDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [operator, setOperator] = useState<Operator | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    fetchDashboardData(token);
  }, [router]);

  const fetchDashboardData = async (token: string) => {
    try {
      const response = await fetch('/api/operator/dashboard', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setStats(data.stats);
          setAgents(data.agents || []);
          setOperator(data.operator);
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { icon: FiShoppingBag, label: 'Total Shops', value: stats?.totalShops || 0, color: 'from-blue-500 to-blue-600' },
    { icon: FiShoppingBag, label: 'Active Shops', value: stats?.activeShops || 0, color: 'from-green-500 to-emerald-600' },
    { icon: FiDollarSign, label: 'Total Revenue', value: `₹${(stats?.totalRevenue || 0).toLocaleString()}`, color: 'from-purple-500 to-pink-600' },
    { icon: FiTrendingUp, label: 'Today Sales', value: `₹${(stats?.todaySales || 0).toLocaleString()}`, color: 'from-teal-500 to-cyan-600' },
    { icon: FiUsers, label: 'Total Agents', value: stats?.totalAgents || 0, color: 'from-orange-500 to-red-600' },
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
      {/* Welcome Banner */}
      <div className="bg-green-600 text-white rounded-lg p-6 shadow-lg">
        <h1 className="text-2xl font-bold mb-1">Welcome, {operator?.name || 'Operator'}</h1>
        <p className="text-green-100">Operator ID: {operator?.operatorId || 'N/A'}</p>
      </div>

      {/* Commission Highlight Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-xl p-8 text-white"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-green-100 text-sm mb-2">Total Operator Commission</p>
            <p className="text-4xl font-bold mb-1">
              ₹{(stats?.totalOperatorCommission || 0).toLocaleString()}
            </p>
            <p className="text-green-100 text-sm">10% of remaining after agent commission</p>
          </div>
          <div className="p-6 bg-white/20 rounded-xl backdrop-blur-sm">
            <FiDollarSign className="text-white text-4xl" />
          </div>
        </div>
      </motion.div>

      {/* Key Statistics */}
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

      {/* Agents Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Agents ({agents.length})</h2>
        
        {agents.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <FiUsers className="text-4xl mx-auto mb-2 opacity-50" />
            <p>No agents found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Agent Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Contact</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Total Shops</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Active Shops</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Total Revenue</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Agent Commission (20%)</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">My Commission (10%)</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {agents.map((agent) => (
                  <motion.tr
                    key={agent._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <td className="px-4 py-4">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{agent.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{agent.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1 text-sm text-gray-900 dark:text-white">
                        <FiPhone className="text-gray-400" />
                        {agent.phone}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{agent.totalShops}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm font-medium text-green-600 dark:text-green-400">{agent.activeShops}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">₹{agent.totalRevenue.toLocaleString()}</span>
                    </td>
                    <td className="px-4 py-4">
                      <div>
                        <span className="text-sm font-medium text-blue-600 dark:text-blue-400">₹{agent.agentCommission.toLocaleString()}</span>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{agent.agentCommissionPercent}%</p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div>
                        <span className="text-sm font-medium text-green-600 dark:text-green-400">₹{agent.operatorCommission.toLocaleString()}</span>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{agent.operatorCommissionPercent}% of remaining</p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <button
                        onClick={() => setSelectedAgent(agent._id)}
                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                        title="View Full Report"
                      >
                        <FiEye />
                      </button>
                    </td>
                  </motion.tr>
          ))}
              </tbody>
            </table>
        </div>
        )}
      </div>

      {/* Agent Report Modal */}
      {selectedAgent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Agent Full Report</h3>
                <button
                  onClick={() => setSelectedAgent(null)}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-6">
              {(() => {
                const agent = agents.find(a => a._id === selectedAgent);
                if (!agent) return null;
                return (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Agent Name</p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">{agent.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">{agent.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">{agent.phone}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Total Shops</p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">{agent.totalShops}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Active Shops</p>
                        <p className="text-lg font-semibold text-green-600 dark:text-green-400">{agent.activeShops}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Total Revenue</p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">₹{agent.totalRevenue.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Agent Commission ({agent.agentCommissionPercent}%)</p>
                        <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">₹{agent.agentCommission.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Remaining After Agent</p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">₹{agent.remainingAfterAgent.toLocaleString()}</p>
          </div>
            <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Your Commission ({agent.operatorCommissionPercent}% of remaining)</p>
                        <p className="text-lg font-semibold text-green-600 dark:text-green-400">₹{agent.operatorCommission.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
