'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiPhone, FiMessageCircle, FiExternalLink, FiStar, FiMapPin, FiShoppingBag, FiMail, FiGlobe, FiClock } from 'react-icons/fi';
import AdSlot from './AdSlot';

interface Shop {
  _id?: string;
  place_id?: string;
  name: string;
  description?: string;
  category: string;
  address: string;
  city: string;
  state?: string;
  pincode?: string;
  images?: string[];
  rating: number;
  reviewCount: number;
  distance?: number;
  isFeatured: boolean;
  isPaid?: boolean;
  planId?: {
    name: string;
  };
  phone?: string;
  email?: string;
  website?: string;
  source?: 'mongodb' | 'google';
}

interface ShopPopupProps {
  shop: Shop | null;
  isOpen: boolean;
  onClose: () => void;
  userLocation?: { lat: number; lng: number } | null;
}

export default function ShopPopup({ shop, isOpen, onClose, userLocation }: ShopPopupProps) {
  // Close on ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when popup is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!shop) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleBackdropClick}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            {/* Popup */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden relative"
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg hover:bg-white transition-colors"
              >
                <FiX className="text-xl text-gray-700" />
              </button>

              <div className="grid md:grid-cols-2 gap-0">
                {/* Left Section - Image */}
                <div className="relative h-64 md:h-full min-h-[400px] overflow-hidden bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400">
                  {shop.images && shop.images.length > 0 ? (
                    <motion.img
                      src={shop.images[0]}
                      alt={shop.name}
                      className="w-full h-full object-cover"
                      initial={{ scale: 1 }}
                      animate={{ scale: 1.1 }}
                      transition={{ duration: 8, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FiShoppingBag className="text-8xl text-white opacity-50" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  
                  {/* Badges */}
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    {shop.isFeatured && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1"
                      >
                        <FiStar className="text-sm fill-white" />
                        Featured
                      </motion.div>
                    )}
                    {shop.isPaid && shop.planId && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.1 }}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg"
                      >
                        {shop.planId.name}
                      </motion.div>
                    )}
                  </div>
                </div>

                {/* Right Section - Details */}
                <div className="p-6 md:p-8 overflow-y-auto max-h-[90vh]">
                  {/* Shop Name */}
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">{shop.name}</h2>

                  {/* Category */}
                  <p className="text-lg text-purple-600 font-semibold mb-4 flex items-center gap-2">
                    <FiShoppingBag className="text-lg" />
                    {shop.category}
                  </p>

                  {/* Location */}
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 flex items-start gap-2 mb-1">
                      <FiMapPin className="text-sm mt-1 flex-shrink-0" />
                      <span>{shop.address}, {shop.city}{shop.state && `, ${shop.state}`}{shop.pincode && ` - ${shop.pincode}`}</span>
                    </p>
                    {shop.distance !== undefined && shop.distance !== null && (
                      <div className="flex items-center gap-4 ml-6 mt-2">
                        <p className="text-sm text-red-600 font-semibold flex items-center gap-1">
                          <FiMapPin className="text-xs" />
                          {Number(shop.distance).toFixed(1)} km away
                        </p>
                        {(() => {
                          const avgSpeed = 40; // km/h
                          const timeInHours = Number(shop.distance) / avgSpeed;
                          const timeInMinutes = Math.round(timeInHours * 60);
                          const timeText = timeInMinutes < 60 
                            ? `${timeInMinutes} min` 
                            : `${Math.floor(timeInMinutes / 60)}h ${timeInMinutes % 60}m`;
                          return (
                            <p className="text-sm text-blue-600 font-semibold flex items-center gap-1">
                              <FiClock className="text-xs" />
                              {timeText}
                            </p>
                          );
                        })()}
                      </div>
                    )}
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-4">
                    <FiStar className="text-yellow-500 fill-yellow-500 text-xl" />
                    <span className="text-xl font-bold text-gray-900">{shop.rating.toFixed(1)}</span>
                    <span className="text-sm text-gray-500">({shop.reviewCount} reviews)</span>
                  </div>

                  {/* Description */}
                  {shop.description && (
                    <div className="mb-6">
                      <p className="text-sm text-gray-700 leading-relaxed">{shop.description}</p>
                    </div>
                  )}

                  {/* Ad Space - Shop Page Ad */}
                  <div className="mb-6">
                    <AdSlot slot="shop" className="w-full" />
                  </div>

                  {/* Contact Info */}
                  <div className="mb-6 space-y-2">
                    {shop.phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <FiPhone className="text-blue-600" />
                        <a href={`tel:${shop.phone}`} className="hover:text-blue-600 transition-colors">
                          {shop.phone}
                        </a>
                      </div>
                    )}
                    {shop.email && (
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <FiMail className="text-purple-600" />
                        <a href={`mailto:${shop.email}`} className="hover:text-purple-600 transition-colors">
                          {shop.email}
                        </a>
                      </div>
                    )}
                    {shop.website && (
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <FiGlobe className="text-green-600" />
                        <a 
                          href={shop.website.startsWith('http') ? shop.website : `https://${shop.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-green-600 transition-colors"
                        >
                          {shop.website}
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-gray-200">
                    {shop.phone && (
                      <>
                        <motion.a
                          href={`tel:${shop.phone}`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex-1 min-w-[120px] bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                        >
                          <FiPhone className="text-lg" />
                          Call
                        </motion.a>
                        <motion.a
                          href={`https://wa.me/${shop.phone.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex-1 min-w-[120px] bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                        >
                          <FiMessageCircle className="text-lg" />
                          WhatsApp
                        </motion.a>
                      </>
                    )}
                    <motion.a
                      href={`/shops/${shop._id || shop.place_id}`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex-1 min-w-[120px] bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                    >
                      <FiExternalLink className="text-lg" />
                      Visit
                    </motion.a>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

