'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiEye, FiEdit, FiPlus, FiSearch, FiFilter, FiX, FiCheck, FiCamera, FiMapPin } from 'react-icons/fi';
import AgentShopCreateModal from './AgentShopCreateModal';
import PayNowButton from '@/components/payments/PayNowButton';
import PhoneAndPostalInput from '@/components/common/PhoneAndPostalInput';
import { getCountryByCode, validatePhoneNumber, validatePostalCode } from '@/lib/countryData';

interface Shop {
  _id: string;
  name: string;
  category: string;
  address: string;
  city: string;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  planName?: string;
  planId?: {
    _id: string;
    name: string;
    price: number;
  };
  paymentStatus?: 'pending' | 'paid' | 'failed';
  createdAt: string;
}

// Helper function to get plan badge color
const getPlanBadgeColor = (planName: string) => {
  const name = planName.toLowerCase();
  if (name.includes('banner') || name.includes('premium') || name.includes('featured')) {
    return 'bg-gradient-to-r from-purple-600 to-pink-600 text-white';
  }
  if (name.includes('hero') || name.includes('right')) {
    return 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white';
  }
  if (name.includes('bottom') || name.includes('left')) {
    return 'bg-gradient-to-r from-green-600 to-teal-600 text-white';
  }
  return 'bg-gray-600 text-white';
};

