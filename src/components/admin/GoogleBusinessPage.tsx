'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiSearch,
  FiPlus,
  FiRefreshCw,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiAlertCircle,
  FiExternalLink,
  FiEdit,
  FiTrash2,
  FiMapPin,
  FiPhone,
  FiMail,
  FiGlobe,
  FiStar,
  FiImage,
  FiSettings,
  FiDownload,
  FiFilter,
} from 'react-icons/fi';

interface GoogleBusinessAccount {
  _id: string;
  shopId: {
    _id: string;
    name: string;
    address: string;
    city: string;
  };
  shopperId: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  businessName: string;
  businessAddress: string;
  businessPhone: string;
  businessEmail?: string;
  businessWebsite?: string;
  locationId?: string;
  placeId?: string;
  status: 'pending' | 'connected' | 'verified' | 'suspended' | 'failed';
  verificationStatus?: 'verified' | 'unverified' | 'pending';
  googleRating?: number;
  googleReviewCount?: number;
  lastSynced?: string;
  syncEnabled: boolean;
  autoSync: boolean;
  errorCount: number;
  lastError?: string;
  createdAt: string;
}

export default function GoogleBusinessPage() {
  const [accounts, setAccounts] = useState<GoogleBusinessAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    verificationStatus: '',
  });
  const [selectedAccount, setSelectedAccount] = useState<GoogleBusinessAccount | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    shopId: '',
    businessName: '',
    businessAddress: '',
    businessPhone: '',
    businessEmail: '',
    businessWebsite: '',
    businessCategory: '',
    businessDescription: '',
    latitude: '',
    longitude: '',
  });
  const [shops, setShops] = useState<Array<{ _id: string; name: string; address: string; city: string }>>([]);
  const [loadingShopDetails, setLoadingShopDetails] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    connected: 0,
    verified: 0,
    pending: 0,
    failed: 0,
  });

  useEffect(() => {
    fetchAccounts();
    fetchShops();
    fetchStats();
  }, [filters]);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams();
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.verificationStatus) queryParams.append('verificationStatus', filters.verificationStatus);

      const response = await fetch(`/api/admin/google-business?${queryParams}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAccounts(data.accounts || []);
      }
    } catch (error) {
      console.error('Error fetching accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchShops = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/shops?limit=1000', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setShops(data.shops || []);
      }
    } catch (error) {
      console.error('Error fetching shops:', error);
    }
  };

  const handleShopSelect = async (shopId: string) => {
    if (!shopId) {
      // Reset form if no shop selected
      setCreateFormData({
        shopId: '',
        businessName: '',
        businessAddress: '',
        businessPhone: '',
        businessEmail: '',
        businessWebsite: '',
        businessCategory: '',
        businessDescription: '',
        latitude: '',
        longitude: '',
      });
      setLoadingShopDetails(false);
      return;
    }

    setLoadingShopDetails(true);
    try {
      // Fetch shop details from API
      const response = await fetch(`/api/shops/${shopId}`);

      if (response.ok) {
        const data = await response.json();
        const shop = data.shop;

        if (shop) {
          // Build full address from shop data
          const addressParts = [
            shop.address || '',
            shop.area || '',
            shop.city || '',
            shop.state || '',
            shop.pincode || '',
          ].filter(Boolean);

          // Auto-populate form with shop data
          setCreateFormData({
            shopId: shop._id,
            businessName: shop.name || '',
            businessAddress: addressParts.join(', '),
            businessPhone: shop.phone || shop.contact?.phone || '',
            businessEmail: shop.email || shop.contact?.email || '',
            businessWebsite: shop.website || '',
            businessCategory: shop.category || '',
            businessDescription: shop.description || '',
            latitude: shop.location?.coordinates?.[1]?.toString() || '',
            longitude: shop.location?.coordinates?.[0]?.toString() || '',
          });
        }
      } else {
        const errorData = await response.json();
        console.error('Failed to fetch shop details:', errorData.error);
        alert('Failed to load shop details. Please try again.');
        // Reset shop selection on error
        setCreateFormData({
          shopId: '',
          businessName: '',
          businessAddress: '',
          businessPhone: '',
          businessEmail: '',
          businessWebsite: '',
          businessCategory: '',
          businessDescription: '',
          latitude: '',
          longitude: '',
        });
      }
    } catch (error: any) {
      console.error('Error fetching shop details:', error);
      alert('Error loading shop details: ' + (error.message || 'Unknown error'));
      // Reset shop selection on error
      setCreateFormData({
        shopId: '',
        businessName: '',
        businessAddress: '',
        businessPhone: '',
        businessEmail: '',
        businessWebsite: '',
        businessCategory: '',
        businessDescription: '',
        latitude: '',
        longitude: '',
      });
    } finally {
      setLoadingShopDetails(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/google-business/stats', {
        headers: {
          Authorization: `Bearer ${token}`,
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

  const handleCreate = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/google-business', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(createFormData),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.oauthUrl) {
          // Redirect to OAuth flow
          window.location.href = data.oauthUrl;
        } else {
          setShowCreateModal(false);
          // Reset form after successful creation
          setCreateFormData({
            shopId: '',
            businessName: '',
            businessAddress: '',
            businessPhone: '',
            businessEmail: '',
            businessWebsite: '',
            businessCategory: '',
            businessDescription: '',
            latitude: '',
            longitude: '',
          });
          setLoadingShopDetails(false);
          fetchAccounts();
          fetchStats();
        }
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create account');
      }
    } catch (error: any) {
      alert(error.message || 'Failed to create account');
    }
  };

  const handleSync = async (accountId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/google-business/${accountId}/sync`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchAccounts();
        alert('Sync completed successfully');
      } else {
        const error = await response.json();
        alert(error.error || 'Sync failed');
      }
    } catch (error: any) {
      alert(error.message || 'Sync failed');
    }
  };

  const handleDelete = async (accountId: string) => {
    if (!confirm('Are you sure you want to delete this Google Business account?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/google-business/${accountId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchAccounts();
        fetchStats();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete account');
      }
    } catch (error: any) {
      alert(error.message || 'Failed to delete account');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'connected':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'suspended':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'failed':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <FiGlobe className="text-blue-600" />
            Google Business Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Create and manage Google Business Profile accounts for shoppers
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FiPlus />
            Create Account
          </button>
          <button
            onClick={fetchAccounts}
            className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            <FiRefreshCw className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {[
          { label: 'Total Accounts', value: stats.total, icon: FiGlobe, color: 'blue' },
          { label: 'Connected', value: stats.connected, icon: FiCheckCircle, color: 'green' },
          { label: 'Verified', value: stats.verified, icon: FiStar, color: 'yellow' },
          { label: 'Pending', value: stats.pending, icon: FiClock, color: 'orange' },
          { label: 'Failed', value: stats.failed, icon: FiXCircle, color: 'red' },
        ].map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-4">
              <stat.icon className={`text-${stat.color}-600 dark:text-${stat.color}-400 text-2xl`} />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{stat.label}</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-4">
          <FiFilter className="text-blue-600 dark:text-blue-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Filters</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search shops, shoppers..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
            />
          </div>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="connected">Connected</option>
            <option value="verified">Verified</option>
            <option value="suspended">Suspended</option>
            <option value="failed">Failed</option>
          </select>
          <select
            value={filters.verificationStatus}
            onChange={(e) => setFilters({ ...filters, verificationStatus: e.target.value })}
            className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Verification</option>
            <option value="verified">Verified</option>
            <option value="unverified">Unverified</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      {/* Accounts Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Shop & Shopper
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Business Details
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Google Rating
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Last Synced
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
                      <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
                    </div>
                  </td>
                </tr>
              ) : accounts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    No Google Business accounts found
                  </td>
                </tr>
              ) : (
                accounts.map((account) => (
                  <motion.tr
                    key={account._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {account.shopId?.name || 'N/A'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {account.shopperId?.name || 'N/A'} • {account.shopperId?.email || 'N/A'}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {account.businessName}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          <FiMapPin className="inline mr-1" />
                          {account.businessAddress}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          <FiPhone className="inline mr-1" />
                          {account.businessPhone}
                        </p>
                        {account.businessEmail && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            <FiMail className="inline mr-1" />
                            {account.businessEmail}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <span
                          className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(account.status)}`}
                        >
                          {account.status}
                        </span>
                        {account.verificationStatus && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {account.verificationStatus}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {account.googleRating ? (
                        <div className="flex items-center gap-1">
                          <FiStar className="text-yellow-500 fill-yellow-500" />
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {account.googleRating.toFixed(1)}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            ({account.googleReviewCount || 0})
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {account.lastSynced ? (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {new Date(account.lastSynced).toLocaleDateString()}
                        </p>
                      ) : (
                        <span className="text-sm text-gray-400">Never</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedAccount(account);
                            setShowDetailsModal(true);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <FiExternalLink />
                        </button>
                        <button
                          onClick={() => handleSync(account._id)}
                          className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                          title="Sync Now"
                        >
                          <FiRefreshCw />
                        </button>
                        <button
                          onClick={() => handleDelete(account._id)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <FiTrash2 />
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

      {/* Create Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => {
              setShowCreateModal(false);
              // Reset form when modal closes
              setCreateFormData({
                shopId: '',
                businessName: '',
                businessAddress: '',
                businessPhone: '',
                businessEmail: '',
                businessWebsite: '',
                businessCategory: '',
                businessDescription: '',
                latitude: '',
                longitude: '',
              });
              setLoadingShopDetails(false);
            }}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Create Google Business Account
                  </h2>
                  <button
                    onClick={() => {
                      setShowCreateModal(false);
                      // Reset form when modal closes
                      setCreateFormData({
                        shopId: '',
                        businessName: '',
                        businessAddress: '',
                        businessPhone: '',
                        businessEmail: '',
                        businessWebsite: '',
                        businessCategory: '',
                        businessDescription: '',
                        latitude: '',
                        longitude: '',
                      });
                      setLoadingShopDetails(false);
                    }}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <FiXCircle className="text-2xl" />
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select Shop *
                  </label>
                  <div className="relative">
                    <select
                      value={createFormData.shopId}
                      onChange={(e) => handleShopSelect(e.target.value)}
                      disabled={loadingShopDetails}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      required
                    >
                      <option value="">Select a shop</option>
                      {shops.map((shop) => (
                        <option key={shop._id} value={shop._id}>
                          {shop.name} - {shop.city}
                        </option>
                      ))}
                    </select>
                    {loadingShopDetails && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <FiRefreshCw className="animate-spin text-blue-600" />
                      </div>
                    )}
                  </div>
                  {createFormData.shopId && !loadingShopDetails && (
                    <p className="mt-1 text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                      <FiCheckCircle className="text-xs" />
                      Shop details loaded automatically from database
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Business Name *
                  </label>
                  <input
                    type="text"
                    value={createFormData.businessName}
                    onChange={(e) => setCreateFormData({ ...createFormData, businessName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Business Address *
                  </label>
                  <textarea
                    value={createFormData.businessAddress}
                    onChange={(e) => setCreateFormData({ ...createFormData, businessAddress: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Phone *
                    </label>
                    <input
                      type="tel"
                      value={createFormData.businessPhone}
                      onChange={(e) => setCreateFormData({ ...createFormData, businessPhone: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={createFormData.businessEmail}
                      onChange={(e) => setCreateFormData({ ...createFormData, businessEmail: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      placeholder="business@example.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Website
                  </label>
                  <input
                    type="url"
                    value={createFormData.businessWebsite}
                    onChange={(e) => setCreateFormData({ ...createFormData, businessWebsite: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category
                  </label>
                  <input
                    type="text"
                    value={createFormData.businessCategory}
                    onChange={(e) => setCreateFormData({ ...createFormData, businessCategory: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={createFormData.businessDescription}
                    onChange={(e) => setCreateFormData({ ...createFormData, businessDescription: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Latitude
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={createFormData.latitude}
                      onChange={(e) => setCreateFormData({ ...createFormData, latitude: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Longitude
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={createFormData.longitude}
                      onChange={(e) => setCreateFormData({ ...createFormData, longitude: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    // Reset form when modal closes
                    setCreateFormData({
                      shopId: '',
                      businessName: '',
                      businessAddress: '',
                      businessPhone: '',
                      businessEmail: '',
                      businessWebsite: '',
                      businessCategory: '',
                      businessDescription: '',
                      latitude: '',
                      longitude: '',
                    });
                    setLoadingShopDetails(false);
                  }}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Account
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Details Modal */}
      <AnimatePresence>
        {showDetailsModal && selectedAccount && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowDetailsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Account Details
                  </h2>
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <FiXCircle className="text-2xl" />
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</label>
                    <p className={`mt-1 px-3 py-1 inline-block rounded-full text-sm font-medium ${getStatusColor(selectedAccount.status)}`}>
                      {selectedAccount.status}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Verification</label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">
                      {selectedAccount.verificationStatus || 'N/A'}
                    </p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Location ID</label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white font-mono">
                    {selectedAccount.locationId || 'N/A'}
                  </p>
                </div>
                {selectedAccount.placeId && (
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Place ID</label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white font-mono">
                      {selectedAccount.placeId}
                    </p>
                  </div>
                )}
                {selectedAccount.lastError && (
                  <div>
                    <label className="text-sm font-medium text-red-500 dark:text-red-400">Last Error</label>
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {selectedAccount.lastError}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

