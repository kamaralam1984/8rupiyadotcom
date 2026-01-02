'use client';

import { motion } from 'framer-motion';
import { FiMapPin, FiSearch, FiShield, FiUsers, FiTrendingUp } from 'react-icons/fi';

export default function SEOTextSection() {
  return (
    <section className="relative py-12 md:py-16 bg-gradient-to-br from-white via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl p-8 md:p-12 shadow-xl border border-gray-200 dark:border-gray-700"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
            Discover Nearby Shops and Services on 8rupiya.com
          </h2>
          
          <div className="prose prose-lg max-w-none dark:prose-invert text-gray-700 dark:text-gray-300 space-y-6">
            <p className="text-lg leading-relaxed">
              <strong className="text-gray-900 dark:text-white">8rupiya.com</strong> is India's premier local business discovery platform, designed to connect users with trusted shops, services, and businesses in their neighborhood. Whether you're searching for nearby shops, doctors, teachers, technicians, or any local service provider, our platform makes it easy to find exactly what you need, right where you are.
            </p>

            <div className="grid md:grid-cols-2 gap-6 my-8">
              <div className="flex items-start gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <FiMapPin className="text-2xl text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Location-Based Discovery</h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    Our smart location system helps you discover businesses based on your current location. Simply enter your area or allow location access, and instantly see verified shops, restaurants, hotels, and service providers nearby.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <FiSearch className="text-2xl text-purple-600 dark:text-purple-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Comprehensive Directory</h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    From jewelry stores and furniture shops to doctors, teachers, and technicians, our directory covers every type of local business. Find everything from daily essentials to specialized services in one convenient platform.
                  </p>
                </div>
              </div>
            </div>

            <p className="text-lg leading-relaxed">
              The digital directory plays a crucial role in modern business discovery. In today's fast-paced world, people need quick access to reliable local services. <strong className="text-gray-900 dark:text-white">8rupiya.com bridges the gap</strong> between local businesses and customers, creating a seamless connection that benefits both parties.
            </p>

            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">Why Choose 8rupiya.com for Local Business Discovery?</h3>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <FiShield className="text-xl text-green-600 dark:text-green-400 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white mb-1">Verified Businesses Only</h4>
                  <p className="text-gray-700 dark:text-gray-300">
                    Every business listed on our platform undergoes a verification process. We ensure that contact information, addresses, and business details are accurate and up-to-date, giving you confidence in your choices.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FiUsers className="text-xl text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white mb-1">Real User Reviews</h4>
                  <p className="text-gray-700 dark:text-gray-300">
                    Our community-driven platform features authentic reviews and ratings from real customers. Read genuine experiences from people who have used these services, helping you make informed decisions.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FiTrendingUp className="text-xl text-purple-600 dark:text-purple-400 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white mb-1">Supporting Local Economy</h4>
                  <p className="text-gray-700 dark:text-gray-300">
                    By using 8rupiya.com, you're directly supporting local businesses and shopkeepers. We help small and medium enterprises gain online visibility, reach more customers, and grow their businesses in the digital age.
                  </p>
                </div>
              </div>
            </div>

            <p className="text-lg leading-relaxed mt-6">
              Whether you're looking for a nearby restaurant for dinner, a reliable doctor for a health checkup, a skilled technician for home repairs, or a trusted teacher for your child's education, <strong className="text-gray-900 dark:text-white">8rupiya.com has you covered</strong>. Our platform serves as your comprehensive guide to local businesses, making it easier than ever to discover and connect with services in your area.
            </p>

            <p className="text-lg leading-relaxed">
              The platform's user-friendly interface and powerful search capabilities ensure that finding what you need is quick and effortless. Filter by category, location, ratings, or specific services to narrow down your search. With detailed business profiles including photos, contact information, operating hours, and customer reviews, you have all the information needed to make the right choice.
            </p>

            <p className="text-lg leading-relaxed">
              Join thousands of satisfied users who trust 8rupiya.com for their local business discovery needs. Experience the convenience of having a complete directory of verified local businesses at your fingertips, and discover how easy it is to find the best shops and services in your neighborhood.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

