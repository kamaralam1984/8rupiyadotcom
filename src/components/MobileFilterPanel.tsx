'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiFilter, FiMapPin, FiTag, FiChevronDown, FiSearch, FiX } from 'react-icons/fi';
import { useLanguage } from '@/contexts/LanguageContext';

interface MobileFilterPanelProps {
  onCategoryChange?: (category: string) => void;
  onCityChange?: (city: string) => void;
  selectedCategory?: string;
  selectedCity?: string;
}

interface Category {
  _id: string;
  name: string;
  slug: string;
  icon?: string;
  displayOrder: number;
}

const popularCities = [
  'Patna',
  'Gaya',
  'Muzaffarpur',
  'Bhagalpur',
  'Purnia',
  'Darbhanga',
];

export default function MobileFilterPanel({ 
  onCategoryChange, 
  onCityChange, 
  selectedCategory: propSelectedCategory = 'All Categories',
  selectedCity: propSelectedCity = ''
}: MobileFilterPanelProps) {
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState(propSelectedCategory);
  const [selectedCity, setSelectedCity] = useState(propSelectedCity);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isCityOpen, setIsCityOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categorySearchText, setCategorySearchText] = useState('');
  const [citySearchText, setCitySearchText] = useState('');
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

  // Fetch categories from database
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const response = await fetch('/api/categories');
        const data = await response.json();
        
        if (response.ok && data.success) {
          setCategories(data.categories || []);
        } else {
          console.error('Failed to fetch categories:', data.error);
          setCategories([]);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategories([]);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  // Update local state when props change
  useEffect(() => {
    if (propSelectedCategory) {
      setSelectedCategory(propSelectedCategory);
    } else {
      setSelectedCategory('All Categories');
    }
  }, [propSelectedCategory]);

  useEffect(() => {
    if (propSelectedCity !== undefined) {
      setSelectedCity(propSelectedCity);
    }
  }, [propSelectedCity]);

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setIsCategoryOpen(false);
    setCategorySearchText('');
    setIsFilterPanelOpen(false);
    onCategoryChange?.(category);
  };

  const handleCitySelect = (city: string) => {
    setSelectedCity(city);
    setIsCityOpen(false);
    setCitySearchText('');
    setIsFilterPanelOpen(false);
    onCityChange?.(city);
  };

  const handleCategoryClick = () => {
    const newCategoryOpen = !isCategoryOpen;
    setIsCategoryOpen(newCategoryOpen);
    if (newCategoryOpen) {
      setIsCityOpen(false);
      setIsFilterPanelOpen(true);
    } else {
      setIsFilterPanelOpen(false);
    }
  };

  const handleCityClick = () => {
    const newCityOpen = !isCityOpen;
    setIsCityOpen(newCityOpen);
    if (newCityOpen) {
      setIsCategoryOpen(false);
      setIsFilterPanelOpen(true);
    } else {
      setIsFilterPanelOpen(false);
    }
  };

  const handleToggleFilterPanel = () => {
    setIsFilterPanelOpen(!isFilterPanelOpen);
    if (!isFilterPanelOpen) {
      setIsCategoryOpen(false);
      setIsCityOpen(false);
    }
  };

  // Filter categories based on search text
  const filteredCategories = categories.filter(category => {
    if (!categorySearchText.trim()) return true;
    const searchLower = categorySearchText.toLowerCase();
    return category.name.toLowerCase().includes(searchLower) ||
           (category.icon && category.icon.includes(searchLower));
  });

  // Filter cities based on search text
  const filteredCities = popularCities.filter(city => {
    if (!citySearchText.trim()) return true;
    const searchLower = citySearchText.toLowerCase();
    return city.toLowerCase().includes(searchLower);
  });

  return (
    <div className="lg:hidden mb-4 px-4 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800/80 backdrop-blur-md rounded-xl shadow-lg border border-gray-200 dark:border-gray-700/50"
      >
        {/* Filter Header - Always Visible */}
        <div className="flex items-center justify-between p-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <FiFilter />
            Filter
          </h3>
          <button
            onClick={handleToggleFilterPanel}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors"
            aria-label="Toggle filter panel"
          >
            {isFilterPanelOpen ? <FiX className="text-xl" /> : <FiChevronDown className="text-xl" />}
          </button>
        </div>

        {/* Filter Panel Content - Expandable */}
        <AnimatePresence>
          {isFilterPanelOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="px-4 pb-4 overflow-hidden"
            >
              {/* Categories Section */}
              <div className="mb-4">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
                  {/* Category Button */}
                  <div
                    onClick={handleCategoryClick}
                    className="w-full flex justify-between items-center font-semibold cursor-pointer text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <FiTag />
                      {selectedCategory}
                    </span>
                    <FiChevronDown className={`text-sm transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`} />
                  </div>

                  {/* Category Dropdown List */}
                  <AnimatePresence>
                    {isCategoryOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="mt-2"
                      >
                        <div className="w-full max-h-[300px] overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg category-scrollbar scroll-smooth">
                          {/* Search Input */}
                          <div className="p-2 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
                            <div className="relative">
                              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 text-sm" />
                              <input
                                type="text"
                                placeholder="Search category..."
                                value={categorySearchText}
                                onChange={(e) => setCategorySearchText(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                autoFocus
                              />
                            </div>
                          </div>

                          {/* All Categories Option */}
                          {(!categorySearchText.trim() || 'All Categories'.toLowerCase().includes(categorySearchText.toLowerCase())) && (
                            <div
                              onClick={() => handleCategorySelect('All Categories')}
                              className={`p-2 py-2 cursor-pointer hover:bg-blue-400 hover:text-white dark:hover:bg-blue-600 transition-colors ${
                                selectedCategory === 'All Categories' || selectedCategory === t('category.all')
                                  ? 'bg-blue-400 dark:bg-blue-600 text-white font-semibold'
                                  : 'text-gray-800 dark:text-gray-200'
                              }`}
                            >
                              All Categories
                            </div>
                          )}

                          {/* Database Categories */}
                          {loadingCategories ? (
                            <div className="p-2 py-2 text-sm text-gray-500 dark:text-gray-400">
                              Loading categories...
                            </div>
                          ) : filteredCategories.length > 0 ? (
                            filteredCategories.map((category) => {
                              const displayCategory = category.icon ? `${category.icon} ${category.name}` : category.name;
                              const isSelected = selectedCategory === category.name;
                              return (
                                <div
                                  key={category._id}
                                  onClick={() => handleCategorySelect(category.name)}
                                  className={`p-2 py-2 cursor-pointer hover:bg-blue-400 hover:text-white dark:hover:bg-blue-600 transition-colors ${
                                    isSelected
                                      ? 'bg-blue-400 dark:bg-blue-600 text-white font-semibold'
                                      : 'text-gray-800 dark:text-gray-200'
                                  }`}
                                >
                                  {displayCategory}
                                </div>
                              );
                            })
                          ) : (
                            <div className="p-2 py-2 text-sm text-gray-500 dark:text-gray-400 text-center">
                              {categorySearchText.trim() ? 'No categories found' : 'No categories available'}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Popular Cities Section */}
              <div className="mb-4">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
                  {/* City Button */}
                  <div
                    onClick={handleCityClick}
                    className="w-full flex justify-between items-center font-semibold cursor-pointer text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <FiMapPin />
                      {selectedCity || 'Popular Cities'}
                    </span>
                    <FiChevronDown className={`text-sm transition-transform ${isCityOpen ? 'rotate-180' : ''}`} />
                  </div>

                  {/* City Dropdown List */}
                  <AnimatePresence>
                    {isCityOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="mt-2"
                      >
                        <div className="w-full max-h-[300px] overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg category-scrollbar scroll-smooth">
                          {/* Search Input */}
                          <div className="p-2 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
                            <div className="relative">
                              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 text-sm" />
                              <input
                                type="text"
                                placeholder="Search city..."
                                value={citySearchText}
                                onChange={(e) => setCitySearchText(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                autoFocus
                              />
                            </div>
                          </div>

                          {/* All Cities Option */}
                          {(!citySearchText.trim() || 'All Cities'.toLowerCase().includes(citySearchText.toLowerCase())) && (
                            <div
                              onClick={() => handleCitySelect('')}
                              className={`p-2 py-2 cursor-pointer hover:bg-blue-400 hover:text-white dark:hover:bg-blue-600 transition-colors ${
                                !selectedCity
                                  ? 'bg-blue-400 dark:bg-blue-600 text-white font-semibold'
                                  : 'text-gray-800 dark:text-gray-200'
                              }`}
                            >
                              All Cities
                            </div>
                          )}

                          {/* Popular Cities List */}
                          {filteredCities.length > 0 ? (
                            filteredCities.map((city) => {
                              const isSelected = selectedCity === city;
                              return (
                                <div
                                  key={city}
                                  onClick={() => handleCitySelect(city)}
                                  className={`p-2 py-2 cursor-pointer hover:bg-blue-400 hover:text-white dark:hover:bg-blue-600 transition-colors ${
                                    isSelected
                                      ? 'bg-blue-400 dark:bg-blue-600 text-white font-semibold'
                                      : 'text-gray-800 dark:text-gray-200'
                                  }`}
                                >
                                  {city}
                                </div>
                              );
                            })
                          ) : (
                            <div className="p-2 py-2 text-sm text-gray-500 dark:text-gray-400 text-center">
                              {citySearchText.trim() ? 'No cities found' : 'No cities available'}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick Filter Buttons - Always Visible */}
        {!isFilterPanelOpen && (
          <div className="px-4 pb-4 flex gap-2 overflow-x-auto scrollbar-hide">
            <button
              onClick={handleCategoryClick}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <FiTag className="text-sm" />
              {selectedCategory}
            </button>
            <button
              onClick={handleCityClick}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <FiMapPin className="text-sm" />
              {selectedCity || 'All Cities'}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}

