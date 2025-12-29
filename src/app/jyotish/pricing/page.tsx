'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';
import { FaCheckCircle, FaCrown, FaStar, FaRocket, FaDollarSign } from 'react-icons/fa';

interface Plan {
  name: string;
  icon: string;
  price: number;
  period: string;
  gradient: string;
  features: string[];
  popular?: boolean;
}

export default function PricingPage() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const membershipPlans: Plan[] = [
    {
      name: 'Basic',
      icon: '📱',
      price: 0,
      period: 'Free Forever',
      gradient: 'from-gray-400 to-gray-600',
      features: [
        'AI hired As Jyotish chart',
        'Basic horoscope reading',
        'Daily predictions',
        'Limited chat messages'
      ]
    },
    {
      name: 'Silver',
      icon: '⚪',
      price: 299,
      period: 'per month',
      gradient: 'from-gray-300 to-gray-500',
      features: [
        'AI hired As Jyotish chart',
        'NotReal Kundli insight',
        'Unlimited chat access',
        'Weekly detailed reports',
        'Priority support'
      ]
    },
    {
      name: 'Gold',
      icon: '👑',
      price: 599,
      period: 'per month',
      gradient: 'from-yellow-400 to-amber-600',
      popular: true,
      features: [
        'All Silver features',
        'NotReal Kundli insight',
        'High Tellum Business',
        'Personal AI astrologer',
        'Video consultations',
        'Remedies & solutions'
      ]
    },
    {
      name: 'Premium',
      icon: '💎',
      price: 999,
      period: 'per month',
      gradient: 'from-purple-500 to-pink-600',
      features: [
        'All Gold features',
        'Unlimited everything',
        '24/7 expert support',
        'Personalized reports',
        'Marriage matching',
        'Career guidance',
        'Health predictions'
      ]
    }
  ];

  const monetizationOptions = [
    {
      category: 'Jyotish Memberships',
      gradient: 'from-blue-500 to-indigo-600',
      options: [
        'AI-powered Jyotish predictions',
        'Personalized Kundli insights',
        'Premium astrology services'
      ]
    },
    {
      category: 'Premium Features',
      gradient: 'from-green-500 to-emerald-600',
      options: [
        'Expert consultations',
        'Google AdSense integration',
        'Advanced analytics dashboard'
      ]
    }
  ];

  const googleAdsOptions = [
    {
      name: 'Display Ads',
      description: 'Banner ads throughout the platform',
      revenue: '₹5-15 per 1000 views'
    },
    {
      name: 'In-Feed Ads',
      description: 'Native ads in content feed',
      revenue: '₹10-25 per 1000 views'
    },
    {
      name: 'Anchor Ads',
      description: 'Bottom sticky ads',
      revenue: '₹8-20 per 1000 views'
    }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Mystical Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-black via-gray-900 to-green-900/30">
        <div className="absolute inset-0 opacity-20">
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
              }}
            />
          ))}
        </div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="p-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Link href="/jyotish" className="flex items-center space-x-3">
              <img 
                src="/uploads/jyotish-logo.png" 
                alt="8rupiya AI Jyotish Platform" 
                className="h-12 md:h-14 w-auto drop-shadow-lg hover:drop-shadow-2xl transition-all" 
              />
            </Link>
            <nav className="hidden md:flex space-x-6 text-gray-300">
              <Link href="/" className="hover:text-yellow-400 transition-colors">Home</Link>
              <Link href="/jyotish/kundli" className="hover:text-yellow-400 transition-colors">Kundli</Link>
              <Link href="/jyotish/marketplace" className="hover:text-yellow-400 transition-colors">Mulhurat</Link>
              <Link href="/jyotish/pricing" className="text-yellow-400">Dashboard</Link>
            </nav>
            <button className="px-6 py-2 bg-gradient-to-r from-yellow-500 to-amber-600 text-black font-bold rounded-full hover:shadow-lg transition-all">
              Try Now
            </button>
          </div>
        </header>

        <div className="px-4 py-12">
          <div className="max-w-7xl mx-auto">
            {/* Page Title */}
            <motion.div
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 bg-clip-text text-transparent">
                Monetize your properties
              </h1>
              <p className="text-xl text-gray-300">
                Choose the perfect plan for your spiritual journey
              </p>
            </motion.div>

            {/* Membership Plans */}
            <div className="mb-20">
              <h2 className="text-3xl font-bold text-yellow-400 text-center mb-10">
                Jyotish Membership Plans
              </h2>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {membershipPlans.map((plan, index) => (
                  <motion.div
                    key={plan.name}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className={`relative overflow-hidden rounded-3xl p-1 hover:scale-105 transition-transform duration-300 ${
                      plan.popular ? 'md:scale-110' : ''
                    }`}
                  >
                    {/* Popular Badge */}
                    {plan.popular && (
                      <div className="absolute -top-2 -right-2 z-20">
                        <div className="bg-gradient-to-r from-yellow-400 to-amber-600 text-black px-4 py-1 rounded-full text-sm font-bold flex items-center space-x-1 shadow-lg">
                          <FaCrown />
                          <span>Popular</span>
                        </div>
                      </div>
                    )}

                    {/* Glowing Border */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${plan.gradient} opacity-75`} />
                    
                    {/* Card Content */}
                    <div className="relative bg-gray-900/90 backdrop-blur-xl rounded-3xl p-6 h-full flex flex-col">
                      {/* Plan Header */}
                      <div className="text-center mb-6">
                        <div className="text-5xl mb-3">{plan.icon}</div>
                        <h3 className="text-2xl font-bold text-yellow-400 mb-2">
                          {plan.name}
                        </h3>
                        <div className="mb-4">
                          <span className="text-4xl font-bold text-white">₹{plan.price}</span>
                          <span className="text-gray-400 text-sm ml-2">/ {plan.period}</span>
                        </div>
                      </div>

                      {/* Features */}
                      <div className="flex-1 space-y-3 mb-6">
                        {plan.features.map((feature, i) => (
                          <div key={i} className="flex items-start space-x-2">
                            <FaCheckCircle className="text-green-400 mt-1 flex-shrink-0" />
                            <span className="text-gray-300 text-sm">{feature}</span>
                          </div>
                        ))}
                      </div>

                      {/* CTA Button */}
                      <button
                        onClick={() => setSelectedPlan(plan.name)}
                        className={`w-full py-3 rounded-full font-bold transition-all ${
                          plan.popular
                            ? 'bg-gradient-to-r from-yellow-500 to-amber-600 text-black hover:shadow-2xl hover:shadow-yellow-500/50'
                            : 'bg-gray-800 border-2 border-yellow-500 text-yellow-400 hover:bg-gray-700'
                        }`}
                      >
                        {plan.price === 0 ? 'Get Started' : 'Subscribe Now'}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Monetization Options */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mb-20"
            >
              <h2 className="text-3xl font-bold text-yellow-400 text-center mb-10">
                Monetization Opportunities
              </h2>
              
              <div className="grid md:grid-cols-2 gap-8">
                {monetizationOptions.map((option, index) => (
                  <div
                    key={index}
                    className="relative overflow-hidden rounded-3xl p-1"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${option.gradient} opacity-75`} />
                    <div className="relative bg-gray-900/90 backdrop-blur-xl rounded-3xl p-8">
                      <h3 className="text-2xl font-bold text-yellow-400 mb-6 flex items-center">
                        <FaRocket className="mr-3" />
                        {option.category}
                      </h3>
                      <ul className="space-y-3">
                        {option.options.map((item, i) => (
                          <li key={i} className="flex items-center space-x-3">
                            <FaCheckCircle className="text-green-400" />
                            <span className="text-gray-300">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Google AdSense Section */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="mb-12"
            >
              <div className="relative overflow-hidden rounded-3xl p-1">
                <div className="absolute inset-0 bg-gradient-to-br from-red-500 via-orange-500 to-yellow-500 opacity-75" />
                <div className="relative bg-gray-900/90 backdrop-blur-xl rounded-3xl p-8">
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-yellow-400 mb-2 flex items-center justify-center">
                      <FaDollarSign className="mr-2" />
                      Google AdSense Integration
                    </h2>
                    <p className="text-gray-300">Maximize your revenue with strategic ad placements</p>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    {googleAdsOptions.map((ad, index) => (
                      <div key={index} className="p-6 bg-gray-800/70 rounded-xl border border-yellow-500/30">
                        <h3 className="text-xl font-bold text-yellow-400 mb-2">{ad.name}</h3>
                        <p className="text-gray-300 text-sm mb-4">{ad.description}</p>
                        <div className="p-3 bg-green-500/20 rounded-lg border border-green-500/50">
                          <p className="text-green-400 font-semibold text-center">{ad.revenue}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 text-center">
                    <button className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-full hover:shadow-2xl hover:shadow-green-500/50 transition-all">
                      Enable AdSense →
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Stats Section */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <div className="grid md:grid-cols-3 gap-6 text-center">
                {[
                  { icon: '👥', value: '10,000+', label: 'Active Users' },
                  { icon: '⭐', value: '4.8/5', label: 'User Rating' },
                  { icon: '💰', value: '₹50L+', label: 'Revenue Generated' }
                ].map((stat, index) => (
                  <div
                    key={index}
                    className="relative overflow-hidden rounded-2xl p-1"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-600 opacity-75" />
                    <div className="relative bg-gray-900/90 backdrop-blur-xl rounded-2xl p-6">
                      <div className="text-5xl mb-3">{stat.icon}</div>
                      <div className="text-3xl font-bold text-yellow-400 mb-1">{stat.value}</div>
                      <div className="text-gray-300">{stat.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

