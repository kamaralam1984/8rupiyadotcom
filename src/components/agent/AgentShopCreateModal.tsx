'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiCheck, FiMapPin, FiCamera, FiCreditCard, FiDollarSign, FiUpload, FiTrash2 } from 'react-icons/fi';
import { compressImage } from '@/lib/imageCompression';

interface Plan {
  _id: string;
  name: string;
  price: number;
  duration: number;
  maxPhotos: number;
  maxOffers: number;
  slotType?: string;
  seoEnabled: boolean;
  pageHosting: number;
  priority: number;
}

interface FormData {
  // Step 1: Plan Selection
  planId: string;
  selectedPlan: Plan | null;
  
  // Step 2: Shop Details
  shopName: string;
  category: string;
  address: string;
  latitude: string;
  longitude: string;
  area?: string;
  city?: string;
  state?: string;
  pincode?: string;
  
  // Step 3: Images
  images: File[];
  imagePreviews: string[];
  
  // Step 4: Payment
  paymentMode: 'cash' | 'online';
  
  // Step 5: Confirmation (read-only)
}

interface AgentShopCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AgentShopCreateModal({ isOpen, onClose, onSuccess }: AgentShopCreateModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [categories, setCategories] = useState<Array<{ _id: string; name: string; slug: string }>>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const [formData, setFormData] = useState<FormData>({
    planId: '',
    selectedPlan: null,
    shopName: '',
    category: '',
    address: '',
    latitude: '',
    longitude: '',
    area: '',
    city: '',
    state: '',
    pincode: '',
    images: [],
    imagePreviews: [],
    paymentMode: 'cash',
  });

  // Fetch plans and categories
  useEffect(() => {
    if (isOpen) {
      fetchPlans();
      fetchCategories();
    }
  }, [isOpen]);

  const fetchPlans = async () => {
    setLoadingPlans(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login again');
        return;
      }

      const response = await fetch('/api/agent/plans', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        setPlans(data.plans || []);
      } else {
        setError(data.error || 'Failed to fetch plans');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch plans');
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

  // Get current location
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
        
        console.log('Location obtained:', { lat, lng });
        
        setFormData(prev => ({
          ...prev,
          latitude: lat,
          longitude: lng,
        }));
        
        setLoadingLocation(false);
        setError(''); // Clear any previous errors
      },
      (err) => {
        console.error('Geolocation error:', err);
        let errorMessage = 'Failed to get location. Please enter coordinates manually.';
        
        switch (err.code) {
          case err.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please enable location permissions in your browser settings, or enter coordinates manually.';
            break;
          case err.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable. Please enter coordinates manually.';
            break;
          case err.TIMEOUT:
            errorMessage = 'Location request timed out. Please try again or enter coordinates manually.';
            break;
          default:
            errorMessage = 'Failed to get location. Please enter coordinates manually.';
            break;
        }
        
        setError(errorMessage);
        setLoadingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000, // Increased timeout
        maximumAge: 0, // Don't use cached position
      }
    );
  };

  const handlePlanSelect = (planId: string) => {
    const plan = plans.find(p => p._id === planId);
    if (plan) {
      setFormData(prev => ({
        ...prev,
        planId,
        selectedPlan: plan,
      }));
    }
  };

  const handleNext = () => {
    setError('');
    
    if (currentStep === 1) {
      if (!formData.planId) {
        setError('Please select a plan');
        return;
      }
    } else if (currentStep === 2) {
      if (!formData.shopName || !formData.category || !formData.address || !formData.latitude || !formData.longitude || !formData.pincode) {
        setError('Please fill all required fields (Shop Name, Category, Address, Latitude, Longitude, Pincode)');
        return;
      }
    } else if (currentStep === 3) {
      // Check image limits based on plan
      const maxPhotos = formData.selectedPlan?.maxPhotos || 0;
      if (formData.images.length === 0 && maxPhotos > 0) {
        setError(`Please upload at least one image. Your plan allows ${maxPhotos} photo(s).`);
        return;
      }
      if (formData.images.length > maxPhotos) {
        setError(`You can only upload ${maxPhotos} photo(s) with your selected plan.`);
        return;
      }
    } else if (currentStep === 4) {
      if (!formData.paymentMode) {
        setError('Please select a payment method');
        return;
      }
    }
    
    setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    setError('');
    setCurrentStep(currentStep - 1);
  };

  // Image upload handler
  const handleImageUpload = async (file: File) => {
    const maxPhotos = formData.selectedPlan?.maxPhotos || 0;
    
    if (formData.images.length >= maxPhotos) {
      setError(`You can only upload ${maxPhotos} photo(s) with your selected plan.`);
      return;
    }

    // Check file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setError('Image size must be less than 10MB');
      return;
    }

    setUploadingImages(true);
    setError('');

    try {
      // Compress image to 1MB
      const compressedBlob = await compressImage(file, 1, 1920, 1920);
      const compressedFile = new File([compressedBlob], file.name, { type: 'image/jpeg' });

      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login again');
        setUploadingImages(false);
        return;
      }

      const formDataToUpload = new FormData();
      formDataToUpload.append('image', compressedFile);

      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formDataToUpload,
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Failed to upload image';
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
        } catch {
          errorMessage = errorText || `Server error: ${response.status}`;
        }
        setError(errorMessage);
        setUploadingImages(false);
        return;
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        setError('Invalid response from server');
        setUploadingImages(false);
        return;
      }

      const text = await response.text();
      if (!text || text.trim() === '') {
        setError('Empty response from server');
        setUploadingImages(false);
        return;
      }

      let data;
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        setError('Invalid JSON response from server');
        setUploadingImages(false);
        return;
      }

      if (data.url || (data.success && data.url)) {
        const imageUrl = data.url || (data.urls && data.urls[0]);
        if (imageUrl) {
          setFormData(prev => ({
            ...prev,
            images: [...prev.images, compressedFile], // Keep file reference
            imagePreviews: [...prev.imagePreviews, imageUrl], // Store URL for preview and submission
          }));
          setError('');
        } else {
          setError('Image uploaded but URL not received');
        }
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

  // Camera functions
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      setCameraStream(stream);
      setShowCamera(true);
      
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
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
      imagePreviews: prev.imagePreviews.filter((_, i) => i !== index),
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

      // Use already uploaded image URLs from imagePreviews
      const response = await fetch('/api/agent/shop/create', {
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
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          planId: formData.planId,
          paymentMode: formData.paymentMode,
          images: formData.imagePreviews, // Use uploaded URLs
        }),
      });

      // Check response status first
      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText || `Server error: ${response.status} ${response.statusText}` };
        }
        
        console.error('Shop creation failed:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        
        if (response.status === 401) {
          setError('Session expired. Please login again.');
          setTimeout(() => {
            window.location.href = '/login';
          }, 2000);
        } else if (response.status === 403) {
          setError(errorData.message || errorData.error || 'You do not have permission to create shops. Please ensure you are logged in as an agent.');
        } else {
          setError(errorData.message || errorData.error || 'Failed to create shop');
        }
        setSubmitting(false);
        return;
      }

      const data = await response.json();

      if (data.success) {
        // Show success message
        alert(data.message || 'Shop created successfully!');
        onSuccess();
        onClose();
        // Reset form
        setFormData({
          planId: '',
          selectedPlan: null,
          shopName: '',
          category: '',
          address: '',
          area: '',
          latitude: '',
          longitude: '',
          city: '',
          state: '',
          pincode: '',
          images: [],
          imagePreviews: [],
          paymentMode: 'cash',
        });
        setCurrentStep(1);
      } else {
        setError(data.error || data.message || 'Failed to create shop');
        console.error('Shop creation error:', data);
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
    { number: 3, label: 'Shop Images' },
    { number: 4, label: 'Payment' },
    { number: 5, label: 'Confirmation' },
  ];

  const getPlanDescription = (plan: Plan) => {
    const features = [];
    if (plan.maxPhotos > 0) features.push(`${plan.maxPhotos} Photo${plan.maxPhotos > 1 ? 's' : ''}`);
    if (plan.slotType) features.push(plan.slotType);
    if (plan.maxOffers > 0) features.push(`${plan.maxOffers} Offers`);
    if (plan.seoEnabled) features.push('SEO');
    if (plan.pageHosting > 0) features.push(`${plan.pageHosting} Page Hosting`);
    return features.join(', ') || 'Basic listing';
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex justify-between items-center z-10">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Add New Shop</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Home / Add New Shop</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <FiX className="text-2xl" />
            </button>
          </div>

          {/* Progress Steps */}
          <div className="px-6 pt-6">
            <div className="flex items-center justify-between mb-6">
              {steps.map((step, index) => (
                <div key={step.number} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold text-lg transition-all ${
                        currentStep >= step.number
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
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
                      className={`w-full h-1 mx-2 ${
                        currentStep > step.number ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mx-6 mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Form Content */}
          <div className="p-6">
            {/* Step 1: Select Plan */}
            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">1. Select Plan</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select Plan *
                  </label>
                  {loadingPlans ? (
                    <div className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                      <span className="text-gray-600 dark:text-gray-400">Loading plans...</span>
                    </div>
                  ) : (
                    <select
                      value={formData.planId}
                      onChange={(e) => handlePlanSelect(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      <option value="">-- Select Plan --</option>
                      {plans.map((plan) => (
                        <option key={plan._id} value={plan._id}>
                          {plan.name} - ₹{plan.price}/year ({getPlanDescription(plan)})
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {formData.selectedPlan && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                      {formData.selectedPlan.name} Features
                    </h4>
                    <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                      <li>✓ Price: ₹{formData.selectedPlan.price}/year</li>
                      <li>✓ Photos: {formData.selectedPlan.maxPhotos}</li>
                      {formData.selectedPlan.maxOffers > 0 && (
                        <li>✓ Offers: {formData.selectedPlan.maxOffers}</li>
                      )}
                      {formData.selectedPlan.slotType && (
                        <li>✓ Slot: {formData.selectedPlan.slotType}</li>
                      )}
                      {formData.selectedPlan.seoEnabled && (
                        <li>✓ SEO Enabled</li>
                      )}
                      {formData.selectedPlan.pageHosting > 0 && (
                        <li>✓ Page Hosting: {formData.selectedPlan.pageHosting}</li>
                      )}
                    </ul>
                  </div>
                )}
              </motion.div>
            )}

            {/* Step 2: Shop Details */}
            {currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">2. Shop Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Shop Name *
                    </label>
                    <input
                      type="text"
                      value={formData.shopName}
                      onChange={(e) => setFormData(prev => ({ ...prev, shopName: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="Enter shop name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Category *
                    </label>
                    {loadingCategories ? (
                      <div className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                        <span className="text-gray-600 dark:text-gray-400">Loading categories...</span>
                      </div>
                    ) : (
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
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
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="Enter full address"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Area
                    </label>
                    <input
                      type="text"
                      value={formData.area}
                      onChange={(e) => setFormData(prev => ({ ...prev, area: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="Enter area/locality"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Pincode *
                    </label>
                    <input
                      type="text"
                      value={formData.pincode}
                      onChange={(e) => setFormData(prev => ({ ...prev, pincode: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
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
                      value={formData.state}
                      onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="Enter state"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Latitude *
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={formData.latitude}
                      onChange={(e) => setFormData(prev => ({ ...prev, latitude: e.target.value }))}
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
                      value={formData.longitude}
                      onChange={(e) => setFormData(prev => ({ ...prev, longitude: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="e.g., 85.1376"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        getCurrentLocation();
                      }}
                      disabled={loadingLocation}
                      className="w-full px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <FiMapPin />
                      {loadingLocation ? 'Getting Location...' : 'Get Current Location'}
                    </button>
                    {formData.latitude && formData.longitude && !loadingLocation && (
                      <p className="text-xs text-green-600 dark:text-green-400 mt-2 text-center">
                        ✓ Location captured: {formData.latitude}, {formData.longitude}
                      </p>
                    )}
                  </div>

                  {/* Map Preview */}
                  {formData.latitude && formData.longitude && (
                    <div className="md:col-span-2 mt-4">
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

            {/* Step 3: Shop Images */}
            {currentStep === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">3. Shop Images</h3>
                {formData.selectedPlan && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-4">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      Your plan allows <strong>{formData.selectedPlan.maxPhotos} photo(s)</strong>. 
                      {formData.images.length > 0 && (
                        <span> You have uploaded {formData.images.length} of {formData.selectedPlan.maxPhotos}.</span>
                      )}
                    </p>
                  </div>
                )}

                <div className="space-y-4">
                  {/* Upload Options */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* File Upload */}
                    <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 cursor-pointer transition-colors">
                      <FiUpload className="text-3xl text-gray-400 mb-2" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Upload from Device</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">Max 10MB per image</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple={false}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleImageUpload(file);
                          }
                        }}
                        className="hidden"
                        disabled={uploadingImages || (formData.selectedPlan ? formData.images.length >= formData.selectedPlan.maxPhotos : false)}
                      />
                    </label>

                    {/* Camera Capture */}
                    <button
                      type="button"
                      onClick={showCamera ? stopCamera : startCamera}
                      disabled={uploadingImages || (formData.selectedPlan ? formData.images.length >= formData.selectedPlan.maxPhotos : false)}
                      className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FiCamera className="text-3xl text-gray-400 mb-2" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {showCamera ? 'Stop Camera' : 'Capture from Camera'}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">Take a photo</span>
                    </button>
                  </div>

                  {/* Camera Preview */}
                  {showCamera && (
                    <div className="relative bg-black rounded-lg overflow-hidden">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className="w-full h-64 object-cover"
                      />
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                        <button
                          type="button"
                          onClick={captureFromCamera}
                          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                        >
                          Capture
                        </button>
                        <button
                          type="button"
                          onClick={stopCamera}
                          className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Uploaded Images Grid */}
                  {formData.imagePreviews.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Uploaded Images ({formData.imagePreviews.length}{formData.selectedPlan ? ` / ${formData.selectedPlan.maxPhotos}` : ''})
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {formData.imagePreviews.map((preview, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={preview}
                              alt={`Shop image ${index + 1}`}
                              className="w-full h-48 object-cover rounded-lg border-2 border-gray-300 dark:border-gray-600"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(index)}
                              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                            >
                              <FiTrash2 />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {uploadingImages && (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mx-auto mb-2"></div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Uploading and compressing image...</p>
                    </div>
                  )}

                  {formData.selectedPlan && formData.images.length === 0 && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        ⚠️ Please upload at least one shop image. Your plan allows {formData.selectedPlan.maxPhotos} photo(s).
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Step 4: Payment */}
            {currentStep === 4 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">4. Payment</h3>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, paymentMode: 'cash' }))}
                    className={`p-6 border-2 rounded-lg transition-all ${
                      formData.paymentMode === 'cash'
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                        : 'border-gray-300 dark:border-gray-600 hover:border-green-300'
                    }`}
                  >
                    <div className="text-center">
                      <FiDollarSign className="text-4xl mx-auto mb-2 text-yellow-600" />
                      <div className="font-semibold text-gray-900 dark:text-white">Cash</div>
                      {formData.selectedPlan && (
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          ₹{formData.selectedPlan.price}
                        </div>
                      )}
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, paymentMode: 'online' }))}
                    className={`p-6 border-2 rounded-lg transition-all ${
                      formData.paymentMode === 'online'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-300 dark:border-gray-600 hover:border-blue-300'
                    }`}
                  >
                    <div className="text-center">
                      <FiCreditCard className="text-4xl mx-auto mb-2 text-blue-600" />
                      <div className="font-semibold text-gray-900 dark:text-white">Online Payment</div>
                      {formData.selectedPlan && (
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          ₹{formData.selectedPlan.price}
                        </div>
                      )}
                    </div>
                  </button>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    {formData.paymentMode === 'cash' 
                      ? '⚠️ Cash payment requires admin approval. Shop will be activated after payment verification.'
                      : '✅ Online payment will activate the shop immediately after successful payment.'}
                  </p>
                </div>
              </motion.div>
            )}

            {/* Step 5: Confirmation */}
            {currentStep === 5 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">5. Confirmation</h3>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Plan Selected</h4>
                    <p className="text-gray-700 dark:text-gray-300">
                      {formData.selectedPlan?.name} - ₹{formData.selectedPlan?.price}/year
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Shop Details</h4>
                    <p className="text-gray-700 dark:text-gray-300">Name: {formData.shopName}</p>
                    <p className="text-gray-700 dark:text-gray-300">Category: {formData.category}</p>
                    <p className="text-gray-700 dark:text-gray-300">Address: {formData.address}</p>
                    {formData.area && (
                      <p className="text-gray-700 dark:text-gray-300">Area: {formData.area}</p>
                    )}
                    {formData.city && (
                      <p className="text-gray-700 dark:text-gray-300">City: {formData.city}</p>
                    )}
                    {formData.state && (
                      <p className="text-gray-700 dark:text-gray-300">State: {formData.state}</p>
                    )}
                    {formData.pincode && (
                      <p className="text-gray-700 dark:text-gray-300">Pincode: {formData.pincode}</p>
                    )}
                    <p className="text-gray-700 dark:text-gray-300">
                      Location: {formData.latitude}, {formData.longitude}
                    </p>
                    {formData.imagePreviews.length > 0 && (
                      <div className="mt-2">
                        <p className="text-gray-700 dark:text-gray-300 font-medium">Images: {formData.imagePreviews.length}</p>
                        <div className="flex gap-2 mt-2">
                          {formData.imagePreviews.slice(0, 3).map((preview, index) => (
                            <img
                              key={index}
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              className="w-16 h-16 object-cover rounded border border-gray-300 dark:border-gray-600"
                            />
                          ))}
                          {formData.imagePreviews.length > 3 && (
                            <div className="w-16 h-16 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600">
                              <span className="text-xs text-gray-600 dark:text-gray-400">+{formData.imagePreviews.length - 3}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Payment Method</h4>
                    <p className="text-gray-700 dark:text-gray-300 capitalize">
                      {formData.paymentMode} - ₹{formData.selectedPlan?.price}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-6 flex justify-between items-center">
            <button
              type="button"
              onClick={currentStep === 1 ? onClose : handleBack}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              {currentStep === 1 ? 'Cancel' : 'Back'}
            </button>
            <div className="flex gap-2">
              {currentStep < 5 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
                  {submitting ? 'Creating...' : 'Create Shop'}
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

