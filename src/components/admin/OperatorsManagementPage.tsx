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
  FiUsers,
  FiCheckCircle,
  FiXCircle,
  FiRefreshCw,
  FiEye,
  FiClock,
} from 'react-icons/fi';

interface Operator {
  _id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  isActive: boolean;
  agents: number;
  totalRevenue: number;
  commission: number;
  createdAt: string;
}

interface AgentRequest {
  _id: string;
  operatorId: string;
  operatorName: string;
  operatorEmail: string;
  agentId: string;
  agentName: string;
  agentEmail: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
}

export default function OperatorsManagementPage() {
  const [operators, setOperators] = useState<Operator[]>([]);
  const [agentRequests, setAgentRequests] = useState<AgentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [filter, setFilter] = useState({
    search: '',
    status: '',
  });
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    totalAgents: 0,
    totalRevenue: 0,
    totalCommission: 0,
  });
  const [activeTab, setActiveTab] = useState<'operators' | 'requests'>('operators');
  const [processingRequest, setProcessingRequest] = useState<string | null>(null);

  useEffect(() => {
    fetchOperators();
    fetchStats();
    if (activeTab === 'requests') {
      fetchAgentRequests();
    }
  }, [filter, activeTab]);

  const fetchOperators = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams();
      
      if (filter.search) queryParams.append('search', filter.search);
      if (filter.status) queryParams.append('status', filter.status);

      const response = await fetch(`/api/admin/users?role=operator&${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setOperators(data.users || []);
      }
    } catch (error) {
      console.error('Error fetching operators:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch operator commission stats
      const statsResponse = await fetch('/api/admin/operators/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        if (statsData.success && statsData.summary) {
          const activeOps = statsData.operators.filter((op: any) => op.totalShops > 0).length;
          setStats({
            total: statsData.summary.totalOperators || 0,
            active: activeOps,
            inactive: statsData.summary.totalOperators - activeOps,
            totalAgents: statsData.operators.reduce((sum: number, op: any) => sum + op.totalAgents, 0),
            totalRevenue: statsData.operators.reduce((sum: number, op: any) => sum + op.totalRevenue, 0),
            totalCommission: statsData.summary.totalOperatorCommission || 0,
          });
        }
      } else {
        // Fallback to user stats
        const response = await fetch('/api/admin/users/stats', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setStats({
            total: data.stats.operators || 0,
            active: data.stats.operators || 0,
            inactive: 0,
            totalAgents: 0,
            totalRevenue: 0,
            totalCommission: 0,
          });
        }
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchAgentRequests = async () => {
    try {
      setRequestsLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/agent-requests?status=pending', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAgentRequests(data.requests || []);
      }
    } catch (error) {
      console.error('Error fetching agent requests:', error);
    } finally {
      setRequestsLoading(false);
    }
  };

  const handleApproveRequest = async (requestId: string) => {
    try {
      setProcessingRequest(requestId);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/agent-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          requestId,
          action: 'approve',
        }),
      });

      if (response.ok) {
        await fetchAgentRequests();
        await fetchOperators();
        await fetchStats();
        alert('Agent request approved successfully!');
      } else {
        const data = await response.json();
        alert(`Error: ${data.error || 'Failed to approve request'}`);
      }
    } catch (error) {
      console.error('Error approving request:', error);
      alert('An error occurred while approving the request');
    } finally {
      setProcessingRequest(null);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    const reason = prompt('Enter rejection reason (optional):');
    try {
      setProcessingRequest(requestId);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/agent-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          requestId,
          action: 'reject',
          rejectionReason: reason || undefined,
        }),
      });

      if (response.ok) {
        await fetchAgentRequests();
        alert('Agent request rejected successfully!');
      } else {
        const data = await response.json();
        alert(`Error: ${data.error || 'Failed to reject request'}`);
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert('An error occurred while rejecting the request');
    } finally {
      setProcessingRequest(null);
    }
  };

  const toggleOperatorStatus = async (operatorId: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/users/${operatorId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (response.ok) {
        fetchOperators();
        fetchStats();
      }
    } catch (error) {
      console.error('Error toggling operator status:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Operators Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage all operators and their performance</p>
        </div>
        <button
          onClick={() => {
            fetchOperators();
            fetchStats();
          }}
          className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          <FiRefreshCw className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
        {[
          { label: 'Total Operators', value: stats.total, icon: FiUser, color: 'green' },
          { label: 'Active', value: stats.active, icon: FiCheckCircle, color: 'green' },
          { label: 'Inactive', value: stats.inactive, icon: FiXCircle, color: 'red' },
          { label: 'Total Agents', value: stats.totalAgents, icon: FiUsers, color: 'blue' },
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

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('operators')}
            className={`flex-1 px-6 py-4 text-sm font-semibold transition-colors ${
              activeTab === 'operators'
                ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-b-2 border-purple-600'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <FiUsers />
              Operators ({stats.total})
            </div>
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`flex-1 px-6 py-4 text-sm font-semibold transition-colors relative ${
              activeTab === 'requests'
                ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-b-2 border-purple-600'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <FiUser />
              Agent Requests
              {agentRequests.length > 0 && (
                <span className="px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">
                  {agentRequests.length}
                </span>
              )}
            </div>
          </button>
        </div>
      </div>

      {/* Operators Tab Content */}
      {activeTab === 'operators' && (
        <>
          {/* Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search operators..."
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
            onClick={() => setFilter({ search: '', status: '' })}
            className="px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Operators Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Operator Details
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
              ) : operators.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    No operators found
                  </td>
                </tr>
              ) : (
                operators.map((operator) => (
                  <motion.tr
                    key={operator._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                          <FiUser className="text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">{operator.name}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            <FiMapPin className="text-xs" />
                            {operator.city || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-2">
                          <FiMail className="text-xs" />
                          {operator.email}
                        </div>
                        {operator.phone && (
                          <div className="flex items-center gap-2">
                            <FiPhone className="text-xs" />
                            {operator.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2">
                          <FiUsers className="text-gray-400" />
                          <span className="text-gray-900 dark:text-white font-medium">{operator.agents || 0} agents</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FiDollarSign className="text-gray-400" />
                          <span className="text-gray-900 dark:text-white font-medium">₹{(operator.totalRevenue || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FiDollarSign className="text-green-600" />
                          <span className="text-green-600 font-medium">₹{(operator.commission || 0).toLocaleString()}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 text-xs font-medium rounded-full ${
                          operator.isActive
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                        }`}
                      >
                        {operator.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleOperatorStatus(operator._id, operator.isActive)}
                          className={`p-2 rounded-lg transition-colors ${
                            operator.isActive
                              ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30'
                              : 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30'
                          }`}
                          title={operator.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {operator.isActive ? <FiXCircle /> : <FiCheckCircle />}
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
        </>
      )}

      {/* Agent Requests Tab Content */}
      {activeTab === 'requests' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Pending Agent Requests
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Operators requesting to add agents to their panel
            </p>
          </div>

          {requestsLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent"></div>
            </div>
          ) : agentRequests.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-gray-400 text-6xl mb-4">📭</div>
              <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">
                No pending agent requests
              </p>
              <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">
                All agent requests have been processed
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {agentRequests.map((request) => (
                <motion.div
                  key={request._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        {/* Operator Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center text-white font-semibold">
                              {request.operatorName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900 dark:text-white">
                                {request.operatorName}
                              </h3>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                Operator
                              </p>
                            </div>
                          </div>
                          <div className="ml-12 space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                              <FiMail className="text-gray-400" />
                              <span className="text-gray-600 dark:text-gray-400">
                                {request.operatorEmail}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Arrow */}
                        <div className="flex items-center justify-center px-4">
                          <div className="text-2xl text-gray-400">→</div>
                        </div>

                        {/* Agent Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white font-semibold">
                              {request.agentName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900 dark:text-white">
                                {request.agentName}
                              </h3>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                Agent
                              </p>
                            </div>
                          </div>
                          <div className="ml-12 space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                              <FiMail className="text-gray-400" />
                              <span className="text-gray-600 dark:text-gray-400">
                                {request.agentEmail}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Request Info */}
                      <div className="mt-4 ml-12 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <FiClock />
                            <span>
                              Requested: {new Date(request.requestedAt).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                            Pending Approval
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2 ml-4">
                      <button
                        onClick={() => handleApproveRequest(request._id)}
                        disabled={processingRequest === request._id}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <FiCheckCircle />
                        {processingRequest === request._id ? 'Approving...' : 'Approve'}
                      </button>
                      <button
                        onClick={() => handleRejectRequest(request._id)}
                        disabled={processingRequest === request._id}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <FiXCircle />
                        {processingRequest === request._id ? 'Rejecting...' : 'Reject'}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}



