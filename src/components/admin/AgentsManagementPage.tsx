'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FiSearch,
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiDollarSign,
  FiShoppingBag,
  FiCheckCircle,
  FiXCircle,
  FiRefreshCw,
  FiEye,
} from 'react-icons/fi';

interface Agent {
  _id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  isActive: boolean;
  shops: number;
  totalRevenue: number;
  commission: number;
  createdAt: string;
}

export default function AgentsManagementPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    search: '',
    status: '',
    city: '',
  });
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    totalShops: 0,
    totalRevenue: 0,
    totalCommission: 0,
  });

  useEffect(() => {
    fetchAgents();
  }, [filter.search, filter.status]);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch('/api/admin/agents/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        let agentsList = data.agents || [];
        
        // Apply filters
        if (filter.search) {
          const searchLower = filter.search.toLowerCase();
          agentsList = agentsList.filter((agent: Agent) =>
            agent.name.toLowerCase().includes(searchLower) ||
            agent.email.toLowerCase().includes(searchLower) ||
            agent.phone?.includes(filter.search)
          );
        }
        
        if (filter.status === 'active') {
          agentsList = agentsList.filter((agent: Agent) => agent.isActive);
        } else if (filter.status === 'inactive') {
          agentsList = agentsList.filter((agent: Agent) => !agent.isActive);
        }
        
        // Map the data to match the component's interface
        const mappedAgents = agentsList.map((agent: any) => ({
          _id: agent._id,
          name: agent.name,
          email: agent.email,
          phone: agent.phone || '',
          city: 'India', // Can be enhanced if city data is available
          isActive: agent.isActive,
          shops: agent.shops || 0,
          totalRevenue: agent.totalEarnings || 0,
          commission: agent.earnings || 0,
          createdAt: agent.createdAt,
        }));
        
        setAgents(mappedAgents);
        
        // Calculate stats
        const total = agentsList.length;
        const active = agentsList.filter((a: any) => a.isActive).length;
        const inactive = total - active;
        const totalShops = agentsList.reduce((sum: number, a: any) => sum + (a.shops || 0), 0);
        const totalRevenue = agentsList.reduce((sum: number, a: any) => sum + (a.totalEarnings || 0), 0);
        const totalCommission = agentsList.reduce((sum: number, a: any) => sum + (a.earnings || 0), 0);
        
        setStats({
          total,
          active,
          inactive,
          totalShops,
          totalRevenue,
          totalCommission,
        });
      }
    } catch (error) {
      console.error('Error fetching agents:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    // Stats are now fetched together with agents in fetchAgents
    return;
  };

  const toggleAgentStatus = async (agentId: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/users/${agentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (response.ok) {
        await fetchAgents();
        alert(`Agent ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
      } else {
        alert('Failed to update agent status');
      }
    } catch (error) {
      console.error('Error toggling agent status:', error);
      alert('Error updating agent status');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Agents Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage all agents and their performance</p>
        </div>
        <button
          onClick={fetchAgents}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
        >
          <FiRefreshCw className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
        {[
          { label: 'Total Agents', value: stats.total, icon: FiUser, color: 'blue' },
          { label: 'Active', value: stats.active, icon: FiCheckCircle, color: 'green' },
          { label: 'Inactive', value: stats.inactive, icon: FiXCircle, color: 'red' },
          { label: 'Total Shops', value: stats.totalShops, icon: FiShoppingBag, color: 'purple' },
          { label: 'Total Revenue', value: `₹${stats.totalRevenue.toLocaleString()}`, icon: FiDollarSign, color: 'yellow' },
          { label: 'Total Commission', value: `₹${stats.totalCommission.toLocaleString()}`, icon: FiDollarSign, color: 'green' },
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

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search agents..."
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
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <button
            onClick={() => setFilter({ search: '', status: '', city: '' })}
            className="px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Agents Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Agent Details
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Performance
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
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-4 border-purple-600 border-t-transparent"></div>
                    </div>
                  </td>
                </tr>
              ) : agents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    No agents found
                  </td>
                </tr>
              ) : (
                agents.map((agent) => (
                  <motion.tr
                    key={agent._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                          <FiUser className="text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">{agent.name}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            <FiMapPin className="text-xs" />
                            {agent.city || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-2">
                          <FiMail className="text-xs" />
                          {agent.email}
                        </div>
                        {agent.phone && (
                          <div className="flex items-center gap-2">
                            <FiPhone className="text-xs" />
                            {agent.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2">
                          <FiShoppingBag className="text-gray-400" />
                          <span className="text-gray-900 dark:text-white font-medium">{agent.shops || 0} shops</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FiDollarSign className="text-gray-400" />
                          <span className="text-gray-900 dark:text-white font-medium">₹{(agent.totalRevenue || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FiDollarSign className="text-green-600" />
                          <span className="text-green-600 font-medium">₹{(agent.commission || 0).toLocaleString()}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 text-xs font-medium rounded-full ${
                          agent.isActive
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                        }`}
                      >
                        {agent.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleAgentStatus(agent._id, agent.isActive)}
                          className={`p-2 rounded-lg transition-colors ${
                            agent.isActive
                              ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30'
                              : 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30'
                          }`}
                          title={agent.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {agent.isActive ? <FiXCircle /> : <FiCheckCircle />}
                        </button>
                        <button
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <FiEye />
                        </button>
                      </div>
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



