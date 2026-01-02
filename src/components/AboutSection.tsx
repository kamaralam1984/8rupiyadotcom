'use client';

import { motion } from 'framer-motion';
import { FiShoppingBag, FiMapPin, FiUsers, FiTrendingUp, FiCheckCircle, FiStar } from 'react-icons/fi';

export default function AboutSection() {
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

  return (
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
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 md:mb-16"
        >
          <motion.h2 
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent"
            initial={{ scale: 0.9 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
          >
            About 8rupiya.com
          </motion.h2>
          <motion.p 
            className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto font-medium"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
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
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
                <FiShoppingBag className="text-blue-600 dark:text-blue-400" />
                What is 8rupiya.com?
              </h3>
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
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6">
              Why choose 8rupiya.com?
            </h3>
            
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
                    <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {feature.title}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Detailed Benefits Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
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
        </motion.div>

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

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 text-center"
        >
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-4xl mx-auto leading-relaxed">
            <strong className="text-gray-900 dark:text-white">8rupiya.com</strong> is not just a website - it's a movement that's empowering local businesses across India. Whether you're a customer looking for trusted services, or a shopkeeper wanting to take your business online - <strong className="text-blue-600 dark:text-blue-400">8rupiya.com is for you</strong>. Join India's fastest growing local business community and be part of this digital revolution!
          </p>
        </motion.div>
      </div>

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
    </section>
  );
}

