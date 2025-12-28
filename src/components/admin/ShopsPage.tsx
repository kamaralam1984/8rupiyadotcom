'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiEye, FiCheck, FiX, FiEdit, FiShoppingBag, FiImage, FiMapPin, FiMail, FiPhone, FiGlobe, FiStar } from 'react-icons/fi';
import ShopDrawer from './ShopDrawer';

interface Shop {
  _id: string;
  name: string;
  description?: string;
  category: string;
  city: string;
  state?: string;
  area?: string;
  address: string;
  pincode?: string;
  location?: {
    coordinates: [number, number];
  };
  phone?: string;
  email?: string;
  website?: string;
  images?: string[];
  photos?: string[];
  status: 'pending' | 'approved' | 'rejected' | 'active';
  paymentStatus?: 'pending' | 'paid' | 'failed';
  paymentMode?: 'cash' | 'online';
  planId?: {
    _id: string;
    name: string;
    price: number;
  };
  planExpiry?: string;
  shopperId?: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  agentId?: {
    _id: string;
    name: string;
    email: string;
  };
  operatorId?: {
    _id: string;
    name: string;
    email: string;
  };
  isFeatured?: boolean;
  rating?: number;
  reviewCount?: number;
  createdAt: string;
}

export default function ShopsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState('active');
  const [shops, setShops] = useState<Shop[]>([]);
  const [statusCounts, setStatusCounts] = useState({
    pending: 0,
    active: 0,
    rejected: 0,
    expired: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedShop, setSelectedShop] = useState<string | null>(null);

  useEffect(() => {
    const urlStatus = searchParams.get('status') || 'active';
    // Handle backward compatibility: if URL has 'approved', treat it as 'active'
    const normalizedStatus = urlStatus === 'approved' ? 'active' : urlStatus;
    setStatus(normalizedStatus);
  }, [searchParams]);

  useEffect(() => {
    fetchShops();
    fetchStatusCounts();
  }, [status]);

  const fetchShops = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/shops?status=${status}&limit=100`);
      const data = await response.json();
      
      if (data.shops) {
        // Strict filtering - only show shops with exact status match
        const filteredShops = data.shops.filter((shop: Shop) => {
          if (status === 'pending') {
            return shop.status === 'pending';
          } else if (status === 'active') {
            // Show both active and approved shops (for backward compatibility)
            const shopStatus = shop.status as string;
            return shopStatus === 'active' || shopStatus === 'approved';
          } else if (status === 'expired') {
            // Expired = active/approved shops with expired plan
            const shopStatus = shop.status as string;
            if (shopStatus !== 'active' && shopStatus !== 'approved') return false;
            if (!shop.planExpiry) return false;
            return new Date(shop.planExpiry) < new Date();
          } else {
            // For rejected, exact status match
            return shop.status === status;
          }
        });
        
        setShops(filteredShops);
      } else {
        setShops([]);
      }
    } catch (error) {
      console.error('Failed to fetch shops:', error);
      setShops([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatusCounts = async () => {
    try {
      const [pendingRes, activeRes, rejectedRes, expiredRes] = await Promise.all([
        fetch('/api/shops?status=pending&limit=1'),
        fetch('/api/shops?status=active&limit=1'),
        fetch('/api/shops?status=rejected&limit=1'),
        fetch('/api/shops?status=expired&limit=1'),
      ]);

      const pendingData = await pendingRes.json();
      const activeData = await activeRes.json();
      const rejectedData = await rejectedRes.json();
      const expiredData = await expiredRes.json();

      setStatusCounts({
        pending: pendingData.total || 0,
        active: activeData.total || 0,
        rejected: rejectedData.total || 0,
        expired: expiredData.total || 0,
      });
    } catch (error) {
      console.error('Failed to fetch status counts:', error);
    }
  };

  const handleApprove = async (shopId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login again');
        return;
      }

      const response = await fetch('/api/admin/shops/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ shopId, action: 'approve' }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Shop approved successfully!');
        fetchShops();
        fetchStatusCounts();
      } else {
        alert(data.error || 'Failed to approve shop');
      }
    } catch (error: any) {
      console.error('Approve error:', error);
      alert('Failed to approve shop: ' + (error.message || 'Unknown error'));
    }
  };

  const handleReject = async (shopId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login again');
        return;
      }

      const response = await fetch('/api/admin/shops/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ shopId, action: 'reject' }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Shop rejected successfully!');
        fetchShops();
        fetchStatusCounts();
      } else {
        alert(data.error || 'Failed to reject shop');
      }
    } catch (error: any) {
      console.error('Reject error:', error);
      alert('Failed to reject shop: ' + (error.message || 'Unknown error'));
    }
  };

  const handleStatusChange = (newStatus: string) => {
    router.push(`/admin/shops?status=${newStatus}`);
  };

  const getStatusBadge = (shopStatus: string) => {
    const statusColors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300', // Backward compatibility
      rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColors[shopStatus] || statusColors.pending}`}>
        {shopStatus}
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Shops Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage and approve shop listings</p>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-4 border-b border-gray-200 dark:border-gray-700">
        {['pending', 'active', 'rejected', 'expired'].map((tabStatus) => (
          <button
            key={tabStatus}
            onClick={() => handleStatusChange(tabStatus)}
            className={`px-6 py-3 font-medium capitalize transition-colors ${
              status === tabStatus
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {tabStatus} ({statusCounts[tabStatus as keyof typeof statusCounts]})
          </button>
        ))}
      </div>

      {/* Shops Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Image</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Shop ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Shop Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Category</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Location</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Email ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Contact</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Plan</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Payment</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Owner/Agent</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {shops.length === 0 ? (
                <tr>
                  <td colSpan={12} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                    No shops found with {status} status
                  </td>
                </tr>
              ) : (
                shops.map((shop) => (
                <motion.tr
                  key={shop._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <td className="px-4 py-4">
                    {(shop.images && shop.images.length > 0) || (shop.photos && shop.photos.length > 0) ? (
                      <img
                        src={(shop.images || shop.photos || [])[0]}
                        alt={shop.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                        <FiImage className="text-gray-400 text-xl" />
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm">
                        <p className="font-mono text-gray-900 dark:text-white text-xs break-all">{shop._id}</p>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(shop._id);
                          alert('Shop ID copied to clipboard!');
                        }}
                        className="mt-1 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        Copy
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{shop.name}</p>
                      {shop.description && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mt-1">{shop.description}</p>
                      )}
                      {shop.isFeatured && (
                        <span className="inline-block mt-1 px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded text-xs font-semibold">
                          Featured
                        </span>
                      )}
                    </div>
                  </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-gray-900 dark:text-white">{shop.category}</span>
                    </td>
                  <td className="px-4 py-4">
                    <div className="text-sm">
                        <p className="text-gray-900 dark:text-white">{shop.address}</p>
                        <p className="text-gray-500 dark:text-gray-400 text-xs">
                          {shop.city} {shop.state} {shop.pincode}
                        </p>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm">
                        <p className="text-gray-900 dark:text-white">{shop.email || 'N/A'}</p>
                        {shop.email && (
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(shop.email!);
                                alert('Email copied to clipboard!');
                            }}
                            className="mt-1 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            Copy
                          </button>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                      <div className="flex items-center gap-1 text-sm text-gray-900 dark:text-white">
                        <FiPhone className="text-gray-400" />
                        {shop.phone || 'N/A'}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                      <div className="text-sm">
                        <p className="text-gray-900 dark:text-white">{shop.planId?.name || 'No Plan'}</p>
                        {shop.planId && (
                          <>
                            <p className="text-gray-500 dark:text-gray-400 text-xs">₹{shop.planId.price}</p>
                        {shop.planExpiry && (
                              <p className="text-gray-500 dark:text-gray-400 text-xs">
                                Exp: {new Date(shop.planExpiry).toLocaleDateString()}
                          </p>
                        )}
                          </>
                    )}
                      </div>
                  </td>
                  <td className="px-4 py-4">
                      <div className="text-sm">
                        {getPaymentBadge(shop.paymentStatus)}
                      {shop.paymentMode && (
                          <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">{shop.paymentMode}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                      <div className="text-sm">
                        <p className="text-gray-900 dark:text-white">
                          Owner: {shop.shopperId?.name || 'N/A'}
                        </p>
                      {shop.agentId && (
                          <p className="text-gray-500 dark:text-gray-400 text-xs">
                          Agent: {shop.agentId.name}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                      {getStatusBadge(shop.status)}
                      {shop.rating && (
                        <div className="flex items-center gap-1 mt-1 text-xs text-gray-500 dark:text-gray-400">
                          <FiStar className="text-yellow-500" />
                          {shop.rating.toFixed(1)} ({shop.reviewCount || 0})
                    </div>
                      )}
                  </td>
                    <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedShop(shop._id)}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                          title="View & Edit Details"
                      >
                        <FiEdit />
                      </button>
                      <button
                        onClick={() => setSelectedShop(shop._id)}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                          title="View Details"
                      >
                        <FiEye />
                      </button>
                        {status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(shop._id)}
                              className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                              title="Approve"
                          >
                            <FiCheck />
                          </button>
                          <button
                            onClick={() => handleReject(shop._id)}
                              className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                              title="Reject"
                          >
                            <FiX />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Shop Drawer */}
      {selectedShop && (
        <ShopDrawer
          shopId={selectedShop}
          onClose={() => setSelectedShop(null)}
        />
      )}
    </div>
  );
}

