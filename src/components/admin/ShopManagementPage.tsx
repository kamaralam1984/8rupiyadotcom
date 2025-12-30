'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiSearch,
  FiFilter,
  FiMapPin,
  FiEdit,
  FiTrash2,
  FiCheckCircle,
  FiXCircle,
  FiEye,
  FiStar,
  FiTrendingUp,
  FiCalendar,
  FiUser,
  FiDollarSign,
  FiDownload,
  FiRefreshCw,
  FiX,
  FiPhone,
  FiMail,
  FiClock,
  FiPackage,
} from 'react-icons/fi';

interface Shop {
  _id: string;
  name: string;
  category: string;
  description?: string;
  city: string;
  address?: string;
  pincode: string;
  status: 'pending' | 'approved' | 'rejected' | 'active';
  paymentStatus: 'pending' | 'paid' | 'expired';
  planId: {
    _id: string;
    name: string;
    price: number;
    duration: number;
  };
  planExpiry: string;
  planStartDate?: string;
  agentId: {
    _id: string;
    name: string;
    phone?: string;
  } | null;
  operatorId: {
    _id: string;
    name: string;
    phone?: string;
  } | null;
  ownerId?: {
    _id: string;
    name: string;
    email?: string;
    phone?: string;
  };
  contact?: {
    phone?: string;
    email?: string;
    whatsapp?: string;
  };
  images?: string[];
  keywords?: string;
  isFeatured: boolean;
  homepagePriority: number;
  visitors: number;
  createdAt: string;
  updatedAt?: string;
  location?: {
    coordinates: [number, number];
  };
}

