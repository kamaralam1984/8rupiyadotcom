'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FiShoppingBag, FiMapPin, FiUpload, FiCheck, FiAlertCircle, FiCamera, FiX } from 'react-icons/fi';
import PhoneAndPostalInput from '@/components/common/PhoneAndPostalInput';
import CountryNameSelector from '@/components/common/CountryNameSelector';
import { getCountryByCode, validatePhoneNumber, validatePostalCode } from '@/lib/countryData';
import { getPriceForCountry } from '@/lib/currencyConverter';

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
  const [categories, setCategories] = useState<Array<{ _id: string; name: string; slug: string; icon?: string }>>([]);
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
    countryCode: 'IN', // Default to India
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

  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Max dimensions for mobile
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1200;
          
          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              } else {
                reject(new Error('Failed to compress image'));
              }
            },
            'image/jpeg',
            0.85
          );
        };
        img.onerror = () => reject(new Error('Failed to load image'));
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
    });
  };

  const handleImageUpload = async (file: File) => {
    setUploadingImages(true);
    setError('');

    try {
      console.log('📸 Starting image upload:', file.name, file.size, file.type);
      
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('❌ No token found');
        setError('Please login again');
        setUploadingImages(false);
        return;
      }

      // Validate file size (max 10MB before compression)
      if (file.size > 10 * 1024 * 1024) {
        console.error('❌ File too large:', file.size);
        setError('Image size should be less than 10MB');
        setUploadingImages(false);
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        console.error('❌ Invalid file type:', file.type);
        setError('Please upload a valid image file');
        setUploadingImages(false);
        return;
      }

      console.log('🔄 Compressing image...');
      // Compress image for mobile
      const compressedFile = await compressImage(file);
      console.log('✅ Compressed:', compressedFile.size, 'bytes');

      const formDataToUpload = new FormData();
      formDataToUpload.append('image', compressedFile);

      console.log('📤 Uploading to server...');
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formDataToUpload,
      });

      const data = await response.json();
      console.log('📥 Server response:', data);
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload image');
      }

      if (data.url) {
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, data.url],
        }));
        console.log('✅ Image uploaded successfully:', data.url);
      } else {
        throw new Error('No image URL returned');
      }
    } catch (err: any) {
      console.error('❌ Image upload error:', err);
      setError(err.message || 'Failed to upload image. Please try again.');
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
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

      // Validate phone number and postal code based on country
      const country = getCountryByCode(formData.countryCode);
      if (country) {
        if (!validatePhoneNumber(formData.phone, country)) {
          setError(`Mobile number must be ${country.phoneLength.min}-${country.phoneLength.max} digits`);
          setSubmitting(false);
          return;
        }
        
        if (country.postalCode.length > 0 && !validatePostalCode(formData.pincode, country)) {
          setError(`Invalid pincode format. Expected: ${country.postalCode.format} (e.g., ${country.postalCode.example})`);
          setSubmitting(false);
          return;
        }
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
          phone: `${getCountryByCode(formData.countryCode)?.dialCode || '+91'}${formData.phone}`,
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

          if (!paymentResponse.ok) {
            const errorData = await paymentResponse.json();
            console.error('❌ Payment order creation failed:', errorData);
            setError(`Failed to create payment order: ${errorData.error || 'Please try again'}`);
            setSubmitting(false);
            setPaymentProcessing(false);
            return;
          }

          const paymentData = await paymentResponse.json();
          if (paymentData.success && paymentData.orderId) {
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
                
                // Detect if device is mobile
                const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
                console.log('📱 Device type:', isMobile ? 'Mobile' : 'Desktop');
                console.log('💳 Opening Razorpay for amount:', selectedPlan?.price);
                
                const options = {
                  key: keyData.keyId,
                  amount: (selectedPlan?.price || 0) * 100,
                  currency: 'INR',
                  name: '8Rupiya',
                  description: `Payment for ${selectedPlan?.name || 'Plan'} - ${formData.shopName}`,
                  order_id: paymentData.orderId,
                  image: '/logo.png',
                  handler: async function (response: any) {
                    console.log('✅ Payment successful:', response);
                    setPaymentProcessing(true);
                    setSubmitting(true);
                    try {
                      console.log('🔄 Verifying payment...');
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

                      const verifyData = await verifyResponse.json();
                      console.log('📥 Verification response:', verifyData);

                      if (verifyResponse.ok && verifyData.success) {
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
                        console.error('❌ Verification failed:', verifyData);
                        setError(`Payment verification failed: ${verifyData.error || 'Please contact support'}`);
                        setSubmitting(false);
                        setPaymentProcessing(false);
                      }
                    } catch (verifyErr: any) {
                      console.error('❌ Payment verification error:', verifyErr);
                      setError('Payment verification failed. Please contact support with your payment ID.');
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
                    confirm_close: isMobile, // Only confirm on mobile
                    escape: !isMobile, // Only allow ESC on desktop
                    backdropclose: false, // Prevent accidental closes
                    animation: true,
                    handleback: isMobile, // Handle Android back button on mobile
                  },
                  prefill: {
                    name: formData.shopName || '',
                    email: formData.email || '',
                    contact: formData.phone || '',
                  },
                  notes: {
                    shop_name: formData.shopName,
                    shop_id: data.shop._id,
                    plan_id: formData.planId,
                    device_type: isMobile ? 'mobile' : 'desktop',
                  },
                  theme: {
                    color: '#10b981',
                    backdrop_color: 'rgba(0, 0, 0, 0.6)',
                    hide_topbar: isMobile, // Hide topbar on mobile for more space
                  },
                  config: {
                    display: isMobile ? {
                      blocks: {
                        banks: {
                          name: 'Pay using',
                          instruments: [
                            {
                              method: 'upi',
                            },
                            {
                              method: 'card',
                            },
                            {
                              method: 'netbanking',
                            },
                            {
                              method: 'wallet',
                            },
                          ],
                        },
                      },
                      sequence: ['block.banks'],
                      preferences: {
                        show_default_blocks: true,
                      },
                    } : {},
                  },
                  retry: {
                    enabled: true,
                    max_count: 3,
                  },
                  timeout: 600,
                  remember_customer: false,
                  readonly: {
                    email: false,
                    contact: false,
                    name: false,
                  },
                };

                console.log('🚀 Initializing Razorpay with options:', {
                  key: keyData.keyId,
                  amount: options.amount,
                  currency: options.currency,
                  order_id: options.order_id,
                  isMobile,
                });

                const razorpay = new window.Razorpay(options);
                
                // Add error handler
                razorpay.on('payment.failed', function (response: any) {
                  console.error('❌ Payment failed:', response.error);
                  setError(`Payment failed: ${response.error.description || 'Please try again'}`);
                  setSubmitting(false);
                  setPaymentProcessing(false);
                });

                razorpay.open();
                console.log('✅ Razorpay checkout opened');
              } catch (razorpayErr: any) {
                console.error('❌ Razorpay initialization error:', razorpayErr);
                setError(`Failed to open payment gateway: ${razorpayErr.message || 'Please try again'}`);
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
            
            {/* Country Selector for Currency */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Country (for currency conversion) *
              </label>
              <CountryNameSelector
                value={formData.countryCode}
                onChange={(code) => setFormData(prev => ({ ...prev, countryCode: code }))}
                showFlag={true}
                showDialCode={true}
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Plans will be displayed in {getCountryByCode(formData.countryCode)?.currency.symbol} {getCountryByCode(formData.countryCode)?.currency.code}
              </p>
            </div>
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
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
                      {getPriceForCountry(plan.price, formData.countryCode).formatted}
                    </p>
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
                        {cat.icon ? `${cat.icon} ${cat.name}` : cat.name}
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
              <div className="md:col-span-2">
                <PhoneAndPostalInput
                  countryCode={formData.countryCode}
                  onCountryChange={(code) => setFormData(prev => ({ ...prev, countryCode: code }))}
                  phoneValue={formData.phone}
                  onPhoneChange={(phone) => setFormData(prev => ({ ...prev, phone }))}
                  postalValue={formData.pincode}
                  onPostalChange={(postal) => setFormData(prev => ({ ...prev, pincode: postal }))}
                  phoneLabel="Phone"
                  postalLabel="Pincode"
                  phoneRequired={true}
                  postalRequired={true}
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
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Shop Images</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Upload up to {formData.selectedPlan?.maxPhotos || 5} images • Max 10MB per image
              </p>
            </div>

            {/* Upload Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Camera Capture - Mobile Optimized */}
              <label 
                className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl transition-all hover:shadow-lg group ${
                  uploadingImages || formData.images.length >= (formData.selectedPlan?.maxPhotos || 5)
                    ? 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 cursor-not-allowed opacity-60'
                    : 'border-emerald-300 dark:border-emerald-600 hover:border-emerald-500 dark:hover:border-emerald-400 cursor-pointer bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20'
                }`}
              >
                <FiCamera className="text-4xl text-emerald-600 dark:text-emerald-400 mb-3 group-hover:scale-110 transition-transform" />
                <span className="text-base font-semibold text-gray-900 dark:text-white">📸 Capture Photo</span>
                <span className="text-xs text-gray-600 dark:text-gray-400 mt-2 text-center">Use camera to take photo</span>
                {formData.images.length >= (formData.selectedPlan?.maxPhotos || 5) && (
                  <span className="text-xs text-red-600 dark:text-red-400 mt-1">Max photos reached</span>
                )}
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={(e) => {
                    console.log('📸 Camera capture triggered');
                    const file = e.target.files?.[0];
                    if (file) {
                      console.log('📸 File selected:', file.name, file.type, file.size);
                      handleImageUpload(file);
                    }
                    e.target.value = ''; // Reset input
                  }}
                  className="hidden"
                  disabled={uploadingImages || formData.images.length >= (formData.selectedPlan?.maxPhotos || 5)}
                />
              </label>

              {/* File Upload */}
              <label 
                className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl transition-all hover:shadow-lg group ${
                  uploadingImages || formData.images.length >= (formData.selectedPlan?.maxPhotos || 5)
                    ? 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 cursor-not-allowed opacity-60'
                    : 'border-blue-300 dark:border-blue-600 hover:border-blue-500 dark:hover:border-blue-400 cursor-pointer bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20'
                }`}
              >
                <FiUpload className="text-4xl text-blue-600 dark:text-blue-400 mb-3 group-hover:scale-110 transition-transform" />
                <span className="text-base font-semibold text-gray-900 dark:text-white">📁 Upload from Device</span>
                <span className="text-xs text-gray-600 dark:text-gray-400 mt-2 text-center">Choose from gallery</span>
                {formData.images.length >= (formData.selectedPlan?.maxPhotos || 5) && (
                  <span className="text-xs text-red-600 dark:text-red-400 mt-1">Max photos reached</span>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    console.log('📁 File upload triggered');
                    const files = Array.from(e.target.files || []);
                    console.log('📁 Files selected:', files.length);
                    files.forEach(file => {
                      console.log('📁 Uploading file:', file.name, file.type, file.size);
                      handleImageUpload(file);
                    });
                    e.target.value = ''; // Reset input
                  }}
                  className="hidden"
                  disabled={uploadingImages || formData.images.length >= (formData.selectedPlan?.maxPhotos || 5)}
                />
              </label>
            </div>

            {/* Uploading State */}
            {uploadingImages && (
              <div className="flex items-center justify-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent"></div>
                <p className="text-sm font-medium text-blue-700 dark:text-blue-400">Uploading image...</p>
              </div>
            )}

            {/* Uploaded Images Grid */}
            {formData.images.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  Uploaded Images ({formData.images.length}/{formData.selectedPlan?.maxPhotos || 5})
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {formData.images.map((img, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="relative group aspect-square"
                    >
                      <img 
                        src={img} 
                        alt={`Shop ${index + 1}`} 
                        className="w-full h-full object-cover rounded-lg border-2 border-gray-200 dark:border-gray-700 shadow-md"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <FiX className="text-sm" />
                      </button>
                      <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                        #{index + 1}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* No Images Warning */}
            {formData.images.length === 0 && !uploadingImages && (
              <div className="flex items-center gap-2 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                <FiAlertCircle className="text-amber-600 dark:text-amber-400" />
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  Add at least one image to make your shop more attractive
                </p>
              </div>
            )}
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
                  {formData.selectedPlan?.name} - {getPriceForCountry(formData.selectedPlan?.price || 0, formData.countryCode).formatted}
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
                <p className="text-gray-700 dark:text-gray-300">
                  Online Payment Only - {getPriceForCountry(formData.selectedPlan?.price || 0, formData.countryCode).formatted}
                </p>
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
                  
                  // Validate phone and postal code based on country
                  if (currentStep === 2 && formData.phone && formData.pincode) {
                    const country = getCountryByCode(formData.countryCode);
                    if (country) {
                      if (!validatePhoneNumber(formData.phone, country)) {
                        setError(`Mobile number must be ${country.phoneLength.min}-${country.phoneLength.max} digits`);
                        return;
                      }
                      if (country.postalCode.length > 0 && !validatePostalCode(formData.pincode, country)) {
                        setError(`Invalid pincode format. Expected: ${country.postalCode.format} (e.g., ${country.postalCode.example})`);
                        return;
                      }
                    }
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

