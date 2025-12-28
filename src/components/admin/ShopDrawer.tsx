'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiX, FiMapPin, FiUser, FiCreditCard, FiCheck, FiXCircle, 
  FiMail, FiPhone, FiGlobe, FiCalendar, FiTag, FiStar, FiImage,
  FiDollarSign, FiClock, FiShoppingBag, FiEdit, FiTrash2
} from 'react-icons/fi';

interface ShopDrawerProps {
  shopId: string;
  onClose: () => void;
}

interface Shop {
  _id: string;
  name: string;
  description: string;
  category: string;
  address: string;
  area?: string;
  city: string;
  state: string;
  pincode: string;
  location?: {
    type: string;
    coordinates: [number, number]; // [longitude, latitude]
  };
  phone: string;
  email: string;
  website?: string;
  images: string[];
  photos?: string[];
  status: string;
  paymentStatus?: string;
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
  isFeatured: boolean;
  rating: number;
  reviewCount: number;
  visitorCount?: number;
  rankScore: number;
  manualRank?: number;
  homepagePriority: number;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  offers?: Array<{
    title: string;
    description: string;
    validUntil?: string;
  }>;
  pages?: Array<{
    title: string;
    content: string;
    slug: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export default function ShopDrawer({ shopId, onClose }: ShopDrawerProps) {
  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [increasingVisitors, setIncreasingVisitors] = useState(false);

  useEffect(() => {
    fetchShopDetails();
  }, [shopId]);

  const fetchShopDetails = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/shops/${shopId}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      });

      if (!response.ok) {
        throw new Error('Failed to fetch shop details');
      }

