'use client';

import { motion } from 'framer-motion';
import { FiCheckCircle } from 'react-icons/fi';

export default function WhatMakesSpecialSection() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="py-12 md:py-16"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl p-8 md:p-12 shadow-2xl border border-gray-200 dark:border-gray-700">
          <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            What makes 8rupiya.com special?
          </h3>
          
          <div className="grid md:grid-cols-2 gap-8 text-gray-700 dark:text-gray-300">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <FiCheckCircle className="text-green-600 dark:text-green-400 text-xl flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white mb-1">Completely Free</h4>
                  <p className="text-base">Completely free for users - no hidden charges. Browse shops, contact businesses, read reviews - everything is free.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <FiCheckCircle className="text-green-600 dark:text-green-400 text-xl flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white mb-1">Real Reviews & Ratings</h4>
                  <p className="text-base">No fake reviews, only authentic feedback from real users. You can also share your experience.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <FiCheckCircle className="text-green-600 dark:text-green-400 text-xl flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white mb-1">Smart Search System</h4>
                  <p className="text-base">Filter by category, location, and ratings. Find what you need instantly - very fast and accurate.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <FiCheckCircle className="text-green-600 dark:text-green-400 text-xl flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white mb-1">Complete Business Info</h4>
                  <p className="text-base">Phone number, address, timings, photos - everything in one place. No time wasted, contact directly.</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <FiCheckCircle className="text-green-600 dark:text-green-400 text-xl flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white mb-1">Mobile Friendly</h4>
                  <p className="text-base">Use on phone, tablet, or computer - works on any device. Fast loading and smooth experience guaranteed.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <FiCheckCircle className="text-green-600 dark:text-green-400 text-xl flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white mb-1">Support Local Businesses</h4>
                  <p className="text-base">When you use 8rupiya, you help your local shopkeepers grow their businesses.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <FiCheckCircle className="text-green-600 dark:text-green-400 text-xl flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white mb-1">Regular Updates</h4>
                  <p className="text-base">New features are added regularly. We continuously improve the platform.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <FiCheckCircle className="text-green-600 dark:text-green-400 text-xl flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white mb-1">Safe & Secure</h4>
                  <p className="text-base">Your privacy is our priority. We follow data protection and security best practices.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

