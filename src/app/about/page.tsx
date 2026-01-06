'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { 
  FiShoppingBag, 
  FiMapPin, 
  FiUsers, 
  FiTrendingUp, 
  FiCheckCircle, 
  FiStar,
  FiSearch,
  FiShield,
  FiArrowLeft
} from 'react-icons/fi';
import Footer from '@/components/common/Footer';

export default function About() {
  // Set page title dynamically
  useEffect(() => {
    document.title = "About Us - 8rupiya.com";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', "Learn about 8rupiya.com - India's most trusted local business discovery platform. Find verified shops, restaurants, doctors, and services near you.");
    }
  }, []);
  const features = [
    {
      icon: FiMapPin,
      title: 'Local Business Discovery',
      description: 'Find verified shops, restaurants, hotels, and doctors from every corner of your city',
      color: 'from-blue-600 to-cyan-600'
    },
    {
      icon: FiCheckCircle,
      title: 'Verified & Trusted',
      description: 'Every business is verified to ensure you get trusted services',
      color: 'from-green-600 to-emerald-600'
    },
    {
      icon: FiUsers,
      title: 'Community Powered',
      description: 'Find the best businesses through real user reviews and ratings',
      color: 'from-purple-600 to-pink-600'
    },
    {
      icon: FiTrendingUp,
      title: 'Digital Empowerment',
      description: 'Help small shops grow by providing them with a digital platform',
      color: 'from-orange-600 to-red-600'
    }
  ];

  const stats = [
    { number: '10,000+', label: 'Verified Businesses', icon: FiShoppingBag },
    { number: '50,000+', label: 'Happy Users', icon: FiUsers },
    { number: '100+', label: 'Cities Covered', icon: FiMapPin },
    { number: '4.8/5', label: 'Average Rating', icon: FiStar }
  ];

  const benefits = [
    {
      icon: FiCheckCircle,
      title: 'Completely Free',
      description: 'The platform is completely free for users. No hidden charges, no subscription fees.',
      color: 'text-green-600 dark:text-green-400'
    },
    {
      icon: FiStar,
      title: 'Real Reviews & Ratings',
      description: 'Authentic reviews and ratings for every business from real customers. Make informed decisions with genuine feedback.',
      color: 'text-yellow-600 dark:text-yellow-400'
    },
    {
      icon: FiSearch,
      title: 'Smart Search System',
      description: 'Filter by category, location, ratings, or specific services. Quick and easy search experience.',
      color: 'text-blue-600 dark:text-blue-400'
    },
    {
      icon: FiShield,
      title: 'Complete Business Info',
      description: 'Photos, contact details, operating hours, and customer reviews - everything in one place.',
      color: 'text-purple-600 dark:text-purple-400'
    },
    {
      icon: FiMapPin,
      title: 'Mobile Friendly',
      description: 'Mobile, tablet, or desktop - perfect experience on any device. Access anywhere, anytime.',
      color: 'text-pink-600 dark:text-pink-400'
    },
    {
      icon: FiTrendingUp,
      title: 'Support Local Businesses',
      description: 'Support local shopkeepers and businesses. Help them grow in the digital age.',
      color: 'text-blue-600 dark:text-blue-400'
    },
    {
      icon: FiUsers,
      title: 'Regular Updates',
      description: 'New businesses, updated information, and latest reviews are added regularly.',
      color: 'text-cyan-600 dark:text-cyan-400'
    },
    {
      icon: FiShield,
      title: 'Safe & Secure',
      description: 'Your data is safe. A secure platform that prioritizes privacy and security.',
      color: 'text-indigo-600 dark:text-indigo-400'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Back to Home Link */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors group"
        >
          <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
          <span>Back to Home</span>
        </Link>
      </div>

      {/* Hero Section */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20"></div>
        
        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-purple-300 dark:bg-purple-600 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-0 w-72 h-72 bg-yellow-300 dark:bg-yellow-600 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-pink-300 dark:bg-pink-600 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main Heading */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 md:mb-16"
          >
            <motion.h1 
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              About 8rupiya.com
            </motion.h1>
            <motion.p 
              className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              India's most trusted and fastest growing local business discovery platform
            </motion.p>
          </motion.div>

          {/* Main Content */}
          <div className="grid lg:grid-cols-2 gap-12 mb-16">
            {/* Left Column - Main Description */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-gray-200 dark:border-gray-700">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
                  <FiShoppingBag className="text-blue-600 dark:text-blue-400" />
                  What is 8rupiya.com?
                </h2>
                <div className="space-y-4 text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
                  <p>
                    <strong className="text-gray-900 dark:text-white">8rupiya.com</strong> is a local business discovery platform where users can easily find verified shops, restaurants, hotels, doctors, and services in their city. We provide a digital platform for small and large businesses across every city and village in India.
                  </p>
                  <p>
                    In today's digital age, every business needs an online presence. However, many small shopkeepers don't have the time and resources to build their own website. <strong className="text-blue-600 dark:text-blue-400">This is the problem 8rupiya.com solves</strong> - we list local businesses for free and connect them to millions of customers.
                  </p>
                  <p>
                    Whether you're looking for the best restaurant nearby, a reliable doctor, or want to explore trusted shops in your area - <strong className="text-purple-600 dark:text-purple-400">you'll find everything on 8rupiya.com</strong>. Every business is verified, ratings and reviews are from real users, and contact information is completely accurate.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Right Column - Features */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6">
                Why choose 8rupiya.com?
              </h2>
              
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -5 }}
                  className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-xl p-6 shadow-xl border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg bg-gradient-to-br ${feature.color} shadow-lg`}>
                      <feature.icon className="text-2xl text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Stats Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -10 }}
                className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-700 text-center"
              >
                <stat.icon className="text-4xl text-blue-600 dark:text-blue-400 mx-auto mb-3" />
                <div className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                  {stat.number}
                </div>
                <div className="text-sm md:text-base text-gray-600 dark:text-gray-400 font-medium">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="relative py-16 md:py-24 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Platform's <span className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">Key Benefits</span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Features and benefits available on 8rupiya.com
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-all duration-300"
              >
                <benefit.icon className={`text-3xl ${benefit.color} mb-4`} />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  {benefit.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {benefit.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-center"
          >
            <div className="bg-blue-600 rounded-3xl p-8 md:p-12 shadow-2xl">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Join India's Digital Revolution
              </h2>
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                <strong className="text-white">8rupiya.com</strong> is not just a website - it's a movement that's empowering local businesses across India. Whether you're a customer looking for trusted services, or a shopkeeper wanting to take your business online - <strong className="text-white">8rupiya.com is for you</strong>.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/"
                  className="bg-pink-300 dark:bg-pink-300 text-black dark:text-black px-8 py-3 rounded-full font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center justify-center gap-2"
                >
                  <FiSearch />
                  <span>Explore Shops</span>
                </Link>
                <Link
                  href="/add-shop"
                  className="bg-white/10 backdrop-blur-lg text-white border-2 border-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-white/20 transition-all hover:scale-105 flex items-center justify-center gap-2"
                >
                  <FiShoppingBag />
                  <span>Add Your Business</span>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>

      {/* Footer */}
      <Footer />
    </div>
  );
}
