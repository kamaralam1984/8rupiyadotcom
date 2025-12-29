'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { FiMessageCircle, FiCalendar, FiStar, FiClock, FiHash, FiUsers, FiZap, FiArrowRight } from 'react-icons/fi';
import { useRouter } from 'next/navigation';

export default function WebPanditLanding() {
  const router = useRouter();

  const services = [
    {
      icon: FiMessageCircle,
      title: 'AI Jyotish Chat Bot',
      desc: 'Ask career, marriage, health, finance',
      color: 'from-yellow-500 to-amber-600',
      href: '/jyotish/chat',
      bgGlow: 'bg-yellow-500/20'
    },
    {
      icon: FiCalendar,
      title: 'Kundli Generator',
      desc: 'Enter name, DOB, time & get kundli',
      color: 'from-green-500 to-emerald-600',
      href: '/jyotish/kundli',
      bgGlow: 'bg-green-500/20'
    },
    {
      icon: FiStar,
      title: 'Horoscope',
      desc: 'Daily, Weekly & Monthly predictions',
      color: 'from-purple-500 to-pink-600',
      href: '/jyotish/horoscope',
      bgGlow: 'bg-purple-500/20'
    },
    {
      icon: FiClock,
      title: 'Shubh Muhurat',
      desc: 'Marriage, business, vehicle purchase',
      color: 'from-blue-500 to-cyan-600',
      href: '/jyotish/muhurat',
      bgGlow: 'bg-blue-500/20'
    },
    {
      icon: FiHash,
      title: 'Numerology',
      desc: 'Lucky number, color & career guidance',
      color: 'from-red-500 to-orange-600',
      href: '/jyotish/numerology',
      bgGlow: 'bg-red-500/20'
    },
    {
      icon: FiUsers,
      title: 'Pandit Marketplace',
      desc: 'Book expert astrologers',
      color: 'from-indigo-500 to-purple-600',
      href: '/jyotish/pandits',
      bgGlow: 'bg-indigo-500/20'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-900 via-orange-900 to-yellow-900 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden">
      {/* Animated Stars Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-yellow-300 rounded-full"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="w-16 h-16 rounded-full bg-gradient-to-r from-yellow-400 to-amber-600 flex items-center justify-center shadow-2xl"
            >
              <FiZap className="text-3xl text-white" />
            </motion.div>
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 bg-clip-text text-transparent">
              Web Pandit
            </h1>
          </div>
          <p className="text-xl md:text-2xl text-yellow-100/90 font-medium mb-2">
            AI Jyotish Seva Platform
          </p>
          <p className="text-yellow-200/70 max-w-2xl mx-auto">
            Get instant astrological guidance, generate kundli, check horoscope, and connect with expert pandits
          </p>
        </motion.div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="relative group"
              >
                <Link href={service.href}>
                  <div className="relative bg-gradient-to-br from-black/40 to-black/20 backdrop-blur-xl rounded-2xl p-6 border border-yellow-500/20 hover:border-yellow-400/40 transition-all duration-300 overflow-hidden shadow-2xl">
                    {/* Glow Effect */}
                    <div className={`absolute inset-0 ${service.bgGlow} opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-3xl`} />
                    
                    {/* Content */}
                    <div className="relative z-10">
                      <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${service.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="text-3xl text-white" />
                      </div>
                      
                      <h3 className="text-2xl font-bold text-yellow-100 mb-2 group-hover:text-yellow-300 transition-colors">
                        {service.title}
                      </h3>
                      <p className="text-yellow-200/70 mb-4">
                        {service.desc}
                      </p>
                      
                      <div className="flex items-center text-yellow-400 font-semibold group-hover:gap-3 transition-all">
                        <span>Try Now</span>
                        <FiArrowRight className="text-xl group-hover:translate-x-2 transition-transform" />
                      </div>
                    </div>

                    {/* Corner Decoration */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-400/10 to-transparent rounded-bl-[100px]" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="bg-gradient-to-br from-black/40 to-black/20 backdrop-blur-xl rounded-2xl p-8 border border-yellow-500/20"
        >
          <h2 className="text-3xl font-bold text-yellow-100 mb-6 text-center">
            Why Choose Web Pandit?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center">
                <FiZap className="text-3xl text-white" />
              </div>
              <h3 className="text-xl font-semibold text-yellow-100 mb-2">Instant AI Guidance</h3>
              <p className="text-yellow-200/70">Get immediate answers from our AI astrologer</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-500 to-cyan-600 flex items-center justify-center">
                <FiUsers className="text-3xl text-white" />
              </div>
              <h3 className="text-xl font-semibold text-yellow-100 mb-2">Expert Pandits</h3>
              <p className="text-yellow-200/70">Connect with verified astrology experts</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center">
                <FiStar className="text-3xl text-white" />
              </div>
              <h3 className="text-xl font-semibold text-yellow-100 mb-2">Accurate Predictions</h3>
              <p className="text-yellow-200/70">Based on Vedic astrology principles</p>
            </div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="text-center mt-12"
        >
          <Link href="/jyotish/chat">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-amber-600 text-white font-bold text-lg rounded-full shadow-2xl hover:shadow-yellow-500/50 transition-all"
            >
              Start Free Consultation
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

