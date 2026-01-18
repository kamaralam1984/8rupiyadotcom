'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiShoppingBag, FiArrowRight } from 'react-icons/fi';

interface Category {
  _id: string;
  name: string;
  slug: string;
  icon?: string;
  description?: string;
  shopCount?: number;
  displayOrder?: number;
}

interface DiscoverSectionProps {
  categories?: Category[];
  onCategoryClick?: (category: Category) => void;
}

export default function DiscoverSection({ categories = [], onCategoryClick }: DiscoverSectionProps) {
  const [displayCategories, setDisplayCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasFetched, setHasFetched] = useState(false);

  useEffect(() => {
    // If categories prop is provided and not empty, use it directly
    if (categories.length > 0 && !hasFetched) {
      const topCategories = categories.slice(0, 12);
      topCategories.sort((a: Category, b: Category) => {
        if (a.displayOrder !== undefined && b.displayOrder !== undefined) {
          if (a.displayOrder !== b.displayOrder) {
            return a.displayOrder - b.displayOrder;
          }
        }
        if ((b.shopCount || 0) !== (a.shopCount || 0)) {
          return (b.shopCount || 0) - (a.shopCount || 0);
        }
        return a.name.localeCompare(b.name);
      });
      setDisplayCategories(topCategories);
      setLoading(false);
      setHasFetched(true);
      return;
    }

    // Only fetch if we haven't fetched yet and no categories prop provided
    if (hasFetched) return;

    // Fetch categories from database with shop counts
    const fetchCategoriesWithCounts = async () => {
      try {
        setLoading(true);
        
        // Check cache first
        const cacheKey = 'discover-categories-cache';
        const cached = sessionStorage.getItem(cacheKey);
        if (cached) {
          const cachedData = JSON.parse(cached);
          const now = Date.now();
          // Use cache if less than 5 minutes old
          if (now - cachedData.timestamp < 300000) {
            setDisplayCategories(cachedData.categories);
            setLoading(false);
            setHasFetched(true);
            return;
          }
        }
        
        // Fetch categories from database with shop counts
        const categoriesResponse = await fetch('/api/categories?withCounts=true', {
          cache: 'default',
        });
        const categoriesData = await categoriesResponse.json();
        
        if (categoriesData.success && categoriesData.categories && categoriesData.categories.length > 0) {
          // Take top 10-12 categories and sort them
          const topCategories = categoriesData.categories.slice(0, 12);
          
          // Sort by displayOrder, then by shopCount (descending), then by name
          topCategories.sort((a: Category, b: Category) => {
            if (a.displayOrder !== undefined && b.displayOrder !== undefined) {
              if (a.displayOrder !== b.displayOrder) {
                return a.displayOrder - b.displayOrder;
              }
            }
            if ((b.shopCount || 0) !== (a.shopCount || 0)) {
              return (b.shopCount || 0) - (a.shopCount || 0);
            }
            return a.name.localeCompare(b.name);
          });
          
          setDisplayCategories(topCategories);
          // Cache the result
          sessionStorage.setItem(cacheKey, JSON.stringify({
            categories: topCategories,
            timestamp: Date.now(),
          }));
        } else {
          setDisplayCategories([]);
        }
      } catch (err) {
        console.error('Failed to fetch categories:', err);
        // Fallback: try without shop counts
        try {
          const fallbackResponse = await fetch('/api/categories', {
            cache: 'default',
          });
          const fallbackData = await fallbackResponse.json();
          if (fallbackData.success && fallbackData.categories && fallbackData.categories.length > 0) {
            const topCategories = fallbackData.categories.slice(0, 12);
            setDisplayCategories(topCategories);
          } else {
            setDisplayCategories([]);
          }
        } catch (fallbackErr) {
          console.error('Fallback fetch also failed:', fallbackErr);
          setDisplayCategories([]);
        }
      } finally {
        setLoading(false);
        setHasFetched(true);
      }
    };

    fetchCategoriesWithCounts();
  }, []); // Empty dependency array - only run once on mount

  // Show loading only if we don't have any categories yet
  if (loading && displayCategories.length === 0) {
    return (
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3">
              Discover by Category
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-base sm:text-lg max-w-2xl mx-auto">
              Explore shops and services in different categories
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
              <div key={i} className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4 sm:p-5 animate-pulse">
                <div className="h-14 w-14 sm:h-16 sm:w-16 bg-gray-300 dark:bg-gray-700 rounded-lg mx-auto mb-3"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mx-auto"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Don't render if no categories after loading
  if (!loading && displayCategories.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3">
            Discover by Category
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-base sm:text-lg max-w-2xl mx-auto">
            Explore shops and services in different categories
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5 mb-10">
          {displayCategories.map((category, index) => (
            <motion.div
              key={category._id || index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              whileHover={{ y: -4, scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <Link
                href={`/category/${category.slug}`}
                onClick={() => onCategoryClick?.(category)}
                className="block p-4 sm:p-5 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg border border-gray-100 dark:border-gray-700 transition-all duration-300 group cursor-pointer"
              >
                <div className="flex flex-col items-center text-center">
                  {/* Category Icon */}
                  <div className="mb-3 sm:mb-4">
                    {category.icon ? (
                      <div className="h-14 w-14 sm:h-16 sm:w-16 mx-auto flex items-center justify-center bg-gray-50 dark:bg-gray-700 rounded-lg p-2 group-hover:bg-blue-50 dark:group-hover:bg-gray-600 transition-colors">
                        {category.icon.startsWith('http') || category.icon.startsWith('/') ? (
                          <img
                            src={category.icon}
                            alt={category.name}
                            className="h-full w-full object-contain"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const fallback = target.nextElementSibling as HTMLElement;
                              if (fallback) fallback.classList.remove('hidden');
                            }}
                          />
                        ) : (
                          <span className="text-2xl sm:text-3xl">{category.icon}</span>
                        )}
                        <div className="hidden h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                          <FiShoppingBag className="h-5 w-5 text-white" />
                        </div>
                      </div>
                    ) : (
                      <div className="h-14 w-14 sm:h-16 sm:w-16 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                        <FiShoppingBag className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
                      </div>
                    )}
                  </div>
                  
                  {/* Category Name */}
                  <h3 className="font-semibold text-gray-900 dark:text-white text-xs sm:text-sm mb-0.5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 min-h-[2.5rem] flex items-center justify-center">
                    {category.name}
                  </h3>
                  
                  {/* Shop Count - Only show if > 0 */}
                  {category.shopCount !== undefined && category.shopCount > 0 && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {category.shopCount} {category.shopCount === 1 ? 'shop' : 'shops'}
                    </p>
                  )}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* View All Categories Button */}
        <div className="text-center">
          <Link
            href="/categories"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white rounded-xl font-semibold text-base hover:shadow-xl hover:scale-105 transition-all duration-300"
          >
            <span>View All Categories</span>
            <FiArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
