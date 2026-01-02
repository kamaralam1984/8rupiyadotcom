'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { 
  FaPhone, FaEnvelope, FaGlobe, FaMapMarkerAlt, FaStar, FaEye, 
  FaArrowLeft, FaWhatsapp, FaDirections, FaShareAlt, FaHeart,
  FaClock, FaCheckCircle, FaShieldAlt, FaAward, FaUsers,
  FaThumbsUp, FaComments, FaMapPin, FaHome
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import Analytics from '@/lib/analytics';

// Lazy load heavy components
const AIAssistant = dynamic(() => import('@/components/AIAssistant'), {
  ssr: false,
  loading: () => null,
});

const DisplayAd = dynamic(() => import('@/components/DisplayAd'), {
  ssr: false,
  loading: () => null,
});

const InFeedAd = dynamic(() => import('@/components/InFeedAd'), {
  ssr: false,
  loading: () => null,
});

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
  phone: string;
  email: string;
  website?: string;
  images: string[];
  photos?: string[];
  rating: number;
  reviewCount: number;
  visitorCount: number;
  status: string;
  location?: {
    coordinates: [number, number];
  };
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
  planId?: {
    name: string;
    features: string[];
  };
}

export default function ShopDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [nearbyShops, setNearbyShops] = useState<Shop[]>([]);

  useEffect(() => {
    const fetchShop = async () => {
      try {
        const response = await fetch(`/api/shops/${params.id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch shop');
        }

        setShop(data.shop);
        
        // Track shop view in analytics
        if (data.shop._id && data.shop.name) {
          Analytics.trackShopView(data.shop._id, data.shop.name);
        }
        
        // Increment visitor count
        await fetch(`/api/shops/${params.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ visitorCount: (data.shop.visitorCount || 0) + 1 }),
        }).catch(console.error);

        // Fetch nearby shops
        if (data.shop.location?.coordinates) {
          const nearbyResponse = await fetch(
            `/api/shops/nearby?lat=${data.shop.location.coordinates[1]}&lng=${data.shop.location.coordinates[0]}&limit=6`
          );
          const nearbyData = await nearbyResponse.json();
          if (nearbyData.shops) {
            setNearbyShops(nearbyData.shops.filter((s: Shop) => s._id !== data.shop._id).slice(0, 4));
          }
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchShop();
    }
  }, [params.id]);

  const handleShare = async () => {
    if (navigator.share && shop) {
      try {
        await navigator.share({
          title: shop.name,
          text: `Check out ${shop.name} on 8rupiya.com`,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Share failed:', err);
      }
    }
  };

  const handleGetDirections = () => {
    if (shop?.location?.coordinates) {
      const [lng, lat] = shop.location.coordinates;
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
    } else {
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(shop?.address || '')}`, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300 font-medium">Loading shop details...</p>
        </div>
      </div>
    );
  }

  if (error || !shop) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center">
          <div className="text-6xl mb-4">😞</div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">Shop Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error || 'The shop you are looking for does not exist.'}</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            <FaArrowLeft className="inline mr-2" />
            Go Back Home
          </button>
        </div>
      </div>
    );
  }

  const allImages = [...(shop.images || []), ...(shop.photos || [])].filter(Boolean);
  const hasImages = allImages.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header with Breadcrumbs */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Breadcrumbs */}
            <nav className="flex items-center space-x-2 text-sm">
              <Link href="/" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center">
                <FaHome className="mr-1" />
                Home
              </Link>
              <span className="text-gray-400">/</span>
              <Link href="/" className="text-blue-600 hover:text-blue-700 dark:text-blue-400">
                Shops
              </Link>
              <span className="text-gray-400">/</span>
              <span className="text-gray-600 dark:text-gray-300 truncate max-w-xs">{shop.name}</span>
            </nav>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="p-2 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
                title="Share"
              >
                <FaShareAlt />
              </button>
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className={`p-2 transition-colors ${
                  isFavorite ? 'text-red-500' : 'text-gray-600 hover:text-red-500 dark:text-gray-400'
                }`}
                title="Add to favorites"
              >
                <FaHeart />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden"
            >
              {/* Main Image */}
              <div className="relative h-96 bg-gray-200 dark:bg-gray-700">
                {hasImages ? (
                  <Image
                    src={allImages[selectedImage]}
                    alt={shop.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="text-6xl mb-4">🏪</div>
                      <p className="text-gray-500 dark:text-gray-400">No images available</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Thumbnail Gallery */}
              {hasImages && allImages.length > 1 && (
                <div className="p-4 bg-gray-50 dark:bg-gray-900 grid grid-cols-6 gap-2">
                  {allImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`relative h-16 rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImage === index
                          ? 'border-blue-600 ring-2 ring-blue-300'
                          : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'
                      }`}
                    >
                      <Image
                        src={image}
                        alt={`${shop.name} - ${index + 1}`}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Shop Header */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
                      {shop.name}
                    </h1>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="inline-flex items-center px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
                        {shop.category}
                      </span>
                      {shop.planId && (
                        <span className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full text-sm font-bold shadow-md">
                          <FaAward className="mr-1" />
                          {shop.planId.name} Member
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex flex-wrap items-center gap-4 md:gap-6 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center text-yellow-500">
                    <FaStar className="mr-1 text-xl" />
                    <span className="font-bold text-lg">{shop.rating.toFixed(1)}</span>
                    <span className="text-gray-500 dark:text-gray-400 ml-1 text-sm">
                      ({shop.reviewCount} reviews)
                    </span>
                  </div>
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <FaEye className="mr-1 text-lg" />
                    <span className="font-medium">{shop.visitorCount.toLocaleString()} views</span>
                  </div>
                  <div className="flex items-center text-green-600 dark:text-green-400">
                    <FaCheckCircle className="mr-1" />
                    <span className="font-medium text-sm">Verified Business</span>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                    <FaShieldAlt className="mr-2 text-blue-600" />
                    About {shop.name}
                  </h2>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                    {shop.description}
                  </p>
                </div>

                {/* Current Offers */}
                {shop.offers && shop.offers.length > 0 && (
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                      🎉 Current Offers & Deals
                    </h2>
                    <div className="space-y-3">
                      {shop.offers.map((offer, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border-l-4 border-green-500 shadow-md"
                        >
                          <h3 className="font-bold text-green-800 dark:text-green-200 mb-2 text-lg">
                            {offer.title}
                          </h3>
                          <p className="text-gray-700 dark:text-gray-300">
                            {offer.description}
                          </p>
                          {offer.validUntil && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 flex items-center">
                              <FaClock className="mr-1" />
                              Valid until: {new Date(offer.validUntil).toLocaleDateString()}
                            </p>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Ad Placement 1 */}
            <DisplayAd />

            {/* Why Choose This Business Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 md:p-8"
            >
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                <FaThumbsUp className="mr-3 text-blue-600" />
                Why Choose {shop.name}?
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <FaCheckCircle className="text-2xl text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-2">Verified & Trusted</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {shop.name} is a verified business on 8rupiya.com. All information has been authenticated to ensure reliability and trustworthiness.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <FaUsers className="text-2xl text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-2">Customer Satisfaction</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      With a {shop.rating.toFixed(1)} star rating from {shop.reviewCount} real customers, {shop.name} has proven track record of quality service.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <FaMapPin className="text-2xl text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-2">Convenient Location</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Located in {shop.city}, {shop.state}, this business is easily accessible and serves the local community with dedication.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                    <FaAward className="text-2xl text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-2">Quality Assured</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {shop.name} maintains high standards of quality and professionalism in all services provided to customers.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Services/Products Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl shadow-lg p-6 md:p-8"
            >
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6">
                Services & Products at {shop.name}
              </h2>
              
              <div className="prose dark:prose-invert max-w-none">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg mb-4">
                  <strong>{shop.name}</strong> is your trusted destination for quality {shop.category.toLowerCase()} services in {shop.city}. 
                  We understand the importance of finding reliable local businesses, and that's why we've verified this establishment 
                  to ensure you get the best experience possible.
                </p>
                
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg mb-4">
                  Whether you're a regular customer or visiting for the first time, {shop.name} offers a comprehensive range of 
                  services designed to meet your needs. The business is committed to providing excellent customer service and 
                  maintaining high standards of quality in everything they do.
                </p>

                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 my-6 border-l-4 border-blue-500">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">What Makes Us Special</h3>
                  <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                    <li className="flex items-start">
                      <FaCheckCircle className="text-green-500 mr-2 mt-1 flex-shrink-0" />
                      <span>Professional and experienced team dedicated to customer satisfaction</span>
                    </li>
                    <li className="flex items-start">
                      <FaCheckCircle className="text-green-500 mr-2 mt-1 flex-shrink-0" />
                      <span>High-quality products and services at competitive prices</span>
                    </li>
                    <li className="flex items-start">
                      <FaCheckCircle className="text-green-500 mr-2 mt-1 flex-shrink-0" />
                      <span>Convenient location with easy accessibility</span>
                    </li>
                    <li className="flex items-start">
                      <FaCheckCircle className="text-green-500 mr-2 mt-1 flex-shrink-0" />
                      <span>Trusted by hundreds of satisfied customers in {shop.city}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>

            {/* Ad Placement 2 */}
            <InFeedAd />

            {/* Local SEO Content Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 md:p-8"
            >
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6">
                Best {shop.category} in {shop.city}, {shop.state}
              </h2>
              
              <div className="prose dark:prose-invert max-w-none space-y-4 text-gray-700 dark:text-gray-300">
                <p className="text-lg leading-relaxed">
                  Looking for the best <strong>{shop.category.toLowerCase()}</strong> services in <strong>{shop.city}</strong>? 
                  {shop.name} has been serving the local community with dedication and excellence. Located at {shop.address}, 
                  this establishment has become a trusted name in the area.
                </p>

                <p className="text-lg leading-relaxed">
                  What sets {shop.name} apart is their commitment to quality and customer satisfaction. With a stellar 
                  {shop.rating.toFixed(1)}-star rating from {shop.reviewCount} verified customers, they have proven their 
                  reliability time and again. Whether you're a local resident or just visiting {shop.city}, this is the 
                  place to go for all your {shop.category.toLowerCase()} needs.
                </p>

                <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 my-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    Why Customers Love {shop.name}
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <FaCheckCircle className="text-white text-xl" />
                      </div>
                      <span className="font-medium">Excellent Service Quality</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <FaUsers className="text-white text-xl" />
                      </div>
                      <span className="font-medium">Friendly Staff</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <FaAward className="text-white text-xl" />
                      </div>
                      <span className="font-medium">Competitive Pricing</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <FaMapPin className="text-white text-xl" />
                      </div>
                      <span className="font-medium">Prime Location</span>
                    </div>
                  </div>
                </div>

                <p className="text-lg leading-relaxed">
                  The business is conveniently located in {shop.area || shop.city}, making it easily accessible for 
                  customers from all parts of the city. With {shop.visitorCount.toLocaleString()} people already 
                  discovering this business through 8rupiya.com, it's clear that {shop.name} is a popular choice 
                  among locals.
                </p>

                <p className="text-lg leading-relaxed">
                  At 8rupiya.com, we verify every business listing to ensure you get accurate and reliable information. 
                  {shop.name} has been thoroughly vetted, and all contact details, address, and business information 
                  have been confirmed. You can trust that when you visit or contact this business, you'll receive 
                  the quality service you expect.
                </p>
              </div>
            </motion.div>

            {/* User Safety & Guidance Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-2xl shadow-lg p-6 md:p-8 border-2 border-yellow-200 dark:border-yellow-800"
            >
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                <FaShieldAlt className="mr-3 text-yellow-600" />
                Important Information for Visitors
              </h2>
              
              <div className="space-y-4 text-gray-700 dark:text-gray-300">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                  <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">✅ Before You Visit</h3>
                  <ul className="space-y-2 ml-4">
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Call ahead to confirm business hours and availability</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Check for any special offers or deals mentioned above</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Get directions using the "Get Directions" button for accurate navigation</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                  <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">📞 Contact Guidelines</h3>
                  <ul className="space-y-2 ml-4">
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Use the verified contact numbers provided on this page</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>WhatsApp is available for quick queries and bookings</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Email for detailed inquiries or business proposals</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                  <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">⭐ Share Your Experience</h3>
                  <p>
                    After visiting {shop.name}, please share your experience to help other customers make informed 
                    decisions. Your feedback is valuable to both the business and the community.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Nearby Similar Businesses */}
            {nearbyShops.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 md:p-8"
              >
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6">
                  More {shop.category} Businesses Nearby
                </h2>
                
                <div className="grid sm:grid-cols-2 gap-4">
                  {nearbyShops.map((nearbyShop) => (
                    <Link
                      key={nearbyShop._id}
                      href={`/shops/${nearbyShop._id}`}
                      className="block p-4 bg-gray-50 dark:bg-gray-900 rounded-xl hover:shadow-lg transition-all border border-gray-200 dark:border-gray-700 hover:border-blue-500"
                    >
                      <h3 className="font-bold text-gray-900 dark:text-white mb-2">{nearbyShop.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                        {nearbyShop.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-yellow-500 text-sm">
                          <FaStar className="mr-1" />
                          <span className="font-semibold">{nearbyShop.rating.toFixed(1)}</span>
                        </div>
                        <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                          View Details →
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Column - Contact Info & CTA */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 sticky top-20 space-y-4"
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Contact Information
              </h2>

              {/* Address */}
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                <div className="flex items-start mb-2">
                  <FaMapMarkerAlt className="text-red-500 mt-1 mr-3 flex-shrink-0 text-xl" />
                  <div>
                    <p className="text-gray-800 dark:text-gray-200 font-medium mb-1">
                      {shop.address}
                    </p>
                    {shop.area && (
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        {shop.area}
                      </p>
                    )}
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {shop.city}, {shop.state} - {shop.pincode}
                    </p>
                  </div>
                </div>
              </div>

              {/* Get Directions Button */}
              <button
                onClick={handleGetDirections}
                className="w-full flex items-center justify-center p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all font-semibold shadow-lg"
              >
                <FaDirections className="mr-2 text-xl" />
                Get Directions
              </button>

              {/* Phone */}
              <a
                href={`tel:${shop.phone}`}
                onClick={() => Analytics.trackPhoneClick(shop._id, shop.phone)}
                className="w-full flex items-center justify-center p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors font-semibold border-2 border-blue-200 dark:border-blue-800"
              >
                <FaPhone className="mr-3 text-xl" />
                {shop.phone}
              </a>

              {/* WhatsApp */}
              <a
                href={`https://wa.me/${shop.phone.replace(/[^0-9]/g, '')}`}
                onClick={() => Analytics.trackWhatsAppClick(shop._id, shop.phone)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center p-4 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors font-semibold border-2 border-green-200 dark:border-green-800"
              >
                <FaWhatsapp className="mr-3 text-2xl" />
                Chat on WhatsApp
              </a>

              {/* Email */}
              <a
                href={`mailto:${shop.email}`}
                onClick={() => Analytics.trackClick('email_click', { shopId: shop._id, targetUrl: `mailto:${shop.email}` })}
                className="w-full flex items-center justify-center p-4 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-xl hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors font-semibold border-2 border-purple-200 dark:border-purple-800"
              >
                <FaEnvelope className="mr-3 text-xl" />
                Send Email
              </a>

              {/* Website */}
              {shop.website && (
                <a
                  href={shop.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center p-4 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 rounded-xl hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors font-semibold border-2 border-orange-200 dark:border-orange-800"
                >
                  <FaGlobe className="mr-3 text-xl" />
                  Visit Website
                </a>
              )}

              {/* Trust Badge */}
              <div className="mt-6 p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border-2 border-green-200 dark:border-green-800">
                <div className="flex items-center justify-center mb-2">
                  <FaShieldAlt className="text-green-600 dark:text-green-400 text-3xl" />
                </div>
                <p className="text-center text-sm font-semibold text-gray-900 dark:text-white">
                  Verified Business
                </p>
                <p className="text-center text-xs text-gray-600 dark:text-gray-400 mt-1">
                  All information verified by 8rupiya.com
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* AI Assistant */}
      <AIAssistant userLocation={shop.location?.coordinates ? { lat: shop.location.coordinates[1], lng: shop.location.coordinates[0] } : null} userId={undefined} />
    </div>
  );
}
