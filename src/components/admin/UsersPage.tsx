'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiEye, FiEdit, FiTrash2, FiUser, FiMail, FiPhone, FiPlus, FiX, FiEyeOff, FiSave, FiToggleLeft, FiToggleRight } from 'react-icons/fi';
import { UserRole } from '@/models/User';

interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}

interface UsersPageProps {
  role: 'admin' | 'agent' | 'operator' | 'accountant' | 'shopper';
}

export default function UsersPage({ role }: UsersPageProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentUserRole, setCurrentUserRole] = useState<string>('');
  const [showPassword, setShowPassword] = useState<{ [key: string]: boolean }>({});
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    agentId: '', // For operators
    operatorId: '', // For shoppers
  });

  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    isActive: true,
  });

  // Check current user's role
  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.user) {
            setCurrentUserRole(data.user.role);
            console.log('Current user role:', data.user.role);
          }
        }
      } catch (err) {
        console.error('Error checking user role:', err);
      }
    };

    checkUserRole();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login again');
        setLoading(false);
        return;
      }

      const response = await fetch(`/api/admin/users?role=${role}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      console.log('Fetch users response:', { status: response.status, data });
      
      if (response.ok && data.success) {
        // Ensure role is included for each user
        const usersWithRole = (data.users || []).map((user: any) => ({
          ...user,
          role: user.role || role, // Fallback to page role if not provided
        }));
        console.log('Users with roles:', usersWithRole); // Debug log
        setUsers(usersWithRole);
      } else {
        if (response.status === 403) {
          setError('Access denied. Please ensure you are logged in as an admin user.');
        } else if (response.status === 401) {
          setError('Authentication failed. Please login again.');
        } else {
          setError(data.error || 'Failed to fetch users');
        }
      }
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError(err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [role]);

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setEditFormData({
      name: user.name,
      email: user.email,
      phone: user.phone,
      password: '',
      isActive: user.isActive,
    });
    setError('');
    setShowEditModal(true);
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;

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

      // Validate form
      if (!editFormData.name || !editFormData.email || !editFormData.phone) {
        setError('Please fill all required fields');
        setSubmitting(false);
        return;
      }

      // Validate phone (10 digits)
      if (!/^[0-9]{10}$/.test(editFormData.phone.replace(/\s+/g, ''))) {
        setError('Phone number must be 10 digits');
        setSubmitting(false);
        return;
      }

      // Validate email
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editFormData.email)) {
        setError('Invalid email format');
        setSubmitting(false);
        return;
      }

      // Validate password if provided
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
          userId: editingUser._id,
          name: editFormData.name,
          email: editFormData.email,
          phone: editFormData.phone,
          password: editFormData.password || undefined,
          isActive: editFormData.isActive,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(data.message || 'User updated successfully');
        setShowEditModal(false);
        setEditingUser(null);
        setEditFormData({
          name: '',
          email: '',
          phone: '',
          password: '',
          isActive: true,
        });
        // Refresh users list
        fetchUsers();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error || 'Failed to update user');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (!confirm(`Are you sure you want to delete user "${user.name}"? This action cannot be undone.`)) {
      return;
    }

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

      const response = await fetch(`/api/admin/users/delete?userId=${user._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(data.message || 'User deleted successfully');
        fetchUsers();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error || 'Failed to delete user');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (user: User) => {
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
          userId: user._id,
          isActive: !user.isActive,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(`User ${!user.isActive ? 'activated' : 'deactivated'} successfully`);
        fetchUsers();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error || 'Failed to update user status');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    }
  };

  const handleCreateUser = async () => {
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

      // Validate form
      if (!formData.name || !formData.email || !formData.phone || !formData.password) {
        setError('Please fill all required fields');
        setSubmitting(false);
        return;
      }

      // Validate phone (10 digits)
      if (!/^[0-9]{10}$/.test(formData.phone.replace(/\s+/g, ''))) {
        setError('Phone number must be 10 digits');
        setSubmitting(false);
        return;
      }

      // Validate email
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        setError('Invalid email format');
        setSubmitting(false);
        return;
      }

      // Validate password
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
          role: role,
          agentId: role === 'operator' && formData.agentId ? formData.agentId : undefined,
          operatorId: role === 'shopper' && formData.operatorId ? formData.operatorId : undefined,
        }),
      });

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        const text = await response.text();
        console.error('Failed to parse response:', text);
        setError(`Server error: ${response.status} ${response.statusText}. ${text || 'Unknown error'}`);
        setSubmitting(false);
        return;
      }

      console.log('User creation response:', { status: response.status, data });

      if (response.ok && data.success) {
        setSuccess(data.message || 'User created successfully');
        setShowCreateModal(false);
        setFormData({
          name: '',
          email: '',
          phone: '',
          password: '',
          agentId: '',
          operatorId: '',
        });
        // Refresh users list
        fetchUsers();
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000);
      } else {
        // Handle different error scenarios
        if (response.status === 403) {
          const errorMsg = data.message 
            ? `${data.error || 'Access denied'}. ${data.message}`
            : 'Access denied. Please ensure you are logged in as an admin user.';
          setError(errorMsg);
        } else if (response.status === 401) {
          setError('Authentication failed. Please login again.');
          // Redirect to login after 2 seconds
          setTimeout(() => {
            window.location.href = '/login';
          }, 2000);
        } else {
          setError(data.error || data.message || `Failed to create user (Status: ${response.status})`);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white capitalize">
            {role}s
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage {role} users and their accounts
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <FiPlus />
          Create {role.charAt(0).toUpperCase() + role.slice(1)}
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
          <p className="font-semibold">{error}</p>
          {currentUserRole && currentUserRole !== 'admin' && (
            <p className="text-sm mt-2">
              Your current role: <span className="font-semibold">{currentUserRole}</span>. 
              Please login with an admin account to access this page.
            </p>
          )}
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {users.map((user) => (
                <motion.tr
                  key={user._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{user.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">ID: {user._id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-900 dark:text-white">{user.email}</td>
                  <td className="px-6 py-4 text-gray-900 dark:text-white">{user.phone}</td>
                  <td className="px-6 py-4">
                    {user.role ? (
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        user.role === 'admin'
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
                          : user.role === 'agent'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                          : user.role === 'operator'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                          : user.role === 'accountant'
                          ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
                          : user.role === 'shopper'
                          ? 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleActive(user)}
                      className="flex items-center gap-2"
                    >
                      {user.isActive ? (
                        <FiToggleRight className="text-green-600 text-2xl" />
                      ) : (
                        <FiToggleLeft className="text-gray-400 text-2xl" />
                      )}
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          user.isActive
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                        }`}
                      >
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditUser(user)}
                        className="text-gray-600 hover:text-gray-800 dark:text-gray-400 flex items-center gap-1"
                      >
                        <FiEdit />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user)}
                        disabled={submitting}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
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

      {/* Create User Modal */}
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
                  agentId: '',
                  operatorId: '',
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
                {/* Header */}
                <div className="border-b border-gray-200 dark:border-gray-700 p-6 flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Create {role.charAt(0).toUpperCase() + role.slice(1)}
                  </h2>
                  <button
                    onClick={() => {
                      setShowCreateModal(false);
                      setError('');
                      setFormData({
                        name: '',
                        email: '',
                        phone: '',
                        password: '',
                        agentId: '',
                        operatorId: '',
                      });
                    }}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <FiX className="text-2xl" />
                  </button>
                </div>

                {/* Form */}
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

                  {role === 'operator' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Agent ID (Optional)
                      </label>
                      <input
                        type="text"
                        value={formData.agentId}
                        onChange={(e) => setFormData(prev => ({ ...prev, agentId: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="Enter agent ID"
                      />
                    </div>
                  )}

                  {role === 'shopper' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Operator ID (Optional)
                      </label>
                      <input
                        type="text"
                        value={formData.operatorId}
                        onChange={(e) => setFormData(prev => ({ ...prev, operatorId: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="Enter operator ID"
                      />
                    </div>
                  )}

                  {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                      {error}
                    </div>
                  )}
                </div>

                {/* Footer */}
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
                        agentId: '',
                        operatorId: '',
                      });
                    }}
                    className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateUser}
                    disabled={submitting}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Creating...' : 'Create User'}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}

        {/* Edit User Modal */}
        {showEditModal && editingUser && (
          <>
            <div
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => {
                setShowEditModal(false);
                setEditingUser(null);
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
                {/* Header */}
                <div className="border-b border-gray-200 dark:border-gray-700 p-6 flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Edit {role.charAt(0).toUpperCase() + role.slice(1)}
                  </h2>
                  <button
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingUser(null);
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

                {/* Form */}
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      User ID
                    </label>
                    <input
                      type="text"
                      value={editingUser._id}
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

                {/* Footer */}
                <div className="border-t border-gray-200 dark:border-gray-700 p-6 flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingUser(null);
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
                    onClick={handleUpdateUser}
                    disabled={submitting}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <FiSave />
                    {submitting ? 'Updating...' : 'Update User'}
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

