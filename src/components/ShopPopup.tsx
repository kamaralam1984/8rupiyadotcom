'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiPhone, FiMessageCircle, FiExternalLink, FiStar, FiMapPin, FiShoppingBag, FiMail, FiGlobe, FiClock, FiEdit3, FiUser } from 'react-icons/fi';
import OptimizedImage from './OptimizedImage';
import AdSlot from './AdSlot';
import DisplayAd from './DisplayAd';

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

interface Review {
  _id: string;
  rating: number;
  comment: string;
  userId?: string;
  userName?: string;
  createdAt: string;
  isVerified?: boolean;
}

export default function ShopPopup({ shop, isOpen, onClose, userLocation }: ShopPopupProps) {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  // Fetch reviews when popup opens
  useEffect(() => {
    if (isOpen && shop?._id) {
      fetchReviews();
    }
  }, [isOpen, shop?._id]);

  const fetchReviews = async () => {
    if (!shop?._id) return;
    
    try {
      setLoadingReviews(true);
      const response = await fetch(`/api/shops/${shop._id}/reviews`);
      const data = await response.json();
      
      if (data.success && data.reviews) {
        setReviews(data.reviews);
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setLoadingReviews(false);
    }
  };

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

  const handleSubmitReview = async () => {
    if (!shop._id) {
      alert('Shop ID not available');
      return;
    }

    if (reviewComment.trim().length < 10) {
      alert('Please write at least 10 characters in your review');
      return;
    }

    try {
      setSubmittingReview(true);
      const response = await fetch(`/api/shops/${shop._id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rating: reviewRating,
          comment: reviewComment.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Review submitted successfully!');
        setShowReviewForm(false);
        setReviewComment('');
        setReviewRating(5);
        // Refresh reviews and shop data
        await fetchReviews();
        // Update shop rating in parent (if needed)
        if (data.shop) {
          // Shop data will be updated on next fetch
        }
      } else {
        alert(data.error || 'Failed to submit review. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review. Please try again.');
    } finally {
      setSubmittingReview(false);
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

              <div className="grid md:grid-cols-2 gap-0 flex-1">
                {/* Left Section - Image */}
                <div className="relative h-64 md:h-full min-h-[400px] overflow-hidden bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 flex-shrink-0">
                  {shop.images && shop.images.length > 0 ? (
                    <motion.div
                      initial={{ scale: 1 }}
                      animate={{ scale: 1.1 }}
                      transition={{ duration: 8, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
                      className="w-full h-full"
                    >
                      <OptimizedImage
                        src={shop.images[0]}
                        alt={shop.name}
                        fill
                        className="object-cover"
                        priority={true}
                        objectFit="cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                        fallbackIcon={<FiShoppingBag className="text-8xl text-white opacity-50" />}
                    />
                    </motion.div>
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
                <div className="p-6 md:p-8 overflow-y-auto max-h-[90vh] flex-1 min-w-0 relative">
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

                  {/* Rating & Write Review Button - Always Visible */}
                  <div className="mb-4 p-4 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800/50 dark:to-blue-900/20 rounded-xl border-2 border-blue-200 dark:border-blue-700 shadow-sm">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <FiStar className="text-yellow-500 fill-yellow-500 text-2xl flex-shrink-0" />
                        <div>
                          <span className="text-2xl font-bold text-gray-900 dark:text-white block">{shop.rating.toFixed(1)}</span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">({shop.reviewCount} reviews)</span>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowReviewForm(!showReviewForm)}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 active:scale-95 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 text-base font-bold whitespace-nowrap w-full md:w-auto md:flex-shrink-0 z-20 relative"
                        type="button"
                        aria-label={showReviewForm ? 'Cancel Review' : 'Write Review'}
                        style={{ display: 'flex' }}
                      >
                        <FiEdit3 className="text-lg flex-shrink-0" />
                        <span className="flex-shrink-0">{showReviewForm ? 'Cancel Review' : 'Write Review'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Display Ad - Shop Detail Page (Placement 2) - After Rating, Before Review Form */}
                  <div className="mb-6">
                    <DisplayAd />
                  </div>

                  {/* Review Form */}
                  {showReviewForm && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-6 p-4 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-200 dark:border-blue-800"
                    >
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <FiStar className="text-yellow-500" />
                        Write a Review
                      </h3>
                      
                      {/* Star Rating */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Rating
                        </label>
                        <div className="flex items-center gap-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setReviewRating(star)}
                              className="focus:outline-none"
                            >
                              <FiStar
                                className={`text-3xl transition-colors ${
                                  star <= reviewRating
                                    ? 'text-yellow-500 fill-yellow-500'
                                    : 'text-gray-300 dark:text-gray-600'
                                }`}
                              />
                            </button>
                          ))}
                          <span className="ml-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                            {reviewRating}.0
                          </span>
                        </div>
                      </div>

                      {/* Review Comment */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Your Review
                        </label>
                        <textarea
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          placeholder="Share your experience with this shop..."
                          rows={4}
                          className="w-full px-4 py-3 border-2 border-blue-300 dark:border-blue-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {reviewComment.length} / 500 characters (minimum 10)
                        </p>
                      </div>

                      {/* Submit Button */}
                      <button
                        onClick={handleSubmitReview}
                        disabled={submittingReview || reviewComment.trim().length < 10}
                        className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {submittingReview ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            Submitting...
                          </>
                        ) : (
                          <>
                            <FiStar className="text-sm" />
                            Submit Review
                          </>
                        )}
                      </button>
                    </motion.div>
                  )}

                  {/* Reviews List */}
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <FiStar className="text-yellow-500" />
                      Customer Reviews ({reviews.length})
                    </h3>
                    
                    {loadingReviews ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="text-gray-500 dark:text-gray-400 mt-2">Loading reviews...</p>
                      </div>
                    ) : reviews.length > 0 ? (
                      <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                        {reviews.map((review) => (
                          <motion.div
                            key={review._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 shadow-sm"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center">
                                  <FiUser className="text-white text-sm" />
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                    {review.userName || 'Anonymous User'}
                                  </p>
                                  <div className="flex items-center gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <FiStar
                                        key={star}
                                        className={`text-xs ${
                                          star <= review.rating
                                            ? 'text-yellow-500 fill-yellow-500'
                                            : 'text-gray-300 dark:text-gray-600'
                                        }`}
                                      />
                                    ))}
                                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                                      {review.rating}.0
                                    </span>
                                  </div>
                                </div>
                              </div>
                              {review.isVerified && (
                                <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded-full">
                                  Verified
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-700 dark:text-gray-300 mt-2 leading-relaxed">
                              {review.comment}
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                              {new Date(review.createdAt).toLocaleDateString('en-IN', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </p>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                        <FiStar className="text-4xl text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                        <p className="text-gray-500 dark:text-gray-400">No reviews yet. Be the first to review!</p>
                      </div>
                    )}
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

