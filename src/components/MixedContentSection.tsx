'use client';

import { motion } from 'framer-motion';
import { FiShoppingBag, FiMapPin, FiStar, FiUsers, FiTrendingUp, FiCheckCircle, FiShield, FiSearch } from 'react-icons/fi';

interface MixedContentSectionProps {
  variant?: 'text-left' | 'text-right' | 'text-center' | 'shops-only' | 'text-only';
  title?: string;
  content?: string;
  shops?: any[];
  onShopClick?: (shop: any) => void;
  userLocation?: { lat: number; lng: number } | null;
  ShopCardComponent?: React.ComponentType<any>;
  index?: number;
}

export default function MixedContentSection({
  variant = 'text-left',
  title,
  content,
  shops = [],
  onShopClick,
  userLocation,
  ShopCardComponent,
  index = 0
}: MixedContentSectionProps) {
  
  const textContent = [
    {
      title: "Discover Local Businesses Near You",
      content: "8rupiya.com helps you find trusted shops, restaurants, doctors, and services in your neighborhood. Our platform features verified businesses with accurate contact information, real customer reviews, and detailed profiles to help you make informed decisions.",
      icon: FiMapPin,
      color: "bg-blue-600"
    },
    {
      title: "Why Choose 8rupiya.com?",
      content: "Every business is verified to ensure you get trusted services. Our community-driven platform features authentic reviews from real customers, helping you discover the best local businesses in your area.",
      icon: FiShield,
      color: "bg-blue-600"
    },
    {
      title: "Support Local Businesses",
      content: "By using 8rupiya.com, you're directly supporting local shopkeepers and businesses. We help small and medium enterprises gain online visibility and reach more customers in the digital age.",
      icon: FiTrendingUp,
      color: "bg-blue-600"
    },
    {
      title: "Smart Search & Discovery",
      content: "Filter by category, location, ratings, or specific services. Each business profile includes photos, contact details, operating hours, and customer reviews to help you make the best choice.",
      icon: FiSearch,
      color: "bg-blue-600"
    }
  ];

  const displayContent = title && content 
    ? { title, content, icon: FiShield, color: "bg-blue-600" }
    : textContent[index % textContent.length];

  if (variant === 'text-only') {
    return (
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: index * 0.1 }}
        className="py-12 md:py-16"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-white via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900/10 rounded-3xl p-8 md:p-12 shadow-2xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-start gap-6">
              <div className={`p-4 rounded-2xl bg-gradient-to-br ${displayContent.color} shadow-lg flex-shrink-0`}>
                <displayContent.icon className="text-3xl text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  {displayContent.title}
                </h3>
                <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                  {displayContent.content}
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.section>
    );
  }

  if (variant === 'shops-only' && shops.length > 0) {
    return (
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: index * 0.1 }}
        className="py-8 md:py-12"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {shops.slice(0, 6).map((shop, shopIndex) => (
              ShopCardComponent ? (
                <ShopCardComponent
                  key={`mixed-shops-only-${index}-${shopIndex}-${shop._id || shop.place_id || `fallback-${index}-${shopIndex}`}`}
                  shop={shop}
                  index={shopIndex}
                  onClick={() => onShopClick?.(shop)}
                  userLocation={userLocation}
                />
              ) : null
            ))}
          </div>
        </div>
      </motion.section>
    );
  }

  // Mixed layouts
  if (variant === 'text-left' && shops.length > 0) {
    return (
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: index * 0.1 }}
        className="py-12 md:py-16"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
            {/* Text Content - Left */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <div className={`inline-flex items-center gap-3 p-4 rounded-xl ${displayContent.color} mb-4`}>
                <displayContent.icon className="text-2xl text-white" />
                <h3 className="text-2xl md:text-3xl font-bold text-white">
                  {displayContent.title}
                </h3>
              </div>
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                {displayContent.content}
              </p>
            </motion.div>

            {/* Shops - Right */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4"
            >
              {shops.slice(0, 2).map((shop, shopIndex) => (
                ShopCardComponent ? (
                  <ShopCardComponent
                    key={`mixed-text-left-${index}-${shopIndex}-${shop._id || shop.place_id || `fallback-${index}-${shopIndex}`}`}
                    shop={shop}
                    index={shopIndex}
                    onClick={() => onShopClick?.(shop)}
                    userLocation={userLocation}
                  />
                ) : null
              ))}
            </motion.div>
          </div>
        </div>
      </motion.section>
    );
  }

  if (variant === 'text-right' && shops.length > 0) {
    return (
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: index * 0.1 }}
        className="py-12 md:py-16 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
            {/* Shops - Left */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 order-2 lg:order-1"
            >
              {shops.slice(0, 2).map((shop, shopIndex) => (
                ShopCardComponent ? (
                  <ShopCardComponent
                    key={`mixed-text-right-${index}-${shopIndex}-${shop._id || shop.place_id || `fallback-${index}-${shopIndex}`}`}
                    shop={shop}
                    index={shopIndex}
                    onClick={() => onShopClick?.(shop)}
                    userLocation={userLocation}
                  />
                ) : null
              ))}
            </motion.div>

            {/* Text Content - Right */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-6 order-1 lg:order-2"
            >
              <div className={`inline-flex items-center gap-3 p-4 rounded-xl ${displayContent.color} mb-4`}>
                <displayContent.icon className="text-2xl text-white" />
                <h3 className="text-2xl md:text-3xl font-bold text-white">
                  {displayContent.title}
                </h3>
              </div>
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                {displayContent.content}
              </p>
            </motion.div>
          </div>
        </div>
      </motion.section>
    );
  }

  if (variant === 'text-center' && shops.length > 0) {
    return (
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: index * 0.1 }}
        className="py-12 md:py-16"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Text Content - Center */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className={`inline-flex items-center gap-3 p-4 rounded-2xl ${displayContent.color} mb-6`}>
              <displayContent.icon className="text-3xl text-white" />
              <h3 className="text-3xl md:text-4xl font-bold text-white">
                {displayContent.title}
              </h3>
            </div>
            <p className="text-xl text-gray-700 dark:text-gray-300 leading-relaxed max-w-3xl mx-auto">
              {displayContent.content}
            </p>
          </motion.div>

          {/* Shops Grid - Below */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {shops.slice(0, 6).map((shop, shopIndex) => {
              // Create unique key - include index, shopIndex, and shop ID to ensure uniqueness
              const shopId = shop._id || shop.place_id;
              const uniqueKey = `mixed-text-center-${index}-${shopIndex}-${shopId || `fallback-${index}-${shopIndex}`}`;
              return ShopCardComponent ? (
                <ShopCardComponent
                  key={uniqueKey}
                  shop={shop}
                  index={shopIndex}
                  onClick={() => onShopClick?.(shop)}
                  userLocation={userLocation}
                />
              ) : null;
            })}
          </motion.div>
        </div>
      </motion.section>
    );
  }

  return null;
}