      const data = await response.json();
      if (data.shop) {
        setShop(data.shop);
      } else {
        throw new Error('Shop not found');
      }
    } catch (err: any) {
      console.error('Error fetching shop:', err);
      setError(err.message || 'Failed to load shop details');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
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

      if (response.ok) {
        alert('Shop approved successfully!');
        onClose();
        window.location.reload(); // Refresh to update list
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to approve shop');
      }
    } catch (err: any) {
      alert('Failed to approve shop: ' + err.message);
    }
  };

  const handleReject = async () => {
    if (!confirm('Are you sure you want to reject this shop?')) {
      return;
    }

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

      if (response.ok) {
        alert('Shop rejected');
        onClose();
        window.location.reload(); // Refresh to update list
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to reject shop');
      }
    } catch (err: any) {
      alert('Failed to reject shop: ' + err.message);
    }
  };

  const handleEdit = () => {
    if (shop) {
      setEditFormData({
        name: shop.name,
        description: shop.description,
        category: shop.category,
        address: shop.address,
        area: shop.area || '',
        city: shop.city,
        state: shop.state,
        pincode: shop.pincode,
        phone: shop.phone,
        email: shop.email,
        website: shop.website || '',
        latitude: shop.location?.coordinates?.[1]?.toString() || '',
        longitude: shop.location?.coordinates?.[0]?.toString() || '',
      });
      setIsEditing(true);
    }
  };

  const handleSaveEdit = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login again');
        return;
      }

      // Prepare update data with location coordinates
      const updateData: any = { ...editFormData };
      
      // Update location if latitude and longitude are provided
      if (updateData.latitude && updateData.longitude) {
        updateData.location = {
          type: 'Point',
          coordinates: [parseFloat(updateData.longitude), parseFloat(updateData.latitude)], // [longitude, latitude]
        };
        // Remove latitude and longitude from updateData as they're not part of the schema
        delete updateData.latitude;
        delete updateData.longitude;
      }

      const response = await fetch(`/api/shops/${shopId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        alert('Shop updated successfully!');
        setIsEditing(false);
        fetchShopDetails(); // Refresh shop data
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to update shop');
      }
    } catch (err: any) {
      alert('Failed to update shop: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleIncreaseVisitors = async (amount: number) => {
    if (!confirm(`Add ${amount} visitors to this shop?`)) {
      return;
    }

    try {
      setIncreasingVisitors(true);
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login again');
        return;
      }

      const response = await fetch(`/api/admin/shops/${shopId}/visitors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ amount }),
      });

      if (response.ok) {
        const data = await response.json();
        alert(data.message || `Successfully added ${amount} visitors!`);
        fetchShopDetails(); // Refresh shop data
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to increase visitors');
      }
    } catch (err: any) {
      alert('Failed to increase visitors: ' + err.message);
    } finally {
      setIncreasingVisitors(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />

        {/* Drawer */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="absolute right-0 top-0 h-full w-full max-w-2xl bg-white dark:bg-gray-800 shadow-2xl"
        >
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {isEditing ? 'Edit Shop' : 'Shop Details'}
              </h2>
              <div className="flex items-center gap-2">
                {!isEditing && shop && (
                  <button
                    onClick={handleEdit}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-blue-600"
                    title="Edit Shop"
                  >
                    <FiEdit className="text-xl" />
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <FiX className="text-2xl" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
                </div>
              ) : error ? (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
                  {error}
                </div>
              ) : shop ? (
                <>
                  {isEditing ? (
                    /* Edit Form */
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Shop Name *
                        </label>
                        <input
                          type="text"
                          value={editFormData.name || ''}
                          onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Description *
                        </label>
                        <textarea
                          value={editFormData.description || ''}
                          onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                          rows={3}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Category *
                          </label>
                          <input
                            type="text"
                            value={editFormData.category || ''}
                            onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            City *
                          </label>
                          <input
                            type="text"
                            value={editFormData.city || ''}
                            onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Address *
                        </label>
                        <textarea
                          value={editFormData.address || ''}
                          onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                          rows={2}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            State *
                          </label>
                          <input
                            type="text"
                            value={editFormData.state || ''}
                            onChange={(e) => setEditFormData({ ...editFormData, state: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Pincode *
                          </label>
                          <input
                            type="text"
                            value={editFormData.pincode || ''}
                            onChange={(e) => setEditFormData({ ...editFormData, pincode: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Phone *
                          </label>
                          <input
                            type="text"
                            value={editFormData.phone || ''}
                            onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Email *
                          </label>
                          <input
                            type="email"
                            value={editFormData.email || ''}
                            onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Website
                        </label>
                        <input
                          type="url"
                          value={editFormData.website || ''}
                          onChange={(e) => setEditFormData({ ...editFormData, website: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Area
                        </label>
                        <input
                          type="text"
                          value={editFormData.area || ''}
                          onChange={(e) => setEditFormData({ ...editFormData, area: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Latitude *
                          </label>
                          <input
                            type="number"
                            step="any"
                            value={editFormData.latitude || ''}
                            onChange={(e) => setEditFormData({ ...editFormData, latitude: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            placeholder="e.g., 25.5941"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Longitude *
                          </label>
                          <input
                            type="number"
                            step="any"
                            value={editFormData.longitude || ''}
                            onChange={(e) => setEditFormData({ ...editFormData, longitude: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            placeholder="e.g., 85.1376"
                          />
                        </div>
                      </div>
                      <div className="flex gap-4 pt-4">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleSaveEdit}
                          disabled={saving}
                          className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                        >
                          {saving ? 'Saving...' : 'Save Changes'}
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setIsEditing(false)}
                          className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                        >
                          Cancel
                        </motion.button>
                      </div>
                    </div>
                  ) : (
                    <>
                  {/* Shop Images */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <FiImage /> Images ({shop.images?.length || 0})
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      {(shop.images && shop.images.length > 0) || (shop.photos && shop.photos.length > 0) ? (
                        (shop.images || shop.photos || []).map((img: string, idx: number) => (
                          <img key={idx} src={img} alt={`${shop.name} - Image ${idx + 1}`} className="rounded-lg w-full h-32 object-cover" />
                        ))
                      ) : (
                        <div className="col-span-2 bg-gray-200 dark:bg-gray-700 rounded-lg h-48 flex items-center justify-center">
                          <p className="text-gray-500">No images available</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Basic Shop Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <FiShoppingBag /> Shop Information
                    </h3>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Shop Name</p>
                          <p className="text-lg font-medium text-gray-900 dark:text-white">{shop.name}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Category</p>
                          <p className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-1">
                            <FiTag className="text-sm" /> {shop.category}
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Description</p>
                        <p className="text-gray-900 dark:text-white">{shop.description || 'No description provided'}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Rating</p>
                          <p className="text-gray-900 dark:text-white flex items-center gap-1">
                            <FiStar className="text-yellow-500 fill-yellow-500" />
                            {shop.rating?.toFixed(1) || '0.0'} ({shop.reviewCount || 0} reviews)
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                            shop.status === 'active' || shop.status === 'approved'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                              : shop.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                          }`}>
                            {shop.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <FiPhone /> Contact Information
                    </h3>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                            <FiPhone className="text-xs" /> Phone
                          </p>
                          <p className="text-gray-900 dark:text-white">{shop.phone}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                            <FiMail className="text-xs" /> Email
                          </p>
                          <p className="text-gray-900 dark:text-white">{shop.email}</p>
                        </div>
                      </div>
                      {shop.website && (
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                            <FiGlobe className="text-xs" /> Website
                          </p>
                          <a href={shop.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">
                            {shop.website}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Address & Location */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <FiMapPin /> Address & Location
                    </h3>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-3">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Full Address</p>
                        <p className="text-gray-900 dark:text-white">
                          {shop.address}
                          {shop.area && `, ${shop.area}`}
                          {shop.city && `, ${shop.city}`}
                          {shop.state && `, ${shop.state}`}
                          {shop.pincode && ` - ${shop.pincode}`}
                        </p>
                      </div>
                      {shop.location?.coordinates && (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Latitude</p>
                            <p className="text-gray-900 dark:text-white">{shop.location.coordinates[1]?.toFixed(6)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Longitude</p>
                            <p className="text-gray-900 dark:text-white">{shop.location.coordinates[0]?.toFixed(6)}</p>
                          </div>
                        </div>
                      )}
                      {shop.location?.coordinates && (
                        <div className="mt-4">
                          <a
                            href={`https://www.google.com/maps?q=${shop.location.coordinates[1]},${shop.location.coordinates[0]}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                          >
                            <FiMapPin /> View on Google Maps
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Plan Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <FiCreditCard /> Plan Information
                    </h3>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-3">
                      {shop.planId ? (
                        <>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Plan Name</p>
                              <p className="text-lg font-medium text-gray-900 dark:text-white">{shop.planId.name}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Plan Price</p>
                              <p className="text-lg font-medium text-gray-900 dark:text-white">₹{shop.planId.price?.toLocaleString() || '0'}</p>
                            </div>
                          </div>
                          {shop.planExpiry && (
                            <div>
                              <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                                <FiCalendar className="text-xs" /> Plan Expiry
                              </p>
                              <p className="text-gray-900 dark:text-white">
                                {new Date(shop.planExpiry).toLocaleDateString()}
                                {new Date(shop.planExpiry) < new Date() && (
                                  <span className="ml-2 text-red-600 dark:text-red-400 text-sm font-semibold">(Expired)</span>
                                )}
                              </p>
                            </div>
                          )}
                        </>
                      ) : (
                        <p className="text-gray-600 dark:text-gray-400">No plan assigned</p>
                      )}
                    </div>
                  </div>

                  {/* Payment Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <FiDollarSign /> Payment Information
                    </h3>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Payment Status</p>
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                            shop.paymentStatus === 'paid'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                              : shop.paymentStatus === 'pending'
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                          }`}>
                            {shop.paymentStatus || 'pending'}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Payment Mode</p>
                          <p className="text-gray-900 dark:text-white capitalize">{shop.paymentMode || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* User Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <FiUser /> User Information
                    </h3>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-4">
                      {shop.shopperId && (
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Shop Owner (Shopper)</p>
                          <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                            <p className="font-medium text-gray-900 dark:text-white">{shop.shopperId.name}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{shop.shopperId.email}</p>
                            {shop.shopperId.phone && (
                              <p className="text-sm text-gray-600 dark:text-gray-400">{shop.shopperId.phone}</p>
                            )}
                          </div>
                        </div>
                      )}
                      {shop.agentId && (
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Assigned Agent</p>
                          <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                            <p className="font-medium text-gray-900 dark:text-white">{shop.agentId.name}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{shop.agentId.email}</p>
                          </div>
                        </div>
                      )}
                      {shop.operatorId && (
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Assigned Operator</p>
                          <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                            <p className="font-medium text-gray-900 dark:text-white">{shop.operatorId.name}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{shop.operatorId.email}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Ranking & Priority */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <FiStar /> Ranking & Priority
                    </h3>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-3">
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Rank Score</p>
                          <p className="text-lg font-medium text-gray-900 dark:text-white">{shop.rankScore?.toFixed(2) || '0.00'}</p>
                        </div>
                        {shop.manualRank !== undefined && (
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Manual Rank</p>
                            <p className="text-lg font-medium text-gray-900 dark:text-white">{shop.manualRank}</p>
                          </div>
                        )}
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Homepage Priority</p>
                          <p className="text-lg font-medium text-gray-900 dark:text-white">{shop.homepagePriority || 0}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={shop.isFeatured || false}
                            disabled
                            className="w-4 h-4 text-blue-600 rounded"
                          />
                          <label className="text-sm text-gray-600 dark:text-gray-400">Featured Shop</label>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SEO Information */}
                  {(shop.seoTitle || shop.seoDescription || shop.seoKeywords) && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">SEO Information</h3>
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-3">
                        {shop.seoTitle && (
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">SEO Title</p>
                            <p className="text-gray-900 dark:text-white">{shop.seoTitle}</p>
                          </div>
                        )}
                        {shop.seoDescription && (
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">SEO Description</p>
                            <p className="text-gray-900 dark:text-white">{shop.seoDescription}</p>
                          </div>
                        )}
                        {shop.seoKeywords && (
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">SEO Keywords</p>
                            <p className="text-gray-900 dark:text-white">{shop.seoKeywords}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Offers */}
                  {shop.offers && shop.offers.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Offers ({shop.offers.length})</h3>
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-3">
                        {shop.offers.map((offer: any, idx: number) => (
                          <div key={idx} className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                            <p className="font-medium text-gray-900 dark:text-white">{offer.title}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{offer.description}</p>
                            {offer.validUntil && (
                              <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                                Valid until: {new Date(offer.validUntil).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Pages */}
                  {shop.pages && shop.pages.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Custom Pages ({shop.pages.length})</h3>
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-3">
                        {shop.pages.map((page: any, idx: number) => (
                          <div key={idx} className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                            <p className="font-medium text-gray-900 dark:text-white">{page.title}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-500">Slug: {page.slug}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Visitor Management */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <FiUser /> Visitor Management
                    </h3>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Current Visitors</p>
                          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                            {shop.visitorCount || 0}
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Increase Visitors</p>
                        <div className="grid grid-cols-3 gap-3">
                          {[100, 200, 300].map((amount) => (
                            <motion.button
                              key={amount}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleIncreaseVisitors(amount)}
                              disabled={increasingVisitors}
                              className="px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              +{amount}
                            </motion.button>
                          ))}
                        </div>
                        {increasingVisitors && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                            Updating visitors...
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Timestamps */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <FiClock /> Timestamps
                    </h3>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Created At:</span>
                        <span className="text-sm text-gray-900 dark:text-white">
                          {new Date(shop.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Last Updated:</span>
                        <span className="text-sm text-gray-900 dark:text-white">
                          {new Date(shop.updatedAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                    </>
                  )}
                </>
              ) : null}
            </div>

            {/* Footer Actions */}
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-4">
              {shop?.status === 'pending' && (
                <>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleReject}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg font-semibold hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                  >
                    <FiXCircle />
                    Reject
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleApprove}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all"
                  >
                    <FiCheck />
                    Approve
                  </motion.button>
                </>
              )}
              {shop?.status !== 'pending' && (
                <div className="flex-1 text-center text-sm text-gray-600 dark:text-gray-400">
                  Shop is {shop?.status}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