export default function ShopManagementPage() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    city: '',
    category: '',
    status: '',
    plan: '',
    agent: '',
    operator: '',
  });
  const [selectedShops, setSelectedShops] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    active: 0,
    expired: 0,
  });

  useEffect(() => {
    fetchShops();
    fetchStats();
  }, [filters]);

  const fetchShops = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const response = await fetch(`/api/admin/shops?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setShops(data.shops || []);
      }
    } catch (error) {
      console.error('Error fetching shops:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/shops/stats', {
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

  const handleApprove = async (shopId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/shops/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ shopId, status: 'approved' }),
      });

      if (response.ok) {
        fetchShops();
        fetchStats();
      }
    } catch (error) {
      console.error('Error approving shop:', error);
    }
  };

  const handleReject = async (shopId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/shops/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ shopId, status: 'rejected' }),
      });

      if (response.ok) {
        fetchShops();
        fetchStats();
      }
    } catch (error) {
      console.error('Error rejecting shop:', error);
    }
  };

  const toggleFeatured = async (shopId: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/shops/${shopId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ isFeatured: !currentStatus }),
      });

      if (response.ok) {
        fetchShops();
      }
    } catch (error) {
      console.error('Error toggling featured:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'expired':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const isExpired = (expiryDate: string) => {
    return new Date(expiryDate) < new Date();
  };

  const getDaysRemaining = (expiryDate: string) => {
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diff = expiry.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  const handleViewDetails = (shop: Shop) => {
    setSelectedShop(shop);
    setShowDetailsModal(true);
  };

  const handleEditShop = (shop: Shop) => {
    setSelectedShop(shop);
    setShowEditModal(true);
  };

  const handleCloseModals = () => {
    setShowDetailsModal(false);
    setShowEditModal(false);
    setSelectedShop(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Shop Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage all shops, approve, reject, and configure</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchShops()}
            className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            <FiRefreshCw className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            <FiDownload />
            Export
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Shops', value: stats.total, icon: FiTrendingUp, color: 'purple' },
          { label: 'Pending Approval', value: stats.pending, icon: FiCalendar, color: 'yellow' },
          { label: 'Active Shops', value: stats.active, icon: FiCheckCircle, color: 'green' },
          { label: 'Expired', value: stats.expired, icon: FiXCircle, color: 'red' },
        ].map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
              </div>
              <div className={`p-4 rounded-xl bg-${stat.color}-100 dark:bg-${stat.color}-900/30`}>
                <stat.icon className={`text-${stat.color}-600 dark:text-${stat.color}-400 text-2xl`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Filters & Search</h3>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            <FiFilter />
            {showFilters ? 'Hide' : 'Show'} Filters
          </button>
        </div>

        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search shops by name, category, or location..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white"
            />
          </div>

          {/* Advanced Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4"
              >
                <select
                  value={filters.city}
                  onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">All Cities</option>
                  <option value="Patna">Patna</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Mumbai">Mumbai</option>
                </select>

                <select
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">All Categories</option>
                  <option value="restaurant">Restaurant</option>
                  <option value="clothing">Clothing</option>
                  <option value="electronics">Electronics</option>
                </select>

                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="active">Active</option>
                  <option value="rejected">Rejected</option>
                </select>

                <select
                  value={filters.plan}
                  onChange={(e) => setFilters({ ...filters, plan: e.target.value })}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">All Plans</option>
                  <option value="starter">Starter</option>
                  <option value="basic">Basic</option>
                  <option value="pro">Pro</option>
                  <option value="business">Business</option>
                  <option value="enterprise">Enterprise</option>
                </select>

                <button
                  onClick={() => setFilters({
                    search: '',
                    city: '',
                    category: '',
                    status: '',
                    plan: '',
                    agent: '',
                    operator: '',
                  })}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Clear Filters
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Shops Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Shop Details
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Plan & Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Agent/Operator
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Visitors
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
              ) : shops.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    No shops found
                  </td>
                </tr>
              ) : (
                shops.map((shop) => (
                  <motion.tr
                    key={shop._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-gray-900 dark:text-white">{shop.name}</p>
                            {shop.isFeatured && (
                              <FiStar className="text-yellow-500 fill-yellow-500" title="Featured" />
                            )}
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{shop.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <FiMapPin className="text-gray-400" />
                        <div>
                          <p>{shop.city}</p>
                          <p className="text-xs">{shop.pincode}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(shop.status)}`}>
                            {shop.status}
                          </span>
                          {isExpired(shop.planExpiry) && (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                              Expired
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Plan: {shop.planId?.name || 'N/A'}
                        </p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          ₹{shop.planId?.price?.toLocaleString('en-IN') || 0}
                        </p>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-gray-500 dark:text-gray-500">
                            Expires: {new Date(shop.planExpiry).toLocaleDateString('en-IN', { 
                              day: '2-digit', 
                              month: 'short', 
                              year: 'numeric' 
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FiClock className={`text-xs ${
                            getDaysRemaining(shop.planExpiry) < 7 
                              ? 'text-red-500' 
                              : getDaysRemaining(shop.planExpiry) < 30
                              ? 'text-yellow-500'
                              : 'text-green-500'
                          }`} />
                          <span className={`text-xs font-semibold ${
                            getDaysRemaining(shop.planExpiry) < 7 
                              ? 'text-red-600 dark:text-red-400' 
                              : getDaysRemaining(shop.planExpiry) < 30
                              ? 'text-yellow-600 dark:text-yellow-400'
                              : 'text-green-600 dark:text-green-400'
                          }`}>
                            {getDaysRemaining(shop.planExpiry)} days left
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm space-y-1">
                        <div className="flex items-center gap-1">
                          <FiUser className="text-gray-400 text-xs" />
                          <span className="text-gray-600 dark:text-gray-400">
                            Agent: {shop.agentId?.name || 'None'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FiUser className="text-gray-400 text-xs" />
                          <span className="text-gray-600 dark:text-gray-400">
                            Operator: {shop.operatorId?.name || 'None'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <FiEye className="text-gray-400" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {shop.visitors || 0}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {shop.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(shop._id)}
                              className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                              title="Approve"
                            >
                              <FiCheckCircle />
                            </button>
                            <button
                              onClick={() => handleReject(shop._id)}
                              className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                              title="Reject"
                            >
                              <FiXCircle />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => toggleFeatured(shop._id, shop.isFeatured)}
                          className={`p-2 hover:bg-yellow-50 dark:hover:bg-yellow-900/30 rounded-lg transition-colors ${
                            shop.isFeatured ? 'text-yellow-600' : 'text-gray-400'
                          }`}
                          title="Toggle Featured"
                        >
                          <FiStar className={shop.isFeatured ? 'fill-yellow-500' : ''} />
                        </button>
                        <button
                          onClick={() => handleViewDetails(shop)}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <FiEye />
                        </button>
                        <button
                          onClick={() => handleEditShop(shop)}
                          className="p-2 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <FiEdit />
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

      {/* Shop Details Modal */}
      <AnimatePresence>
        {showDetailsModal && selectedShop && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={handleCloseModals}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      {selectedShop.name}
                      {selectedShop.isFeatured && (
                        <FiStar className="text-yellow-300 fill-yellow-300" />
                      )}
                    </h2>
                    <p className="text-purple-100 mt-1">{selectedShop.category}</p>
                  </div>
                  <button
                    onClick={handleCloseModals}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <FiX className="text-2xl" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Status & Plan Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-purple-600 rounded-lg">
                        <FiPackage className="text-white text-xl" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Current Plan</p>
                        <p className="text-xl font-bold text-gray-900 dark:text-white">
                          {selectedShop.planId?.name || 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Price:</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          ₹{selectedShop.planId?.price.toLocaleString('en-IN') || 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Duration:</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {selectedShop.planId?.duration || 0} days
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-3">
                        <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(selectedShop.status)}`}>
                          {selectedShop.status}
                        </span>
                        {isExpired(selectedShop.planExpiry) && (
                          <span className="px-3 py-1 text-sm font-medium rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                            Expired
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-blue-600 rounded-lg">
                        <FiCalendar className="text-white text-xl" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Plan Expiry</p>
                        <p className="text-xl font-bold text-gray-900 dark:text-white">
                          {new Date(selectedShop.planExpiry).toLocaleDateString('en-IN')}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {selectedShop.planStartDate && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Started:</span>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {new Date(selectedShop.planStartDate).toLocaleDateString('en-IN')}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Days Remaining:</span>
                        <span className={`font-bold text-lg ${
                          getDaysRemaining(selectedShop.planExpiry) < 7 
                            ? 'text-red-600 dark:text-red-400' 
                            : getDaysRemaining(selectedShop.planExpiry) < 30
                            ? 'text-yellow-600 dark:text-yellow-400'
                            : 'text-green-600 dark:text-green-400'
                        }`}>
                          {getDaysRemaining(selectedShop.planExpiry)} days
                        </span>
                      </div>
                      {getDaysRemaining(selectedShop.planExpiry) < 7 && getDaysRemaining(selectedShop.planExpiry) > 0 && (
                        <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                          <p className="text-xs text-red-600 dark:text-red-400">
                            ⚠️ Plan expiring soon!
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Shop Details */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Shop Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Description</p>
                      <p className="text-gray-900 dark:text-white">{selectedShop.description || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Category</p>
                      <p className="text-gray-900 dark:text-white">{selectedShop.category}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Address</p>
                      <p className="text-gray-900 dark:text-white">
                        {selectedShop.address || 'N/A'}, {selectedShop.city}, {selectedShop.pincode}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Keywords</p>
                      <p className="text-gray-900 dark:text-white">{selectedShop.keywords || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                {selectedShop.contact && (
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Contact Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {selectedShop.contact.phone && (
                        <div className="flex items-center gap-3">
                          <FiPhone className="text-purple-600" />
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Phone</p>
                            <p className="text-gray-900 dark:text-white font-medium">{selectedShop.contact.phone}</p>
                          </div>
                        </div>
                      )}
                      {selectedShop.contact.email && (
                        <div className="flex items-center gap-3">
                          <FiMail className="text-purple-600" />
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                            <p className="text-gray-900 dark:text-white font-medium">{selectedShop.contact.email}</p>
                          </div>
                        </div>
                      )}
                      {selectedShop.contact.whatsapp && (
                        <div className="flex items-center gap-3">
                          <FiPhone className="text-green-600" />
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">WhatsApp</p>
                            <p className="text-gray-900 dark:text-white font-medium">{selectedShop.contact.whatsapp}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Agent & Operator Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Agent Details</h3>
                    {selectedShop.agentId ? (
                      <div className="space-y-2">
                        <p className="text-gray-900 dark:text-white font-medium">{selectedShop.agentId.name}</p>
                        {selectedShop.agentId.phone && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">{selectedShop.agentId.phone}</p>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400">No agent assigned</p>
                    )}
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Operator Details</h3>
                    {selectedShop.operatorId ? (
                      <div className="space-y-2">
                        <p className="text-gray-900 dark:text-white font-medium">{selectedShop.operatorId.name}</p>
                        {selectedShop.operatorId.phone && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">{selectedShop.operatorId.phone}</p>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400">No operator assigned</p>
                    )}
                  </div>
                </div>

                {/* Owner Info */}
                {selectedShop.ownerId && (
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Owner Details</h3>
                    <div className="space-y-2">
                      <p className="text-gray-900 dark:text-white font-medium">{selectedShop.ownerId.name}</p>
                      {selectedShop.ownerId.email && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">{selectedShop.ownerId.email}</p>
                      )}
                      {selectedShop.ownerId.phone && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">{selectedShop.ownerId.phone}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 text-center">
                    <FiEye className="mx-auto text-2xl text-purple-600 mb-2" />
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedShop.visitors || 0}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Visitors</p>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 text-center">
                    <FiStar className="mx-auto text-2xl text-yellow-600 mb-2" />
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedShop.homepagePriority || 0}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Priority</p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 text-center">
                    <FiClock className="mx-auto text-2xl text-green-600 mb-2" />
                    <p className="text-xs font-medium text-gray-900 dark:text-white">
                      {new Date(selectedShop.createdAt).toLocaleDateString('en-IN')}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Created</p>
                  </div>
                  {selectedShop.updatedAt && (
                    <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4 text-center">
                      <FiClock className="mx-auto text-2xl text-orange-600 mb-2" />
                      <p className="text-xs font-medium text-gray-900 dark:text-white">
                        {new Date(selectedShop.updatedAt).toLocaleDateString('en-IN')}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Updated</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer Actions */}
              <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-b-2xl">
                <div className="flex items-center justify-end gap-3">
                  <button
                    onClick={handleCloseModals}
                    className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      setShowEditModal(true);
                    }}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                  >
                    <FiEdit />
                    Edit Shop
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Shop Modal - Placeholder */}
      <AnimatePresence>
        {showEditModal && selectedShop && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={handleCloseModals}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Shop</h2>
                <button onClick={handleCloseModals} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                  <FiX className="text-2xl" />
                </button>
              </div>
              
              <div className="space-y-4">
                <p className="text-gray-600 dark:text-gray-400">
                  Edit functionality coming soon...
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  Shop Name: <span className="font-semibold text-gray-900 dark:text-white">{selectedShop.name}</span>
                </p>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={handleCloseModals}
                  className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Save Changes
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}



