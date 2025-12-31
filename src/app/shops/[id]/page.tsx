'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { FaPhone, FaEnvelope, FaGlobe, FaMapMarkerAlt, FaStar, FaEye, FaArrowLeft, FaWhatsapp } from 'react-icons/fa';
import { motion } from 'framer-motion';

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

  useEffect(() => {
    const fetchShop = async () => {
      try {
        const response = await fetch(`/api/shops/${params.id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch shop');
        }

        setShop(data.shop);
        // Increment visitor count
        await fetch(`/api/shops/${params.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ visitorCount: (data.shop.visitorCount || 0) + 1 }),
        }).catch(console.error);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading shop details...</p>
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
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <button
            onClick={() => router.back()}
            className="flex items-center text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
          >
            <FaArrowLeft className="mr-2" />
            Back
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Images */}
          <div className="lg:col-span-2">
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

              {/* Shop Details */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                      {shop.name}
                    </h1>
                    <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
                      {shop.category}
                    </span>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-6 mb-6">
                  <div className="flex items-center text-yellow-500">
                    <FaStar className="mr-1" />
                    <span className="font-semibold">{shop.rating.toFixed(1)}</span>
                    <span className="text-gray-500 dark:text-gray-400 ml-1">
                      ({shop.reviewCount} reviews)
                    </span>
                  </div>
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <FaEye className="mr-1" />
                    <span>{shop.visitorCount} views</span>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                    About
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {shop.description}
                  </p>
                </div>

                {/* Offers */}
                {shop.offers && shop.offers.length > 0 && (
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                      Current Offers
                    </h2>
                    <div className="space-y-3">
                      {shop.offers.map((offer, index) => (
                        <div
                          key={index}
                          className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border-l-4 border-green-500"
                        >
                          <h3 className="font-semibold text-green-800 dark:text-green-200 mb-1">
                            {offer.title}
                          </h3>
                          <p className="text-gray-700 dark:text-gray-300 text-sm">
                            {offer.description}
                          </p>
                          {offer.validUntil && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                              Valid until: {new Date(offer.validUntil).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Right Column - Contact Info */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 sticky top-4"
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Contact Information
              </h2>

              {/* Address */}
              <div className="mb-6">
                <div className="flex items-start mb-2">
                  <FaMapMarkerAlt className="text-red-500 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <p className="text-gray-800 dark:text-gray-200 font-medium">
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

              {/* Phone */}
              <div className="mb-4">
                <a
                  href={`tel:${shop.phone}`}
                  className="flex items-center p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                >
                  <FaPhone className="mr-3" />
                  <span className="font-medium">{shop.phone}</span>
                </a>
              </div>

              {/* WhatsApp */}
              <div className="mb-4">
                <a
                  href={`https://wa.me/${shop.phone.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center p-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                >
                  <FaWhatsapp className="mr-3 text-xl" />
                  <span className="font-medium">WhatsApp</span>
                </a>
              </div>

              {/* Email */}
              <div className="mb-4">
                <a
                  href={`mailto:${shop.email}`}
                  className="flex items-center p-3 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
                >
                  <FaEnvelope className="mr-3" />
                  <span className="font-medium text-sm break-all">{shop.email}</span>
                </a>
              </div>

              {/* Website */}
              {shop.website && (
                <div className="mb-4">
                  <a
                    href={shop.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center p-3 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors"
                  >
                    <FaGlobe className="mr-3" />
                    <span className="font-medium text-sm truncate">Visit Website</span>
                  </a>
                </div>
              )}

              {/* Plan Info */}
              {shop.planId && (
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Plan
                  </h3>
                  <span className="inline-block px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full text-sm font-medium">
                    {shop.planId.name}
                  </span>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

