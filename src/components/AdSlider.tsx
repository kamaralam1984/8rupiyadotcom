'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronLeft, FiChevronRight, FiX } from 'react-icons/fi';
import Link from 'next/link';

interface Ad {
  _id?: string;
  title: string;
  description?: string;
  imageUrl: string;
  linkUrl?: string;
  isActive: boolean;
}

interface AdSliderProps {
  ads?: Ad[];
  autoSlideInterval?: number; // in milliseconds
}

export default function AdSlider({ ads = [], autoSlideInterval = 5000 }: AdSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeAds, setActiveAds] = useState<Ad[]>([]);

  useEffect(() => {
    const filtered = ads.filter(ad => ad.isActive);
    setActiveAds(filtered);
  }, [ads]);

  useEffect(() => {
    if (activeAds.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeAds.length);
    }, autoSlideInterval);

    return () => clearInterval(interval);
  }, [activeAds.length, autoSlideInterval]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % activeAds.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + activeAds.length) % activeAds.length);
  };

  if (activeAds.length === 0) {
    return null;
  }

  const currentAd = activeAds[currentIndex];

  return (
    <section className="py-6 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-lg overflow-hidden shadow-lg">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentAd._id || currentIndex}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5 }}
            >
              {currentAd.linkUrl ? (
                <Link href={currentAd.linkUrl} target="_blank" rel="noopener noreferrer">
                  <div className="relative h-48 sm:h-64 md:h-80 cursor-pointer group">
                    <img
                      src={currentAd.imageUrl}
                      alt={currentAd.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent group-hover:from-black/80 transition-all"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 text-white">
                      <h3 className="text-xl sm:text-2xl font-bold mb-2">{currentAd.title}</h3>
                      {currentAd.description && (
                        <p className="text-sm sm:text-base text-gray-200">{currentAd.description}</p>
                      )}
                    </div>
                  </div>
                </Link>
              ) : (
                <div className="relative h-48 sm:h-64 md:h-80">
                  <img
                    src={currentAd.imageUrl}
                    alt={currentAd.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 text-white">
                    <h3 className="text-xl sm:text-2xl font-bold mb-2">{currentAd.title}</h3>
                    {currentAd.description && (
                      <p className="text-sm sm:text-base text-gray-200">{currentAd.description}</p>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {activeAds.length > 1 && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 dark:bg-gray-800/90 rounded-full shadow-lg hover:shadow-xl transition-shadow z-10"
                aria-label="Previous ad"
              >
                <FiChevronLeft className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 dark:bg-gray-800/90 rounded-full shadow-lg hover:shadow-xl transition-shadow z-10"
                aria-label="Next ad"
              >
                <FiChevronRight className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              </button>

              {/* Dots Indicator */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                {activeAds.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`h-2 rounded-full transition-all ${
                      index === currentIndex
                        ? 'w-8 bg-white'
                        : 'w-2 bg-white/50'
                    }`}
                    aria-label={`Go to ad ${index + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
