'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  FiArrowLeft,
  FiCamera,
  FiMapPin,
  FiCheck,
  FiAlertCircle,
  FiX,
} from 'react-icons/fi';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface Plan {
  _id: string;
  name: string;
  price: number;
  // New plan system fields
  maxPhotos: number;
  maxOffers: number;
  pageLimit: number;
  position: 'normal' | 'left' | 'right' | 'hero' | 'banner';
  seoEnabled: boolean;
  // Legacy fields
  photos?: number;
  slots?: number;
  seo?: boolean;
  offers?: number;
  pageHosting?: number;
  slotType?: string;
  priorityRank?: number;
}

interface FormData {
  // Step 1: Plan
  planId: string;
  selectedPlan: Plan | null;
  
  // Step 2: Basic Information
  shopName: string;
  ownerName: string;
  mobileNumber: string;
  email: string;
  category: string;
  pincode: string;
  area: string;
  city: string;
  fullAddress: string;
  
  // SEO Fields
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  
  // Step 3: Photo
  photo: File | null;
  photoPreview: string;
  
  // Step 4: Location & Payment
  location: {
    lat: number;
    lng: number;
  } | null;
  manualLatitude: string;
  manualLongitude: string;
  amount: number;
  receiptNo: string;
  sendSmsReceipt: boolean;
  paymentMode: 'cash' | 'upi';
}

