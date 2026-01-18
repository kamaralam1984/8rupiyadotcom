'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  FiShoppingBag,
  FiSearch,
  FiGrid,
  FiList,
  FiArrowLeft,
  FiX,
} from 'react-icons/fi';
import NavbarAirbnb from '@/components/NavbarAirbnb';
import FooterMinimal from '@/components/FooterMinimal';

interface Category {
  _id: string;
  name: string;
  slug: string;
  icon?: string;
  description?: string;
  shopCount?: number;
  displayOrder?: number;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

function CategoriesPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Fetch user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setUser(null);
          return;
        }
        const response = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.user) {
            setUser(data.user);
          }
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
      }
    };
    fetchUser();
  }, []);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/categories?withCounts=true&all=true');
        const data = await response.json();
        
        if (data.success && data.categories) {
          // Sort by displayOrder, then by shopCount, then by name
          const sorted = data.categories.sort((a: Category, b: Category) => {
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
          setCategories(sorted);
        } else {
          setCategories([]);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Filter categories by search query
  const filteredCategories = categories.filter((category) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      category.name.toLowerCase().includes(query) ||
      category.description?.toLowerCase().includes(query) ||
      category.slug.toLowerCase().includes(query)
    );
  });

  const handleLogout = () => {
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <NavbarAirbnb user={user} onLogout={handleLogout} />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading categories...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <NavbarAirbnb user={user} onLogout={handleLogout} />

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="flex items-center gap-4 mb-6">
            <Link
              href="/"
              className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
            >
              <FiArrowLeft className="h-5 w-5" />
              <span>Back to Home</span>
            </Link>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">
            Browse All Categories
          </h1>
          <p className="text-white/90 text-lg sm:text-xl max-w-3xl">
            Discover shops and businesses across {categories.length} categories. Find exactly what you're looking for.
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md w-full">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search categories..."
                className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <FiX className="h-5 w-5" />
                </button>
              )}
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-300'
                }`}
              >
                <FiGrid className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-300'
                }`}
              >
                <FiList className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Results count */}
          {searchQuery && (
            <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              Found {filteredCategories.length} {filteredCategories.length === 1 ? 'category' : 'categories'} matching "{searchQuery}"
            </div>
          )}
        </div>
      </div>

      {/* Categories Grid/List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredCategories.length === 0 ? (
          <div className="text-center py-16">
            <FiShoppingBag className="h-24 w-24 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No categories found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchQuery
                ? `No categories match "${searchQuery}". Try a different search term.`
                : 'No categories available at the moment.'}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6'
                : 'space-y-4'
            }
          >
            {filteredCategories.map((category, index) => (
              <motion.div
                key={category._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                whileHover={{ y: -4, scale: 1.02 }}
              >
                <Link
                  href={`/category/${category.slug}`}
                  className={`block p-5 sm:p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg border border-gray-100 dark:border-gray-700 transition-all duration-300 group cursor-pointer ${
                    viewMode === 'list' ? 'flex items-center gap-4' : ''
                  }`}
                >
                  {viewMode === 'list' ? (
                    <>
                      <div className="flex-shrink-0">
                        {category.icon ? (
                          category.icon.startsWith('http') || category.icon.startsWith('/') ? (
                            <div className="w-16 h-16 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                              <Image
                                src={category.icon}
                                alt={category.name}
                                width={64}
                                height={64}
                                className="rounded-lg"
                              />
                            </div>
                          ) : (
                            <div className="w-16 h-16 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center justify-center text-3xl">
                              {category.icon}
                            </div>
                          )
                        ) : (
                          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <FiShoppingBag className="h-8 w-8 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {category.name}
                        </h3>
                        {category.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                            {category.description}
                          </p>
                        )}
                        {category.shopCount !== undefined && category.shopCount > 0 && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {category.shopCount} {category.shopCount === 1 ? 'shop' : 'shops'}
                          </p>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center text-center">
                      <div className="mb-4">
                        {category.icon ? (
                          category.icon.startsWith('http') || category.icon.startsWith('/') ? (
                            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center justify-center group-hover:bg-blue-50 dark:group-hover:bg-gray-600 transition-colors">
                              <Image
                                src={category.icon}
                                alt={category.name}
                                width={80}
                                height={80}
                                className="rounded-lg"
                              />
                            </div>
                          ) : (
                            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center justify-center group-hover:bg-blue-50 dark:group-hover:bg-gray-600 transition-colors text-3xl sm:text-4xl">
                              {category.icon}
                            </div>
                          )
                        ) : (
                          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                            <FiShoppingBag className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                          </div>
                        )}
                      </div>
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 min-h-[2.5rem] flex items-center justify-center">
                        {category.name}
                      </h3>
                      {category.description && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-2">
                          {category.description}
                        </p>
                      )}
                      {category.shopCount !== undefined && category.shopCount > 0 && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {category.shopCount} {category.shopCount === 1 ? 'shop' : 'shops'}
                        </p>
                      )}
                    </div>
                  )}
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <FooterMinimal />
    </div>
  );
}

export default function CategoriesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading categories...</p>
        </div>
      </div>
    }>
      <CategoriesPageContent />
    </Suspense>
  );
}
