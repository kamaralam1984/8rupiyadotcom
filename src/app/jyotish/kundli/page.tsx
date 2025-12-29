'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { FaDownload, FaStar, FaMoon, FaSun, FaHome } from 'react-icons/fa';
import { calculateKundli, generateInsights, type CalculatedKundli } from '@/utils/kundliCalculations';

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
  const [mounted, setMounted] = useState(false);
  const [calculatedKundli, setCalculatedKundli] = useState<CalculatedKundli | null>(null);
  const [insights, setInsights] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      alert('कृपया नाम दर्ज करें / Please enter name');
      return;
    }
    
    if (!formData.dob) {
      alert('कृपया जन्म तिथि चुनें / Please select date of birth');
      return;
    }
    
    if (!formData.time) {
      alert('कृपया जन्म समय चुनें / Please select birth time');
      return;
    }
    
    if (!formData.place.trim()) {
      alert('कृपया जन्म स्थान दर्ज करें / Please enter birth place');
      return;
    }
    
    setIsGenerating(true);
    
    // Calculate Kundli
    setTimeout(() => {
      const kundliData = calculateKundli(formData);
      const generatedInsights = generateInsights(kundliData);
      
      setCalculatedKundli(kundliData);
      setInsights(generatedInsights);
      setIsGenerating(false);
      setShowKundli(true);
    }, 2000);
  };

  const handleDownloadPDF = () => {
    // PDF download logic would go here
    const name = formData.name || 'Kundli';
    alert(`${name} की कुंडली PDF डाउनलोड हो रही है... / Downloading ${name}'s Kundli PDF...`);
  };

  const zodiacSigns = [
    { sign: '♈', name: 'Aries', hindi: 'मेष' },
    { sign: '♉', name: 'Taurus', hindi: 'वृषभ' },
    { sign: '♊', name: 'Gemini', hindi: 'मिथुन' },
    { sign: '♋', name: 'Cancer', hindi: 'कर्क' },
    { sign: '♌', name: 'Leo', hindi: 'सिंह' },
    { sign: '♍', name: 'Virgo', hindi: 'कन्या' },
    { sign: '♎', name: 'Libra', hindi: 'तुला' },
    { sign: '♏', name: 'Scorpio', hindi: 'वृश्चिक' },
    { sign: '♐', name: 'Sagittarius', hindi: 'धनु' },
    { sign: '♑', name: 'Capricorn', hindi: 'मकर' },
    { sign: '♒', name: 'Aquarius', hindi: 'कुंभ' },
    { sign: '♓', name: 'Pisces', hindi: 'मीन' }
  ];

  // Use calculated data or fallback to default
  const planets = calculatedKundli?.planets || [];
  const houses = calculatedKundli?.houses || [];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Mystical Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-black via-indigo-950 to-black">
        {mounted && (
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
        )}
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
                      
                      {/* Diamond Chart - North Indian Style */}
                      <div className="relative w-full aspect-square max-w-md mx-auto">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="relative w-[85%] h-[85%] rotate-45">
                            {/* Main Diamond Border */}
                            <div className="absolute inset-0 border-4 border-yellow-500 bg-gradient-to-br from-amber-900/40 to-purple-900/40">
                              
                              {/* Inner Grid Lines - Creating 12 Houses */}
                              <div className="absolute top-0 left-0 right-0 bottom-0">
                                {/* Horizontal Lines */}
                                <div className="absolute top-1/4 left-0 right-0 border-t-2 border-yellow-500/40" />
                                <div className="absolute top-1/2 left-0 right-0 border-t-2 border-yellow-500/50" />
                                <div className="absolute top-3/4 left-0 right-0 border-t-2 border-yellow-500/40" />
                                
                                {/* Vertical Lines */}
                                <div className="absolute left-1/4 top-0 bottom-0 border-l-2 border-yellow-500/40" />
                                <div className="absolute left-1/2 top-0 bottom-0 border-l-2 border-yellow-500/50" />
                                <div className="absolute left-3/4 top-0 bottom-0 border-l-2 border-yellow-500/40" />
                              </div>

                              {/* 12 Houses with Zodiac Signs */}
                              {/* House 1 - Top */}
                              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-gray-900/80 px-3 py-2 rounded-lg border border-yellow-500/50">
                                <div className="text-center">
                                  <div className="text-xl">{zodiacSigns[0].sign}</div>
                                  <div className="text-[10px] text-yellow-400">1st</div>
                                  <div className="text-[10px] text-gray-400">{zodiacSigns[0].hindi}</div>
                                </div>
                              </div>

                              {/* House 2 - Top Right */}
                              <div className="absolute top-[12.5%] right-[12.5%] translate-x-1/2 -translate-y-1/2 -rotate-45 bg-gray-900/80 px-2 py-1 rounded-lg border border-yellow-500/30">
                                <div className="text-center">
                                  <div className="text-lg">{zodiacSigns[1].sign}</div>
                                  <div className="text-[9px] text-yellow-400">2nd</div>
                                </div>
                              </div>

                              {/* House 3 - Right Upper */}
                              <div className="absolute top-[37.5%] right-0 translate-x-1/2 -rotate-45 bg-gray-900/80 px-2 py-1 rounded-lg border border-yellow-500/30">
                                <div className="text-center">
                                  <div className="text-lg">{zodiacSigns[2].sign}</div>
                                  <div className="text-[9px] text-yellow-400">3rd</div>
                                </div>
                              </div>

                              {/* House 4 - Right */}
                              <div className="absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 -rotate-45 bg-gray-900/80 px-3 py-2 rounded-lg border border-yellow-500/50">
                                <div className="text-center">
                                  <div className="text-xl">{zodiacSigns[3].sign}</div>
                                  <div className="text-[10px] text-yellow-400">4th</div>
                                  <div className="text-[10px] text-gray-400">{zodiacSigns[3].hindi}</div>
                                </div>
                              </div>

                              {/* House 5 - Right Lower */}
                              <div className="absolute bottom-[37.5%] right-0 translate-x-1/2 -rotate-45 bg-gray-900/80 px-2 py-1 rounded-lg border border-yellow-500/30">
                                <div className="text-center">
                                  <div className="text-lg">{zodiacSigns[4].sign}</div>
                                  <div className="text-[9px] text-yellow-400">5th</div>
                                </div>
                              </div>

                              {/* House 6 - Bottom Right */}
                              <div className="absolute bottom-[12.5%] right-[12.5%] translate-x-1/2 translate-y-1/2 -rotate-45 bg-gray-900/80 px-2 py-1 rounded-lg border border-yellow-500/30">
                                <div className="text-center">
                                  <div className="text-lg">{zodiacSigns[5].sign}</div>
                                  <div className="text-[9px] text-yellow-400">6th</div>
                                </div>
                              </div>

                              {/* House 7 - Bottom */}
                              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 -rotate-45 bg-gray-900/80 px-3 py-2 rounded-lg border border-yellow-500/50">
                                <div className="text-center">
                                  <div className="text-xl">{zodiacSigns[6].sign}</div>
                                  <div className="text-[10px] text-yellow-400">7th</div>
                                  <div className="text-[10px] text-gray-400">{zodiacSigns[6].hindi}</div>
                                </div>
                              </div>

                              {/* House 8 - Bottom Left */}
                              <div className="absolute bottom-[12.5%] left-[12.5%] -translate-x-1/2 translate-y-1/2 -rotate-45 bg-gray-900/80 px-2 py-1 rounded-lg border border-yellow-500/30">
                                <div className="text-center">
                                  <div className="text-lg">{zodiacSigns[7].sign}</div>
                                  <div className="text-[9px] text-yellow-400">8th</div>
                                </div>
                              </div>

                              {/* House 9 - Left Lower */}
                              <div className="absolute bottom-[37.5%] left-0 -translate-x-1/2 -rotate-45 bg-gray-900/80 px-2 py-1 rounded-lg border border-yellow-500/30">
                                <div className="text-center">
                                  <div className="text-lg">{zodiacSigns[8].sign}</div>
                                  <div className="text-[9px] text-yellow-400">9th</div>
                                </div>
                              </div>

                              {/* House 10 - Left */}
                              <div className="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-gray-900/80 px-3 py-2 rounded-lg border border-yellow-500/50">
                                <div className="text-center">
                                  <div className="text-xl">{zodiacSigns[9].sign}</div>
                                  <div className="text-[10px] text-yellow-400">10th</div>
                                  <div className="text-[10px] text-gray-400">{zodiacSigns[9].hindi}</div>
                                </div>
                              </div>

                              {/* House 11 - Left Upper */}
                              <div className="absolute top-[37.5%] left-0 -translate-x-1/2 -rotate-45 bg-gray-900/80 px-2 py-1 rounded-lg border border-yellow-500/30">
                                <div className="text-center">
                                  <div className="text-lg">{zodiacSigns[10].sign}</div>
                                  <div className="text-[9px] text-yellow-400">11th</div>
                                </div>
                              </div>

                              {/* House 12 - Top Left */}
                              <div className="absolute top-[12.5%] left-[12.5%] -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-gray-900/80 px-2 py-1 rounded-lg border border-yellow-500/30">
                                <div className="text-center">
                                  <div className="text-lg">{zodiacSigns[11].sign}</div>
                                  <div className="text-[9px] text-yellow-400">12th</div>
                                </div>
                              </div>

                              {/* Center OM Symbol */}
                              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-45">
                                <div className="text-4xl text-yellow-400 drop-shadow-lg">🕉️</div>
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
                      
                      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                        {planets.map((planet, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-center justify-between p-4 bg-gray-800/70 rounded-xl border border-yellow-500/30 hover:border-yellow-500/60 hover:bg-gray-800/90 transition-all"
                          >
                            <div className="flex items-center space-x-4">
                              <span className="text-4xl">{planet.icon}</span>
                              <div>
                                <div className={`font-bold text-lg ${planet.color}`}>{planet.name}</div>
                                <div className="text-gray-300 text-xs">{planet.hindi}</div>
                                <div className="text-gray-400 text-sm mt-1">{planet.position}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-yellow-400 font-mono text-lg font-bold">{planet.degree}</div>
                              <div className="text-gray-400 text-sm mt-1">House {planet.house}</div>
                              <div className="text-xs text-gray-500 mt-1">{zodiacSigns[planet.house - 1]?.hindi}</div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Kundli Analysis Summary */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  className="mt-8"
                >
                  <div className="relative overflow-hidden rounded-3xl p-1">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-teal-600 opacity-75" />
                    <div className="relative bg-gray-900/90 backdrop-blur-xl rounded-3xl p-8">
                      <h3 className="text-2xl font-bold text-yellow-400 mb-6 text-center">
                        कुंडली विश्लेषण / Kundli Analysis
                      </h3>
                      
                      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        {/* Ascendant */}
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.1 }}
                          className="p-6 bg-gradient-to-br from-green-900/40 to-gray-800/70 rounded-xl border-2 border-green-500/50 hover:border-green-400 hover:shadow-lg hover:shadow-green-500/20 transition-all"
                        >
                          <div className="text-center">
                            <div className="text-5xl mb-3">🌅</div>
                            <h4 className="text-green-400 font-bold mb-3 text-sm">Ascendant / लग्न</h4>
                            <p className="text-white text-2xl font-bold mb-1">{calculatedKundli?.ascendant.name}</p>
                            <p className="text-gray-300 text-base font-semibold">{calculatedKundli?.ascendant.hindi}</p>
                          </div>
                        </motion.div>

                        {/* Moon Sign */}
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.2 }}
                          className="p-6 bg-gradient-to-br from-blue-900/40 to-gray-800/70 rounded-xl border-2 border-blue-500/50 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-500/20 transition-all"
                        >
                          <div className="text-center">
                            <div className="text-5xl mb-3">🌙</div>
                            <h4 className="text-blue-400 font-bold mb-3 text-sm">Moon Sign / चंद्र राशि</h4>
                            <p className="text-white text-2xl font-bold mb-1">{calculatedKundli?.moonSign.name}</p>
                            <p className="text-gray-300 text-base font-semibold">{calculatedKundli?.moonSign.hindi}</p>
                          </div>
                        </motion.div>

                        {/* Sun Sign */}
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.3 }}
                          className="p-6 bg-gradient-to-br from-orange-900/40 to-gray-800/70 rounded-xl border-2 border-orange-500/50 hover:border-orange-400 hover:shadow-lg hover:shadow-orange-500/20 transition-all"
                        >
                          <div className="text-center">
                            <div className="text-5xl mb-3">☀️</div>
                            <h4 className="text-orange-400 font-bold mb-3 text-sm">Sun Sign / सूर्य राशि</h4>
                            <p className="text-white text-2xl font-bold mb-1">{calculatedKundli?.sunSign.name}</p>
                            <p className="text-gray-300 text-base font-semibold">{calculatedKundli?.sunSign.hindi}</p>
                          </div>
                        </motion.div>

                        {/* Nakshatra */}
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.4 }}
                          className="p-6 bg-gradient-to-br from-purple-900/40 to-gray-800/70 rounded-xl border-2 border-purple-500/50 hover:border-purple-400 hover:shadow-lg hover:shadow-purple-500/20 transition-all"
                        >
                          <div className="text-center">
                            <div className="text-5xl mb-3">⭐</div>
                            <h4 className="text-purple-400 font-bold mb-3 text-sm">Nakshatra / नक्षत्र</h4>
                            <p className="text-white text-2xl font-bold mb-1">{calculatedKundli?.nakshatra.name}</p>
                            <p className="text-gray-300 text-base font-semibold">{calculatedKundli?.nakshatra.hindi}</p>
                          </div>
                        </motion.div>
                      </div>

                      {/* Key Insights */}
                      <div className="mt-2 grid md:grid-cols-2 gap-6">
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 }}
                          className="p-6 bg-gradient-to-br from-yellow-900/40 to-amber-900/40 rounded-xl border-2 border-yellow-500/50 hover:border-yellow-400 hover:shadow-lg hover:shadow-yellow-500/20 transition-all"
                        >
                          <h4 className="text-yellow-400 font-bold mb-4 flex items-center text-lg">
                            <span className="mr-2 text-2xl">💫</span>
                            Strengths / शक्तियां
                          </h4>
                          <ul className="text-gray-200 space-y-3">
                            {insights?.strengths.map((strength: string, index: number) => (
                              <li key={index} className="flex items-start">
                                <span className="text-yellow-400 mr-2 mt-1">•</span>
                                <span>{strength}</span>
                              </li>
                            ))}
                          </ul>
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.6 }}
                          className="p-6 bg-gradient-to-br from-blue-900/40 to-indigo-900/40 rounded-xl border-2 border-blue-500/50 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-500/20 transition-all"
                        >
                          <h4 className="text-blue-400 font-bold mb-4 flex items-center text-lg">
                            <span className="mr-2 text-2xl">🔮</span>
                            Remedies / उपाय
                          </h4>
                          <ul className="text-gray-200 space-y-3">
                            {insights?.remedies.map((remedy: string, index: number) => (
                              <li key={index} className="flex items-start">
                                <span className="text-blue-400 mr-2 mt-1">•</span>
                                <span>{remedy}</span>
                              </li>
                            ))}
                          </ul>
                        </motion.div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Action Buttons */}
                <div className="flex flex-wrap justify-center gap-4 mt-8">
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

