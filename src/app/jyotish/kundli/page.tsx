'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';
import { FaDownload, FaStar, FaMoon, FaSun, FaHome } from 'react-icons/fa';

interface KundliForm {
  name: string;
  dob: string;
  time: string;
  place: string;
  gender: 'male' | 'female';
}

export default function KundliPage() {
  const [formData, setFormData] = useState<KundliForm>({
    name: '',
    dob: '',
    time: '',
    place: '',
    gender: 'male'
  });
  const [showKundli, setShowKundli] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    
    setTimeout(() => {
      setIsGenerating(false);
      setShowKundli(true);
    }, 2000);
  };

  const handleDownloadPDF = () => {
    // PDF download logic would go here
    alert('कुंडली PDF डाउनलोड हो रही है...');
  };

  const planets = [
    { name: 'Sun', icon: '☀️', position: 'Aries', degree: '15°23\'', house: 1 },
    { name: 'Moon', icon: '🌙', position: 'Taurus', degree: '23°45\'', house: 2 },
    { name: 'Mars', icon: '♂️', position: 'Leo', degree: '8°12\'', house: 5 },
    { name: 'Mercury', icon: '☿', position: 'Gemini', degree: '19°56\'', house: 3 },
    { name: 'Jupiter', icon: '♃', position: 'Sagittarius', degree: '27°34\'', house: 9 },
    { name: 'Venus', icon: '♀', position: 'Libra', degree: '14°28\'', house: 7 },
    { name: 'Saturn', icon: '♄', position: 'Capricorn', degree: '5°18\'', house: 10 }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Mystical Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-black via-indigo-950 to-black">
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
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 2 + Math.random() * 3,
                repeat: Infinity,
              }}
            />
          ))}
        </div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="p-6">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <Link href="/jyotish" className="flex items-center space-x-3">
              <img 
                src="/uploads/jyotish-logo.png" 
                alt="8rupiya AI Jyotish Platform" 
                className="h-12 md:h-14 w-auto drop-shadow-lg hover:drop-shadow-2xl transition-all" 
              />
            </Link>
            <nav className="hidden md:flex space-x-6 text-gray-300">
              <Link href="/" className="hover:text-yellow-400 transition-colors">Home</Link>
              <Link href="/jyotish/kundli" className="text-yellow-400">Kundli</Link>
              <Link href="/jyotish/marketplace" className="hover:text-yellow-400 transition-colors">Mulhurat</Link>
              <Link href="/jyotish/pricing" className="hover:text-yellow-400 transition-colors">Dashboard</Link>
            </nav>
            <button className="px-6 py-2 bg-gradient-to-r from-yellow-500 to-amber-600 text-black font-bold rounded-full hover:shadow-lg transition-all">
              Try Now
            </button>
          </div>
        </header>

        <div className="px-4 py-12">
          <div className="max-w-6xl mx-auto">
            {!showKundli ? (
              /* Kundli Form */
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="max-w-2xl mx-auto"
              >
                <div className="text-center mb-12">
                  <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 bg-clip-text text-transparent">
                    KUNDLI GENERATOR
                  </h1>
                  <p className="text-xl text-gray-300">
                    • Enter name, dob, time, place
                  </p>
                  <p className="text-lg text-gray-400">
                    • Generate & download Kundli chart
                  </p>
                </div>

                <div className="relative overflow-hidden rounded-3xl p-1">
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-purple-600 opacity-75" />
                  <div className="relative bg-gray-900/90 backdrop-blur-xl rounded-3xl p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Name */}
                      <div>
                        <label className="block text-yellow-400 font-semibold mb-2">
                          Name / नाम
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                          className="w-full px-4 py-3 bg-gray-800/70 border border-yellow-500/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/50"
                          placeholder="Enter your name"
                        />
                      </div>

                      {/* Date of Birth */}
                      <div>
                        <label className="block text-yellow-400 font-semibold mb-2">
                          Date of Birth / जन्म तिथि
                        </label>
                        <input
                          type="date"
                          value={formData.dob}
                          onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                          required
                          className="w-full px-4 py-3 bg-gray-800/70 border border-yellow-500/30 rounded-xl text-white focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/50"
                        />
                      </div>

                      {/* Time */}
                      <div>
                        <label className="block text-yellow-400 font-semibold mb-2">
                          Time / समय
                        </label>
                        <input
                          type="time"
                          value={formData.time}
                          onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                          required
                          className="w-full px-4 py-3 bg-gray-800/70 border border-yellow-500/30 rounded-xl text-white focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/50"
                        />
                      </div>

                      {/* Place */}
                      <div>
                        <label className="block text-yellow-400 font-semibold mb-2">
                          Place of Birth / जन्म स्थान
                        </label>
                        <input
                          type="text"
                          value={formData.place}
                          onChange={(e) => setFormData({ ...formData, place: e.target.value })}
                          required
                          className="w-full px-4 py-3 bg-gray-800/70 border border-yellow-500/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/50"
                          placeholder="City, State, Country"
                        />
                      </div>

                      {/* Gender */}
                      <div>
                        <label className="block text-yellow-400 font-semibold mb-2">
                          Gender / लिंग
                        </label>
                        <div className="flex space-x-4">
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, gender: 'male' })}
                            className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                              formData.gender === 'male'
                                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                                : 'bg-gray-800/70 border border-yellow-500/30 text-gray-400'
                            }`}
                          >
                            Male / पुरुष
                          </button>
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, gender: 'female' })}
                            className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                              formData.gender === 'female'
                                ? 'bg-gradient-to-r from-pink-500 to-pink-600 text-white'
                                : 'bg-gray-800/70 border border-yellow-500/30 text-gray-400'
                            }`}
                          >
                            Female / महिला
                          </button>
                        </div>
                      </div>

                      {/* Submit Button */}
                      <button
                        type="submit"
                        disabled={isGenerating}
                        className="w-full py-4 bg-gradient-to-r from-yellow-500 to-amber-600 text-black font-bold text-xl rounded-full hover:shadow-2xl hover:shadow-yellow-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isGenerating ? (
                          <span className="flex items-center justify-center">
                            <svg className="animate-spin h-6 w-6 mr-3" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Generating Kundli...
                          </span>
                        ) : (
                          'Generate Kundli'
                        )}
                      </button>
                    </form>
                  </div>
                </div>
              </motion.div>
            ) : (
              /* Kundli Display */
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
              >
                <div className="text-center mb-8">
                  <h2 className="text-4xl font-bold text-yellow-400 mb-2">
                    {formData.name}'s Kundli
                  </h2>
                  <p className="text-gray-300">
                    {formData.dob} • {formData.time} • {formData.place}
                  </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-8 mb-8">
                  {/* Kundli Chart */}
                  <div className="relative overflow-hidden rounded-3xl p-1">
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-purple-600 opacity-75" />
                    <div className="relative bg-gray-900/90 backdrop-blur-xl rounded-3xl p-8">
                      <h3 className="text-2xl font-bold text-yellow-400 mb-6 text-center">
                        Kundli Chart
                      </h3>
                      
                      {/* Diamond Chart */}
                      <div className="relative w-full aspect-square max-w-md mx-auto">
                        {/* Center Diamond */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="relative w-3/4 h-3/4 rotate-45">
                            <div className="absolute inset-0 border-4 border-yellow-500 bg-gradient-to-br from-amber-900/50 to-purple-900/50">
                              {/* Grid Lines */}
                              <div className="absolute top-1/2 left-0 right-0 border-t-2 border-yellow-500/50" />
                              <div className="absolute top-0 bottom-0 left-1/2 border-l-2 border-yellow-500/50" />
                              
                              {/* Houses */}
                              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-45">
                                <div className="text-center">
                                  <div className="text-2xl">♈</div>
                                  <div className="text-xs text-yellow-400">1st</div>
                                </div>
                              </div>
                              
                              <div className="absolute top-1/4 right-0 translate-x-1/2 -rotate-45">
                                <div className="text-center">
                                  <div className="text-2xl">♉</div>
                                  <div className="text-xs text-yellow-400">2nd</div>
                                </div>
                              </div>
                              
                              <div className="absolute bottom-1/4 right-0 translate-x-1/2 -rotate-45">
                                <div className="text-center">
                                  <div className="text-2xl">♊</div>
                                  <div className="text-xs text-yellow-400">3rd</div>
                                </div>
                              </div>
                              
                              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 -rotate-45">
                                <div className="text-center">
                                  <div className="text-2xl">♋</div>
                                  <div className="text-xs text-yellow-400">4th</div>
                                </div>
                              </div>

                              <div className="absolute bottom-1/4 left-0 -translate-x-1/2 -rotate-45">
                                <div className="text-center">
                                  <div className="text-2xl">♌</div>
                                  <div className="text-xs text-yellow-400">5th</div>
                                </div>
                              </div>

                              <div className="absolute top-1/4 left-0 -translate-x-1/2 -rotate-45">
                                <div className="text-center">
                                  <div className="text-2xl">♍</div>
                                  <div className="text-xs text-yellow-400">6th</div>
                                </div>
                              </div>

                              {/* Center */}
                              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-45">
                                <div className="text-3xl">🕉️</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Planet Positions */}
                  <div className="relative overflow-hidden rounded-3xl p-1">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-pink-600 opacity-75" />
                    <div className="relative bg-gray-900/90 backdrop-blur-xl rounded-3xl p-8">
                      <h3 className="text-2xl font-bold text-yellow-400 mb-6">
                        Planet Positions
                      </h3>
                      
                      <div className="space-y-3">
                        {planets.map((planet, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-center justify-between p-3 bg-gray-800/50 rounded-xl border border-yellow-500/20"
                          >
                            <div className="flex items-center space-x-3">
                              <span className="text-3xl">{planet.icon}</span>
                              <div>
                                <div className="text-white font-semibold">{planet.name}</div>
                                <div className="text-gray-400 text-sm">{planet.position}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-yellow-400 font-mono">{planet.degree}</div>
                              <div className="text-gray-400 text-sm">House {planet.house}</div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap justify-center gap-4">
                  <button
                    onClick={handleDownloadPDF}
                    className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-full hover:shadow-2xl hover:shadow-green-500/50 transition-all flex items-center space-x-2"
                  >
                    <FaDownload />
                    <span>Download Kundli PDF</span>
                  </button>
                  <button
                    onClick={() => setShowKundli(false)}
                    className="px-8 py-4 bg-gray-800 border-2 border-yellow-500 text-yellow-400 font-bold rounded-full hover:bg-gray-700 transition-all"
                  >
                    Generate New Kundli
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

