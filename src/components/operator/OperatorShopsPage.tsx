'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiShoppingBag, FiSearch, FiFilter, FiEye, FiEdit, FiMapPin, FiMail, FiPhone, FiGlobe, FiStar, FiCheck, FiX } from 'react-icons/fi';

interface Shop {
  _id: string;
  name: string;
  description?: string;
  category: string;
  address: string;
  city: string;
  state?: string;
  pincode?: string;
  phone?: string;
  email?: string;
  website?: string;
  images?: string[];
  status: 'pending' | 'approved' | 'rejected';
  planName?: string;
  planId?: {
    _id: string;
    name: string;
    price: number;
  };
  planExpiry?: string;
  paymentStatus?: 'pending' | 'paid' | 'failed';
  paymentMode?: 'cash' | 'online';
  agentId?: {
    _id: string;
    name: string;
  };
  shopperId?: {
    _id: string;
    name: string;
  };
  isFeatured?: boolean;
  rating?: number;
  reviewCount?: number;
  createdAt: string;
}

export default function OperatorShopsPage() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);

  useEffect(() => {
    fetchShops();
  }, []);

  const fetchShops = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch('/api/operator/shops', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setShops(data.shops || []);
        }
      }
    } catch (error) {
      console.error('Failed to fetch shops:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredShops = shops.filter(shop => {
    const matchesSearch = shop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         shop.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         shop.city.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || shop.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colors[status] || colors.pending}`}>
        {status}
      </span>
    );
  };

  const getPaymentBadge = (paymentStatus?: string) => {
    if (!paymentStatus) return null;
    const colors: Record<string, string> = {
      paid: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      failed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colors[paymentStatus] || colors.pending}`}>
        {paymentStatus}
      </span>
    );
  };

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
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Shops</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your shop listings</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{shops.length}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Shops</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search shops by name, category, or city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div className="relative">
            <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Shops Grid */}
      {filteredShops.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 border border-gray-200 dark:border-gray-700 text-center">
          <FiShoppingBag className="text-6xl text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            {searchTerm || statusFilter !== 'all' 
              ? 'No shops found matching your filters' 
              : 'No shops found. Start by adding your first shop!'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredShops.map((shop, index) => (
            <motion.div
              key={shop._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-2xl transition-all"
            >
              {/* Shop Image */}
              <div className="relative h-48 bg-gradient-to-br from-blue-400 to-purple-500">
                {shop.images && shop.images.length > 0 ? (
                  <img
                    src={shop.images[0]}
                    alt={shop.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FiShoppingBag className="text-6xl text-white opacity-50" />
                  </div>
                )}
                {shop.isFeatured && (
                  <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                    Featured
                  </div>
                )}
                <div className="absolute top-2 left-2">
                  {getStatusBadge(shop.status)}
                </div>
              </div>

              {/* Shop Details */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-1">
                  {shop.name}
                </h3>
                {shop.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                    {shop.description}
                  </p>
                )}
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <FiShoppingBag className="text-gray-400" />
                    <span>{shop.category}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <FiMapPin className="text-gray-400" />
                    <span>{shop.city}, {shop.state} {shop.pincode}</span>
                  </div>
                  {shop.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <FiPhone className="text-gray-400" />
                      <span>{shop.phone}</span>
                    </div>
                  )}
                  {shop.email && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <FiMail className="text-gray-400" />
                      <span className="truncate">{shop.email}</span>
                    </div>
                  )}
                </div>

                {/* Plan and Payment Info */}
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Plan</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {shop.planName || 'No Plan'}
                    </p>
                    {shop.planId && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        ₹{shop.planId.price}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Payment</p>
                    {getPaymentBadge(shop.paymentStatus)}
                    {shop.paymentMode && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {shop.paymentMode}
                      </p>
                    )}
                  </div>
                </div>

                {/* Rating */}
                {shop.rating && (
                  <div className="flex items-center gap-1 mb-4">
                    <FiStar className="text-yellow-500 fill-yellow-500" />
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {shop.rating.toFixed(1)}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      ({shop.reviewCount || 0} reviews)
                    </span>
                  </div>
                )}

                {/* Agent Info */}
                {shop.agentId && (
                  <div className="mb-4 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Agent</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {shop.agentId.name}
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedShop(shop)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    <FiEye />
                    View
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Shop Detail Modal */}
      {selectedShop && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Shop Details</h3>
                <button
                  onClick={() => setSelectedShop(null)}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-2xl"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Shop Name</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{selectedShop.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Category</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{selectedShop.category}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                  {getStatusBadge(selectedShop.status)}
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Payment Status</p>
                  {getPaymentBadge(selectedShop.paymentStatus)}
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Plan</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {selectedShop.planName || 'No Plan'}
                  </p>
                </div>
                {selectedShop.rating && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Rating</p>
                    <div className="flex items-center gap-1">
                      <FiStar className="text-yellow-500 fill-yellow-500" />
                      <span className="text-lg font-semibold text-gray-900 dark:text-white">
                        {selectedShop.rating.toFixed(1)} ({selectedShop.reviewCount || 0})
                      </span>
                    </div>
                  </div>
                )}
              </div>
              {selectedShop.description && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Description</p>
                  <p className="text-gray-900 dark:text-white">{selectedShop.description}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Address</p>
                <p className="text-gray-900 dark:text-white">
                  {selectedShop.address}, {selectedShop.city}, {selectedShop.state} {selectedShop.pincode}
                </p>
              </div>
              {selectedShop.phone && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Phone</p>
                  <p className="text-gray-900 dark:text-white">{selectedShop.phone}</p>
                </div>
              )}
              {selectedShop.email && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Email</p>
                  <p className="text-gray-900 dark:text-white">{selectedShop.email}</p>
                </div>
              )}
              {selectedShop.agentId && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Agent</p>
                  <p className="text-gray-900 dark:text-white">{selectedShop.agentId.name}</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

