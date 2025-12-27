'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FiEye, FiCheck, FiX, FiEdit, FiTrash2, FiShoppingBag, FiImage, FiMapPin, FiXCircle, FiUpload, FiSave, FiCamera, FiMail, FiPhone, FiGlobe, FiStar, FiCalendar } from 'react-icons/fi';
import ShopDrawer from './ShopDrawer';
import { compressImage, blobToFile } from '@/lib/imageCompression';

interface Shop {
  _id: string;
  name: string;
  description?: string;
  category: string;
  city: string;
  state?: string;
  area?: string;
  address?: string;
  pincode?: string;
  location?: {
    coordinates: [number, number]; // [longitude, latitude]
  };
  phone?: string;
  email?: string;
  website?: string;
  images?: string[];
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
  isFeatured?: boolean;
  rating?: number;
  reviewCount?: number;
  rankScore?: number;
  manualRank?: number;
  homepagePriority?: number;
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
  updatedAt?: string;
}

export default function ShopsPage() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState('approved');
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedShop, setSelectedShop] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingShop, setEditingShop] = useState<Shop | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploadingImages, setUploadingImages] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [fixingShops, setFixingShops] = useState(false);

  const [editFormData, setEditFormData] = useState({
    name: '',
    description: '',
    category: '',
    city: '',
    state: '',
    area: '',
    address: '',
    pincode: '',
    latitude: '',
    longitude: '',
    phone: '',
    email: '',
    website: '',
    images: [] as string[],
    planId: '',
    status: '',
    paymentStatus: '',
    paymentMode: '' as 'cash' | 'online' | '',
  });
  const [plans, setPlans] = useState<Array<{ _id: string; name: string; price: number; expiryDays?: number }>>([]);

  useEffect(() => {
    const urlStatus = searchParams.get('status') || 'approved';
    setStatus(urlStatus);
  }, [searchParams]);

  useEffect(() => {
    fetchShops();
  }, [status]);

  useEffect(() => {
    // Fetch plans for plan selection
    const fetchPlans = async () => {
      try {
        const response = await fetch('/api/plans');
        const data = await response.json();
        if (response.ok && data.success && data.plans) {
          setPlans(data.plans);
        }
      } catch (error) {
        console.error('Failed to fetch plans:', error);
      }
    };
    fetchPlans();
  }, []);

  const fetchShops = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/shops?status=${status}&limit=50`);
      const data = await response.json();
      if (data.shops) {
        setShops(data.shops);
      }
    } catch (error) {
      console.error('Failed to fetch shops:', error);
    } finally {
      setLoading(false);
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
      } else {
        alert(data.error || 'Failed to reject shop');
      }
    } catch (error: any) {
      console.error('Reject error:', error);
      alert('Failed to reject shop: ' + (error.message || 'Unknown error'));
    }
  };

  const handleEditShop = (shop: Shop) => {
    setEditingShop(shop);
    setEditFormData({
      name: shop.name || '',
      description: shop.description || '',
      category: shop.category || '',
      city: shop.city || '',
      state: shop.state || '',
      area: shop.area || '',
      address: shop.address || '',
      pincode: shop.pincode || '',
      latitude: shop.location?.coordinates?.[1]?.toString() || '',
      longitude: shop.location?.coordinates?.[0]?.toString() || '',
      phone: shop.phone || '',
      email: shop.email || '',
      website: shop.website || '',
      images: shop.images || shop.photos || [],
      planId: shop.planId?._id || '',
      status: shop.status || 'pending',
      paymentStatus: shop.paymentStatus || 'pending',
      paymentMode: shop.paymentMode || '',
    });
    setError('');
    setShowEditModal(true);
  };

  const handleImageUpload = async (file: File) => {
    setUploadingImages(true);
    setError('');
    try {
      // Validate file size (10MB max)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        setError('File size exceeds 10MB limit');
        setUploadingImages(false);
        return;
      }

      // Compress image to 1MB
      const compressedBlob = await compressImage(file, 1);
      const compressedFile = blobToFile(compressedBlob, file.name);

      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login again');
        setUploadingImages(false);
        return;
      }

      const formData = new FormData();
      formData.append('image', compressedFile);

      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      // Check if response is OK
      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Failed to upload image';
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
        } catch {
          errorMessage = errorText || `Server error: ${response.status} ${response.statusText}`;
        }
        setError(errorMessage);
        return;
      }

      // Check if response has content
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        setError('Invalid response from server');
        return;
      }

      // Parse JSON response
      const text = await response.text();
      if (!text || text.trim() === '') {
        setError('Empty response from server');
        return;
      }

      let data;
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        setError('Invalid JSON response from server');
        return;
      }

      if (data.url || data.success) {
        const imageUrl = data.url || (data.urls && data.urls[0]);
        setEditFormData(prev => ({
          ...prev,
          images: [...prev.images, imageUrl],
        }));
      } else {
        setError(data.error || 'Failed to upload image');
      }
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload image. Please try again.');
    } finally {
      setUploadingImages(false);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' } // Use back camera if available
      });
      setCameraStream(stream);
      setShowCamera(true);
      
      // Set video stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      setError('Failed to access camera: ' + err.message);
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setShowCamera(false);
  };

  const captureFromCamera = async () => {
    try {
      if (!videoRef.current) return;

      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(videoRef.current, 0, 0);
      
      canvas.toBlob(async (blob) => {
        if (!blob) return;

        const file = new File([blob], `camera-${Date.now()}.jpg`, { type: 'image/jpeg' });
        stopCamera();
        await handleImageUpload(file);
      }, 'image/jpeg', 0.9);
    } catch (err: any) {
      setError('Failed to capture image: ' + err.message);
      stopCamera();
    }
  };

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]);

  const handleRemoveImage = (index: number) => {
    setEditFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleUpdateShop = async () => {
    if (!editingShop) return;

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

      // Validate required fields
      if (!editFormData.name || !editFormData.description || !editFormData.category || !editFormData.city || !editFormData.address || !editFormData.pincode || !editFormData.email || !editFormData.phone) {
        setError('Please fill all required fields (marked with *)');
        setSubmitting(false);
        return;
      }

      // Validate pincode (6 digits)
      if (!/^[0-9]{6}$/.test(editFormData.pincode)) {
        setError('Pincode must be 6 digits');
        setSubmitting(false);
        return;
      }

      // Validate latitude and longitude
      const lat = parseFloat(editFormData.latitude);
      const lng = parseFloat(editFormData.longitude);
      if (isNaN(lat) || isNaN(lng)) {
        setError('Please enter valid latitude and longitude');
        setSubmitting(false);
        return;
      }

      if (lat < -90 || lat > 90) {
        setError('Latitude must be between -90 and 90');
        setSubmitting(false);
        return;
      }

      if (lng < -180 || lng > 180) {
        setError('Longitude must be between -180 and 180');
        setSubmitting(false);
        return;
      }

      // Prepare update data
      const updateData: any = {
        name: editFormData.name,
        description: editFormData.description,
        category: editFormData.category,
        city: editFormData.city,
        state: editFormData.state,
        area: editFormData.area,
        address: editFormData.address,
        pincode: editFormData.pincode,
        phone: editFormData.phone,
        email: editFormData.email,
        website: editFormData.website || undefined,
        location: {
          type: 'Point',
          coordinates: [lng, lat], // [longitude, latitude]
        },
        images: editFormData.images,
        photos: editFormData.images, // Also update photos array
        status: editFormData.status,
        paymentStatus: editFormData.paymentStatus,
        paymentMode: editFormData.paymentMode || undefined,
      };

      // Update plan if selected
      if (editFormData.planId) {
        updateData.planId = editFormData.planId;
        // Calculate plan expiry date if plan has expiryDays
        const selectedPlan = plans.find(p => p._id === editFormData.planId);
        if (selectedPlan && selectedPlan.expiryDays) {
          const planExpiry = new Date();
          planExpiry.setDate(planExpiry.getDate() + selectedPlan.expiryDays);
          updateData.planExpiry = planExpiry;
        }
      } else {
        // Remove plan if empty
        updateData.planId = null;
        updateData.planExpiry = null;
      }

      const response = await fetch(`/api/shops/${editingShop._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess('Shop updated successfully');
        setShowEditModal(false);
        setEditingShop(null);
        fetchShops();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error || 'Failed to update shop');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteShop = async (shopId: string) => {
    if (!confirm('Are you sure you want to delete this shop? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login again');
        return;
      }

      const response = await fetch(`/api/shops/${shopId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess('Shop deleted successfully');
        fetchShops();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error || 'Failed to delete shop');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    }
  };

  const handleFixAllShops = async () => {
    if (!confirm('This will set agentId/shopperId for all shops that are missing them. Continue?')) {
      return;
    }

    setFixingShops(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login again');
        setFixingShops(false);
        return;
      }

      const response = await fetch('/api/admin/shops/fix-agent-ids', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(`Successfully fixed ${data.fixed} shops. ${data.errors > 0 ? `${data.errors} errors occurred.` : ''}`);
        fetchShops();
        setTimeout(() => setSuccess(''), 5000);
      } else {
        setError(data.error || 'Failed to fix shops');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setFixingShops(false);
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
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Shops Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage and approve shop listings
          </p>
        </div>
        <button
          onClick={handleFixAllShops}
          disabled={fixingShops}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {fixingShops ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              Fixing...
            </>
          ) : (
            'Fix All Shops (Set Agent IDs)'
          )}
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

      {/* Status Tabs */}
      <div className="flex gap-4 border-b border-gray-200 dark:border-gray-700">
        {['pending', 'approved', 'rejected', 'expired'].map((tabStatus) => (
          <button
            key={tabStatus}
            onClick={() => window.location.href = `/admin/shops?status=${tabStatus}`}
            className={`px-6 py-3 font-medium capitalize transition-colors ${
              status === tabStatus
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {tabStatus} ({shops.filter((s) => s.status === tabStatus).length})
          </button>
        ))}
      </div>

      {/* Shops Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Image
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Shop ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Shop Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Category
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Location
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Email ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Contact
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Plan
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Payment
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Owner/Agent
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {shops.map((shop) => (
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
                      <p className="font-mono text-gray-900 dark:text-white text-xs break-all">
                        {shop._id}
                      </p>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(shop._id);
                          alert('Shop ID copied to clipboard!');
                        }}
                        className="mt-1 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                        title="Click to copy"
                      >
                        Copy
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{shop.name}</p>
                      {shop.description && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mt-1">
                          {shop.description}
                        </p>
                      )}
                      {shop.isFeatured && (
                        <span className="inline-block mt-1 px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded text-xs font-semibold">
                          Featured
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-gray-900 dark:text-white">{shop.category}</td>
                  <td className="px-4 py-4">
                    <div className="text-sm">
                      <p className="text-gray-900 dark:text-white">{shop.city}</p>
                      {shop.state && (
                        <p className="text-gray-500 dark:text-gray-400 text-xs">{shop.state}</p>
                      )}
                      {shop.pincode && (
                        <p className="text-gray-500 dark:text-gray-400 text-xs">{shop.pincode}</p>
                      )}
                      {shop.area && (
                        <p className="text-gray-500 dark:text-gray-400 text-xs">{shop.area}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm">
                      {shop.email ? (
                        <>
                          <p className="text-gray-900 dark:text-white text-xs break-all flex items-center gap-1">
                            <FiMail className="text-xs flex-shrink-0" />
                            <span className="break-all">{shop.email}</span>
                          </p>
                          <button
                            onClick={() => {
                              if (shop.email) {
                                navigator.clipboard.writeText(shop.email);
                                alert('Email copied to clipboard!');
                              }
                            }}
                            className="mt-1 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                            title="Click to copy"
                          >
                            Copy
                          </button>
                        </>
                      ) : (
                        <span className="text-gray-400 text-xs">No email</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm space-y-1">
                      {shop.phone && (
                        <p className="text-gray-900 dark:text-white flex items-center gap-1">
                          <FiPhone className="text-xs" /> {shop.phone}
                        </p>
                      )}
                      {shop.website && (
                        <a
                          href={shop.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 dark:text-blue-400 text-xs hover:underline flex items-center gap-1"
                        >
                          <FiGlobe className="text-xs" /> Website
                        </a>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    {shop.planId ? (
                      <div>
                        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-xs font-semibold">
                          {shop.planId.name}
                        </span>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          ₹{shop.planId.price?.toLocaleString() || '0'}
                        </p>
                        {shop.planExpiry && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(shop.planExpiry) < new Date() ? (
                              <span className="text-red-600 dark:text-red-400">Expired</span>
                            ) : (
                              <span>Exp: {new Date(shop.planExpiry).toLocaleDateString()}</span>
                            )}
                          </p>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">No Plan</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <div className="space-y-1">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          shop.paymentStatus === 'paid'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                            : shop.paymentStatus === 'pending'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                        }`}
                      >
                        {shop.paymentStatus || 'pending'}
                      </span>
                      {shop.paymentMode && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                          {shop.paymentMode}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm space-y-1">
                      {shop.shopperId && (
                        <p className="text-gray-900 dark:text-white">
                          Owner: {shop.shopperId.name}
                        </p>
                      )}
                      {shop.agentId && (
                        <p className="text-gray-600 dark:text-gray-400 text-xs">
                          Agent: {shop.agentId.name}
                        </p>
                      )}
                      {shop.operatorId && (
                        <p className="text-gray-600 dark:text-gray-400 text-xs">
                          Operator: {shop.operatorId.name}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="space-y-1">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          shop.status === 'approved'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                            : shop.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                        }`}
                      >
                        {shop.status}
                      </span>
                      {shop.rating !== undefined && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          <FiStar className="text-yellow-500 fill-yellow-500 text-xs" />
                          {shop.rating?.toFixed(1) || '0.0'} ({shop.reviewCount || 0})
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedShop(shop._id)}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 flex items-center gap-1"
                      >
                        <FiEye />
                        View
                      </button>
                      <button
                        onClick={() => handleEditShop(shop)}
                        className="text-gray-600 hover:text-gray-800 dark:text-gray-400 flex items-center gap-1"
                      >
                        <FiEdit />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteShop(shop._id)}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 flex items-center gap-1"
                      >
                        <FiTrash2 />
                        Remove
                      </button>
                      {shop.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(shop._id)}
                            className="text-green-600 hover:text-green-800 dark:text-green-400 flex items-center gap-1"
                          >
                            <FiCheck />
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(shop._id)}
                            className="text-red-600 hover:text-red-800 dark:text-red-400 flex items-center gap-1"
                          >
                            <FiX />
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {shops.length === 0 && (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
          <FiShoppingBag className="text-6xl text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            No {status} shops found
          </p>
        </div>
      )}

      {/* Shop Drawer */}
      {selectedShop && (
        <ShopDrawer shopId={selectedShop} onClose={() => setSelectedShop(null)} />
      )}

      {/* Edit Shop Modal */}
      <AnimatePresence>
        {showEditModal && editingShop && (
          <motion.div
            key="edit-shop-modal"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => {
                setShowEditModal(false);
                setEditingShop(null);
                setError('');
              }}
            />
            <div
              className="relative z-50 bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="border-b border-gray-200 dark:border-gray-700 p-6 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Shop</h2>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingShop(null);
                    setError('');
                  }}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <FiX className="text-2xl" />
                </button>
              </div>

                {/* Form */}
                <div className="p-6 space-y-4">
                  {/* Shop ID - Read Only */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Shop ID
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editingShop._id}
                        readOnly
                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 font-mono text-xs"
                      />
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(editingShop._id);
                          alert('Shop ID copied to clipboard!');
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                      >
                        Copy
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Shop Name *
                      </label>
                      <input
                        type="text"
                        value={editFormData.name}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="Enter shop name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Category *
                      </label>
                      <input
                        type="text"
                        value={editFormData.category}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="Enter category"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description *
                    </label>
                    <textarea
                      value={editFormData.description}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="Enter shop description"
                      rows={2}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Address *
                    </label>
                    <textarea
                      value={editFormData.address}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, address: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="Enter full address"
                      rows={2}
                    />
                  </div>

                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        City *
                      </label>
                      <input
                        type="text"
                        value={editFormData.city}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, city: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="Enter city"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        State
                      </label>
                      <input
                        type="text"
                        value={editFormData.state}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, state: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="Enter state"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Area
                      </label>
                      <input
                        type="text"
                        value={editFormData.area}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, area: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="Enter area"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Pincode *
                      </label>
                      <input
                        type="text"
                        value={editFormData.pincode}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) }))}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="Enter 6-digit pincode"
                        maxLength={6}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Latitude *
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={editFormData.latitude}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, latitude: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="e.g., 22.6131968"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Longitude *
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={editFormData.longitude}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, longitude: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="e.g., 88.2868224"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Images
                    </label>
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-3">
                        {editFormData.images.map((image, index) => (
                          <div key={`image-${index}-${image}`} className="relative">
                            <img
                              src={image}
                              alt={`Shop image ${index + 1}`}
                              className="w-24 h-24 object-cover rounded-lg max-w-full max-h-full"
                              style={{ objectFit: 'cover' }}
                            />
                            <button
                              onClick={() => handleRemoveImage(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                            >
                              <FiXCircle className="text-sm" />
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={startCamera}
                          className="flex-1 flex items-center justify-center px-4 py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-blue-500 transition-colors"
                        >
                          <FiCamera className="mr-2" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Capture from Camera
                          </span>
                        </button>
                        <label className="flex-1 flex items-center justify-center px-4 py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                          <FiUpload className="mr-2" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {uploadingImages ? 'Uploading...' : 'Upload Image (Max 10MB)'}
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleImageUpload(file);
                            }}
                            disabled={uploadingImages}
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Plan
                    </label>
                    <select
                      value={editFormData.planId}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, planId: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      <option value="">No Plan</option>
                      {plans.map((plan) => (
                        <option key={plan._id} value={plan._id}>
                          {plan.name} - ₹{plan.price?.toLocaleString() || '0'}
                        </option>
                      ))}
                    </select>
                    {editFormData.planId && (
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Selected plan will be assigned to this shop
                      </p>
                    )}
                  </div>

                  {/* Contact Information */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email ID *
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="email"
                          value={editFormData.email}
                          onChange={(e) => setEditFormData(prev => ({ ...prev, email: e.target.value }))}
                          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                          placeholder="Enter email"
                        />
                        <button
                          onClick={() => {
                            if (editFormData.email) {
                              navigator.clipboard.writeText(editFormData.email);
                              alert('Email copied to clipboard!');
                            }
                          }}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                          disabled={!editFormData.email}
                        >
                          Copy
                        </button>
                      </div>
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
                        placeholder="Enter phone number"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Website
                    </label>
                    <input
                      type="url"
                      value={editFormData.website}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, website: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="https://example.com"
                    />
                  </div>

                  {/* Status and Payment */}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Status *
                      </label>
                      <select
                        value={editFormData.status}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, status: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      >
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                        <option value="expired">Expired</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Payment Status
                      </label>
                      <select
                        value={editFormData.paymentStatus}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, paymentStatus: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      >
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="failed">Failed</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Payment Mode
                      </label>
                      <select
                        value={editFormData.paymentMode}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, paymentMode: e.target.value as 'cash' | 'online' | '' }))}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      >
                        <option value="">Select Mode</option>
                        <option value="cash">Cash</option>
                        <option value="online">Online</option>
                      </select>
                    </div>
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
                      setEditingShop(null);
                      setError('');
                    }}
                    className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateShop}
                    disabled={submitting}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <FiSave />
                    {submitting ? 'Updating...' : 'Update Shop'}
                  </button>
                </div>
              </div>
            </motion.div>
        )}

        {/* Camera Modal */}
        {showCamera && (
          <motion.div
            key="camera-modal"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div
              className="fixed inset-0 bg-black/90 z-50"
              onClick={stopCamera}
            />
            <div className="relative z-50 bg-black rounded-xl w-full max-w-2xl">
              <div className="p-4 flex justify-between items-center border-b border-gray-700">
                <h3 className="text-white font-semibold">Camera Capture</h3>
                <button
                  onClick={stopCamera}
                  className="text-white hover:text-gray-300"
                >
                  <FiX className="text-2xl" />
                </button>
              </div>
              <div className="p-4">
                <video
                  ref={videoRef}
                  id="camera-video"
                  autoPlay
                  playsInline
                  className="w-full max-w-full h-auto rounded-lg"
                  style={{ maxHeight: '70vh', objectFit: 'contain' }}
                />
              </div>
              <div className="p-4 flex justify-center gap-4 border-t border-gray-700">
                <button
                  onClick={stopCamera}
                  className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={captureFromCamera}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <FiCamera />
                  Capture
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