export default function AgentShopsPage() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Shop Details
    name: '',
    countryCode: 'IN', // Default to India
    phone: '',
    category: '',
    address: '',
    contactPerson: '',
    email: '',
    // Step 2: Location
    area: '',
    latitude: '',
    longitude: '',
    city: '',
    state: '',
    pincode: '',
    // Step 3: Photo
    image: null as File | null,
    imagePreview: '',
    // Step 4: Plan & Payment
    planId: '',
    planPrice: 0,
    paymentMethod: 'cash' as 'cash' | 'online',
  });
  const [plans, setPlans] = useState<Array<{ _id: string; name: string; price: number }>>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [categories, setCategories] = useState<Array<{ _id: string; name: string; slug: string }>>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      // Fetch all active categories from admin panel
      const response = await fetch('/api/categories?all=true');
      const data = await response.json();
      
      if (response.ok && data.success) {
        setCategories(data.categories || []);
      } else {
        console.error('Failed to fetch categories:', data.error);
        setCategories([]);
      }
    } catch (err: any) {
      console.error('Failed to fetch categories:', err);
      setCategories([]);
    } finally {
      setLoadingCategories(false);
    }
  };

  const fetchPlans = async () => {
    setLoadingPlans(true);
    try {
      const response = await fetch('/api/plans');
      const data = await response.json();
      
      console.log('Plans API response:', data);
      
      if (response.ok && data.success && data.plans && Array.isArray(data.plans)) {
        if (data.plans.length > 0) {
          const formattedPlans = data.plans.map((plan: any) => ({
            _id: plan._id || plan._id?.toString() || '',
            name: plan.name || 'Unknown Plan',
            price: plan.price || 0,
          })).filter((plan: any) => plan._id); // Filter out invalid plans
          
          setPlans(formattedPlans);
          console.log('Plans loaded successfully:', formattedPlans.length, formattedPlans);
        } else {
          console.warn('No plans found in database. Please initialize plans.');
          setPlans([]);
        }
      } else {
        console.error('Failed to fetch plans:', data.error || 'Unknown error');
        setPlans([]);
      }
    } catch (err: any) {
      console.error('Error fetching plans:', err);
      setPlans([]);
    } finally {
      setLoadingPlans(false);
    }
  };

  useEffect(() => {
    // Fetch plans and categories
    fetchPlans();
    fetchCategories();
  }, []);

  useEffect(() => {
    // Fetch agent shops
    const fetchShops = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No token found in localStorage');
          setLoading(false);
          return;
        }

        const response = await fetch('/api/agent/shops', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setShops(data.shops || []);
          } else {
            console.error('Failed to fetch shops:', data.error);
          }
        } else {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
          console.error('Failed to fetch shops:', {
            status: response.status,
            error: errorData
          });
          
          if (response.status === 401 || response.status === 403) {
            console.error('Authentication error. Redirecting to login...');
            // Don't set mock data on auth errors
            setShops([]);
          } else {
            // Only use mock data for non-auth errors
            setShops([]);
          }
        }
      } catch (err) {
        console.error('Failed to fetch shops:', err);
        setShops([]);
      } finally {
        setLoading(false);
      }
    };

    fetchShops();
  }, []);

  // Get current location function
  const getCurrentLocation = () => {
    setLoadingLocation(true);
    setError('');
    
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser. Please enter coordinates manually.');
      setLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude.toString();
        const lng = position.coords.longitude.toString();
        
        // Update form data with explicit values
        setFormData((prev) => {
          return {
            ...prev,
            latitude: lat,
            longitude: lng,
          };
        });
        
        setLoadingLocation(false);
        setError('');
      },
      (error) => {
        setLoadingLocation(false);
        let errorMessage = 'Failed to get location. Please enter coordinates manually.';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please enable location permission and try again, or enter coordinates manually.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable. Please enter coordinates manually.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out. Please try again or enter coordinates manually.';
            break;
          default:
            errorMessage = 'Failed to get location. Please enter coordinates manually.';
            break;
        }
        
        setError(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // Reset form when modal closes
  useEffect(() => {
    if (!showAddModal) {
      // Clean up image preview URL to avoid memory leaks
      if (formData.imagePreview) {
        URL.revokeObjectURL(formData.imagePreview);
      }
      setCurrentStep(1);
      setFormData({
        name: '',
        countryCode: 'IN',
        phone: '',
        category: '',
        address: '',
        contactPerson: '',
        email: '',
        area: '',
        latitude: '',
        longitude: '',
        city: '',
        state: '',
        pincode: '',
        image: null,
        imagePreview: '',
        planId: '',
        planPrice: 0,
        paymentMethod: 'cash',
      });
      setError('');
      setLoadingLocation(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showAddModal]);

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login again. Token not found.');
        setSubmitting(false);
        // Redirect to login after 2 seconds
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
        return;
      }

      // Validate required fields
      if (!formData.name || !formData.category || !formData.address) {
        setError('Please fill all required fields in Step 1');
        setSubmitting(false);
        setCurrentStep(1);
        return;
      }

      if (!formData.latitude || !formData.longitude || !formData.city || !formData.state || !formData.pincode) {
        setError('Please fill all location fields in Step 2');
        setSubmitting(false);
        setCurrentStep(2);
        return;
      }

      // Validate postal code and phone based on country
      const country = getCountryByCode(formData.countryCode);
      if (country) {
        if (country.postalCode.length > 0 && !validatePostalCode(formData.pincode, country)) {
          setError(`Invalid pincode format. Expected: ${country.postalCode.format} (e.g., ${country.postalCode.example})`);
          setSubmitting(false);
          setCurrentStep(2);
          return;
        }
        
        if (formData.phone && !validatePhoneNumber(formData.phone, country)) {
          setError(`Mobile number must be ${country.phoneLength.min}-${country.phoneLength.max} digits`);
          setSubmitting(false);
          setCurrentStep(1);
          return;
        }
      }

      if (!formData.planId) {
        setError('Please select a plan in Step 4');
        setSubmitting(false);
        setCurrentStep(4);
        return;
      }

      // Upload image first if any
      let imageUrl = '';
      if (formData.image) {
        try {
          const formDataToUpload = new FormData();
          formDataToUpload.append('image', formData.image);

          const uploadResponse = await fetch('/api/upload', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
            body: formDataToUpload,
          });

          if (uploadResponse.ok) {
            const uploadData = await uploadResponse.json();
            imageUrl = uploadData.url || uploadData.urls?.[0] || '';
          }
        } catch (err) {
          // Continue even if image upload fails
          console.warn('Image upload failed, continuing without image');
        }
      }

      // Handle payment if online
      if (formData.paymentMethod === 'online' && formData.planId) {
        // Create payment order
        const paymentResponse = await fetch('/api/payments/create-order', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            amount: formData.planPrice * 100, // Convert to paise
            planId: formData.planId,
          }),
        });

        if (!paymentResponse.ok) {
          setError('Failed to create payment order');
          setSubmitting(false);
          return;
        }

        const paymentData = await paymentResponse.json();
        // Redirect to payment gateway or handle payment
        if (paymentData.orderId) {
          // For Razorpay, you would typically redirect to payment page
          // For now, we'll proceed with shop creation and handle payment separately
        }
      }

      // Prepare shop data
      const shopData: any = {
        name: formData.name,
        description: formData.address || formData.name, // Use address as description
        category: formData.category,
        address: formData.address,
        area: formData.area || '',
        city: formData.city || 'Patna',
        state: formData.state || 'Bihar',
        pincode: formData.pincode,
        phone: formData.phone.startsWith('+') 
          ? formData.phone 
          : `${getCountryByCode(formData.countryCode)?.dialCode || '+91'}${formData.phone.replace(/\s+/g, '')}`,
        email: `${formData.phone.replace(/\s+/g, '')}@shop.8rupiya.com`, // Generate email from phone
        location: {
          type: 'Point',
          coordinates: [parseFloat(formData.longitude), parseFloat(formData.latitude)], // [longitude, latitude]
        },
        images: imageUrl ? [imageUrl] : [],
        photos: imageUrl ? [imageUrl] : [], // Plan-based photos array
        offers: [], // Initialize empty offers array
        pages: [], // Initialize empty pages array
        planId: formData.planId || undefined,
        paymentStatus: 'pending', // Set payment status to pending initially
      };

      console.log('Creating shop with data:', shopData);

      const response = await fetch('/api/shops', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(shopData),
      });

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        // If response is not JSON, get text
        const text = await response.text();
        console.error('Failed to parse response:', text);
        setError(`Server error: ${response.status} ${response.statusText}. ${text || 'Unknown error'}`);
        setSubmitting(false);
        return;
      }

      console.log('Shop creation response:', { status: response.status, data });

      if (response.ok) {
        const shopId = data.shop?._id || data.shop?.id || data._id;
        
        if (!shopId) {
          console.error('Shop ID not found in response:', data);
          setError('Shop created but ID not found. Please refresh and check.');
          setSubmitting(false);
          return;
        }
        
        // Create cash payment record if cash payment was selected
        if (formData.paymentMethod === 'cash' && formData.planId && shopId) {
          try {
            const paymentResponse = await fetch('/api/payments/cash', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
              },
              body: JSON.stringify({
                shopId: shopId,
                planId: formData.planId,
                amount: formData.planPrice || 0,
              }),
            });

            const paymentData = await paymentResponse.json().catch(() => ({}));

            if (!paymentResponse.ok) {
              console.warn('Failed to create payment record:', paymentData);
              setError(`Shop created successfully but payment failed: ${paymentData.error || paymentData.message || 'Unknown error'}`);
            } else {
              // Success - close modal and refresh
              setShowAddModal(false);
              setCurrentStep(1);
              // Refresh shops list
              window.location.reload();
            }
          } catch (paymentErr: any) {
            console.warn('Error creating payment record:', paymentErr);
            setError(`Shop created but payment record failed: ${paymentErr.message || 'Unknown error'}`);
          }
        } else {
          // No payment needed or online payment (handled separately)
          setShowAddModal(false);
          setCurrentStep(1);
          // Refresh shops list
          window.location.reload();
        }
      } else {
        // Shop creation failed
        const errorMessage = data?.error || data?.message || data?.details || `HTTP ${response.status}: ${response.statusText}` || 'Failed to add shop';
        console.error('Shop creation failed:', {
          status: response.status,
          statusText: response.statusText,
          data: data,
          error: errorMessage
        });
        setError(errorMessage);
      }
    } catch (err: any) {
      console.error('Error in handleSubmit:', err);
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredShops = shops.filter((shop) => {
    const matchesSearch = shop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         shop.city.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || shop.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Helper function to get plan badge color
  const getPlanBadgeColor = (planName: string) => {
    const name = planName.toLowerCase();
    if (name.includes('banner') || name.includes('premium') || name.includes('featured')) {
      return 'bg-gradient-to-r from-purple-600 to-pink-600 text-white';
    }
    if (name.includes('hero') || name.includes('right')) {
      return 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white';
    }
    if (name.includes('bottom') || name.includes('left')) {
      return 'bg-gradient-to-r from-green-600 to-teal-600 text-white';
    }
    if (name.includes('basic')) {
      return 'bg-gray-600 text-white';
    }
    return 'bg-gray-500 text-white';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'expired':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
    <div className="space-y-6 agent-panel">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Shops</h1>
          <p className="text-gray-600 mt-1">Manage all your shops</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all"
        >
          <FiPlus />
          Add New Shop
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search shops..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="relative">
            <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
              <option value="expired">Expired</option>
            </select>
          </div>
        </div>
      </div>

      {/* Shops Table */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Shop Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredShops.map((shop) => (
                <motion.tr
                  key={shop._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">{shop.name}</p>
                  </td>
                  <td className="px-6 py-4 text-gray-900">{shop.category}</td>
                  <td className="px-6 py-4 text-gray-900">{shop.city}</td>
                  <td className="px-6 py-4">
                    {shop.planId?.name || shop.planName ? (
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPlanBadgeColor(shop.planId?.name || shop.planName || '')}`}>
                        {shop.planId?.name || shop.planName}
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-300 text-gray-700">
                        No Plan
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(shop.status)}`}>
                        {shop.status}
                      </span>
                      {shop.paymentStatus && (
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          shop.paymentStatus === 'paid' 
                            ? 'bg-green-100 text-green-800' 
                            : shop.paymentStatus === 'failed'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {shop.paymentStatus}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <button className="text-blue-600 hover:text-blue-800">
                        <FiEye />
                      </button>
                      <button className="text-gray-600 hover:text-gray-800">
                        <FiEdit />
                      </button>
                      {shop.paymentStatus === 'pending' && shop.planId && (
                        <PayNowButton
                          shopId={shop._id}
                          planId={shop.planId._id}
                          amount={shop.planId.price}
                          shopName={shop.name}
                          planName={shop.planId.name}
                          onSuccess={() => window.location.reload()}
                          className="text-xs"
                        />
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredShops.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No shops found</p>
          </div>
        )}
      </div>

      {/* Add Shop Modal - New 4-Step Flow */}
      <AgentShopCreateModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setCurrentStep(1);
        }}
        onSuccess={async () => {
          // Refresh shops list after successful creation
          try {
            const response = await fetch('/api/agent/shops', {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
              },
            });
            if (response.ok) {
              const data = await response.json();
              if (data.success && data.shops) {
                setShops(data.shops);
              }
            }
          } catch (err) {
            console.error('Failed to refresh shops:', err);
          }
        }}
      />

      {/* Old Modal - Commented out, using new AgentShopCreateModal component above */}
      {false && (
          <>
            <div
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => {
                setShowAddModal(false);
                setCurrentStep(1);
              }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div
                className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex justify-between items-center z-10">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Add New Shop</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Home / Add New Shop</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      setCurrentStep(1);
                    }}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <FiX className="text-2xl" />
                  </button>
                </div>

                {/* Progress Bar */}
                <div className="px-6 pt-6 pb-4">
                  <div className="flex items-center justify-between">
                    {[
                      { step: 1, label: 'Shop Details' },
                      { step: 2, label: 'Location' },
                      { step: 3, label: 'Photos' },
                      { step: 4, label: 'Payment Info' },
                    ].map((item, index) => (
                      <div key={item.step} className="flex items-center flex-1">
                        <div className="flex flex-col items-center flex-1">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                              currentStep >= item.step
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                            }`}
                          >
                            {currentStep > item.step ? (
                              <FiCheck className="text-xl" />
                            ) : (
                              item.step
                            )}
                          </div>
                          <span
                            className={`text-xs mt-2 font-medium ${
                              currentStep >= item.step
                                ? 'text-blue-600 dark:text-blue-400'
                                : 'text-gray-500 dark:text-gray-400'
                            }`}
                          >
                            {item.label}
                          </span>
                        </div>
                        {index < 3 && (
                          <div
                            className={`h-1 flex-1 mx-2 ${
                              currentStep > item.step
                                ? 'bg-blue-600'
                                : 'bg-gray-200 dark:bg-gray-700'
                            }`}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Form Content */}
                <div className="p-6">
                  {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg mb-4">
                      {error}
                    </div>
                  )}

                  {/* Step 1: Shop Details */}
                  {currentStep === 1 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-4"
                    >
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">1. Shop Details</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Shop Name: *
                          </label>
                          <input
                            type="text"
                            required
                            value={formData.name || ''}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Enter shop name"
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                          />
                        </div>


                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Category: *
                          </label>
                          {loadingCategories ? (
                            <div className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 flex items-center gap-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                              <span className="text-gray-600 dark:text-gray-400">Loading categories...</span>
                            </div>
                          ) : (
                            <select
                              required
                              value={formData.category || ''}
                              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            >
                              <option value="">-- Select Category --</option>
                              {categories.map((cat) => (
                                <option key={cat._id} value={cat.name}>
                                  {cat.name}
                                </option>
                              ))}
                            </select>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Full Address: *
                          </label>
                          <input
                            type="text"
                            required
                            value={formData.address || ''}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            placeholder="Enter full address"
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Contact Person: *
                          </label>
                          <input
                            type="text"
                            required
                            value={formData.contactPerson || ''}
                            onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                            placeholder="Enter contact person name"
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Email: *
                          </label>
                          <input
                            type="email"
                            required
                            value={formData.email || ''}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="Enter email address"
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            City: *
                          </label>
                          <input
                            type="text"
                            required
                            value={formData.city || ''}
                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                            placeholder="Enter city name"
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 2: Location */}
                  {currentStep === 2 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-4"
                    >
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">2. Location</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Address: *
                          </label>
                          <input
                            type="text"
                            required
                            value={formData.address || ''}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Area (Optional)
                          </label>
                          <input
                            type="text"
                            value={formData.area || ''}
                            onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                            placeholder="Enter area/locality (e.g., Kankarbagh, Patna)"
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              City: *
                            </label>
                            <input
                              type="text"
                              required
                              value={formData.city || ''}
                              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              State: *
                            </label>
                            <input
                              type="text"
                              required
                              value={formData.state || ''}
                              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            />
                          </div>

                          <div className="md:col-span-2">
                            <PhoneAndPostalInput
                              countryCode={formData.countryCode}
                              onCountryChange={(code) => setFormData({ ...formData, countryCode: code })}
                              phoneValue={formData.phone}
                              onPhoneChange={(phone) => setFormData({ ...formData, phone })}
                              postalValue={formData.pincode}
                              onPostalChange={(postal) => setFormData({ ...formData, pincode: postal })}
                              phoneLabel="Mobile Number"
                              postalLabel="Pincode"
                              phoneRequired={true}
                              postalRequired={true}
                            />
                          </div>
                        </div>

                        <div className="mt-4">
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                            Or Enter Coordinates Manually:
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Enter Latitude: *
                              </label>
                              <input
                                type="number"
                                step="any"
                                required
                                value={formData.latitude || ''}
                                onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                                placeholder="e.g., 25.5941"
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                              />
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Enter latitude coordinate (e.g., 25.5941)
                              </p>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Enter Longitude: *
                              </label>
                              <input
                                type="number"
                                step="any"
                                required
                                value={formData.longitude || ''}
                                onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                                placeholder="e.g., 85.1376"
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                              />
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Enter longitude coordinate (e.g., 85.1376)
                              </p>
                            </div>
                          </div>
                        </div>

                        <div>
                          <button
                            type="button"
                            onClick={getCurrentLocation}
                            disabled={loadingLocation}
                            className="w-full px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                          >
                            <FiMapPin />
                            {loadingLocation ? 'Getting Location...' : 'Get Current Location'}
                          </button>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                            Or manually enter Latitude and Longitude below
                          </p>
                        </div>

                        {/* Map Preview */}
                        {formData.latitude && formData.longitude && (
                          <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Map Preview:
                            </label>
                            <div className="w-full h-64 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600 relative">
                              <iframe
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                loading="lazy"
                                allowFullScreen
                                referrerPolicy="no-referrer-when-downgrade"
                                src={`https://www.google.com/maps?q=${formData.latitude},${formData.longitude}&output=embed&zoom=15`}
                                title="Map Preview"
                              />
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                              Coordinates: Lat {formData.latitude}, Lng {formData.longitude}
                            </p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* Step 3: Photo */}
                  {currentStep === 3 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-4"
                    >
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">3. Add Shop Photo</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Shop Photo: * (Max 10MB - Will be compressed to 150KB)
                          </label>
                          <div className="space-y-3">
                            {/* Camera Capture */}
                            <input
                              type="file"
                              accept="image/*"
                              capture="environment"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  if (file.size > 10 * 1024 * 1024) {
                                    setError('Image size must be less than 10MB');
                                    return;
                                  }
                                  if (!file.type.startsWith('image/')) {
                                    setError('Please upload a valid image file');
                                    return;
                                  }
                                  setFormData({
                                    ...formData,
                                    image: file,
                                    imagePreview: URL.createObjectURL(file),
                                  });
                                  setError('');
                                }
                              }}
                              className="hidden"
                              id="camera-capture"
                            />
                            {/* File Upload */}
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  // Check file size (10MB max)
                                  if (file.size > 10 * 1024 * 1024) {
                                    setError('Image size must be less than 10MB');
                                    return;
                                  }
                                  // Check file type
                                  if (!file.type.startsWith('image/')) {
                                    setError('Please upload a valid image file');
                                    return;
                                  }
                                  setFormData({
                                    ...formData,
                                    image: file,
                                    imagePreview: URL.createObjectURL(file),
                                  });
                                  setError('');
                                }
                              }}
                              className="hidden"
                              id="image-upload-file"
                            />
                            <div className="flex gap-2">
                              <label
                                htmlFor="camera-capture"
                                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-colors"
                              >
                                <FiCamera />
                                Take Photo
                              </label>
                              <label
                                htmlFor="image-upload-file"
                                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg cursor-pointer hover:bg-green-700 transition-colors"
                              >
                                <FiCamera />
                                Upload from Device
                              </label>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Max: 10MB (will be compressed to 150KB when saved). Supported formats: JPG, PNG, WebP
                            </p>
                          </div>

                          {formData.imagePreview && (
                            <div className="mt-4">
                              <div className="relative inline-block">
                                <img
                                  src={formData.imagePreview}
                                  alt="Shop Preview"
                                  className="w-full max-w-md h-64 object-cover rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    setFormData({
                                      ...formData,
                                      image: null,
                                      imagePreview: '',
                                    });
                                  }}
                                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors"
                                >
                                  <FiX />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 4: Payment Info & Plan */}
                  {currentStep === 4 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-4"
                    >
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">4. Payment Info & Plan</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Select Plan: *
                          </label>
                          {loadingPlans ? (
                            <div className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 flex items-center gap-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                              <span className="text-gray-600 dark:text-gray-400">Loading plans...</span>
                            </div>
                          ) : (
                            <>
                              <select
                                required
                                value={formData.planId || ''}
                                onChange={(e) => {
                                  const selectedPlan = plans.find(p => p._id === e.target.value);
                                  setFormData({
                                    ...formData,
                                    planId: e.target.value,
                                    planPrice: selectedPlan?.price || 0,
                                  });
                                }}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                              >
                                <option value="">-- Select Plan --</option>
                                {plans.length > 0 ? (
                                  plans.map((plan) => (
                                    <option key={plan._id} value={plan._id}>
                                      {plan.name} - ₹{plan.price}/year
                                    </option>
                                  ))
                                ) : (
                                  <option value="" disabled>No plans available. Please contact admin.</option>
                                )}
                              </select>
                              {plans.length === 0 && !loadingPlans && (
                                <div className="mt-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                                  <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-2">
                                    ⚠️ <strong>No plans found.</strong> Please initialize plans first.
                                  </p>
                                  <button
                                    type="button"
                                    onClick={async () => {
                                      try {
                                        setLoadingPlans(true);
                                        const response = await fetch('/api/plans/init', {
                                          method: 'POST',
                                        });
                                        const data = await response.json();
                                        if (data.success) {
                                          // Reload plans
                                          const plansResponse = await fetch('/api/plans');
                                          const plansData = await plansResponse.json();
                                          if (plansData.success && plansData.plans) {
                                            setPlans(plansData.plans.map((plan: any) => ({
                                              _id: plan._id,
                                              name: plan.name,
                                              price: plan.price,
                                            })));
                                            setError('');
                                            alert('Plans initialized successfully!');
                                          }
                                        } else {
                                          setError(data.error || 'Failed to initialize plans');
                                        }
                                      } catch (err: any) {
                                        setError(err.message || 'Failed to initialize plans');
                                      } finally {
                                        setLoadingPlans(false);
                                      }
                                    }}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                                  >
                                    Initialize Plans Now
                                  </button>
                                </div>
                              )}
                              {formData.planPrice > 0 && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                  Plan Price: ₹{formData.planPrice}/year
                                </p>
                              )}
                            </>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Payment Method: *
                          </label>
                          <div className="grid grid-cols-2 gap-4">
                            <button
                              type="button"
                              onClick={() => setFormData({ ...formData, paymentMethod: 'cash' })}
                              className={`p-6 border-2 rounded-lg transition-all ${
                                formData.paymentMethod === 'cash'
                                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                  : 'border-gray-300 dark:border-gray-600 hover:border-green-300'
                              }`}
                            >
                              <div className="text-center">
                                <div className="text-4xl mb-2">💰</div>
                                <div className="font-semibold text-gray-900 dark:text-white">Cash</div>
                                {formData.planPrice > 0 && (
                                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    ₹{formData.planPrice}
                                  </div>
                                )}
                              </div>
                            </button>
                            <button
                              type="button"
                              onClick={() => setFormData({ ...formData, paymentMethod: 'online' })}
                              className={`p-6 border-2 rounded-lg transition-all ${
                                formData.paymentMethod === 'online'
                                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                  : 'border-gray-300 dark:border-gray-600 hover:border-blue-300'
                              }`}
                            >
                              <div className="text-center">
                                <div className="text-4xl mb-2">💳</div>
                                <div className="font-semibold text-gray-900 dark:text-white">Online Payment</div>
                                {formData.planPrice > 0 && (
                                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    ₹{formData.planPrice}
                                  </div>
                                )}
                              </div>
                            </button>
                          </div>
                        </div>

                      </div>
                    </motion.div>
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex justify-between items-center pt-6 mt-6 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (currentStep === 1) {
                            setShowAddModal(false);
                            setCurrentStep(1);
                          } else {
                            setCurrentStep(currentStep - 1);
                          }
                        }}
                        className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        {currentStep === 1 ? 'Cancel' : 'Back'}
                      </button>
                    </div>

                    <div className="flex gap-2">
                      {currentStep < 4 ? (
                        <button
                          type="button"
                          onClick={() => {
                            // Validate current step
                            if (currentStep === 1) {
                              if (!formData.name || !formData.category || !formData.phone || !formData.address) {
                                setError('Please fill all required fields');
                                return;
                              }
                            } else if (currentStep === 2) {
                              if (!formData.city || !formData.state || !formData.pincode || !formData.latitude || !formData.longitude) {
                                setError('Please fill all location fields and get coordinates');
                                return;
                              }
                            } else if (currentStep === 3) {
                              if (!formData.image) {
                                setError('Please upload at least one shop image');
                                return;
                              }
                            }
                            setError('');
                            setCurrentStep(currentStep + 1);
                          }}
                          className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
                        >
                          Save & Next <span>&gt;</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            // Validate step 4
                            if (!formData.planId) {
                              setError('Please select a plan');
                              return;
                            }
                            setError('');
                            handleSubmit();
                          }}
                          disabled={submitting}
                          className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                          {submitting ? 'Finishing...' : 'Finish'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
    </div>
  );
}

