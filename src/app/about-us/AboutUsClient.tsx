'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  FiShoppingBag, 
  FiMapPin, 
  FiUsers, 
  FiTrendingUp, 
  FiCheckCircle, 
  FiStar,
  FiSearch,
  FiShield,
  FiArrowLeft,
  FiTarget,
  FiEye
} from 'react-icons/fi';
import FooterMinimal from '@/components/FooterMinimal';

export default function AboutUsClient() {
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
            className="text-center mb-12 md:mb-16"
          >
            <motion.h1 
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-yellow-400 via-yellow-300 to-white bg-clip-text text-transparent"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              About 8rupiya.com
            </motion.h1>
            <motion.p 
              className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              India's most trusted and fastest growing local business discovery platform
            </motion.p>
          </motion.div>

          {/* Main Content */}
          <div className="grid lg:grid-cols-2 gap-12 mb-16">
            {/* Left Column - Who We Are */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <div className="bg-gray-800/80 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-yellow-400/20">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 flex items-center gap-3">
                  <FiShoppingBag className="text-yellow-400" />
                  Who We Are
                </h2>
                <div className="space-y-4 text-white/80 text-lg leading-relaxed">
                  <p>
                    <strong className="text-yellow-400">8rupiya.com</strong> is a local business discovery platform where users can easily find verified shops, restaurants, hotels, doctors, and services in their city. We provide a digital platform for small and large businesses across every city and village in India.
                  </p>
                  <p>
                    In today's digital age, every business needs an online presence. However, many small shopkeepers don't have the time and resources to build their own website. <strong className="text-yellow-400">This is the problem 8rupiya.com solves</strong> - we list local businesses for free and connect them to millions of customers.
                  </p>
                  <p>
                    Whether you're looking for the best restaurant nearby, a reliable doctor, or want to explore trusted shops in your area - <strong className="text-yellow-400">you'll find everything on 8rupiya.com</strong>. Every business is verified, ratings and reviews are from real users, and contact information is completely accurate.
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
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">
                Why Choose 8rupiya.com?
              </h2>
              
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -5 }}
                  className="bg-gray-800/90 backdrop-blur-lg rounded-xl p-6 shadow-xl border border-yellow-400/20 hover:border-yellow-400/40 transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg bg-gradient-to-br ${feature.color} shadow-lg`}>
                      <feature.icon className="text-2xl text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-white/70 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Mission & Vision */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-gradient-to-br from-yellow-400/20 to-yellow-600/20 rounded-2xl p-8 border border-yellow-400/30"
            >
              <div className="flex items-center gap-3 mb-4">
                <FiTarget className="text-3xl text-yellow-400" />
                <h2 className="text-2xl md:text-3xl font-bold text-white">Our Mission</h2>
              </div>
              <p className="text-white/90 text-lg leading-relaxed">
                To empower local businesses across India by providing them with a free digital platform that connects them with millions of customers. We aim to make business discovery simple, trusted, and accessible for everyone.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-gradient-to-br from-blue-400/20 to-blue-600/20 rounded-2xl p-8 border border-blue-400/30"
            >
              <div className="flex items-center gap-3 mb-4">
                <FiEye className="text-3xl text-blue-400" />
                <h2 className="text-2xl md:text-3xl font-bold text-white">Our Vision</h2>
              </div>
              <p className="text-white/90 text-lg leading-relaxed">
                To become India's number one local business directory, helping every shop, restaurant, and service provider establish their online presence and reach customers digitally.
              </p>
            </motion.div>
          </div>

          {/* What Makes Us Different */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-gray-800/80 backdrop-blur-lg rounded-2xl p-8 md:p-12 border border-yellow-400/20 mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 text-center">
              What Makes 8rupiya.com Different
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-start gap-4">
                <FiCheckCircle className="text-2xl text-yellow-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Trust & Accuracy</h3>
                  <p className="text-white/80">Every business listing is verified for accuracy. We ensure contact details, addresses, and business information are always up-to-date.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <FiCheckCircle className="text-2xl text-yellow-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Local Discovery</h3>
                  <p className="text-white/80">Find businesses in your neighborhood, city, or across India. Our platform covers shops from metros to small villages.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <FiCheckCircle className="text-2xl text-yellow-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Free for Everyone</h3>
                  <p className="text-white/80">Listing your business is completely free. No hidden charges, no subscription fees - just pure value for local businesses.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <FiCheckCircle className="text-2xl text-yellow-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Real Reviews</h3>
                  <p className="text-white/80">Authentic reviews and ratings from real customers help you make informed decisions about which businesses to choose.</p>
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
                className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 shadow-xl border border-yellow-400/20 text-center"
              >
                <stat.icon className="text-4xl text-yellow-400 mx-auto mb-3" />
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {stat.number}
                </div>
                <div className="text-sm md:text-base text-white/70 font-medium">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
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
            <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-3xl p-8 md:p-12 shadow-2xl">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Join India's Digital Revolution
              </h2>
              <p className="text-xl text-gray-800 mb-8 max-w-2xl mx-auto">
                <strong>8rupiya.com</strong> is not just a website - it's a movement that's empowering local businesses across India. Whether you're a customer looking for trusted services, or a shopkeeper wanting to take your business online - <strong>8rupiya.com is for you</strong>.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/"
                  className="bg-gray-900 text-yellow-400 px-8 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center justify-center gap-2"
                >
                  <FiSearch />
                  <span>Explore Shops</span>
                </Link>
                <Link
                  href="/list-your-business"
                  className="bg-white text-gray-900 px-8 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center justify-center gap-2"
                >
                  <FiShoppingBag />
                  <span>Add Your Business</span>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* SEO Keywords Section */}
      <section className="relative py-12 md:py-16 bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-gray-900/80 backdrop-blur-lg rounded-2xl p-8 md:p-12 border border-yellow-400/20"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 text-center">
              Find Best Shops and Businesses - SEO Keywords
            </h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-white/80 text-sm md:text-base leading-relaxed text-center">
                <span className="text-yellow-400 font-semibold">Keywords:</span>{' '}
                shops near me, local businesses, find shops, business directory, local shops, nearby shops, shop finder, local business directory, India shops, business listings, shop directory, local services, find businesses, shop search, business search, best shops, top rated shops, shop reviews, local business reviews, Jewelry near me, best Jewelry shop, Jewelry in India, top Jewelry businesses, Furniture near me, best Furniture shop, Furniture in India, top Furniture businesses, Clothing near me, best Clothing shop, Clothing in India, top Clothing businesses, Family Restaurant near me, best Family Restaurant shop, Family Restaurant in India, top Family Restaurant businesses, Education near me, best Education shop, Education in India, top Education businesses, Restaurant near me, best Restaurant shop, Restaurant in India, top Restaurant businesses, Electronics near me, best Electronics shop, Electronics in India, top Electronics businesses, Kirana Shop near me, best Kirana Shop shop, Kirana Shop in India, top Kirana Shop businesses, Hospital near me, best Hospital shop, Hospital in India, top Hospital businesses, Hotel near me, best Hotel shop, Hotel in India, top Hotel businesses, shops in patna, businesses in patna, local shops patna, patna directory, shops in Patna, businesses in Patna, local shops Patna, Patna directory, shops in buxar, businesses in buxar, local shops buxar, buxar directory, shops in araria, businesses in araria, local shops araria, araria directory
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <FooterMinimal />
    </div>
  );
}
