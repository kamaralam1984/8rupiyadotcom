'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';
import { FaSun, FaMoon, FaStar, FaCalendarAlt, FaCalculator, FaHeart } from 'react-icons/fa';

type ToolType = 'horoscope' | 'shudh' | 'numerology' | 'kundli';

export default function ToolsetPage() {
  const [activeTool, setActiveTool] = useState<ToolType>('horoscope');
  const [selectedZodiac, setSelectedZodiac] = useState('aries');
  const [selectedDate, setSelectedDate] = useState('');
  const [luckyNumber, setLuckyNumber] = useState<number | null>(null);

  const zodiacSigns = [
    { name: 'Aries', icon: '♈', hindi: 'मेष' },
    { name: 'Taurus', icon: '♉', hindi: 'वृषभ' },
    { name: 'Gemini', icon: '♊', hindi: 'मिथुन' },
    { name: 'Cancer', icon: '♋', hindi: 'कर्क' },
    { name: 'Leo', icon: '♌', hindi: 'सिंह' },
    { name: 'Virgo', icon: '♍', hindi: 'कन्या' },
    { name: 'Libra', icon: '♎', hindi: 'तुला' },
    { name: 'Scorpio', icon: '♏', hindi: 'वृश्चिक' },
    { name: 'Sagittarius', icon: '♐', hindi: 'धनु' },
    { name: 'Capricorn', icon: '♑', hindi: 'मकर' },
    { name: 'Aquarius', icon: '♒', hindi: 'कुंभ' },
    { name: 'Pisces', icon: '♓', hindi: 'मीन' }
  ];

  const tools = [
    {
      id: 'horoscope' as ToolType,
      name: 'HOROSCOPE',
      subtitle: 'Daily Muhurat',
      icon: <FaSun className="text-5xl" />,
      gradient: 'from-orange-400 to-red-600',
      description: 'Daily horoscope predictions'
    },
    {
      id: 'shudh' as ToolType,
      name: 'SHUDH MUHURAT',
      subtitle: 'Auspicious Timing',
      icon: <FaCalendarAlt className="text-5xl" />,
      gradient: 'from-green-400 to-emerald-600',
      description: 'Find auspicious timings'
    },
    {
      id: 'numerology' as ToolType,
      name: 'NUMEROLOGY',
      subtitle: 'Lucky Golden',
      icon: <FaCalculator className="text-5xl" />,
      gradient: 'from-purple-400 to-pink-600',
      description: 'Discover your lucky numbers'
    },
    {
      id: 'kundli' as ToolType,
      name: 'KUNDLI',
      subtitle: 'Match Making',
      icon: <FaHeart className="text-5xl" />,
      gradient: 'from-pink-400 to-red-600',
      description: 'Kundli matching service'
    }
  ];

  const generateLuckyNumber = () => {
    const random = Math.floor(Math.random() * 99) + 1;
    setLuckyNumber(random);
  };

  const horoscopeContent = {
    career: 'आज आपके करियर में नई संभावनाएं बन रही हैं। किसी महत्वपूर्ण बैठक में सफलता मिल सकती है।',
    love: 'प्रेम जीवन में मधुरता आएगी। अपने साथी के साथ समय बिताएं।',
    health: 'स्वास्थ्य अच्छा रहेगा। योग और ध्यान करें।',
    finance: 'वित्तीय स्थिति में सुधार होगा। निवेश के अवसर मिल सकते हैं।',
    lucky: '7, 14, 21'
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Mystical Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-black via-purple-950 to-black">
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
              <Link href="/jyotish/marketplace" className="hover:text-yellow-400 transition-colors">Mulhurat</Link>
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
                AI JYOTISH TOOLSET
              </h1>
              <p className="text-xl text-gray-300">
                Complete astrology tools for your daily guidance
              </p>
            </motion.div>

            {/* Tool Selection */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
              {tools.map((tool, index) => (
                <motion.button
                  key={tool.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  onClick={() => setActiveTool(tool.id)}
                  className={`relative overflow-hidden rounded-2xl p-1 transition-all ${
                    activeTool === tool.id ? 'scale-105' : 'hover:scale-105'
                  }`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${tool.gradient} ${
                    activeTool === tool.id ? 'opacity-100' : 'opacity-60'
                  }`} />
                  <div className="relative bg-gray-900/90 backdrop-blur-xl rounded-2xl p-6">
                    <div className="text-white mb-3">{tool.icon}</div>
                    <h3 className="text-lg font-bold text-yellow-400 mb-1">
                      {tool.name}
                    </h3>
                    <p className="text-gray-400 text-sm">{tool.subtitle}</p>
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Tool Content */}
            <motion.div
              key={activeTool}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="relative overflow-hidden rounded-3xl p-1"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${tools.find(t => t.id === activeTool)?.gradient} opacity-75`} />
              <div className="relative bg-gray-900/90 backdrop-blur-xl rounded-3xl p-8">
                {/* Horoscope Tool */}
                {activeTool === 'horoscope' && (
                  <div>
                    <h2 className="text-3xl font-bold text-yellow-400 mb-6 text-center">
                      Daily Horoscope
                    </h2>
                    
                    {/* Zodiac Selection */}
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mb-8">
                      {zodiacSigns.map((sign) => (
                        <button
                          key={sign.name}
                          onClick={() => setSelectedZodiac(sign.name.toLowerCase())}
                          className={`p-4 rounded-xl transition-all ${
                            selectedZodiac === sign.name.toLowerCase()
                              ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/50'
                              : 'bg-gray-800/70 text-white hover:bg-gray-700/70'
                          }`}
                        >
                          <div className="text-3xl mb-2">{sign.icon}</div>
                          <div className="text-xs font-semibold">{sign.hindi}</div>
                        </button>
                      ))}
                    </div>

                    {/* Horoscope Content */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="p-4 bg-gray-800/50 rounded-xl">
                          <div className="flex items-center mb-2">
                            <FaSun className="text-yellow-400 mr-2" />
                            <h3 className="text-xl font-semibold text-yellow-400">Career</h3>
                          </div>
                          <p className="text-gray-300">{horoscopeContent.career}</p>
                        </div>
                        
                        <div className="p-4 bg-gray-800/50 rounded-xl">
                          <div className="flex items-center mb-2">
                            <FaHeart className="text-pink-400 mr-2" />
                            <h3 className="text-xl font-semibold text-yellow-400">Love</h3>
                          </div>
                          <p className="text-gray-300">{horoscopeContent.love}</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="p-4 bg-gray-800/50 rounded-xl">
                          <div className="flex items-center mb-2">
                            <FaStar className="text-green-400 mr-2" />
                            <h3 className="text-xl font-semibold text-yellow-400">Health</h3>
                          </div>
                          <p className="text-gray-300">{horoscopeContent.health}</p>
                        </div>
                        
                        <div className="p-4 bg-gray-800/50 rounded-xl">
                          <div className="flex items-center mb-2">
                            <FaCalculator className="text-blue-400 mr-2" />
                            <h3 className="text-xl font-semibold text-yellow-400">Finance</h3>
                          </div>
                          <p className="text-gray-300">{horoscopeContent.finance}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 text-center p-4 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 rounded-xl border border-yellow-500/50">
                      <p className="text-yellow-400 font-semibold mb-2">Lucky Numbers</p>
                      <p className="text-2xl text-white font-bold">{horoscopeContent.lucky}</p>
                    </div>
                  </div>
                )}

                {/* Shudh Muhurat Tool */}
                {activeTool === 'shudh' && (
                  <div>
                    <h2 className="text-3xl font-bold text-yellow-400 mb-6 text-center">
                      Shudh Muhurat - Auspicious Timings
                    </h2>
                    
                    <div className="max-w-2xl mx-auto space-y-6">
                      <div className="p-6 bg-gray-800/50 rounded-xl">
                        <h3 className="text-xl font-semibold text-yellow-400 mb-4">Select Event Type</h3>
                        <div className="grid grid-cols-2 gap-4">
                          {['Marriage', 'Business', 'Travel', 'Property'].map((event) => (
                            <button
                              key={event}
                              className="p-4 bg-gray-700/70 hover:bg-green-600/70 rounded-xl text-white font-semibold transition-all"
                            >
                              {event}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="p-6 bg-gray-800/50 rounded-xl">
                        <h3 className="text-xl font-semibold text-yellow-400 mb-4">Auspicious Times Today</h3>
                        <div className="space-y-3">
                          {[
                            { time: '06:00 AM - 07:30 AM', event: 'Morning Prayers' },
                            { time: '10:00 AM - 12:00 PM', event: 'Business Meetings' },
                            { time: '02:00 PM - 03:30 PM', event: 'Important Decisions' },
                            { time: '05:00 PM - 06:30 PM', event: 'Evening Prayers' }
                          ].map((item, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                              <span className="text-white font-semibold">{item.time}</span>
                              <span className="text-green-400">{item.event}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Numerology Tool */}
                {activeTool === 'numerology' && (
                  <div>
                    <h2 className="text-3xl font-bold text-yellow-400 mb-6 text-center">
                      Numerology - Lucky Numbers
                    </h2>
                    
                    <div className="max-w-2xl mx-auto space-y-6">
                      <div className="p-8 bg-gray-800/50 rounded-xl text-center">
                        <p className="text-gray-300 mb-6">
                          Click the button to discover your lucky number for today
                        </p>
                        
                        {luckyNumber && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="mb-6"
                          >
                            <div className="inline-block p-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full shadow-2xl">
                              <span className="text-6xl font-bold text-white">{luckyNumber}</span>
                            </div>
                            <p className="mt-4 text-yellow-400 font-semibold">Your Lucky Number!</p>
                          </motion.div>
                        )}
                        
                        <button
                          onClick={generateLuckyNumber}
                          className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold rounded-full hover:shadow-2xl hover:shadow-purple-500/50 transition-all"
                        >
                          Generate Lucky Number
                        </button>
                      </div>

                      <div className="grid md:grid-cols-3 gap-4">
                        {['Birth Number', 'Life Path Number', 'Destiny Number', 'Soul Number'].map((feature, i) => (
                          <div key={i} className="p-4 bg-gray-800/50 rounded-xl text-center">
                            <div className="text-3xl mb-2">✨</div>
                            <p className="text-gray-300 text-sm">{feature}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Kundli Matching Tool */}
                {activeTool === 'kundli' && (
                  <div>
                    <h2 className="text-3xl font-bold text-yellow-400 mb-6 text-center">
                      Kundli Match Making
                    </h2>
                    
                    <div className="max-w-3xl mx-auto">
                      <div className="grid md:grid-cols-2 gap-6 mb-6">
                        <div className="p-6 bg-gray-800/50 rounded-xl">
                          <h3 className="text-xl font-semibold text-yellow-400 mb-4">Boy's Details</h3>
                          <div className="space-y-3">
                            <input
                              type="text"
                              placeholder="Name"
                              className="w-full px-4 py-3 bg-gray-700/70 border border-yellow-500/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500"
                            />
                            <input
                              type="date"
                              className="w-full px-4 py-3 bg-gray-700/70 border border-yellow-500/30 rounded-xl text-white focus:outline-none focus:border-yellow-500"
                            />
                            <input
                              type="time"
                              className="w-full px-4 py-3 bg-gray-700/70 border border-yellow-500/30 rounded-xl text-white focus:outline-none focus:border-yellow-500"
                            />
                          </div>
                        </div>

                        <div className="p-6 bg-gray-800/50 rounded-xl">
                          <h3 className="text-xl font-semibold text-yellow-400 mb-4">Girl's Details</h3>
                          <div className="space-y-3">
                            <input
                              type="text"
                              placeholder="Name"
                              className="w-full px-4 py-3 bg-gray-700/70 border border-yellow-500/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500"
                            />
                            <input
                              type="date"
                              className="w-full px-4 py-3 bg-gray-700/70 border border-yellow-500/30 rounded-xl text-white focus:outline-none focus:border-yellow-500"
                            />
                            <input
                              type="time"
                              className="w-full px-4 py-3 bg-gray-700/70 border border-yellow-500/30 rounded-xl text-white focus:outline-none focus:border-yellow-500"
                            />
                          </div>
                        </div>
                      </div>

                      <button className="w-full py-4 bg-gradient-to-r from-pink-500 to-red-600 text-white font-bold text-xl rounded-full hover:shadow-2xl hover:shadow-pink-500/50 transition-all">
                        Check Compatibility
                      </button>

                      <div className="mt-6 p-6 bg-gradient-to-r from-pink-500/20 to-red-500/20 rounded-xl border border-pink-500/50">
                        <p className="text-center text-gray-300">
                          🔮 Get detailed compatibility report with Gun Milan score
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

