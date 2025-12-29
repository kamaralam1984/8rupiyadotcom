'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { FaComments, FaStar, FaStore, FaChartLine } from 'react-icons/fa';

export default function JyotishPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const features = [
    {
      icon: <FaComments className="w-12 h-12" />,
      title: 'AI Jyotish Chat Bot',
      description: 'Ask career, marriage, health, finance',
      subtitle: 'AI Pandit answers in Hindi - Hinglish',
      link: '/jyotish/chatbot',
      gradient: 'from-amber-400 to-orange-600'
    },
    {
      icon: <FaStar className="w-12 h-12" />,
      title: 'Kundli Generator',
      description: 'Enter name, dob, time, place',
      subtitle: 'Generate & download Kundli chart',
      link: '/jyotish/kundli',
      gradient: 'from-yellow-400 to-amber-600'
    },
    {
      icon: <FaStore className="w-12 h-12" />,
      title: 'Shubh Marketplace',
      description: 'Book expert astrologers, online or near you',
      subtitle: 'Free / Silver / Gold / Premium plans',
      link: '/jyotish/marketplace',
      gradient: 'from-green-400 to-emerald-600'
    }
  ];

  const toolset = [
    { name: 'Horoscope', subtitle: 'Daily Muhurat', icon: '🔮', link: '/jyotish/toolset#horoscope' },
    { name: 'Shudh', subtitle: 'Muhurat', icon: '📅', link: '/jyotish/toolset#shudh' },
    { name: 'Numerology', subtitle: 'Lucky Golden', icon: '🔢', link: '/jyotish/toolset#numerology' },
    { name: 'Kundli', subtitle: 'Match Making', icon: '✨', link: '/jyotish/toolset#kundli' }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Mystical Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-black via-gray-900 to-black">
        {/* Animated Stars */}
        <div className="absolute inset-0 opacity-30">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-yellow-300 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                opacity: [0.2, 1, 0.2],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 2 + Math.random() * 3,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        {/* Glowing Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-green-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10">
        {/* Hero Section */}
        <section className="pt-20 pb-16 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-8"
            >
              <div className="flex items-center justify-center mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-600 rounded-full blur-xl opacity-50 animate-pulse" />
                  <img
                    src="/logo.png"
                    alt="8rupiya Logo"
                    className="relative h-16 w-auto"
                  />
                </div>
              </div>

              <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 bg-clip-text text-transparent">
                WEB PANDIT
              </h1>
              <p className="text-2xl md:text-3xl text-gray-300 mb-4">
                AI Jyotish Seva Platform
              </p>
            </motion.div>

            {/* Feature Cards */}
            <div className="grid md:grid-cols-3 gap-8 mb-16">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                >
                  <Link href={feature.link}>
                    <div className="group relative overflow-hidden rounded-3xl p-1 hover:scale-105 transition-transform duration-300">
                      {/* Glowing Border */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-75 group-hover:opacity-100 transition-opacity`} />
                      
                      {/* Card Content */}
                      <div className="relative bg-gray-900/90 backdrop-blur-xl rounded-3xl p-8 h-full">
                        <div className="flex flex-col items-center text-center space-y-4">
                          <div className={`p-4 rounded-2xl bg-gradient-to-br ${feature.gradient} text-black shadow-2xl`}>
                            {feature.icon}
                          </div>
                          <h3 className="text-2xl font-bold text-yellow-400">
                            {feature.title}
                          </h3>
                          <div className="space-y-2">
                            <p className="text-gray-300">• {feature.description}</p>
                            <p className="text-gray-400 text-sm">• {feature.subtitle}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="mb-20"
            >
              <Link href="/jyotish/chatbot">
                <button className="group relative px-12 py-6 text-2xl font-bold text-black bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 rounded-full overflow-hidden shadow-2xl hover:shadow-yellow-500/50 transition-all duration-300">
                  <span className="relative z-10">Try Web Pandit</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </button>
              </Link>
            </motion.div>

            {/* Toolset Section */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1 }}
              className="mb-16"
            >
              <h2 className="text-4xl font-bold text-yellow-400 mb-8">
                AI JYOTISH TOOLSET
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {toolset.map((tool, index) => (
                  <Link key={index} href={tool.link}>
                    <div className="group relative overflow-hidden rounded-2xl p-1 hover:scale-105 transition-transform duration-300">
                      <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-yellow-600 opacity-60 group-hover:opacity-100 transition-opacity" />
                      <div className="relative bg-gray-900/90 backdrop-blur-xl rounded-2xl p-6">
                        <div className="text-5xl mb-3">{tool.icon}</div>
                        <h3 className="text-xl font-bold text-yellow-400 mb-1">
                          {tool.name}
                        </h3>
                        <p className="text-gray-400 text-sm">{tool.subtitle}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>

            {/* Monetization Preview */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.2 }}
              className="max-w-4xl mx-auto"
            >
              <Link href="/jyotish/pricing">
                <div className="group relative overflow-hidden rounded-3xl p-1 hover:scale-105 transition-transform duration-300">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 opacity-75 group-hover:opacity-100 transition-opacity" />
                  <div className="relative bg-gray-900/90 backdrop-blur-xl rounded-3xl p-8">
                    <h3 className="text-3xl font-bold text-yellow-400 mb-4">
                      Monetize your properties
                    </h3>
                    <div className="grid md:grid-cols-2 gap-6 text-left">
                      <div>
                        <h4 className="text-xl font-semibold text-green-400 mb-2">
                          • Jyotish Memberships
                        </h4>
                        <ul className="text-gray-300 space-y-1 ml-4">
                          <li>✓ AI hired As Jyotish chart</li>
                          <li>✓ NotReal Kundli insight</li>
                          <li>✓ High Tellum Business</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-xl font-semibold text-green-400 mb-2">
                          • Premint Preclaslive
                        </h4>
                        <ul className="text-gray-300 space-y-1 ml-4">
                          <li>✓ Tuuu Boii umii</li>
                          <li>✓ Google Aderess</li>
                          <li>✓ Opehi main</li>
                        </ul>
                      </div>
                    </div>
                    <button className="mt-6 px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-full hover:shadow-lg hover:shadow-green-500/50 transition-all">
                      View Plans →
                    </button>
                  </div>
                </div>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Footer Navigation */}
        <footer className="pb-8 px-4">
          <div className="max-w-7xl mx-auto flex flex-wrap justify-center gap-6 text-gray-400">
            <Link href="/" className="hover:text-yellow-400 transition-colors">Home</Link>
            <Link href="/jyotish/kundli" className="hover:text-yellow-400 transition-colors">Kundli</Link>
            <Link href="/jyotish/marketplace" className="hover:text-yellow-400 transition-colors">Mulhurat</Link>
            <Link href="/jyotish/pricing" className="hover:text-yellow-400 transition-colors">Dashboard</Link>
            <button className="px-6 py-2 bg-gradient-to-r from-yellow-500 to-amber-600 text-black font-bold rounded-full hover:shadow-lg transition-all">
              Try Now
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}