export default function AddNewShopPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [userId, setUserId] = useState<string>('');
  const [createdShopId, setCreatedShopId] = useState<string | null>(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    planId: '',
    selectedPlan: null,
    shopName: '',
    ownerName: '',
    mobileNumber: '',
    email: '',
    category: '',
    pincode: '',
    area: '',
    city: '',
    fullAddress: '',
    seoTitle: '',
    seoDescription: '',
    seoKeywords: '',
    photo: null,
    photoPreview: '',
    location: null,
    manualLatitude: '',
    manualLongitude: '',
    amount: 0,
    receiptNo: '',
    sendSmsReceipt: false,
    paymentMode: 'cash',
  });

  useEffect(() => {
    fetchPlans();
    fetchCategories();
    fetchUserInfo();
  }, []);

  // Generate SEO from shop details
  const generateSEO = () => {
    if (!formData.shopName || !formData.category || !formData.pincode || !formData.fullAddress) {
      setError('Please fill Shop Name, Category, Pincode, and Full Address to generate SEO');
      return;
    }

    const seoTitle = `${formData.shopName} - ${formData.category} in ${formData.pincode}`;
    const seoDescription = `Find ${formData.shopName}, ${formData.category} shop in ${formData.fullAddress}, pincode ${formData.pincode}${formData.area ? `, ${formData.area}` : ''}. ${formData.email ? `Contact: ${formData.email}` : ''}`;
    const keywords = [
      formData.shopName,
      formData.category,
      formData.pincode,
      formData.area,
      formData.fullAddress.split(',')[0], // First part of address
      'shop',
      'business',
      'near me',
      formData.category.toLowerCase() + ' shop',
    ].filter(Boolean).join(', ');

    setFormData(prev => ({
      ...prev,
      seoTitle,
      seoDescription,
      seoKeywords: keywords,
    }));

    // Show success message
    const successMsg = document.createElement('div');
    successMsg.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
    successMsg.textContent = '✓ SEO generated successfully!';
    document.body.appendChild(successMsg);
    setTimeout(() => {
      document.body.removeChild(successMsg);
    }, 3000);
  };

  const fetchUserInfo = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUserId(data.user?.id || data.user?.userId || '');
      }
    } catch (err) {
      console.error('Failed to fetch user info:', err);
    }
  };

  const fetchPlans = async () => {
    try {
      setLoadingPlans(true);
      const response = await fetch('/api/plans');
      if (response.ok) {
        const data = await response.json();
        console.log('Plans fetched:', data);
        if (data.plans && data.plans.length > 0) {
          setPlans(data.plans);
        } else {
          console.warn('No plans found in database. Please initialize plans from admin panel.');
          setPlans([]);
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to fetch plans:', response.status, errorData);
        setPlans([]);
      }
    } catch (err) {
      console.error('Failed to fetch plans:', err);
      setPlans([]);
    } finally {
      setLoadingPlans(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      
      if (response.ok && data.success) {
        // Extract category names from database categories
        const categoryNames = (data.categories || []).map((cat: any) => cat.name);
        setCategories(categoryNames);
      } else {
        console.error('Failed to fetch categories:', data.error);
        setCategories([]);
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      setCategories([]);
    }
  };

  const handlePlanSelect = (planId: string) => {
    const plan = plans.find((p) => p._id === planId);
    if (plan) {
      setFormData({
        ...formData,
        planId,
        selectedPlan: plan,
        amount: plan.price,
      });
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        setError('Maximum size: 3MB');
        return;
      }
      setFormData({
        ...formData,
        photo: file,
        photoPreview: URL.createObjectURL(file),
      });
      setError('');
    }
  };

  const captureLocation = () => {
    setError('');
    
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser. Please enter coordinates manually.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData({
          ...formData,
          location: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          },
        });
        setError('');
      },
      (err) => {
        let errorMessage = 'Failed to get location. Please enable location access.';
        
        switch (err.code) {
          case err.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please enable location permission in your browser settings.';
            break;
          case err.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable. Please try again.';
            break;
          case err.TIMEOUT:
            errorMessage = 'Location request timed out. Please try again.';
            break;
          default:
            errorMessage = 'Failed to get location. Please try again.';
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

  const handleNext = () => {
    setError('');
    
    if (currentStep === 1) {
      if (!formData.planId) {
        setError('Please select a plan');
        return;
      }
    } else if (currentStep === 2) {
      if (
        !formData.shopName ||
        !formData.ownerName ||
        !formData.mobileNumber ||
        !formData.email ||
        !formData.category ||
        !formData.pincode ||
        !formData.fullAddress
      ) {
        setError('Please fill all required fields');
        return;
      }
      if (formData.mobileNumber.length !== 10) {
        setError('Mobile number must be 10 digits');
        return;
      }
      if (formData.pincode.length !== 6) {
        setError('Pincode must be 6 digits');
        return;
      }
    } else if (currentStep === 3) {
      if (!formData.photo) {
        setError('Please upload a shop photo');
        return;
      }
    } else if (currentStep === 4) {
      // Check if location is captured or manually entered
      if (!formData.location && (!formData.manualLatitude || !formData.manualLongitude)) {
        setError('Please capture location or enter coordinates manually');
        return;
      }
      
      // If manual coordinates are provided, use them
      if (formData.manualLatitude && formData.manualLongitude) {
        const lat = parseFloat(formData.manualLatitude);
        const lng = parseFloat(formData.manualLongitude);
        
        if (isNaN(lat) || isNaN(lng)) {
          setError('Please enter valid latitude and longitude coordinates');
          return;
        }
        
        if (lat < -90 || lat > 90) {
          setError('Latitude must be between -90 and 90');
          return;
        }
        
        if (lng < -180 || lng > 180) {
          setError('Longitude must be between -180 and 180');
          return;
        }
        
        setFormData({
          ...formData,
          location: { lat, lng },
        });
      }
    }
    
    setCurrentStep(currentStep + 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login again');
        setLoading(false);
        return;
      }

      // Upload photo
      let photoUrl = '';
      if (formData.photo) {
        const photoFormData = new FormData();
        photoFormData.append('image', formData.photo);

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: photoFormData,
        });

        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          photoUrl = uploadData.url || uploadData.urls?.[0] || '';
        }
      }

      // Validate plan limits
      if (formData.selectedPlan) {
        const maxPhotos = formData.selectedPlan.maxPhotos ?? formData.selectedPlan.photos ?? 1;
        const photoCount = photoUrl ? 1 : 0;
        
        if (photoCount > maxPhotos) {
          setError(`This plan allows only ${maxPhotos} photo(s). Please remove extra photos.`);
          setLoading(false);
          return;
        }
      }

      // Create shop
      const shopData: any = {
        name: formData.shopName,
        description: formData.fullAddress,
        category: formData.category,
        address: formData.fullAddress,
        area: formData.area || '',
        city: formData.city || 'Patna',
        state: 'Bihar',
        pincode: formData.pincode,
        phone: `+91${formData.mobileNumber}`,
        email: formData.email,
        location: {
          type: 'Point',
          coordinates: [
            formData.location?.lng || parseFloat(formData.manualLongitude),
            formData.location?.lat || parseFloat(formData.manualLatitude)
          ],
        },
        images: photoUrl ? [photoUrl] : [],
        photos: photoUrl ? [photoUrl] : [], // Plan-based photos array
        offers: [], // Initialize empty offers array
        pages: [], // Initialize empty pages array
        planId: formData.planId,
        paymentStatus: 'pending', // Set payment status to pending initially
        shopperId: userId, // Use agent's ID as shopperId for agent-created shops
      };

      // Add SEO fields if generated and plan has SEO enabled
      if (formData.selectedPlan && (formData.selectedPlan.seoEnabled ?? formData.selectedPlan.seo)) {
        if (formData.seoTitle && formData.seoDescription && formData.seoKeywords) {
          shopData.seoTitle = formData.seoTitle;
          shopData.seoDescription = formData.seoDescription;
          shopData.seoKeywords = formData.seoKeywords;
        }
      }

      const response = await fetch('/api/shops', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(shopData),
      });

      const data = await response.json();

      if (response.ok) {
        const shopId = data.shop?._id || data.shop?.id || data._id;
        setCreatedShopId(shopId);
        
        // Handle payment based on mode (upi uses Razorpay for online payment)
        if (formData.paymentMode === 'upi' && formData.planId && shopId) {
          console.log(`🔄 Starting Online Payment (UPI/Card) flow...`, { shopId, planId: formData.planId, mode: formData.paymentMode });
          
          // Disable submit button and set payment processing
          setPaymentProcessing(true);
          setLoading(false); // Allow UI to show payment processing state
          
          // For online payment, create order with shopId
          try {
            console.log('📤 Creating payment order...');
            const paymentResponse = await fetch('/api/payments/create-order', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
              },
              body: JSON.stringify({
                shopId: shopId,
                planId: formData.planId,
              }),
            });

            console.log('📥 Payment order response status:', paymentResponse.status);

            if (!paymentResponse.ok) {
              const errorData = await paymentResponse.json().catch(() => ({ error: 'Unknown error' }));
              console.error('❌ Payment order creation failed:', errorData);
              setError(`Payment order failed: ${errorData.error || 'Unknown error'}`);
              setPaymentProcessing(false);
              setLoading(false);
              return;
            }

            const paymentData = await paymentResponse.json();
            console.log('✅ Payment order created:', paymentData);
            
            if (paymentData.success && paymentData.orderId) {
              console.log('✅ Payment order created successfully:', paymentData.orderId);
              
              // Get Razorpay key
              console.log('🔑 Fetching Razorpay key...');
              const keyResponse = await fetch('/api/payments/razorpay-key');
              
              if (!keyResponse.ok) {
                console.error('❌ Failed to fetch Razorpay key:', keyResponse.status);
                throw new Error('Failed to get payment gateway configuration. Please try again.');
              }
              
              const keyData = await keyResponse.json();
              console.log('🔑 Razorpay key response:', keyData);
              
              if (!keyData.success || !keyData.keyId) {
                console.error('❌ Razorpay key not configured');
                throw new Error('Payment gateway not configured. Please contact administrator.');
              }
              
              console.log('✅ Razorpay key obtained:', keyData.keyId.substring(0, 10) + '...');

              // Function to open Razorpay checkout
              const openRazorpayCheckout = () => {
                console.log('🔓 Opening Razorpay checkout...');
                
                if (!window.Razorpay) {
                  console.error('❌ Razorpay SDK not available');
                  setError('Razorpay SDK not loaded. Please refresh the page and try again.');
                  setPaymentProcessing(false);
                  setLoading(false);
                  return;
                }

                try {
                  const amount = (formData.selectedPlan?.price || 0) * 100;
                  console.log('💰 Payment amount:', amount, 'paise');
                  
                  const options: any = {
                    key: keyData.keyId,
                    amount: amount,
                    currency: 'INR',
                    name: '8Rupiya',
                    description: `Payment for ${formData.selectedPlan?.name || 'Plan'} - ${formData.shopName}`,
                    order_id: paymentData.orderId,
                    handler: async function (response: any) {
                      setPaymentProcessing(true);
                      setLoading(true);
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
                            setLoading(false);
                            // Redirect after a short delay to show success state
                            setTimeout(() => {
                              router.push('/agent/shops?payment=success');
                            }, 1000);
                          } else {
                            setError('Payment verification failed. Please contact support.');
                            setPaymentProcessing(false);
                            setLoading(false);
                          }
                        } else {
                          const errorData = await verifyResponse.json();
                          setError(`Payment verification failed: ${errorData.error || 'Unknown error'}`);
                          setPaymentProcessing(false);
                          setLoading(false);
                        }
                      } catch (verifyErr: any) {
                        console.error('Payment verification error:', verifyErr);
                        setError('Payment verification failed. Please contact support.');
                        setPaymentProcessing(false);
                        setLoading(false);
                      }
                    },
                    modal: {
                      ondismiss: function () {
                        setPaymentProcessing(false);
                        setLoading(false);
                        setError('Payment was cancelled. You can try again.');
                      },
                    },
                    prefill: {
                      name: formData.ownerName || formData.shopName || '',
                      email: formData.email || '',
                      contact: formData.mobileNumber || '',
                    },
                    theme: {
                      color: '#6366f1',
                    },
                  };
                  
                  // Configure payment options - Razorpay will show all payment methods (UPI, Card, Net Banking)
                  options.notes = {
                    payment_type: 'online',
                    shop_name: formData.shopName,
                  };
                  console.log('💳 Online payment configured - Razorpay will show all payment options (UPI, Card, Net Banking)');

                  const razorpay = new window.Razorpay(options);
                  razorpay.open();
                } catch (razorpayErr: any) {
                  console.error('Razorpay initialization error:', razorpayErr);
                  setError('Failed to open payment gateway. Please try again.');
                  setPaymentProcessing(false);
                  setLoading(false);
                }
              };

            // Check if Razorpay is already loaded
            console.log('🔍 Checking Razorpay SDK availability...');
            
            if (window.Razorpay) {
              console.log('✅ Razorpay SDK already loaded, opening checkout...');
              // Razorpay already loaded, open checkout immediately
              setTimeout(() => {
                openRazorpayCheckout();
              }, 100);
            } else {
              console.log('⏳ Razorpay SDK not loaded, loading script...');
              
              // Load Razorpay script
              const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
              
              if (existingScript) {
                console.log('📜 Existing script found, waiting for load...');
                // Script already exists, check if it's loaded
                if ((existingScript as HTMLScriptElement).onload) {
                  // Already has onload handler, check if Razorpay is available
                  const checkInterval = setInterval(() => {
                    if (window.Razorpay) {
                      clearInterval(checkInterval);
                      console.log('✅ Razorpay SDK loaded via existing script');
                      openRazorpayCheckout();
                    }
                  }, 100);
                  
                  // Timeout after 5 seconds
                  setTimeout(() => {
                    clearInterval(checkInterval);
                  if (!window.Razorpay) {
                    setError('Razorpay SDK failed to load. Please refresh and try again.');
                    setPaymentProcessing(false);
                    setLoading(false);
                  }
                  }, 5000);
                } else {
                  // Add load event listener
                  existingScript.addEventListener('load', () => {
                    console.log('✅ Existing script loaded');
                    if (window.Razorpay) {
                      openRazorpayCheckout();
                    } else {
                      setError('Razorpay SDK failed to load. Please refresh and try again.');
                      setPaymentProcessing(false);
                      setLoading(false);
                    }
                  });
                }
              } else {
                console.log('📥 Creating new Razorpay script...');
                // Create and load new script
                const script = document.createElement('script');
                script.src = 'https://checkout.razorpay.com/v1/checkout.js';
                script.async = true;
                script.id = 'razorpay-checkout-script';
                
                script.onload = () => {
                  console.log('✅ Razorpay script loaded');
                  // Give it a moment to initialize
                  setTimeout(() => {
                    if (window.Razorpay) {
                      console.log('✅ Razorpay SDK initialized');
                      openRazorpayCheckout();
                    } else {
                      console.error('❌ Razorpay SDK not available after script load');
                      setError('Razorpay SDK failed to initialize. Please refresh and try again.');
                      setPaymentProcessing(false);
                      setLoading(false);
                    }
                  }, 200);
                };
                
                script.onerror = (error) => {
                  console.error('❌ Razorpay script load error:', error);
                  setError('Failed to load Razorpay SDK. Please check your internet connection and try again.');
                  setPaymentProcessing(false);
                  setLoading(false);
                };
                
                document.head.appendChild(script);
                console.log('📤 Razorpay script added to head');
              }
            }
            } else {
              throw new Error('Invalid payment response from server');
            }
          } catch (paymentErr: any) {
            console.error('Error processing online payment:', paymentErr);
            setError(`Payment failed: ${paymentErr.message || 'Unknown error'}`);
            setPaymentProcessing(false);
            setLoading(false);
            return;
          }
        } else if (formData.paymentMode === 'cash' && formData.planId && shopId) {
          // Create cash payment record
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
                amount: formData.amount || formData.selectedPlan?.price || 0,
                receiptNo: formData.receiptNo || undefined,
                sendSmsReceipt: formData.sendSmsReceipt,
              }),
            });

            if (!paymentResponse.ok) {
              console.warn('Failed to create payment record:', await paymentResponse.text());
              // Continue even if payment creation fails
            }
          } catch (paymentErr) {
            console.warn('Error creating payment record:', paymentErr);
            // Continue even if payment creation fails
          }
          
          router.push('/agent/shops');
        } else {
          // No payment needed
          router.push('/agent/shops');
        }
      } else {
        setError(data.error || 'Failed to create shop');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { number: 1, label: 'Select Plan' },
    { number: 2, label: 'Basic Information' },
    { number: 3, label: 'Shop Photo' },
    { number: 4, label: 'Location & Payment' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 hover:text-blue-100 transition-colors"
          >
            <FiArrowLeft />
            <span>Back</span>
          </button>
          <h1 className="text-xl font-bold">Add New Shop</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-8">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold text-lg transition-all ${
                    currentStep >= step.number
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {currentStep > step.number ? <FiCheck /> : step.number}
                </div>
                <span
                  className={`text-xs mt-2 font-medium ${
                    currentStep >= step.number ? 'text-blue-600' : 'text-gray-500'
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`w-24 h-1 mx-2 ${
                    currentStep > step.number ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-200">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 bg-red-50 border-2 border-red-300 text-red-800 px-4 py-3 rounded-lg flex items-start gap-3 shadow-md"
            >
              <FiAlertCircle className="text-red-600 text-xl flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">Error:</p>
                <p className="text-sm">{error}</p>
              </div>
              <button
                onClick={() => setError('')}
                className="text-red-600 hover:text-red-800 flex-shrink-0"
              >
                <FiX />
              </button>
            </motion.div>
          )}
          
          {loading && (
            <div className="mb-6 bg-blue-50 border-2 border-blue-300 text-blue-800 px-4 py-3 rounded-lg flex items-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent"></div>
              <span className="font-medium">
                {formData.paymentMode === 'upi'
                  ? 'Processing Online Payment... Please wait...' 
                  : 'Creating shop... Please wait...'}
              </span>
            </div>
          )}

          {/* Step 1: Select Plan */}
          {currentStep === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Select Plan (योजना चुनें)
                </h2>
                <p className="text-gray-600">
                  Pehle apna plan select karein, phir shop details fill karein
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Plan *
                  </label>
                  {loadingPlans ? (
                    <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                      <span className="text-gray-600">Loading plans...</span>
                    </div>
                  ) : (
                    <>
                      <select
                        value={formData.planId || ''}
                        onChange={(e) => handlePlanSelect(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select Plan</option>
                        {plans.length > 0 ? (
                          plans.map((plan) => {
                            // Build feature description based on plan
                            const features = [];
                            
                            // Use new fields if available, fallback to legacy
                            const maxPhotos = plan.maxPhotos ?? plan.photos ?? 0;
                            const maxOffers = plan.maxOffers ?? plan.offers ?? 0;
                            const pageLimit = plan.pageLimit ?? plan.pageHosting ?? 0;
                            const position = plan.position ?? 'normal';
                            const seoEnabled = plan.seoEnabled ?? plan.seo ?? false;
                            
                            // Build feature string based on plan type
                            let featureText = '';
                            
                            if (plan.name === 'Basic Plan') {
                              featureText = ` (${maxPhotos} Photo)`;
                            } else if (plan.name === 'Left Bar Plan') {
                              featureText = ` (1 Slot, ${maxPhotos} Photo)`;
                            } else if (plan.name === 'Bottom Rail Plan') {
                              featureText = ` (Big Slot)`;
                            } else if (plan.name === 'Right Side Plan') {
                              featureText = ` (3x Slot + SEO)`;
                            } else if (plan.name === 'Hero Plan') {
                              featureText = ` (Hero Section, ${maxPhotos} Photos + SEO)`;
                            } else if (plan.name === 'Featured Plan') {
                              featureText = ` (${maxPhotos} Photos + ${maxOffers} Offers + ${pageLimit} Page)`;
                            } else if (plan.name === 'Premium Plan') {
                              featureText = ` (${maxPhotos} Photos + ${maxOffers} Offers + ${pageLimit} Pages)`;
                            } else if (plan.name === 'Banner Plan') {
                              featureText = ` (${maxPhotos} Photos + ${maxOffers} Offers + ${pageLimit} Pages)`;
                            } else {
                              // Fallback for other plans
                              if (maxPhotos) features.push(`${maxPhotos} Photo${maxPhotos > 1 ? 's' : ''}`);
                              if (maxOffers) features.push(`${maxOffers} Offers`);
                              if (pageLimit) features.push(`${pageLimit} Page${pageLimit > 1 ? 's' : ''}`);
                              if (seoEnabled) features.push('SEO');
                              featureText = features.length > 0 ? ` (${features.join(', ')})` : '';
                            }
                            
                            return (
                              <option key={plan._id} value={plan._id}>
                                {plan.name} - ₹{plan.price}/year{featureText}
                              </option>
                            );
                          })
                        ) : (
                          <option value="" disabled>No plans available. Please contact admin.</option>
                        )}
                      </select>
                      {plans.length === 0 && !loadingPlans && (
                        <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <p className="text-sm text-yellow-800">
                            ⚠️ <strong>No plans found.</strong> Please initialize plans from admin panel at <code className="bg-yellow-100 px-1 rounded">/api/admin/plans/init</code> or contact administrator.
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {formData.selectedPlan && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {formData.selectedPlan.name} Features
                    </h3>
                    <ul className="space-y-1 text-sm text-gray-700">
                      <li>✓ Price: ₹{formData.selectedPlan.price}/year</li>
                      {(formData.selectedPlan.maxPhotos ?? formData.selectedPlan.photos) && (
                        <li>✓ Photos: {formData.selectedPlan.maxPhotos ?? formData.selectedPlan.photos} photo{(formData.selectedPlan.maxPhotos ?? formData.selectedPlan.photos ?? 0) > 1 ? 's' : ''}</li>
                      )}
                      {(formData.selectedPlan.maxOffers ?? formData.selectedPlan.offers) > 0 && (
                        <li>✓ Offers: {formData.selectedPlan.maxOffers ?? formData.selectedPlan.offers} offer{(formData.selectedPlan.maxOffers ?? formData.selectedPlan.offers ?? 0) > 1 ? 's' : ''}</li>
                      )}
                      {(formData.selectedPlan.pageLimit ?? formData.selectedPlan.pageHosting) > 0 && (
                        <li>✓ Pages: {formData.selectedPlan.pageLimit ?? formData.selectedPlan.pageHosting} page{(formData.selectedPlan.pageLimit ?? formData.selectedPlan.pageHosting ?? 0) > 1 ? 's' : ''}</li>
                      )}
                      {formData.selectedPlan.position && formData.selectedPlan.position !== 'normal' && (
                        <li>✓ Position: {formData.selectedPlan.position.charAt(0).toUpperCase() + formData.selectedPlan.position.slice(1)}</li>
                      )}
                      {(formData.selectedPlan.seoEnabled ?? formData.selectedPlan.seo) && (
                        <li>✓ SEO Enabled</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Step 2: Basic Information */}
          {currentStep === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Basic Information</h2>
                {formData.selectedPlan && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    {formData.selectedPlan.name}
                  </span>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Shop Name *
                  </label>
                  <input
                    type="text"
                    value={formData.shopName || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, shopName: e.target.value })
                    }
                    placeholder="Enter shop name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Owner Name *
                  </label>
                  <input
                    type="text"
                    value={formData.ownerName || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, ownerName: e.target.value })
                    }
                    placeholder="Enter owner name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mobile Number * (10 digits only)
                  </label>
                  <div className="flex gap-2">
                    <select className="px-4 py-3 border border-gray-300 rounded-lg bg-gray-50">
                      <option>+91 🇮🇳</option>
                    </select>
                    <input
                      type="tel"
                      maxLength={10}
                      value={formData.mobileNumber || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          mobileNumber: e.target.value.replace(/\D/g, ''),
                        })
                      }
                      placeholder="Enter 10 digit mobile number"
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email ID *
                  </label>
                  <div className="mb-2">
                    <span className="text-green-600 text-sm mr-2">Verified</span>
                    <span className="text-red-600 text-sm">(OTP Temporarily Disabled)</span>
                  </div>
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="Enter email address"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <div className="mt-2 flex items-center gap-2 text-yellow-600 text-sm">
                    <FiAlertCircle />
                    <span>
                      Email OTP verification is temporarily disabled. You can proceed without
                      verification.
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    value={formData.category || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pincode *
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={formData.pincode || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        pincode: e.target.value.replace(/\D/g, ''),
                      })
                    }
                    placeholder="Enter 6-digit pincode"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Area (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.area || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, area: e.target.value })
                    }
                    placeholder="Enter area/locality (e.g., Kankarbagh, Patna) - Optional"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.city || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                    placeholder="Enter city name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Address *
                  </label>
                  <textarea
                    value={formData.fullAddress || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, fullAddress: e.target.value })
                    }
                    placeholder="Enter full address"
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* SEO Settings */}
                <div className="pt-4">
                  <button
                    type="button"
                    onClick={generateSEO}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Generate SEO
                  </button>
                  <p className="text-sm text-gray-600 mt-2">
                    Click to generate SEO from Shop Name, Category, Address, and Pincode. SEO will be saved to database when you submit the shop.
                  </p>
                  {formData.seoTitle && (
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm font-medium text-green-800 mb-2">✓ SEO Generated Successfully</p>
                      <div className="text-xs text-green-700 space-y-1">
                        <p><strong>Title:</strong> {formData.seoTitle}</p>
                        <p><strong>Description:</strong> {formData.seoDescription ? (formData.seoDescription.length > 100 ? formData.seoDescription.substring(0, 100) + '...' : formData.seoDescription) : ''}</p>
                        <p><strong>Keywords:</strong> {formData.seoKeywords ? (formData.seoKeywords.length > 80 ? formData.seoKeywords.substring(0, 80) + '...' : formData.seoKeywords) : ''}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Shop Photo */}
          {currentStep === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Shop Photo</h2>
                {formData.selectedPlan && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    {formData.selectedPlan.name}
                  </span>
                )}
              </div>

              <p className="text-gray-600 mb-6">
                Current Plan: {formData.selectedPlan?.name} -{' '}
                {formData.selectedPlan?.photos || 1} photo{formData.selectedPlan?.photos && formData.selectedPlan.photos > 1 ? 's' : ''} allowed
              </p>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <p className="text-lg font-medium text-gray-900 mb-2">
                  Upload Shop Photo (Required)
                </p>
                <p className="text-sm text-gray-600 mb-4">Maximum size: 3MB</p>
                <div className="flex items-center justify-center gap-2 text-yellow-600 mb-6">
                  <FiAlertCircle />
                  <span className="text-sm">
                    This plan allows only {formData.selectedPlan?.photos || 1} photo{formData.selectedPlan?.photos && formData.selectedPlan.photos > 1 ? 's' : ''}
                  </span>
                </div>

                <div className="flex gap-4 justify-center">
                  <label className="flex flex-col items-center gap-2 p-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                    <FiCamera className="text-4xl text-gray-400" />
                    <span className="font-medium text-gray-700">Camera</span>
                    <span className="text-sm text-gray-500">Take Photo</span>
                  </label>

                  <label className="flex flex-col items-center gap-2 p-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                    <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <div className="w-8 h-8 bg-green-500 rounded"></div>
                    </div>
                    <span className="font-medium text-gray-700">Gallery</span>
                    <span className="text-sm text-gray-500">Upload Image</span>
                  </label>
                </div>

                {formData.photoPreview && (
                  <div className="mt-6">
                    <img
                      src={formData.photoPreview}
                      alt="Preview"
                      className="max-w-md mx-auto rounded-lg border border-gray-300"
                    />
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Step 4: Location & Payment */}
          {currentStep === 4 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Location & Payment</h2>
              </div>

              <div className="space-y-6">
                {/* Shop Details Summary */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Shop Details Summary</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600">Shop Name:</span>{' '}
                      <span className="font-medium">{formData.shopName}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Owner:</span>{' '}
                      <span className="font-medium">{formData.ownerName}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Category:</span>{' '}
                      <span className="font-medium">{formData.category}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Pincode:</span>{' '}
                      <span className="font-medium">{formData.pincode}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Area:</span>{' '}
                      <span className="font-medium">{formData.area || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">City:</span>{' '}
                      <span className="font-medium">{formData.city || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Address:</span>{' '}
                      <span className="font-medium">{formData.fullAddress}</span>
                    </div>
                  </div>
                  {formData.selectedPlan && (
                    <div className="mt-3">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                        {formData.selectedPlan.name}
                      </span>
                    </div>
                  )}
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location *
                  </label>
                  
                  {/* Capture Location Button */}
                  <button
                    type="button"
                    onClick={captureLocation}
                    className="w-full px-6 py-4 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2 mb-4"
                  >
                    <FiMapPin className="text-xl" />
                    Capture Current Location
                  </button>
                  
                  {/* Manual Input Option */}
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-3">
                      Or Enter Coordinates Manually:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Latitude *
                        </label>
                        <input
                          type="number"
                          step="any"
                          value={formData.manualLatitude}
                          onChange={(e) => setFormData({ ...formData, manualLatitude: e.target.value })}
                          placeholder="e.g., 25.5941"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Enter latitude (-90 to 90)
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Longitude *
                        </label>
                        <input
                          type="number"
                          step="any"
                          value={formData.manualLongitude}
                          onChange={(e) => setFormData({ ...formData, manualLongitude: e.target.value })}
                          placeholder="e.g., 85.1376"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Enter longitude (-180 to 180)
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Display Location */}
                  {(formData.location || (formData.manualLatitude && formData.manualLongitude)) && (
                    <>
                      <p className="mt-2 text-sm text-gray-600 mb-3">
                        Location: {formData.location 
                          ? `${formData.location.lat.toFixed(6)}, ${formData.location.lng.toFixed(6)}`
                          : `${formData.manualLatitude}, ${formData.manualLongitude}`
                        }
                      </p>
                      
                      {/* Map Preview */}
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Map Preview
                        </label>
                        <div className="w-full h-64 rounded-lg overflow-hidden border border-gray-300 relative">
                          <iframe
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            loading="lazy"
                            allowFullScreen
                            referrerPolicy="no-referrer-when-downgrade"
                            src={`https://www.google.com/maps?q=${
                              formData.location?.lat || formData.manualLatitude
                            },${
                              formData.location?.lng || formData.manualLongitude
                            }&output=embed&zoom=15`}
                            title="Map Preview"
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Coordinates: Lat {formData.location?.lat.toFixed(6) || formData.manualLatitude}, Lng {formData.location?.lng.toFixed(6) || formData.manualLongitude}
                        </p>
                      </div>
                    </>
                  )}
                </div>

                {/* Selected Plan */}
                {formData.selectedPlan && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-gray-900">
                        Selected Plan: {formData.selectedPlan.name}
                      </span>
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        Change Plan
                      </button>
                    </div>
                    <p className="text-gray-700">Amount: ₹{formData.selectedPlan.price}/year</p>
                  </div>
                )}

                {/* Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.amount || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        amount: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    All plans are yearly (365 days validity)
                  </p>
                </div>

                {/* Receipt No */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Receipt No (Auto-generated if empty)
                  </label>
                  <input
                    type="text"
                    value={formData.receiptNo || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, receiptNo: e.target.value })
                    }
                    placeholder="Leave empty to auto-generate"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-sm text-gray-500 mt-1">Leave empty to auto-generate</p>
                </div>

                {/* Send SMS Receipt */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="smsReceipt"
                    checked={formData.sendSmsReceipt}
                    onChange={(e) =>
                      setFormData({ ...formData, sendSmsReceipt: e.target.checked })
                    }
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="smsReceipt" className="text-sm font-medium text-gray-700">
                    Send SMS Receipt
                  </label>
                </div>

                {/* Payment Mode */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Payment Mode *
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, paymentMode: 'cash' })}
                      className={`p-6 rounded-lg border-2 transition-all ${
                        formData.paymentMode === 'cash'
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                          : 'border-gray-300 dark:border-gray-600 hover:border-green-300'
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-4xl mb-2">💰</div>
                        <div className="font-semibold text-gray-900 dark:text-white">Cash Payment</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Offline Payment</div>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, paymentMode: 'upi' })}
                      className={`p-6 rounded-lg border-2 transition-all ${
                        formData.paymentMode === 'upi'
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-300 dark:border-gray-600 hover:border-blue-300'
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-4xl mb-2">💳</div>
                        <div className="font-semibold text-gray-900 dark:text-white">Online Payment</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">UPI, Card, Net Banking</div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => {
                if (currentStep === 1) {
                  router.back();
                } else {
                  setCurrentStep(currentStep - 1);
                }
              }}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              Back
            </button>

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Next: {steps[currentStep].label}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading || paymentProcessing}
                className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                  paymentSuccess
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : paymentProcessing
                    ? 'bg-yellow-600 text-white hover:bg-yellow-700 cursor-wait'
                    : loading
                    ? 'bg-blue-600 text-white hover:bg-blue-700 cursor-wait'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {paymentSuccess ? (
                  <>
                    <FiCheck className="text-lg" />
                    Payment Successful! Redirecting...
                  </>
                ) : paymentProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Processing Payment...
                  </>
                ) : loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Submitting...
                  </>
                ) : (
                  'Submit Shop'
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

