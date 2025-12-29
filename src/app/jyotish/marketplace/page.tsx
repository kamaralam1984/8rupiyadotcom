'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';
import { FaStar, FaPhone, FaVideo, FaMapMarkerAlt, FaCheckCircle, FaCrown } from 'react-icons/fa';

interface Pandit {
  id: string;
  name: string;
  image: string;
  expertise: string;
  experience: string;
  rating: number;
  reviews: number;
  price: number;
  plan: 'free' | 'silver' | 'gold' | 'premium';
  languages: string[];
  available: boolean;
  specialties: string[];
}

export default function MarketplacePage() {
  const [selectedPlan, setSelectedPlan] = useState<'all' | 'free' | 'silver' | 'gold' | 'premium'>('all');

  const pandits: Pandit[] = [
    {
      id: '1',
      name: 'Pandit Sharma',
      image: '/uploads/1766899784969-8znx9htxrro.jpg',
      expertise: 'Praincope, AI Rassa',
      experience: '15+ years',
      rating: 4.8,
      reviews: 892,
      price: 0,
      plan: 'gold',
      languages: ['Hindi', 'English'],
      available: true,
      specialties: ['Marriage', 'Career', 'Health']
    },
    {
      id: '2',
      name: 'Acharya Tiwari',
      image: '/uploads/1766901937078-0k7zudp6076k.jpg',
      expertise: 'Pterrocope, AI Rassa',
      experience: '20+ years',
      rating: 4.9,
      reviews: 1243,
      price: 0,
      plan: 'premium',
      languages: ['Hindi', 'Sanskrit'],
      available: true,
      specialties: ['Vedic', 'Kundli', 'Remedies']
    },
    {
      id: '3',
      name: 'Pandit Prosed',
      image: '/uploads/1766908648869-idhepl239x.jpg',
      expertise: 'Pterrocope, AI Raan',
      experience: '12+ years',
      rating: 4.7,
      reviews: 654,
      price: 0,
      plan: 'silver',
      languages: ['Hindi', 'Marathi'],
      available: false,
      specialties: ['Business', 'Finance', 'Property']
    }
  ];

  const planColors = {
    free: 'from-gray-400 to-gray-600',
    silver: 'from-gray-300 to-gray-500',
    gold: 'from-yellow-400 to-amber-600',
    premium: 'from-purple-500 to-pink-600'
  };

  const planIcons = {
    free: '📱',
    silver: '⚪',
    gold: '👑',
    premium: '💎'
  };

  const filteredPandits = selectedPlan === 'all' 
    ? pandits 
    : pandits.filter(p => p.plan === selectedPlan);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Mystical Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-black via-gray-900 to-green-900/20">
        <div className="absolute inset-0 opacity-20">
          {[...Array(40)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-yellow-300 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                opacity: [0.2, 1, 0.2],
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
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-amber-400 to-orange-600 flex items-center justify-center">
                <img src="/logo.png" alt="8rupiya" className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-yellow-400">8rupiya</h1>
              </div>
            </Link>
            <nav className="hidden md:flex space-x-6 text-gray-300">
              <Link href="/" className="hover:text-yellow-400 transition-colors">Home</Link>
              <Link href="/jyotish/kundli" className="hover:text-yellow-400 transition-colors">Kundli</Link>
              <Link href="/jyotish/marketplace" className="text-yellow-400">Mulhurat</Link>
              <Link href="/jyotish/pricing" className="hover:text-yellow-400 transition-colors">Dashboard</Link>
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
              className="text-center mb-12"
            >
              <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 bg-clip-text text-transparent">
                PANDIT MARKETPLACE
              </h1>
              <p className="text-xl text-gray-300 mb-2">
                Book expert astrologers, online or near you
              </p>
              <p className="text-lg text-gray-400">
                Free / Silver / Gold / Premium plans
              </p>
            </motion.div>

            {/* Plan Filter */}
            <div className="mb-8 flex flex-wrap justify-center gap-4">
              {['all', 'free', 'silver', 'gold', 'premium'].map((plan) => (
                <button
                  key={plan}
                  onClick={() => setSelectedPlan(plan as any)}
                  className={`px-6 py-3 rounded-full font-semibold transition-all ${
                    selectedPlan === plan
                      ? 'bg-gradient-to-r from-yellow-500 to-amber-600 text-black shadow-lg'
                      : 'bg-gray-800/70 border border-yellow-500/30 text-gray-300 hover:border-yellow-500'
                  }`}
                >
                  {plan !== 'all' && <span className="mr-2">{planIcons[plan as keyof typeof planIcons]}</span>}
                  {plan.charAt(0).toUpperCase() + plan.slice(1)}
                </button>
              ))}
            </div>

            {/* Pandit Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPandits.map((pandit, index) => (
                <motion.div
                  key={pandit.id}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="group relative overflow-hidden rounded-3xl p-1 hover:scale-105 transition-transform duration-300"
                >
                  {/* Glowing Border */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${planColors[pandit.plan]} opacity-75 group-hover:opacity-100 transition-opacity`} />
                  
                  {/* Card Content */}
                  <div className="relative bg-gray-900/90 backdrop-blur-xl rounded-3xl overflow-hidden">
                    {/* Plan Badge */}
                    <div className="absolute top-4 right-4 z-10">
                      <div className={`px-4 py-2 rounded-full bg-gradient-to-r ${planColors[pandit.plan]} flex items-center space-x-2 shadow-lg`}>
                        <span className="text-xl">{planIcons[pandit.plan]}</span>
                        <span className="text-white font-bold text-sm uppercase">{pandit.plan}</span>
                      </div>
                    </div>

                    {/* Pandit Image */}
                    <div className="relative h-64 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent z-10" />
                      <img
                        src={pandit.image}
                        alt={pandit.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = '/logo.png';
                        }}
                      />
                      
                      {/* Availability Badge */}
                      <div className="absolute bottom-4 left-4 z-20">
                        <div className={`px-4 py-2 rounded-full flex items-center space-x-2 ${
                          pandit.available
                            ? 'bg-green-500/90'
                            : 'bg-gray-700/90'
                        }`}>
                          <span className={`w-2 h-2 rounded-full ${
                            pandit.available ? 'bg-white animate-pulse' : 'bg-gray-400'
                          }`} />
                          <span className="text-white text-sm font-semibold">
                            {pandit.available ? 'Available' : 'Offline'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Pandit Info */}
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-2xl font-bold text-yellow-400 mb-1">
                            {pandit.name}
                          </h3>
                          <p className="text-gray-400 text-sm">{pandit.expertise}</p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-1 mb-1">
                            <FaStar className="text-yellow-400" />
                            <span className="text-white font-bold">{pandit.rating}</span>
                          </div>
                          <p className="text-gray-400 text-xs">{pandit.reviews} reviews</p>
                        </div>
                      </div>

                      {/* Experience */}
                      <div className="flex items-center text-gray-300 mb-3">
                        <FaCheckCircle className="text-green-400 mr-2" />
                        <span>{pandit.experience} experience</span>
                      </div>

                      {/* Specialties */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {pandit.specialties.map((specialty, i) => (
                          <span
                            key={i}
                            className="px-3 py-1 bg-gray-800/70 border border-yellow-500/30 rounded-full text-xs text-gray-300"
                          >
                            {specialty}
                          </span>
                        ))}
                      </div>

                      {/* Languages */}
                      <div className="mb-4 text-sm text-gray-400">
                        🗣️ {pandit.languages.join(', ')}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3">
                        <button
                          disabled={!pandit.available}
                          className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-green-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                        >
                          <FaPhone />
                          <span>Call</span>
                        </button>
                        <button
                          disabled={!pandit.available}
                          className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-blue-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                        >
                          <FaVideo />
                          <span>Video</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Generate Kundli CTA */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-16 text-center"
            >
              <div className="relative overflow-hidden rounded-3xl p-1 inline-block">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-amber-600 opacity-75" />
                <div className="relative bg-gray-900/90 backdrop-blur-xl rounded-3xl px-12 py-8">
                  <h3 className="text-3xl font-bold text-yellow-400 mb-4">
                    Generate Kundli
                  </h3>
                  <Link href="/jyotish/kundli">
                    <button className="px-10 py-4 bg-gradient-to-r from-yellow-500 to-amber-600 text-black font-bold text-xl rounded-full hover:shadow-2xl hover:shadow-yellow-500/50 transition-all">
                      Create Your Kundli Now →
                    </button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

