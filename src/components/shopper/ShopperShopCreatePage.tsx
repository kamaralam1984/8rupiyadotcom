'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiShoppingBag, FiMapPin, FiUpload, FiCheck, FiAlertCircle } from 'react-icons/fi';

interface Plan {
  _id: string;
  name: string;
  price: number;
  duration: number;
  maxPhotos: number;
}

export default function ShopperShopCreatePage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [categories, setCategories] = useState<Array<{ _id: string; name: string; slug: string }>>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  
  const [formData, setFormData] = useState({
    planId: '',
    selectedPlan: null as Plan | null,
    shopName: '',
    category: '',
    address: '',
    latitude: '',
    longitude: '',
    area: '',
    city: '',
    state: '',
    pincode: '',
    phone: '',
    email: '',
    images: [] as string[],
  });

  useEffect(() => {
    fetchPlans();
    fetchCategories();
  }, []);

  const fetchPlans = async () => {
    setLoadingPlans(true);
    try {
      const response = await fetch('/api/plans');
      const data = await response.json();
      
      if (response.ok && data.success) {
        setPlans(data.plans || []);
      }
    } catch (err: any) {
      console.error('Failed to fetch plans:', err);
    } finally {
      setLoadingPlans(false);
    }
  };

  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      
      if (response.ok && data.success) {
        setCategories(data.categories || []);
      }
    } catch (err: any) {
      console.error('Failed to fetch categories:', err);
    } finally {
      setLoadingCategories(false);
    }
  };

  const getCurrentLocation = () => {
    setLoadingLocation(true);
    setError('');
    
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      setLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData(prev => ({
          ...prev,
          latitude: position.coords.latitude.toString(),
          longitude: position.coords.longitude.toString(),
        }));
        setLoadingLocation(false);
      },
      (err) => {
        setError('Failed to get location: ' + err.message);
        setLoadingLocation(false);
      }
    );
  };

  const handleImageUpload = async (file: File) => {
    setUploadingImages(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login again');
        setUploadingImages(false);
        return;
      }

      const formDataToUpload = new FormData();
      formDataToUpload.append('image', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formDataToUpload,
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const data = await response.json();
      if (data.url) {
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, data.url],
        }));
      }
    } catch (err: any) {
      setError(err.message || 'Failed to upload image');
    } finally {
      setUploadingImages(false);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login again');
        setSubmitting(false);
        return;
      }

      if (!formData.shopName || !formData.category || !formData.address || !formData.latitude || !formData.longitude || !formData.pincode || !formData.planId || !formData.phone) {
        setError('Please fill all required fields');
        setSubmitting(false);
        return;
      }

      const response = await fetch('/api/shopper/shop/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          shopName: formData.shopName,
          category: formData.category,
          address: formData.address,
          area: formData.area,
          latitude: formData.latitude,
          longitude: formData.longitude,
          city: formData.city || 'Patna',
          state: formData.state || 'Bihar',
          pincode: formData.pincode,
          phone: formData.phone,
          email: formData.email,
          planId: formData.planId,
          images: formData.images,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Redirect to payment or shops page
        if (data.requiresPayment) {
          // Create payment order
          const paymentResponse = await fetch('/api/payments/create-order', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
              shopId: data.shop._id,
              planId: formData.planId,
            }),
          });

          const paymentData = await paymentResponse.json();
          if (paymentResponse.ok && paymentData.orderId) {
            // Redirect to payment page or handle Razorpay
            router.push(`/shopper/shops?payment=${paymentData.orderId}`);
          } else {
            router.push('/shopper/shops');
          }
        } else {
          router.push('/shopper/shops');
        }
      } else {
        setError(data.error || 'Failed to create shop');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const steps = [
    { number: 1, label: 'Select Plan' },
    { number: 2, label: 'Shop Details' },
    { number: 3, label: 'Images' },
    { number: 4, label: 'Review' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Add New Shop</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Create a new shop listing (Online Payment Only)</p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold text-lg transition-all ${
                    currentStep >= step.number
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                  }`}
                >
                  {currentStep > step.number ? <FiCheck /> : step.number}
                </div>
                <span className={`text-xs mt-2 font-medium ${
                  currentStep >= step.number ? 'text-green-600' : 'text-gray-500'
                }`}>
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`w-full h-1 mx-2 ${
                    currentStep > step.number ? 'bg-green-600' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {error && (
          <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Step 1: Plan Selection */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Select Plan</h3>
            {loadingPlans ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-green-600 border-t-transparent mx-auto"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {plans.map((plan) => (
                  <button
                    key={plan._id}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, planId: plan._id, selectedPlan: plan }))}
                    className={`p-6 rounded-xl border-2 text-left transition-all ${
                      formData.planId === plan._id
                        ? 'border-green-600 bg-green-50 dark:bg-green-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-green-300'
                    }`}
                  >
                    <h4 className="font-bold text-gray-900 dark:text-white mb-2">{plan.name}</h4>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">₹{plan.price}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Duration: {plan.duration} days</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Photos: {plan.maxPhotos}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 2: Shop Details */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Shop Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Shop Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.shopName}
                  onChange={(e) => setFormData(prev => ({ ...prev, shopName: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-900 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter shop name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category *
                </label>
                {loadingCategories ? (
                  <div className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700">
                    Loading...
                  </div>
                ) : (
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-900 dark:bg-gray-700 dark:text-white"
                    required
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
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Address *
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-900 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter full address"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Phone *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value.replace(/\D/g, '') }))}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-900 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter phone number"
                  maxLength={10}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-900 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter email (optional)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Pincode *
                </label>
                <input
                  type="text"
                  required
                  value={formData.pincode}
                  onChange={(e) => setFormData(prev => ({ ...prev, pincode: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-900 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter pincode"
                  maxLength={6}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  City
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-900 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter city"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Latitude *
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={formData.latitude}
                  onChange={(e) => setFormData(prev => ({ ...prev, latitude: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-900 dark:bg-gray-700 dark:text-white"
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
                  required
                  value={formData.longitude}
                  onChange={(e) => setFormData(prev => ({ ...prev, longitude: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-900 dark:bg-gray-700 dark:text-white"
                  placeholder="e.g., 85.1376"
                />
              </div>
              <div className="md:col-span-2">
                <button
                  type="button"
                  onClick={getCurrentLocation}
                  disabled={loadingLocation}
                  className="w-full px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <FiMapPin />
                  {loadingLocation ? 'Getting Location...' : 'Get Current Location'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Images */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Shop Images</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Upload Images
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  files.forEach(file => handleImageUpload(file));
                }}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-900 dark:bg-gray-700 dark:text-white"
              />
              {uploadingImages && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Uploading...</p>
              )}
              {formData.images.length > 0 && (
                <div className="grid grid-cols-3 gap-4 mt-4">
                  {formData.images.map((img, index) => (
                    <div key={index} className="relative">
                      <img src={img} alt={`Shop ${index + 1}`} className="w-full h-32 object-cover rounded-lg" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 4: Review */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Review & Submit</h3>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Plan Selected</h4>
                <p className="text-gray-700 dark:text-gray-300">
                  {formData.selectedPlan?.name} - ₹{formData.selectedPlan?.price}
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Shop Details</h4>
                <p className="text-gray-700 dark:text-gray-300">Name: {formData.shopName}</p>
                <p className="text-gray-700 dark:text-gray-300">Category: {formData.category}</p>
                <p className="text-gray-700 dark:text-gray-300">Address: {formData.address}</p>
                <p className="text-gray-700 dark:text-gray-300">Phone: {formData.phone}</p>
                <p className="text-gray-700 dark:text-gray-300">Pincode: {formData.pincode}</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Payment Method</h4>
                <p className="text-gray-700 dark:text-gray-300">Online Payment Only - ₹{formData.selectedPlan?.price}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={() => setCurrentStep(currentStep > 1 ? currentStep - 1 : 1)}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            {currentStep === 1 ? 'Cancel' : 'Back'}
          </button>
          <div className="flex gap-2">
            {currentStep < 4 ? (
              <button
                type="button"
                onClick={() => {
                  if (currentStep === 1 && !formData.planId) {
                    setError('Please select a plan');
                    return;
                  }
                  if (currentStep === 2 && (!formData.shopName || !formData.category || !formData.address || !formData.latitude || !formData.longitude || !formData.pincode || !formData.phone)) {
                    setError('Please fill all required fields');
                    return;
                  }
                  setCurrentStep(currentStep + 1);
                  setError('');
                }}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Creating...' : 'Create Shop & Pay Online'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

