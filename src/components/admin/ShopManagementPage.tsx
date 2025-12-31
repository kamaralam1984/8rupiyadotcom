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
  FiImage,
  FiUpload,
  FiPlus,
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
  photos?: string[];
  keywords?: string;
  seoKeywords?: string;
  seoTitle?: string;
  seoDescription?: string;
  isFeatured: boolean;
  homepagePriority: number;
  visitors: number;
  rating: number;
  reviewCount: number;
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
  const [editFormData, setEditFormData] = useState({
    name: '',
    category: '',
    address: '',
    city: '',
    pincode: '',
    phone: '',
    email: '',
    keywords: '',
    isFeatured: false,
    homepagePriority: 0,
    rating: 0,
    reviewCount: 0,
    status: 'pending' as 'pending' | 'approved' | 'rejected' | 'active',
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const [currentImages, setCurrentImages] = useState<string[]>([]);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [imageUploading, setImageUploading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    active: 0,
    expired: 0,
  });
  const [categories, setCategories] = useState<Array<{ _id: string; name: string; slug: string; icon?: string }>>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    fetchShops();
    fetchStats();
    fetchCategories();
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

  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      
      if (response.ok && data.success) {
        setCategories(data.categories || []);
      } else {
        console.error('Failed to fetch categories:', data.error);
        setCategories([]);
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      setCategories([]);
    } finally {
      setLoadingCategories(false);
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
    setEditFormData({
      name: shop.name || '',
      category: shop.category || '',
      address: shop.address || '',
      city: shop.city || '',
      pincode: shop.pincode || '',
      phone: shop.contact?.phone || '',
      email: shop.contact?.email || '',
      // Keywords from SEO keywords (database linked)
      keywords: (shop as any).seoKeywords || shop.keywords || '',
      isFeatured: shop.isFeatured || false,
      homepagePriority: shop.homepagePriority || 0,
      rating: shop.rating || 0,
      reviewCount: shop.reviewCount || 0,
      status: shop.status || 'pending',
    });
    // Set images from database (images or photos array)
    setCurrentImages(shop.images || (shop as any).photos || []);
    setNewImageFiles([]);
    setImagePreviewUrls([]);
    setEditError('');
    setShowEditModal(true);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Limit total images to 5
    const totalImages = currentImages.length + newImageFiles.length + files.length;
    if (totalImages > 5) {
      setEditError('Maximum 5 images allowed');
      return;
    }

    // Validate file types and sizes
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/');
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB
      
      if (!isValidType) {
        setEditError(`${file.name} is not a valid image file`);
        return false;
      }
      if (!isValidSize) {
        setEditError(`${file.name} is too large (max 5MB)`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    // Create preview URLs
    const newPreviews = validFiles.map(file => URL.createObjectURL(file));
    
    setNewImageFiles(prev => [...prev, ...validFiles]);
    setImagePreviewUrls(prev => [...prev, ...newPreviews]);
    setEditError('');
  };

  const handleRemoveCurrentImage = (index: number) => {
    setCurrentImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleRemoveNewImage = (index: number) => {
    // Revoke the preview URL to free memory
    URL.revokeObjectURL(imagePreviewUrls[index]);
    
    setNewImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const uploadImages = async (files: File[]): Promise<string[]> => {
    const uploadedUrls: string[] = [];
    const token = localStorage.getItem('token');

    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          uploadedUrls.push(data.url);
        } else {
          console.error('Failed to upload image:', file.name);
        }
      } catch (error) {
        console.error('Error uploading image:', error);
      }
    }

    return uploadedUrls;
  };

  const handleSaveEdit = async () => {
    if (!selectedShop) return;

    try {
      setEditLoading(true);
      setEditError('');

      // Upload new images first
      let uploadedImageUrls: string[] = [];
      if (newImageFiles.length > 0) {
        setImageUploading(true);
        uploadedImageUrls = await uploadImages(newImageFiles);
        setImageUploading(false);
      }

      // Combine current images with newly uploaded images
      const allImages = [...currentImages, ...uploadedImageUrls];

      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/shops/${selectedShop._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editFormData.name,
          category: editFormData.category,
          address: editFormData.address,
          city: editFormData.city,
          pincode: editFormData.pincode,
          contact: {
            phone: editFormData.phone,
            email: editFormData.email,
            // WhatsApp removed as per requirement
          },
          keywords: editFormData.keywords,
          seoKeywords: editFormData.keywords, // Save to SEO keywords as well
          images: allImages,
          photos: allImages, // Also save to photos array for compatibility
          isFeatured: editFormData.isFeatured,
          homepagePriority: editFormData.homepagePriority,
          status: editFormData.status,
        }),
      });

      if (response.ok) {
        // Clean up preview URLs
        imagePreviewUrls.forEach(url => URL.revokeObjectURL(url));
        
        await fetchShops();
        await fetchStats();
        handleCloseModals();
      } else {
        const data = await response.json();
        setEditError(data.error || 'Failed to update shop');
      }
    } catch (error) {
      console.error('Error updating shop:', error);
      setEditError('Failed to update shop. Please try again.');
    } finally {
      setEditLoading(false);
      setImageUploading(false);
    }
  };

  const handleUpdateRating = async (shopId: string, rating: number, reviewCount: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/shops/${shopId}/rating`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ rating, reviewCount }),
      });

      if (response.ok) {
        await fetchShops();
        return true;
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to update rating');
        return false;
      }
    } catch (error) {
      console.error('Error updating rating:', error);
      alert('Failed to update rating. Please try again.');
      return false;
    }
  };

  const handleDeleteShop = async (shopId: string, shopName: string) => {
    if (!confirm(`Are you sure you want to delete "${shopName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/shops/${shopId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        await fetchShops();
        await fetchStats();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete shop');
      }
    } catch (error) {
      console.error('Error deleting shop:', error);
      alert('Failed to delete shop. Please try again.');
    }
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
                <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Image
                </th>
                <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Shop Details
                </th>
                <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Contact Info
                </th>
                <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Location & Address
                </th>
                <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Plan & Status
                </th>
                <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Coordinates
                </th>
                <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-4 border-purple-600 border-t-transparent"></div>
                    </div>
                  </td>
                </tr>
              ) : shops.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
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
                    {/* Image Column */}
                    <td className="px-4 py-4">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                        {shop.images && shop.images.length > 0 ? (
                          <img 
                            src={shop.images[0]} 
                            alt={shop.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/64?text=No+Image';
                            }}
                          />
                        ) : (
                          <span className="text-2xl">🏪</span>
                        )}
                      </div>
                    </td>

                    {/* Shop Details Column */}
                    <td className="px-4 py-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-gray-900 dark:text-white">{shop.name}</p>
                          {shop.isFeatured && (
                            <FiStar className="text-yellow-500 fill-yellow-500" title="Featured" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{shop.category}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(shop.status)}`}>
                            {shop.status}
                          </span>
                          {isExpired(shop.planExpiry) && (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                              Expired
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-2">
                          <div className="flex items-center gap-1">
                            <FiEye className="text-gray-400" />
                            <span>{shop.visitors || 0} visitors</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <FiStar className={`${shop.rating >= 4.0 ? 'text-yellow-500 fill-yellow-500' : 'text-gray-400'}`} />
                            <span className={`font-semibold ${shop.rating >= 4.0 ? 'text-yellow-600 dark:text-yellow-400' : 'text-gray-600 dark:text-gray-400'}`}>
                              {shop.rating.toFixed(1)}
                            </span>
                            <span className="text-gray-400">({shop.reviewCount})</span>
                          </div>
                        </div>
                        {shop.rating >= 4.0 && (
                          <div className="mt-2">
                            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 text-yellow-800 dark:text-yellow-300 border border-yellow-300 dark:border-yellow-700">
                              🏆 Top Rated
                            </span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Contact Info Column */}
                    <td className="px-4 py-4">
                      <div className="text-sm space-y-2">
                        {shop.contact?.phone ? (
                          <div className="flex items-center gap-2">
                            <FiPhone className="text-green-600 text-xs" />
                            <span className="text-gray-900 dark:text-white font-medium">{shop.contact.phone}</span>
                          </div>
                        ) : (
                          <p className="text-gray-400 text-xs">No phone</p>
                        )}
                        {shop.contact?.email ? (
                          <div className="flex items-center gap-2">
                            <FiMail className="text-blue-600 text-xs" />
                            <span className="text-gray-700 dark:text-gray-300 text-xs truncate max-w-[150px]" title={shop.contact.email}>
                              {shop.contact.email}
                            </span>
                          </div>
                        ) : (
                          <p className="text-gray-400 text-xs">No email</p>
                        )}
                        {shop.contact?.whatsapp && (
                          <div className="flex items-center gap-2">
                            <FiPhone className="text-green-500 text-xs" />
                            <span className="text-gray-700 dark:text-gray-300 text-xs">WhatsApp</span>
                          </div>
                        )}
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                          <div className="flex items-center gap-1">
                            <FiUser className="text-xs" />
                            <span>Agent: {shop.agentId?.name || 'None'}</span>
                          </div>
                          {shop.operatorId && (
                            <div className="flex items-center gap-1 mt-1">
                              <FiUser className="text-xs" />
                              <span>Op: {shop.operatorId.name}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Location & Address Column */}
                    <td className="px-4 py-4">
                      <div className="text-sm space-y-1">
                        <div className="flex items-start gap-2">
                          <FiMapPin className="text-purple-600 text-xs mt-1 flex-shrink-0" />
                          <div>
                            <p className="text-gray-900 dark:text-white font-medium">{shop.city}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">PIN: {shop.pincode}</p>
                            {shop.address && (
                              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 line-clamp-2" title={shop.address}>
                                {shop.address}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Plan & Status Column */}
                    <td className="px-4 py-4">
                      <div className="space-y-2">
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {shop.planId?.name || 'N/A'}
                          </p>
                          <p className="text-sm font-bold text-purple-600 dark:text-purple-400">
                            ₹{shop.planId?.price?.toLocaleString('en-IN') || 0}
                          </p>
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          <p>Expires: {new Date(shop.planExpiry).toLocaleDateString('en-IN', { 
                            day: '2-digit', 
                            month: 'short'
                          })}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <FiClock className={`${
                              getDaysRemaining(shop.planExpiry) < 7 
                                ? 'text-red-500' 
                                : getDaysRemaining(shop.planExpiry) < 30
                                ? 'text-yellow-500'
                                : 'text-green-500'
                            }`} />
                            <span className={`font-semibold ${
                              getDaysRemaining(shop.planExpiry) < 7 
                                ? 'text-red-600 dark:text-red-400' 
                                : getDaysRemaining(shop.planExpiry) < 30
                                ? 'text-yellow-600 dark:text-yellow-400'
                                : 'text-green-600 dark:text-green-400'
                            }`}>
                              {getDaysRemaining(shop.planExpiry)}d
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Coordinates Column */}
                    <td className="px-4 py-4">
                      <div className="text-xs space-y-1">
                        {shop.location?.coordinates ? (
                          <>
                            <div className="flex items-center gap-1">
                              <span className="text-gray-500 dark:text-gray-400">Lat:</span>
                              <span className="text-gray-900 dark:text-white font-mono">
                                {shop.location.coordinates[1]?.toFixed(6)}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-gray-500 dark:text-gray-400">Lng:</span>
                              <span className="text-gray-900 dark:text-white font-mono">
                                {shop.location.coordinates[0]?.toFixed(6)}
                              </span>
                            </div>
                            <a
                              href={`https://maps.google.com/?q=${shop.location.coordinates[1]},${shop.location.coordinates[0]}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1 mt-1"
                            >
                              <FiMapPin className="text-xs" />
                              View Map
                            </a>
                          </>
                        ) : (
                          <p className="text-gray-400">No coordinates</p>
                        )}
                      </div>
                    </td>

                    {/* Actions Column */}
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap items-center gap-2">
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
                        <button
                          onClick={() => handleDeleteShop(shop._id, shop.name)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                          title="Delete Shop"
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

      {/* Edit Shop Modal */}
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
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 rounded-t-2xl z-10">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Edit Shop: {selectedShop.name}</h2>
                  <button
                    onClick={handleCloseModals}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <FiX className="text-2xl" />
                  </button>
                </div>
              </div>

              {/* Form */}
              <div className="p-6 space-y-6">
                {/* Error Message */}
                {editError && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <p className="text-red-600 dark:text-red-400">{editError}</p>
                  </div>
                )}

                {/* Image Upload Section - Database Linked */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <FiImage />
                    Shop Images <span className="text-xs text-gray-500 font-normal">(From database: images/photos array)</span>
                  </h3>
                  
                  {/* Current & New Images Preview */}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {/* Current Images */}
                    {currentImages.map((url, index) => (
                      <div key={`current-${index}`} className="relative group">
                        <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 border-2 border-green-500">
                          <img 
                            src={url} 
                            alt={`Shop ${index + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200?text=Error';
                            }}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveCurrentImage(index)}
                          className="absolute -top-2 -right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors shadow-lg"
                          title="Remove image"
                        >
                          <FiX className="text-sm" />
                        </button>
                        <div className="absolute bottom-2 left-2 px-2 py-1 bg-green-600 text-white text-xs rounded">
                          Current
                        </div>
                      </div>
                    ))}

                    {/* New Images Preview */}
                    {imagePreviewUrls.map((url, index) => (
                      <div key={`new-${index}`} className="relative group">
                        <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 border-2 border-blue-500">
                          <img 
                            src={url} 
                            alt={`New ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveNewImage(index)}
                          className="absolute -top-2 -right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors shadow-lg"
                          title="Remove image"
                        >
                          <FiX className="text-sm" />
                        </button>
                        <div className="absolute bottom-2 left-2 px-2 py-1 bg-blue-600 text-white text-xs rounded">
                          New
                        </div>
                      </div>
                    ))}

                    {/* Upload New Image Button */}
                    {(currentImages.length + newImageFiles.length) < 5 && (
                      <label className="aspect-square rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-purple-500 dark:hover:border-purple-500 cursor-pointer transition-colors flex flex-col items-center justify-center gap-2 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700">
                        <FiPlus className="text-3xl text-gray-400" />
                        <span className="text-xs text-gray-600 dark:text-gray-400">Add Image</span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleImageSelect}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <FiUpload className="text-purple-600" />
                    <span>
                      {currentImages.length + newImageFiles.length}/5 images • Max 5MB per image • JPG, PNG, WEBP
                    </span>
                  </div>

                  {imageUploading && (
                    <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                      <span>Uploading images...</span>
                    </div>
                  )}
                </div>

                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Basic Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Shop Name - Database Linked */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Shop Name * <span className="text-xs text-gray-500">(From database)</span>
                      </label>
                      <input
                        type="text"
                        value={editFormData.name}
                        onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                        required
                        title="Shop name from database"
                      />
                    </div>

                    {/* Category - Database Linked */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Category * <span className="text-xs text-gray-500">(From database)</span>
                      </label>
                      <select
                        value={editFormData.category}
                        onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                        disabled={loadingCategories}
                        required
                        title="Category from database"
                      >
                        <option value="">
                          {loadingCategories ? 'Loading categories...' : 'Select Category'}
                        </option>
                        {categories.map((cat) => (
                          <option key={cat._id} value={cat.name}>
                            {cat.icon ? `${cat.icon} ${cat.name}` : cat.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Keywords (SEO) - Database Linked */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Keywords (SEO) <span className="text-xs text-gray-500">(From database SEO keywords)</span>
                      </label>
                      <input
                        type="text"
                        value={editFormData.keywords}
                        onChange={(e) => setEditFormData({ ...editFormData, keywords: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                        placeholder="Keywords from SEO (comma separated)"
                        readOnly
                        title="Keywords are linked from database SEO keywords (seoKeywords field)"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        These keywords are automatically linked from the SEO keywords (seoKeywords) saved in database when shop was created.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Location Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Location Details</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Address - Database Linked (Duplicate Removed) */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Address * <span className="text-xs text-gray-500">(From database)</span>
                      </label>
                      <textarea
                        value={editFormData.address}
                        onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                        placeholder="Complete shop address..."
                        required
                        title="Address from database"
                      />
                    </div>

                    {/* City - Database Linked */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        City * <span className="text-xs text-gray-500">(From database)</span>
                      </label>
                      <input
                        type="text"
                        value={editFormData.city}
                        onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                        required
                        title="City from database"
                      />
                    </div>

                    {/* Pincode - Database Linked */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Pincode * <span className="text-xs text-gray-500">(From database)</span>
                      </label>
                      <input
                        type="text"
                        value={editFormData.pincode}
                        onChange={(e) => setEditFormData({ ...editFormData, pincode: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                        required
                        title="Pincode from database"
                      />
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Contact Details</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Phone - Database Linked */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Phone <span className="text-xs text-gray-500">(From database contact.phone)</span>
                      </label>
                      <input
                        type="tel"
                        value={editFormData.phone}
                        onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                        placeholder="+91-XXXXXXXXXX"
                        title="Phone from database contact.phone"
                      />
                    </div>

                    {/* Email - Database Linked */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email <span className="text-xs text-gray-500">(From database contact.email)</span>
                      </label>
                      <input
                        type="email"
                        value={editFormData.email}
                        onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                        placeholder="email@example.com"
                        title="Email from database contact.email"
                      />
                    </div>
                  </div>
                </div>

                {/* Status & Features - Database Linked */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Status & Features</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Status - Database Linked */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Status <span className="text-xs text-gray-500">(From database)</span>
                      </label>
                      <select
                        value={editFormData.status}
                        onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value as any })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                        title="Status from database"
                      >
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="active">Active</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>

                    {/* Homepage Priority - Database Linked */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Homepage Priority <span className="text-xs text-gray-500">(From database)</span>
                      </label>
                      <input
                        type="number"
                        value={editFormData.homepagePriority}
                        onChange={(e) => setEditFormData({ ...editFormData, homepagePriority: parseInt(e.target.value) || 0 })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                        min="0"
                        title="Homepage priority from database"
                      />
                    </div>

                    {/* Featured Shop - Database Linked */}
                    <div className="flex items-end">
                      <label className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors w-full">
                        <input
                          type="checkbox"
                          checked={editFormData.isFeatured}
                          onChange={(e) => setEditFormData({ ...editFormData, isFeatured: e.target.checked })}
                          className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                          title="Featured status from database"
                        />
                        <div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                            <FiStar className="text-yellow-500" />
                            Featured Shop <span className="text-xs text-gray-500">(From database)</span>
                          </span>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Rating & Reviews Management */}
                <div className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <FiStar className="text-yellow-500" />
                      Rating & Reviews Management
                    </h3>
                    <button
                      type="button"
                      onClick={async () => {
                        if (selectedShop && await handleUpdateRating(selectedShop._id, editFormData.rating, editFormData.reviewCount)) {
                          alert('Rating updated successfully!');
                        }
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all shadow-md hover:shadow-lg flex items-center gap-2 text-sm"
                    >
                      <FiStar className="text-white" />
                      Update Rating
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Rating Input */}
                    <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 p-6 rounded-xl border border-yellow-200 dark:border-yellow-800">
                      <label className="block text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <FiStar className="text-yellow-500" />
                        Shop Rating
                        <span className="text-xs text-gray-500">(0-5 stars)</span>
                      </label>
                      <div className="space-y-3">
                        <input
                          type="number"
                          min="0"
                          max="5"
                          step="0.1"
                          value={editFormData.rating}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value);
                            if (value >= 0 && value <= 5) {
                              setEditFormData({ ...editFormData, rating: value });
                            }
                          }}
                          className="w-full px-4 py-3 border-2 border-yellow-300 dark:border-yellow-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 text-lg font-semibold"
                          placeholder="Enter rating (0-5)"
                        />
                        {/* Visual Star Display */}
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <FiStar
                              key={star}
                              className={`text-2xl ${
                                star <= editFormData.rating
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300 dark:text-gray-600'
                              }`}
                            />
                          ))}
                          <span className="ml-2 text-lg font-bold text-gray-900 dark:text-white">
                            {editFormData.rating.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Review Count Input */}
                    <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-6 rounded-xl border border-blue-200 dark:border-blue-800">
                      <label className="block text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <FiTrendingUp className="text-blue-500" />
                        Total Reviews
                        <span className="text-xs text-gray-500">(Number of reviews)</span>
                      </label>
                      <div className="space-y-3">
                        <input
                          type="number"
                          min="0"
                          value={editFormData.reviewCount}
                          onChange={(e) => {
                            const value = parseInt(e.target.value) || 0;
                            if (value >= 0) {
                              setEditFormData({ ...editFormData, reviewCount: value });
                            }
                          }}
                          className="w-full px-4 py-3 border-2 border-blue-300 dark:border-blue-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 text-lg font-semibold"
                          placeholder="Enter review count"
                        />
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <FiTrendingUp className="text-blue-500" />
                          <span>
                            <span className="font-bold text-blue-600 dark:text-blue-400 text-lg">{editFormData.reviewCount}</span> total reviews
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Top Rated Badge Preview */}
                  {editFormData.rating >= 4.0 && (
                    <div className="bg-gradient-to-r from-yellow-100 via-orange-100 to-red-100 dark:from-yellow-900/30 dark:via-orange-900/30 dark:to-red-900/30 p-4 rounded-xl border-2 border-yellow-400 dark:border-yellow-700">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-yellow-500 rounded-full">
                          <FiStar className="text-2xl text-white" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white text-lg">🏆 Top Rated Shop</p>
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            This shop will display a "Top Rated" badge with {editFormData.rating.toFixed(1)} ⭐ rating
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <strong>💡 Tip:</strong> Shops with rating ≥ 4.0 stars will automatically display a "Top Rated" badge on shop cards and detail pages.
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-b-2xl">
                <div className="flex items-center justify-end gap-3">
                  <button
                    onClick={handleCloseModals}
                    disabled={editLoading}
                    className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    disabled={editLoading || !editFormData.name || !editFormData.category}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {editLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <FiCheckCircle />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}



