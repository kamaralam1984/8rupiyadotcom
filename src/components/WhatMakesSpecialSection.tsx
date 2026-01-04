'use client';

import { motion } from 'framer-motion';
import { 
  FiCheckCircle, 
  FiShield, 
  FiUsers, 
  FiTrendingUp,
  FiStar,
  FiZap,
  FiHeart,
  FiGlobe
} from 'react-icons/fi';

export default function WhatMakesSpecialSection() {
  const features = [
    {
      icon: FiShield,
      title: '100% Free for Users',
      description: 'No hidden charges, no subscription fees. Browse, search, and contact businesses completely free.',
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20'
    },
    {
      icon: FiStar,
      title: 'Verified Businesses',
      description: 'Every business is verified to ensure authenticity and trustworthiness.',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20'
    },
    {
      icon: FiUsers,
      title: 'Real Reviews & Ratings',
      description: 'Authentic feedback from real customers. No fake reviews, only genuine experiences.',
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20'
    },
    {
      icon: FiZap,
      title: 'Smart Search System',
      description: 'Find exactly what you need with advanced filters by category, location, and ratings.',
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20'
    },
    {
      icon: FiHeart,
      title: 'Support Local Businesses',
      description: 'Help small shopkeepers grow by giving them digital visibility and reach.',
      color: 'from-pink-500 to-rose-500',
      bgColor: 'bg-pink-50 dark:bg-pink-900/20'
    },
    {
      icon: FiGlobe,
      title: 'Wide Coverage',
      description: '100+ cities covered across India. Find businesses in your neighborhood easily.',
      color: 'from-indigo-500 to-purple-500',
      bgColor: 'bg-indigo-50 dark:bg-indigo-900/20'
    }
  ];

  return (
    <section className="py-12 md:py-16 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            What Makes 8rupiya.com Special?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Discover why thousands of users trust 8rupiya.com for finding the best local businesses
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`${feature.bgColor} rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300`}
            >
              <div className={`inline-flex p-3 rounded-lg bg-gradient-to-r ${feature.color} mb-4`}>
                <feature.icon className="text-white text-xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-12 text-center"
        >
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-semibold shadow-lg">
            <FiCheckCircle className="text-xl" />
            <span>Join 50,000+ Happy Users Today</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

