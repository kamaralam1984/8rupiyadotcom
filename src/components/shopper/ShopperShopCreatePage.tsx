'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FiShoppingBag, FiMapPin, FiUpload, FiCheck, FiAlertCircle } from 'react-icons/fi';

declare global {
  interface Window {
    Razorpay: any;
  }
}

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
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  
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
          // Set payment processing state
          setPaymentProcessing(true);
          setSubmitting(false); // Allow UI to show payment processing state
          
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
          if (paymentResponse.ok && paymentData.success && paymentData.orderId) {
            // Get Razorpay key
            const keyResponse = await fetch('/api/payments/razorpay-key');
            const keyData = await keyResponse.json();
            
            if (!keyData.success || !keyData.keyId) {
              setError('Razorpay key not configured. Please contact administrator.');
              setSubmitting(false);
              setPaymentProcessing(false);
              return;
            }

            // Function to open Razorpay checkout
            const openRazorpayCheckout = () => {
              if (!window.Razorpay) {
                setError('Razorpay SDK not loaded. Please refresh the page and try again.');
                setSubmitting(false);
                setPaymentProcessing(false);
                return;
              }

              try {
                const selectedPlan = plans.find(p => p._id === formData.planId);
                const options = {
                  key: keyData.keyId,
                  amount: (selectedPlan?.price || 0) * 100,
                  currency: 'INR',
                  name: '8Rupiya',
                  description: `Payment for ${selectedPlan?.name || 'Plan'} - ${formData.shopName}`,
                  order_id: paymentData.orderId,
                  handler: async function (response: any) {
                    setPaymentProcessing(true);
                    setSubmitting(true);
                    try {
                      console.log('✅ Payment successful, verifying...');
                      // Verify payment
                      const verifyResponse = await fetch('/api/payments/verify', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${token}`,
                        },
                        body: JSON.stringify({
                          razorpay_order_id: response.razorpay_order_id,
                          razorpay_payment_id: response.razorpay_payment_id,
                          razorpay_signature: response.razorpay_signature,
                        }),
                      });

                      if (verifyResponse.ok) {
                        const verifyData = await verifyResponse.json();
                        if (verifyData.success) {
                          // Payment successful - enable submit button and redirect
                          console.log('✅ Payment verified successfully');
                          setPaymentSuccess(true);
                          setPaymentProcessing(false);
                          setSubmitting(false);
                          
                          // Redirect after a short delay
                          setTimeout(() => {
                            router.push('/shopper/shops?payment=success');
                          }, 1000);
                        } else {
                          setError('Payment verification failed. Please contact support.');
                          setSubmitting(false);
                          setPaymentProcessing(false);
                        }
                      } else {
                        const errorData = await verifyResponse.json();
                        setError(`Payment verification failed: ${errorData.error || 'Unknown error'}`);
                        setSubmitting(false);
                        setPaymentProcessing(false);
                      }
                    } catch (verifyErr: any) {
                      console.error('Payment verification error:', verifyErr);
                      setError('Payment verification failed. Please contact support.');
                      setSubmitting(false);
                      setPaymentProcessing(false);
                    }
                  },
                  modal: {
                    ondismiss: function () {
                      console.log('❌ Payment dismissed by user');
                      setSubmitting(false);
                      setPaymentProcessing(false);
                      setError('Payment was cancelled. You can try again.');
                    },
                  },
                  onerror: function (error: any) {
                    console.error('❌ Razorpay error:', error);
                    setSubmitting(false);
                    setPaymentProcessing(false);
                    setError('Payment failed. Please try again.');
                  },
                  prefill: {
                    name: formData.shopName || '',
                    email: formData.email || '',
                    contact: formData.phone || '',
                  },
                  theme: {
                    color: '#6366f1',
                  },
                };

                const razorpay = new window.Razorpay(options);
                razorpay.open();
              } catch (razorpayErr: any) {
                console.error('Razorpay initialization error:', razorpayErr);
                setError('Failed to open payment gateway. Please try again.');
                setSubmitting(false);
                setPaymentProcessing(false);
              }
            };

            // Check if Razorpay is already loaded
            if (window.Razorpay) {
              // Razorpay already loaded, open checkout immediately
              openRazorpayCheckout();
            } else {
              // Load Razorpay script
              const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
              
              if (existingScript) {
                // Script already exists, wait for it to load
                existingScript.addEventListener('load', () => {
                  if (window.Razorpay) {
                    openRazorpayCheckout();
                  } else {
                    setError('Razorpay SDK failed to load. Please refresh and try again.');
                    setSubmitting(false);
                  }
                });
              } else {
                // Create and load new script
                const script = document.createElement('script');
                script.src = 'https://checkout.razorpay.com/v1/checkout.js';
                script.async = true;
                
                script.onload = () => {
                  if (window.Razorpay) {
                    openRazorpayCheckout();
                  } else {
                    setError('Razorpay SDK failed to load. Please refresh and try again.');
                    setSubmitting(false);
                    setPaymentProcessing(false);
                  }
                };
                
                script.onerror = () => {
                  setError('Failed to load Razorpay SDK. Please check your internet connection and try again.');
                  setSubmitting(false);
                  setPaymentProcessing(false);
                };
                
                document.head.appendChild(script);
              }
            }
          } else {
            setError(paymentData.error || 'Failed to create payment order');
            setSubmitting(false);
            setPaymentProcessing(false);
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
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 transition-colors duration-200">
        <div className="flex items-center justify-between mb-6">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold text-lg transition-all ${
                    currentStep >= step.number
                      ? 'bg-green-600 dark:bg-green-500 text-white shadow-lg'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {currentStep > step.number ? <FiCheck /> : step.number}
                </div>
                <span className={`text-xs mt-2 font-medium transition-colors ${
                  currentStep >= step.number 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`w-full h-1 mx-2 transition-colors ${
                    currentStep > step.number 
                      ? 'bg-green-600 dark:bg-green-500' 
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg flex items-start gap-2"
            >
              <FiAlertCircle className="text-xl flex-shrink-0 mt-0.5" />
              <p>{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

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
                  <motion.button
                    key={plan._id}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, planId: plan._id, selectedPlan: plan }))}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className={`p-6 rounded-xl border-2 text-left transition-all ${
                      formData.planId === plan._id
                        ? 'border-green-600 dark:border-green-500 bg-green-50 dark:bg-green-900/30 shadow-md'
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-green-300 dark:hover:border-green-600'
                    }`}
                  >
                    <h4 className="font-bold text-gray-900 dark:text-white mb-2">{plan.name}</h4>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">₹{plan.price}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Duration: {plan.duration} days</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Photos: {plan.maxPhotos}</p>
                  </motion.button>
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
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-colors"
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
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
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
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-colors"
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
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-colors"
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
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-colors"
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
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-colors"
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
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-colors"
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
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-colors"
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
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-colors"
                  placeholder="e.g., 85.1376"
                />
              </div>
              <div className="md:col-span-2">
                <motion.button
                  type="button"
                  onClick={getCurrentLocation}
                  disabled={loadingLocation}
                  whileHover={{ scale: loadingLocation ? 1 : 1.02 }}
                  whileTap={{ scale: loadingLocation ? 1 : 0.98 }}
                  className="w-full px-6 py-3 bg-green-600 dark:bg-green-500 text-white rounded-lg font-semibold hover:bg-green-700 dark:hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md"
                >
                  <FiMapPin />
                  {loadingLocation ? 'Getting Location...' : 'Get Current Location'}
                </motion.button>
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
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-50 dark:file:bg-green-900/30 file:text-green-700 dark:file:text-green-400 hover:file:bg-green-100 dark:hover:file:bg-green-900/40 transition-colors"
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
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6 space-y-4 border border-gray-200 dark:border-gray-600">
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
          <motion.button
            type="button"
            onClick={() => setCurrentStep(currentStep > 1 ? currentStep - 1 : 1)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            {currentStep === 1 ? 'Cancel' : 'Back'}
          </motion.button>
          <div className="flex gap-2">
            {currentStep < 4 ? (
              <motion.button
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
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-2 bg-green-600 dark:bg-green-500 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-colors shadow-md"
              >
                Next
              </motion.button>
            ) : (
              <motion.button
                type="button"
                onClick={handleSubmit}
                disabled={submitting || paymentProcessing}
                whileHover={{ scale: (submitting || paymentProcessing) ? 1 : 1.02 }}
                whileTap={{ scale: (submitting || paymentProcessing) ? 1 : 0.98 }}
                className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                  paymentSuccess
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : paymentProcessing
                    ? 'bg-yellow-600 text-white hover:bg-yellow-700 cursor-wait'
                    : 'bg-green-600 text-white hover:bg-green-700'
                } disabled:opacity-50 disabled:cursor-not-allowed shadow-md`}
              >
                {paymentSuccess ? (
                  <>
                    <FiCheck className="text-lg" />
                    Payment Successful! Redirecting...
                  </>
                ) : paymentProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    Processing Payment...
                  </>
                ) : submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    Creating Shop...
                  </>
                ) : (
                  'Create Shop & Pay Online'
                )}
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

