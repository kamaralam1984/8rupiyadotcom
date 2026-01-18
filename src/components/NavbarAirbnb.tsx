'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiSearch, 
  FiMenu, 
  FiX, 
  FiUser, 
  FiLogOut, 
  FiShoppingBag,
  FiSettings,
  FiDatabase,
  FiTrendingUp,
  FiUsers,
  FiDollarSign,
  FiPercent,
  FiLayers,
  FiUserCheck,
  FiGrid,
  FiLayout,
  FiImage,
  FiFileText,
  FiCpu,
  FiStar,
  FiGlobe,
  FiAlertCircle,
  FiPackage,
  FiChevronDown,
  FiPlus
} from 'react-icons/fi';
import { useLanguage } from '@/contexts/LanguageContext';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface NavbarAirbnbProps {
  user?: User | null;
  onLogout?: () => void;
}

export default function NavbarAirbnb({ user, onLogout }: NavbarAirbnbProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState<Array<{ _id: string; name: string; slug: string }>>([]);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  // Sync with URL params on mount and when URL changes
  useEffect(() => {
    const urlQuery = searchParams?.get('q') || '';
    const urlCategory = searchParams?.get('category') || '';
    setSearchQuery(urlQuery);
    setSelectedCategory(urlCategory);
  }, [searchParams]);

  useEffect(() => {
    // Fetch categories from database
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        const data = await response.json();
        if (data.success && data.categories) {
          setCategories(data.categories);
        }
      } catch (err) {
        console.error('Failed to fetch categories:', err);
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.category-dropdown')) {
        setShowCategoryDropdown(false);
      }
    };

    if (showCategoryDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showCategoryDropdown]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    // Build search URL with query and category
    const params = new URLSearchParams();
    if (searchQuery.trim()) {
      params.append('q', searchQuery.trim());
    }
    if (selectedCategory) {
      params.append('category', selectedCategory);
    }
    // Navigate to homepage with search params (will filter shops)
    // If no params, just go to homepage
    if (params.toString()) {
      router.push(`/?${params.toString()}`);
    } else {
      router.push('/');
    }
    // Close mobile menu if open
    setIsMenuOpen(false);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setShowCategoryDropdown(false);
    // Navigate to homepage without filters
    router.push('/');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    if (onLogout) {
      onLogout();
    }
    router.push('/');
  };

  const handleAddShop = () => {
    // Check if user is logged in
    if (user) {
      // If user is already a shopper, go to shopper panel
      if (user.role === 'shopper') {
        router.push('/shopper');
      } else {
        // If user is logged in but not shopper, go to add-shop page (which handles shopper signup)
        router.push('/add-shop');
      }
    } else {
      // If not logged in, go to add-shop page (which handles shopper signup and login)
      router.push('/add-shop');
    }
  };

  // Admin panel menu items
  const adminMenuItems = [
    { name: 'Dashboard', icon: FiShoppingBag, href: '/admin', badge: null },
    { name: 'Analytics', icon: FiTrendingUp, href: '/admin/analytics', badge: 'new' },
    { name: 'Users', icon: FiUsers, href: '/admin/users', badge: null },
    { name: 'Shops', icon: FiShoppingBag, href: '/admin/shops', badge: 'pending' },
    { name: 'Categories', icon: FiPackage, href: '/admin/categories', badge: null },
    { name: 'Payments', icon: FiDollarSign, href: '/admin/payments', badge: null },
    { name: 'Commissions', icon: FiPercent, href: '/admin/commissions', badge: null },
    { name: 'Plans', icon: FiLayers, href: '/admin/plans', badge: null },
    { name: 'Agents', icon: FiUserCheck, href: '/admin/agents', badge: null },
    { name: 'Operators', icon: FiUsers, href: '/admin/operators', badge: null },
    { name: 'Homepage', icon: FiGrid, href: '/admin/homepage-builder', badge: null },
    { name: 'Content Control', icon: FiLayout, href: '/admin/homepage-content-control', badge: null },
    { name: 'Hero Settings', icon: FiImage, href: '/admin/hero-settings', badge: null },
    { name: 'Ad Space Content', icon: FiFileText, href: '/admin/ad-space-content', badge: null },
    { name: 'Advertisements', icon: FiImage, href: '/admin/advertisements', badge: null },
    { name: 'AI & Golu', icon: FiCpu, href: '/admin/ai', badge: null },
    { name: 'Jyotish', icon: FiStar, href: '/admin/jyotish', badge: null },
    { name: 'Reports', icon: FiFileText, href: '/admin/reports', badge: null },
    { name: 'Google Business', icon: FiGlobe, href: '/admin/google-business', badge: null },
    { name: 'Database', icon: FiDatabase, href: '/admin/database', badge: null },
    { name: 'Errors', icon: FiAlertCircle, href: '/admin/errors', badge: null },
    { name: 'Bugs', icon: FiAlertCircle, href: '/admin/bugs', badge: null },
    { name: 'Settings', icon: FiSettings, href: '/admin/settings', badge: null },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-black border-b border-gray-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 hover:opacity-90 transition-opacity">
            <div className="flex items-center h-6">
              <Image
                src="/logo.png"
                alt="8rupiya.com"
                width={350}
                height={48}
                className="h-10 w-20 object-contain"
                priority
                unoptimized
              />
            </div>
          </Link>

          {/* Search Bar - Desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-2xl mx-8 gap-2">
            {/* Category Dropdown */}
            <div className="relative category-dropdown">
              <button
                type="button"
                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                className="px-4 py-2.5 border border-yellow-400 rounded-xl bg-gray-900 text-white hover:bg-gray-800 hover:border-yellow-300 transition-all duration-200 whitespace-nowrap flex items-center gap-2 shadow-md hover:shadow-lg backdrop-blur-sm"
              >
                <FiPackage className="h-4 w-4 text-yellow-400" />
                <span className="text-sm font-medium text-white">
                  {selectedCategory ? <span className="text-white">{selectedCategory}</span> : <span className="text-yellow-400">Category</span>}
                </span>
                <FiChevronDown className={`h-3 w-3 transition-transform duration-200 ${showCategoryDropdown ? 'rotate-180' : ''}`} />
              </button>
              
              {showCategoryDropdown && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl z-50 max-h-64 overflow-y-auto backdrop-blur-xl">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCategory('');
                      setShowCategoryDropdown(false);
                      // Clear category filter and navigate
                      const params = new URLSearchParams();
                      if (searchQuery.trim()) {
                        params.append('q', searchQuery.trim());
                      }
                      if (params.toString()) {
                        router.push(`/?${params.toString()}`);
                      } else {
                        router.push('/');
                      }
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-white hover:bg-gray-800 hover:text-yellow-400 transition-colors duration-150 border-b border-gray-800"
                  >
                    All Categories
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat._id}
                      type="button"
                      onClick={() => {
                        setSelectedCategory(cat.name);
                        setShowCategoryDropdown(false);
                        // Auto-search when category is selected
                        const params = new URLSearchParams();
                        params.append('category', cat.name);
                        if (searchQuery.trim()) {
                          params.append('q', searchQuery.trim());
                        }
                        router.push(`/?${params.toString()}`);
                        setIsMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-800 hover:text-yellow-400 transition-colors duration-150"
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Search Input */}
            <div className="relative flex-1">
              {searchQuery && (
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FiSearch className="h-5 w-5 text-gray-400" />
                </div>
              )}
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Shop"
                style={{ color: '#fbbf24' }}
                className={`block w-full py-2.5 border border-yellow-400 rounded-xl bg-gray-900 text-yellow-400 font-bold placeholder-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all duration-200 shadow-md hover:shadow-lg ${
                  searchQuery ? 'pl-11 pr-11 text-left' : 'px-4 text-center'
                }`}
              />
              {(searchQuery || selectedCategory) && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-white transition-colors duration-200"
                  aria-label="Clear search"
                >
                  <FiX className="h-5 w-5" />
                </button>
              )}
            </div>
          </form>

          {/* Right Side - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Add Shop Button */}
            <button
              onClick={handleAddShop}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-yellow-400 bg-black hover:bg-gray-900 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl font-semibold border border-yellow-400"
            >
              <FiPlus className="h-4 w-4 text-yellow-400" />
              <span className="text-yellow-400">Add Shop</span>
            </button>

            {user && user.role === 'admin' && (
              <div className="relative">
                <button
                  onClick={() => setIsAdminMenuOpen(!isAdminMenuOpen)}
                  className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-yellow-400 hover:text-yellow-300 transition-colors duration-200 rounded-xl border border-yellow-400 hover:bg-gray-900"
                >
                  <FiSettings className="h-5 w-5 text-yellow-400" />
                  <span className="text-yellow-400">Admin</span>
                </button>

                <AnimatePresence>
                  {isAdminMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-64 bg-gray-900 rounded-xl shadow-2xl border border-gray-700 py-2 max-h-96 overflow-y-auto z-50 backdrop-blur-xl"
                    >
                      {adminMenuItems.map((item) => {
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setIsAdminMenuOpen(false)}
                            className="flex items-center space-x-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-800 hover:text-yellow-400 transition-colors duration-150"
                          >
                            <Icon className="h-4 w-4" />
                            <span className="flex-1">{item.name}</span>
                            {item.badge && (
                              <span className="px-2 py-0.5 text-xs font-medium bg-yellow-400 text-black rounded-full">
                                {item.badge}
                              </span>
                            )}
                          </Link>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {user ? (
              <div className="flex items-center space-x-4">
                <Link
                  href="/profile"
                  className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white hover:text-yellow-400 transition-colors duration-200 rounded-xl border border-yellow-400 hover:bg-gray-900"
                >
                  <FiUser className="h-5 w-5 text-yellow-400" />
                  <span className="text-yellow-400">Profile</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white hover:text-yellow-400 transition-colors duration-200 rounded-xl border border-yellow-400 hover:bg-gray-900"
                >
                  <FiLogOut className="h-5 w-5 text-yellow-400" />
                  <span className="text-yellow-400">{t('nav.logout') || 'Logout'}</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-white hover:text-yellow-400 transition-colors duration-200 rounded-xl border border-yellow-400 hover:bg-gray-900"
                >
                  {t('nav.login') || 'Login'}
                </Link>
                <Link
                  href="/register"
                  className="px-5 py-2.5 text-sm font-medium text-black bg-yellow-400 hover:bg-yellow-300 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg font-semibold border border-yellow-400"
                >
                  {t('nav.register') || 'Register'}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-xl text-white hover:bg-gray-900 hover:text-yellow-400 transition-colors duration-200"
          >
            {isMenuOpen ? (
              <FiX className="h-6 w-6" />
            ) : (
              <FiMenu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-gray-800 py-4 bg-black"
            >
              {/* Mobile Add Shop Button */}
              <button
                onClick={handleAddShop}
                className="w-full mb-4 flex items-center justify-center space-x-2 px-4 py-2.5 text-sm font-medium text-yellow-400 bg-black hover:bg-gray-900 rounded-xl transition-all duration-200 shadow-lg font-semibold border border-yellow-400"
              >
                <FiPlus className="h-4 w-4 text-yellow-400" />
                <span className="text-yellow-400">Add Shop</span>
              </button>

              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="mb-4 space-y-2">
                {/* Category Dropdown - Mobile */}
                <div className="relative category-dropdown">
                  <button
                    type="button"
                    onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                    className="w-full px-4 py-2.5 border border-yellow-400 rounded-xl bg-gray-900 text-white hover:bg-gray-800 hover:border-yellow-300 transition-all duration-200 flex items-center justify-between shadow-md"
                  >
                    <div className="flex items-center gap-2">
                      <FiPackage className="h-4 w-4 text-yellow-400" />
                      <span className="text-sm font-medium">{selectedCategory || 'All Categories'}</span>
                    </div>
                    <FiChevronDown className={`h-3 w-3 transition-transform duration-200 ${showCategoryDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {showCategoryDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl z-50 max-h-64 overflow-y-auto backdrop-blur-xl">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCategory('');
                          setShowCategoryDropdown(false);
                          // Clear category filter and navigate
                          const params = new URLSearchParams();
                          if (searchQuery.trim()) {
                            params.append('q', searchQuery.trim());
                          }
                          if (params.toString()) {
                            router.push(`/?${params.toString()}`);
                          } else {
                            router.push('/');
                          }
                          setIsMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm text-white hover:bg-gray-800 hover:text-yellow-400 transition-colors duration-150 border-b border-gray-800"
                      >
                        All Categories
                      </button>
                      {categories.map((cat) => (
                        <button
                          key={cat._id}
                          type="button"
                          onClick={() => {
                            setSelectedCategory(cat.name);
                            setShowCategoryDropdown(false);
                            // Auto-search when category is selected
                            const params = new URLSearchParams();
                            params.append('category', cat.name);
                            if (searchQuery.trim()) {
                              params.append('q', searchQuery.trim());
                            }
                            router.push(`/?${params.toString()}`);
                            setIsMenuOpen(false);
                          }}
                          className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-800 hover:text-yellow-400 transition-colors duration-150"
                        >
                          {cat.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Search Input - Mobile */}
                <div className="relative">
                  {searchQuery && (
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FiSearch className="h-5 w-5 text-gray-400" />
                    </div>
                  )}
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search Shop"
                    style={{ color: '#fbbf24' }}
                    className={`block w-full py-2.5 border border-yellow-400 rounded-xl bg-gray-900 text-yellow-400 font-bold placeholder-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all duration-200 shadow-md ${
                      searchQuery ? 'pl-11 pr-11 text-left' : 'px-4 text-center'
                    }`}
                  />
                  {(searchQuery || selectedCategory) && (
                    <button
                      type="button"
                      onClick={handleClearSearch}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-white transition-colors duration-200"
                      aria-label="Clear search"
                    >
                      <FiX className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </form>

              {/* Mobile Admin Menu */}
              {user && user.role === 'admin' && (
                <div className="mb-4">
                  <button
                    onClick={() => setIsAdminMenuOpen(!isAdminMenuOpen)}
                    className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium text-yellow-400 hover:bg-gray-900 hover:text-yellow-300 rounded-xl border border-yellow-400 transition-colors duration-200"
                  >
                    <span className="text-yellow-400">Admin Panel</span>
                    <FiSettings className="h-4 w-4 text-yellow-400" />
                  </button>
                  {isAdminMenuOpen && (
                    <div className="mt-2 space-y-1 max-h-64 overflow-y-auto">
                      {adminMenuItems.map((item) => {
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => {
                              setIsMenuOpen(false);
                              setIsAdminMenuOpen(false);
                            }}
                            className="flex items-center space-x-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-900 hover:text-yellow-400 rounded-xl transition-colors duration-150"
                          >
                            <Icon className="h-4 w-4" />
                            <span>{item.name}</span>
                            {item.badge && (
                              <span className="ml-auto px-2 py-0.5 text-xs bg-yellow-400 text-black rounded-full font-medium">
                                {item.badge}
                              </span>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Mobile User Menu */}
              {user ? (
                <div className="space-y-2">
                  <Link
                    href="/profile"
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-900 hover:text-yellow-400 rounded-xl border border-yellow-400 transition-colors duration-200"
                  >
                    <div className="flex items-center space-x-2">
                      <FiUser className="h-5 w-5 text-yellow-400" />
                      <span className="text-yellow-400">Profile</span>
                    </div>
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center space-x-2 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-900 hover:text-yellow-400 rounded-xl border border-yellow-400 transition-colors duration-200"
                  >
                    <FiLogOut className="h-5 w-5 text-yellow-400" />
                    <span className="text-yellow-400">{t('nav.logout') || 'Logout'}</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link
                    href="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-900 hover:text-yellow-400 rounded-xl text-center border border-yellow-400 transition-colors duration-200"
                  >
                    {t('nav.login') || 'Login'}
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-4 py-2.5 text-sm font-medium text-black bg-yellow-400 hover:bg-yellow-300 rounded-xl text-center transition-all duration-200 shadow-md hover:shadow-lg font-semibold border border-yellow-400"
                  >
                    {t('nav.register') || 'Register'}
                  </Link>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
