'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FiDollarSign,
  FiSearch,
  FiDownload,
  FiRefreshCw,
  FiCheckCircle,
  FiClock,
  FiXCircle,
  FiUser,
  FiShoppingBag,
} from 'react-icons/fi';
import { ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip } from 'recharts';

interface Commission {
  _id: string;
  paymentId: {
    _id: string;
    amount: number;
    createdAt: string;
  };
  shopId: {
    name: string;
    category: string;
  };
  agentId: {
    name: string;
    email: string;
  } | null;
  operatorId: {
    name: string;
    email: string;
  } | null;
  agentAmount: number;
  operatorAmount: number;
  companyAmount: number;
  status: 'pending' | 'paid' | 'cancelled';
  createdAt: string;
}

export default function CommissionManagementPage() {
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    search: '',
    status: '',
    agent: '',
    operator: '',
  });
  const [stats, setStats] = useState({
    totalCommissions: 0,
    agentTotal: 0,
    operatorTotal: 0,
    companyTotal: 0,
    pending: 0,
    paid: 0,
  });

  useEffect(() => {
    fetchCommissions();
    fetchStats();
  }, [filter]);

  const fetchCommissions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams();
      
      if (filter.search) queryParams.append('search', filter.search);
      if (filter.status) queryParams.append('status', filter.status);

      const response = await fetch(`/api/admin/commissions?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCommissions(data.commissions || []);
      }
    } catch (error) {
      console.error('Error fetching commissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/commissions/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.stats || stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleExport = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/commissions/export', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `commissions-${new Date().toISOString()}.csv`;
        a.click();
      }
    } catch (error) {
      console.error('Error exporting commissions:', error);
    }
  };

  const handleMarkPaid = async (commissionId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/commissions/${commissionId}/mark-paid`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchCommissions();
        fetchStats();
        alert('Commission marked as paid');
      }
    } catch (error) {
      console.error('Error marking commission as paid:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const pieData = [
    { name: 'Agent Commission', value: stats.agentTotal, color: '#3b82f6' },
    { name: 'Operator Commission', value: stats.operatorTotal, color: '#10b981' },
    { name: 'Company Revenue', value: stats.companyTotal, color: '#8b5cf6' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Commission Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Track and manage all commissions</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              fetchCommissions();
              fetchStats();
            }}
            className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            <FiRefreshCw className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <FiDownload />
            Export Report
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
        {[
          { label: 'Total Commissions', value: `₹${stats.totalCommissions.toLocaleString()}`, icon: FiDollarSign, color: 'purple' },
          { label: 'Agent Total', value: `₹${stats.agentTotal.toLocaleString()}`, icon: FiUser, color: 'blue' },
          { label: 'Operator Total', value: `₹${stats.operatorTotal.toLocaleString()}`, icon: FiUser, color: 'green' },
          { label: 'Company Total', value: `₹${stats.companyTotal.toLocaleString()}`, icon: FiShoppingBag, color: 'purple' },
          { label: 'Pending', value: stats.pending, icon: FiClock, color: 'yellow' },
          { label: 'Paid', value: stats.paid, icon: FiCheckCircle, color: 'green' },
        ].map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-2">
              <stat.icon className={`text-${stat.color}-600 dark:text-${stat.color}-400 text-xl`} />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{stat.label}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Commission Distribution Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Commission Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name}: ₹${entry.value.toLocaleString()}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value: any) => `₹${value.toLocaleString()}`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Commission Breakdown</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                  <FiUser className="text-white text-xl" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">Agent Commission</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">20% of payment</p>
                </div>
              </div>
              <p className="text-2xl font-bold text-blue-600">₹{stats.agentTotal.toLocaleString()}</p>
            </div>

            <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                  <FiUser className="text-white text-xl" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">Operator Commission</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">10% of remaining</p>
                </div>
              </div>
              <p className="text-2xl font-bold text-green-600">₹{stats.operatorTotal.toLocaleString()}</p>
            </div>

            <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                  <FiShoppingBag className="text-white text-xl" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">Company Revenue</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Remaining after commissions</p>
                </div>
              </div>
              <p className="text-2xl font-bold text-purple-600">₹{stats.companyTotal.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by shop or user..."
              value={filter.search}
              onChange={(e) => setFilter({ ...filter, search: e.target.value })}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white"
            />
          </div>

          <select
            value={filter.status}
            onChange={(e) => setFilter({ ...filter, status: e.target.value })}
            className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <button
            onClick={() => setFilter({ search: '', status: '', agent: '', operator: '' })}
            className="px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Commissions Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Payment & Shop
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Agent
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Operator
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Commission Breakdown
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-4 border-purple-600 border-t-transparent"></div>
                    </div>
                  </td>
                </tr>
              ) : commissions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    No commissions found
                  </td>
                </tr>
              ) : (
                commissions.map((commission) => (
                  <motion.tr
                    key={commission._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          ₹{commission.paymentId?.amount?.toLocaleString() || 0}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {commission.shopId?.name || 'N/A'} - {commission.shopId?.category || 'N/A'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          {new Date(commission.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {commission.agentId?.name || 'N/A'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {commission.agentId?.email || ''}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {commission.operatorId?.name || 'N/A'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {commission.operatorId?.email || ''}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Agent:</span>
                          <span className="font-semibold text-blue-600">₹{commission.agentAmount.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Operator:</span>
                          <span className="font-semibold text-green-600">₹{commission.operatorAmount.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Company:</span>
                          <span className="font-semibold text-purple-600">₹{commission.companyAmount.toLocaleString()}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(commission.status)}`}>
                        {commission.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {commission.status === 'pending' && (
                        <button
                          onClick={() => handleMarkPaid(commission._id)}
                          className="flex items-center gap-2 px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <FiCheckCircle />
                          Mark Paid
                        </button>
                      )}
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

