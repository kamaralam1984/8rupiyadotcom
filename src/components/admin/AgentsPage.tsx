'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiEye, FiShoppingBag, FiDollarSign, FiUsers, FiEdit, FiTrash2, FiPlus, FiX, FiEyeOff, FiSave, FiToggleLeft, FiToggleRight, FiMail } from 'react-icons/fi';

interface Agent {
  _id: string;
  name: string;
  email: string;
  phone: string;
  shops: number;
  earnings: number;
  operators: number;
  isActive: boolean;
  createdAt: string;
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState<{ [key: string]: boolean }>({});

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });

  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    isActive: true,
  });

  const fetchAgents = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login again');
        setLoading(false);
        return;
      }

      // Fetch agents with real stats from API
      const response = await fetch('/api/admin/agents/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        setAgents(data.agents || []);
      } else {
        setError(data.error || 'Failed to fetch agents');
        setAgents([]);
      }
    } catch (err: any) {
      console.error('Error fetching agents:', err);
      setError(err.message || 'Failed to fetch agents');
      setAgents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  const handleCreateAgent = async () => {
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

      if (!formData.name || !formData.email || !formData.phone || !formData.password) {
        setError('Please fill all required fields');
        setSubmitting(false);
        return;
      }

      if (!/^[0-9]{10}$/.test(formData.phone.replace(/\s+/g, ''))) {
        setError('Phone number must be 10 digits');
        setSubmitting(false);
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        setError('Invalid email format');
        setSubmitting(false);
        return;
      }

      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters');
        setSubmitting(false);
        return;
      }

      const response = await fetch('/api/admin/users/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          role: 'agent',
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(data.message || 'Agent created successfully');
        setShowCreateModal(false);
        setFormData({
          name: '',
          email: '',
          phone: '',
          password: '',
        });
        fetchAgents();
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

  const handleEditAgent = (agent: Agent) => {
    setEditingAgent(agent);
    setEditFormData({
      name: agent.name,
      email: agent.email,
      phone: agent.phone,
      password: '',
      isActive: agent.isActive,
    });
    setError('');
    setShowEditModal(true);
  };

  const handleUpdateAgent = async () => {
    if (!editingAgent) return;

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

      if (!editFormData.name || !editFormData.email || !editFormData.phone) {
        setError('Please fill all required fields');
        setSubmitting(false);
        return;
      }

      if (!/^[0-9]{10}$/.test(editFormData.phone.replace(/\s+/g, ''))) {
        setError('Phone number must be 10 digits');
        setSubmitting(false);
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editFormData.email)) {
        setError('Invalid email format');
        setSubmitting(false);
        return;
      }

      if (editFormData.password && editFormData.password.length < 6) {
        setError('Password must be at least 6 characters');
        setSubmitting(false);
        return;
      }

      const response = await fetch('/api/admin/users/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: editingAgent._id,
          name: editFormData.name,
          email: editFormData.email,
          phone: editFormData.phone,
          password: editFormData.password || undefined,
          isActive: editFormData.isActive,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(data.message || 'Agent updated successfully');
        setShowEditModal(false);
        setEditingAgent(null);
        setEditFormData({
          name: '',
          email: '',
          phone: '',
          password: '',
          isActive: true,
        });
        fetchAgents();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error || 'Failed to update agent');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (agent: Agent) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login again');
        return;
      }

      const response = await fetch('/api/admin/users/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: agent._id,
          isActive: !agent.isActive,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(`Agent ${!agent.isActive ? 'activated' : 'deactivated'} successfully`);
        fetchAgents();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error || 'Failed to update agent status');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Agents</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage agents and their performance</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <FiPlus />
          Create Agent
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Agent</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Shops</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Earnings</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Operators</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
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
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {agent.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{agent.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{agent.email}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">ID: {agent._id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                      Agent
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-900 dark:text-white">{agent.shops}</td>
                  <td className="px-6 py-4 text-gray-900 dark:text-white">₹{agent.earnings.toLocaleString()}</td>
                  <td className="px-6 py-4 text-gray-900 dark:text-white">{agent.operators}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleActive(agent)}
                      className="flex items-center gap-2"
                    >
                      {agent.isActive ? (
                        <FiToggleRight className="text-green-600 text-2xl" />
                      ) : (
                        <FiToggleLeft className="text-gray-400 text-2xl" />
                      )}
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          agent.isActive
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                        }`}
                      >
                        {agent.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedAgent(agent._id)}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 flex items-center gap-1"
                      >
                        <FiEye />
                        View
                      </button>
                      <button
                        onClick={() => handleEditAgent(agent)}
                        className="text-gray-600 hover:text-gray-800 dark:text-gray-400 flex items-center gap-1"
                      >
                        <FiEdit />
                        Edit
                      </button>
                      <button className="text-red-600 hover:text-red-800 dark:text-red-400 flex items-center gap-1">
                        <FiTrash2 />
                        Delete
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedAgent && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Agent Details</h3>
            <button
              onClick={() => setSelectedAgent(null)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400"
            >
              <FiX className="text-xl" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <FiShoppingBag className="text-2xl text-blue-600 mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Shops</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {agents.find(a => a._id === selectedAgent)?.shops || 0}
              </p>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <FiDollarSign className="text-2xl text-green-600 mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Commission</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ₹{agents.find(a => a._id === selectedAgent)?.earnings.toLocaleString() || 0}
              </p>
            </div>
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <FiUsers className="text-2xl text-purple-600 mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-400">Operators</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {agents.find(a => a._id === selectedAgent)?.operators || 0}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Create Agent Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <>
            <div
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => {
                setShowCreateModal(false);
                setError('');
                setFormData({
                  name: '',
                  email: '',
                  phone: '',
                  password: '',
                });
              }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div
                className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="border-b border-gray-200 dark:border-gray-700 p-6 flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create Agent</h2>
                  <button
                    onClick={() => {
                      setShowCreateModal(false);
                      setError('');
                      setFormData({
                        name: '',
                        email: '',
                        phone: '',
                        password: '',
                      });
                    }}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <FiX className="text-2xl" />
                  </button>
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="Enter full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="Enter email address"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Phone *
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="Enter 10-digit phone number"
                      maxLength={10}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Password *
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="Enter password (min 6 characters)"
                    />
                  </div>

                  {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                      {error}
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 p-6 flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setShowCreateModal(false);
                      setError('');
                      setFormData({
                        name: '',
                        email: '',
                        phone: '',
                        password: '',
                      });
                    }}
                    className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateAgent}
                    disabled={submitting}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Creating...' : 'Create Agent'}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}

        {/* Edit Agent Modal */}
        {showEditModal && editingAgent && (
          <>
            <div
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => {
                setShowEditModal(false);
                setEditingAgent(null);
                setError('');
                setEditFormData({
                  name: '',
                  email: '',
                  phone: '',
                  password: '',
                  isActive: true,
                });
              }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div
                className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="border-b border-gray-200 dark:border-gray-700 p-6 flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Agent</h2>
                  <button
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingAgent(null);
                      setError('');
                      setEditFormData({
                        name: '',
                        email: '',
                        phone: '',
                        password: '',
                        isActive: true,
                      });
                    }}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <FiX className="text-2xl" />
                  </button>
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Agent ID
                    </label>
                    <input
                      type="text"
                      value={editingAgent._id}
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Name *
                    </label>
                    <input
                      type="text"
                      value={editFormData.name}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="Enter full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={editFormData.email}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="Enter email address"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Phone *
                    </label>
                    <input
                      type="tel"
                      value={editFormData.phone}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="Enter 10-digit phone number"
                      maxLength={10}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Password (Leave empty to keep current)
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword[editFormData.email] ? 'text' : 'password'}
                        value={editFormData.password}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, password: e.target.value }))}
                        className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="Enter new password (min 6 characters)"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(prev => ({ ...prev, [editFormData.email]: !prev[editFormData.email] }))}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      >
                        {showPassword[editFormData.email] ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editFormData.isActive}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                        className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Active Status
                      </span>
                    </label>
                  </div>

                  {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                      {error}
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 p-6 flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingAgent(null);
                      setError('');
                      setEditFormData({
                        name: '',
                        email: '',
                        phone: '',
                        password: '',
                        isActive: true,
                      });
                    }}
                    className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateAgent}
                    disabled={submitting}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <FiSave />
                    {submitting ? 'Updating...' : 'Update Agent'}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
