'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  FiArrowLeft,
  FiCheckCircle,
  FiShoppingBag,
  FiUsers,
  FiTrendingUp,
  FiMapPin,
  FiStar,
  FiEye,
  FiDollarSign,
  FiSearch,
  FiClock,
  FiShield
} from 'react-icons/fi';
import FooterMinimal from '@/components/FooterMinimal';

export default function ListYourBusinessClient() {
  const router = useRouter();
  const [hoveredBenefit, setHoveredBenefit] = useState<number | null>(null);

  const benefits = [
    {
      icon: FiEye,
      title: 'Increased Visibility',
      description: 'Get discovered by thousands of customers searching for businesses like yours in your area.',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: FiUsers,
      title: 'More Customers',
      description: 'Reach local customers actively looking for your products or services and grow your customer base.',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: FiDollarSign,
      title: 'Free Listing',
      description: 'List your business completely free. No hidden charges, no subscription fees - ever.',
      color: 'from-yellow-500 to-orange-500'
    },
    {
      icon: FiStar,
      title: 'Build Trust',
      description: 'Get verified badge and customer reviews to build trust and credibility with potential customers.',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: FiSearch,
      title: 'SEO Benefits',
      description: 'Appear in local search results when customers search for businesses in your category and location.',
      color: 'from-indigo-500 to-blue-500'
    },
    {
      icon: FiClock,
      title: '24/7 Availability',
      description: 'Your business information is available online 24/7, even when your physical store is closed.',
      color: 'from-red-500 to-pink-500'
    }
  ];

  const businessTypes = [
    'Shops & Retail Stores',
    'Restaurants & Cafes',
    'Hotels & Lodging',
    'Doctors & Clinics',
    'Beauty Salons & Spas',
    'Automobile Services',
    'Educational Institutes',
    'Real Estate',
    'Home Services',
    'Event Planners',
    'Photography Services',
    'Legal Services',
    'Financial Services',
    'Repair Services',
    'And Many More...'
  ];

  const steps = [
    {
      number: '1',
      title: 'Click Add Your Business',
      description: 'Click the "Add Your Business Free" button below or visit our registration page.',
      icon: FiShoppingBag
    },
    {
      number: '2',
      title: 'Fill Business Details',
      description: 'Enter your business name, category, address, contact information, and other relevant details.',
      icon: FiCheckCircle
    },
    {
      number: '3',
      title: 'Get Verified',
      description: 'Our team verifies your business information to ensure accuracy and build trust with customers.',
      icon: FiShield
    },
    {
      number: '4',
      title: 'Go Live',
      description: 'Your business listing goes live and becomes visible to thousands of potential customers.',
      icon: FiTrendingUp
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Back to Home Link */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-yellow-400 hover:text-yellow-300 font-medium transition-colors group"
        >
          <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
          <span>Back to Home</span>
        </Link>
      </div>

      {/* Hero Section */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 via-transparent to-blue-400/10"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <motion.h1 
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-yellow-400 via-yellow-300 to-white bg-clip-text text-transparent"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              List Your Business on 8rupiya.com
            </motion.h1>
            <motion.p 
              className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto font-medium mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Get discovered by thousands of local customers. List your business for free and grow your customer base.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Link
                href="/add-shop"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 px-8 py-4 rounded-xl font-bold text-lg shadow-2xl hover:shadow-yellow-400/50 transition-all hover:scale-105"
              >
                <FiShoppingBag className="text-xl" />
                <span>Add Your Business Free</span>
              </Link>
            </motion.div>
          </motion.div>

          {/* Benefits Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">
              Benefits of Listing Your Business
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  onHoverStart={() => setHoveredBenefit(index)}
                  onHoverEnd={() => setHoveredBenefit(null)}
                  className="bg-gray-800/80 backdrop-blur-lg rounded-xl p-6 shadow-xl border border-yellow-400/20 hover:border-yellow-400/40 transition-all duration-300"
                >
                  <div className={`p-3 rounded-lg bg-gradient-to-br ${benefit.color} shadow-lg mb-4 inline-block`}>
                    <benefit.icon className="text-2xl text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-white/70 leading-relaxed">
                    {benefit.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Business Types Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-gray-800/80 backdrop-blur-lg rounded-2xl p-8 md:p-12 border border-yellow-400/20 mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-8">
              Types of Businesses We Welcome
            </h2>
            <p className="text-white/80 text-center mb-8 text-lg">
              Whether you run a small shop, restaurant, clinic, or provide any service - we welcome all types of businesses.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {businessTypes.map((type, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-3 p-4 bg-gray-900/50 rounded-lg border border-yellow-400/10 hover:border-yellow-400/30 transition-all"
                >
                  <FiCheckCircle className="text-yellow-400 flex-shrink-0" />
                  <span className="text-white/90">{type}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Step-by-Step Process */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">
              How to Add Your Business
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {steps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="relative"
                >
                  <div className="bg-gray-800/80 backdrop-blur-lg rounded-xl p-6 shadow-xl border border-yellow-400/20 h-full">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center text-gray-900 font-bold text-xl">
                        {step.number}
                      </div>
                      <step.icon className="text-2xl text-yellow-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      {step.title}
                    </h3>
                    <p className="text-white/70 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                      <div className="w-6 h-0.5 bg-yellow-400"></div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-3xl p-8 md:p-12 shadow-2xl">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Ready to Grow Your Business?
              </h2>
              <p className="text-xl text-gray-800 mb-8 max-w-2xl mx-auto">
                Join thousands of businesses already listed on 8rupiya.com. Start getting more customers today - it's completely free!
              </p>
              <Link
                href="/add-shop"
                className="inline-flex items-center gap-2 bg-gray-900 text-yellow-400 px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105"
              >
                <FiShoppingBag className="text-xl" />
                <span>Add Your Business Free</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <FooterMinimal />
    </div>
  );
}
