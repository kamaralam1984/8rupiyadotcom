'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiUsers, FiSearch, FiMail, FiPhone, FiShoppingBag, FiPlus, FiX, FiCheck, FiDollarSign, FiUserPlus, FiUserCheck, FiLock } from 'react-icons/fi';

interface Agent {
  _id: string;
  name: string;
  email: string;
  phone: string;
  totalShops: number;
  activeShops: number;
  totalRevenue: number;
  isActive: boolean;
  createdAt: string;
}

type ModalType = 'create' | 'add' | 'request' | null;

export default function OperatorAgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalType, setModalType] = useState<ModalType>(null);
  const [showMenuDropdown, setShowMenuDropdown] = useState(false);
  
  // Form data for creating new agent
  const [createFormData, setCreateFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });
  
  // Form data for adding existing agent
  const [addFormData, setAddFormData] = useState({
    agentId: '',
    agentEmail: '',
    agentPhone: '',
  });
  
  // Form data for requesting agent (admin approval)
  const [requestFormData, setRequestFormData] = useState({
    agentId: '',
    agentEmail: '',
    agentName: '',
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);

  useEffect(() => {
    fetchAgents();
    fetchPendingRequests();
  }, []);

  const fetchPendingRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/operator/agents/request', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const pending = data.requests.filter((req: any) => req.status === 'pending');
          setPendingRequests(pending);
        }
      }
    } catch (error) {
      console.error('Failed to fetch pending requests:', error);
    }
  };

  const fetchAgents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch('/api/operator/agents', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAgents(data.agents || []);
        }
      }
    } catch (error) {
      console.error('Failed to fetch agents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login again');
        setSubmitting(false);
        return;
      }

      // Validate all fields
      if (!createFormData.name || !createFormData.email || !createFormData.phone || !createFormData.password) {
        setError('All fields are required');
        setSubmitting(false);
        return;
      }

      const response = await fetch('/api/operator/agents/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(createFormData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(data.message || 'Agent created successfully!');
        setCreateFormData({ name: '', email: '', phone: '', password: '' });
        setModalType(null);
        fetchAgents(); // Refresh agents list
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error || 'Failed to create agent');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddExistingAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login again');
        setSubmitting(false);
        return;
      }

      // Validate that at least one field is provided
      if (!addFormData.agentId && !addFormData.agentEmail && !addFormData.agentPhone) {
        setError('Please provide Agent ID, Email, or Phone');
        setSubmitting(false);
        return;
      }

      const response = await fetch('/api/operator/agents/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(addFormData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(data.message || 'Agent added successfully!');
        setAddFormData({ agentId: '', agentEmail: '', agentPhone: '' });
        setModalType(null);
        fetchAgents(); // Refresh agents list
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error || 'Failed to add agent');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRequestAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login again');
        setSubmitting(false);
        return;
      }

      // Validate that at least one field is provided
      if (!requestFormData.agentId && !requestFormData.agentEmail && !requestFormData.agentName) {
        setError('Please provide Agent ID, Email, or Name');
        setSubmitting(false);
        return;
      }

      // Send request to admin instead of directly adding
      const response = await fetch('/api/operator/agents/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          agentId: requestFormData.agentId || undefined,
          agentEmail: requestFormData.agentEmail || undefined,
          agentName: requestFormData.agentName || undefined,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(data.message || 'Request sent to admin successfully!');
        setRequestFormData({ agentId: '', agentEmail: '', agentName: '' });
        setModalType(null);
        fetchPendingRequests(); // Refresh pending requests
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error || 'Failed to send request');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredAgents = agents.filter(agent =>
    agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.phone.includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Agents</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Create, add, or request agents for your panel</p>
        </div>
        
        <div className="relative">
          <button
            onClick={() => setShowMenuDropdown(!showMenuDropdown)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            <FiPlus />
            Agent Actions
          </button>
          
          {showMenuDropdown && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50"
            >
              <div className="p-2 space-y-1">
                <button
                  onClick={() => {
                    setModalType('create');
                    setShowMenuDropdown(false);
                    setError('');
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors group"
                >
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg group-hover:bg-green-200 dark:group-hover:bg-green-900/50 transition-colors">
                    <FiUserPlus className="text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">Create New Agent</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Create a brand new agent account</p>
                  </div>
                </button>
                
                <button
                  onClick={() => {
                    setModalType('add');
                    setShowMenuDropdown(false);
                    setError('');
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors group"
                >
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
                    <FiUserCheck className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">Add Existing Agent</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Add an agent who already has account</p>
                  </div>
                </button>
                
                <button
                  onClick={() => {
                    setModalType('request');
                    setShowMenuDropdown(false);
                    setError('');
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition-colors group"
                >
                  <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg group-hover:bg-yellow-200 dark:group-hover:bg-yellow-900/50 transition-colors">
                    <FiLock className="text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">Request Agent (Admin)</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Send request to admin for approval</p>
                  </div>
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
      
      {/* Click outside to close dropdown */}
      {showMenuDropdown && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowMenuDropdown(false)}
        />
      )}

      {/* Success/Error Messages */}
      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-100 dark:bg-green-900/20 border border-green-400 text-green-700 dark:text-green-400 px-4 py-3 rounded-lg"
        >
          {success}
        </motion.div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-100 dark:bg-red-900/20 border border-red-400 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg"
        >
          {error}
        </motion.div>
      )}

      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-400 mb-2">
            Pending Requests ({pendingRequests.length})
          </h3>
          <div className="space-y-2">
            {pendingRequests.map((req) => (
              <div key={req._id} className="flex items-center justify-between text-sm">
                <span className="text-yellow-700 dark:text-yellow-300">
                  Request for <strong>{req.agentName}</strong> ({req.agentEmail}) - Waiting for admin approval
                </span>
                <span className="px-2 py-1 bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 rounded text-xs">
                  Pending
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search agents by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-900 dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>

      {/* Agents Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Agent Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Total Shops
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Active Shops
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Total Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredAgents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    {searchTerm ? 'No agents found matching your search' : 'No agents added yet. Click "Add Agent" to get started.'}
                  </td>
                </tr>
              ) : (
                filteredAgents.map((agent) => (
                  <motion.tr
                    key={agent._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center text-white font-semibold">
                          {agent.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {agent.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {agent.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-gray-900 dark:text-white">
                        <FiPhone className="mr-2 text-gray-400" />
                        {agent.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      <div className="flex items-center">
                        <FiShoppingBag className="mr-2 text-gray-400" />
                        {agent.totalShops}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                        {agent.activeShops}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      <div className="flex items-center">
                        <FiDollarSign className="mr-2 text-gray-400" />
                        ₹{agent.totalRevenue.toLocaleString('en-IN')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        agent.isActive
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                      }`}>
                        {agent.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create New Agent Modal */}
      {modalType === 'create' && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6"
          >
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <FiUserPlus className="text-green-600 dark:text-green-400 text-xl" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create New Agent</h2>
              </div>
              <button
                onClick={() => {
                  setModalType(null);
                  setCreateFormData({ name: '', email: '', phone: '', password: '' });
                  setError('');
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <FiX className="text-xl" />
              </button>
            </div>

            <form onSubmit={handleCreateAgent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={createFormData.name}
                  onChange={(e) => setCreateFormData({ ...createFormData, name: e.target.value })}
                  placeholder="Enter agent name"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-900 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={createFormData.email}
                  onChange={(e) => setCreateFormData({ ...createFormData, email: e.target.value })}
                  placeholder="agent@example.com"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-900 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={createFormData.phone}
                  onChange={(e) => setCreateFormData({ ...createFormData, phone: e.target.value })}
                  placeholder="10-digit phone number"
                  maxLength={10}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-900 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Password *
                </label>
                <input
                  type="password"
                  value={createFormData.password}
                  onChange={(e) => setCreateFormData({ ...createFormData, password: e.target.value })}
                  placeholder="Minimum 6 characters"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-900 dark:bg-gray-700 dark:text-white"
                  required
                  minLength={6}
                />
              </div>

              {error && (
                <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 text-red-700 dark:text-red-400 px-4 py-2 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setModalType(null);
                    setCreateFormData({ name: '', email: '', phone: '', password: '' });
                    setError('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Creating...' : 'Create Agent'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Add Existing Agent Modal */}
      {modalType === 'add' && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6"
          >
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <FiUserCheck className="text-blue-600 dark:text-blue-400 text-xl" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Add Existing Agent</h2>
              </div>
              <button
                onClick={() => {
                  setModalType(null);
                  setAddFormData({ agentId: '', agentEmail: '', agentPhone: '' });
                  setError('');
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <FiX className="text-xl" />
              </button>
            </div>

            <form onSubmit={handleAddExistingAgent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Agent ID (Optional)
                </label>
                <input
                  type="text"
                  value={addFormData.agentId}
                  onChange={(e) => setAddFormData({ ...addFormData, agentId: e.target.value })}
                  placeholder="Enter Agent ID"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div className="text-center text-gray-500 dark:text-gray-400">OR</div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Agent Email (Optional)
                </label>
                <input
                  type="email"
                  value={addFormData.agentEmail}
                  onChange={(e) => setAddFormData({ ...addFormData, agentEmail: e.target.value })}
                  placeholder="agent@example.com"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div className="text-center text-gray-500 dark:text-gray-400">OR</div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Agent Phone (Optional)
                </label>
                <input
                  type="tel"
                  value={addFormData.agentPhone}
                  onChange={(e) => setAddFormData({ ...addFormData, agentPhone: e.target.value })}
                  placeholder="10-digit phone number"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-400">
                Provide at least one: Agent ID, Email, or Phone Number
              </p>

              {error && (
                <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 text-red-700 dark:text-red-400 px-4 py-2 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setModalType(null);
                    setAddFormData({ agentId: '', agentEmail: '', agentPhone: '' });
                    setError('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Adding...' : 'Add Agent'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Request Agent Modal (Admin Approval) */}
      {modalType === 'request' && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6"
          >
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                  <FiLock className="text-yellow-600 dark:text-yellow-400 text-xl" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Request Agent</h2>
              </div>
              <button
                onClick={() => {
                  setModalType(null);
                  setRequestFormData({ agentId: '', agentEmail: '', agentName: '' });
                  setError('');
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <FiX className="text-xl" />
              </button>
            </div>

            <form onSubmit={handleRequestAgent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Agent ID (Optional)
                </label>
                <input
                  type="text"
                  value={requestFormData.agentId}
                  onChange={(e) => setRequestFormData({ ...requestFormData, agentId: e.target.value })}
                  placeholder="Enter Agent ID"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-white text-gray-900 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div className="text-center text-gray-500 dark:text-gray-400">OR</div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Agent Email (Optional)
                </label>
                <input
                  type="email"
                  value={requestFormData.agentEmail}
                  onChange={(e) => setRequestFormData({ ...requestFormData, agentEmail: e.target.value })}
                  placeholder="agent@example.com"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-white text-gray-900 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div className="text-center text-gray-500 dark:text-gray-400">OR</div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Agent Name (Optional)
                </label>
                <input
                  type="text"
                  value={requestFormData.agentName}
                  onChange={(e) => setRequestFormData({ ...requestFormData, agentName: e.target.value })}
                  placeholder="Enter Agent Name"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-white text-gray-900 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                <p className="text-xs text-yellow-800 dark:text-yellow-400">
                  <strong>Note:</strong> This request will be sent to admin for approval. You'll be notified once it's reviewed.
                </p>
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-400">
                Provide at least one: Agent ID, Email, or Name
              </p>

              {error && (
                <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 text-red-700 dark:text-red-400 px-4 py-2 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setModalType(null);
                    setRequestFormData({ agentId: '', agentEmail: '', agentName: '' });
                    setError('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-yellow-600 to-orange-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Sending...' : 'Send Request'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

