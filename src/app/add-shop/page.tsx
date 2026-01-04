'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FiShoppingBag, FiUser, FiMail, FiPhone, FiLock, FiCheck, FiX, FiAlertCircle, FiMoon, FiSun } from 'react-icons/fi';
import Link from 'next/link';
import Image from 'next/image';
import Footer from '@/components/common/Footer';

export default function AddShopPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState<Array<{
    width: number;
    height: number;
    left: number;
    top: number;
    x: number[];
    y: number[];
    scale: number[];
    opacity: number[];
    duration: number;
    delay: number;
  }>>([]);
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  useEffect(() => {
    // Check system preference and load theme
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const savedTheme = localStorage.getItem('theme');
    setDarkMode(savedTheme === 'dark' || (!savedTheme && prefersDark));
    setMounted(true);

    // Generate particles only on client side to avoid hydration mismatch
    const particlesData = Array.from({ length: 20 }, () => ({
      width: Math.random() * 100 + 50,
      height: Math.random() * 100 + 50,
      left: Math.random() * 100,
      top: Math.random() * 100,
      x: [0, Math.random() * 200 - 100],
      y: [0, Math.random() * 200 - 100],
      scale: [1, 1.2, 1],
      opacity: [0.3, 0.6, 0.3],
      duration: Math.random() * 10 + 10,
      delay: Math.random() * 5,
    }));
    setParticles(particlesData);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    // Check if user is already logged in as shopper
    const token = localStorage.getItem('token');
    if (token) {
      fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` },
      })
        .then(res => res.json())
        .then(data => {
          if (data.success && data.user) {
            if (data.user.role === 'shopper') {
              // Already a shopper, redirect to shopper panel
              router.push('/shopper');
            } else {
              // Different role, show message
              setError('You are already registered with a different account type. Please logout first.');
            }
          }
        })
        .catch(() => {});
    }
  }, [router]);

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Name is required');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Invalid email format');
      return false;
    }
    if (!formData.phone.trim()) {
      setError('Phone is required');
      return false;
    }
    if (formData.phone.length < 10) {
      setError('Phone number must be at least 10 digits');
      return false;
    }
    if (!formData.password) {
      setError('Password is required');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // First, send OTP
      const otpResponse = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          purpose: 'signup',
        }),
      });

      const otpData = await otpResponse.json();
      
      if (!otpResponse.ok) {
        throw new Error(otpData.error || 'Failed to send OTP');
      }

      // Move to OTP verification step
      setStep(2);
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const [otp, setOtp] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const verifyResponse = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          otp,
          purpose: 'signup',
        }),
      });

      const verifyData = await verifyResponse.json();

      if (!verifyResponse.ok) {
        throw new Error(verifyData.error || 'Invalid OTP');
      }

      setOtpVerified(true);
      // Now register the shopper
      await handleRegister();
    } catch (err: any) {
      setError(err.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          role: 'shopper',
          otp: otp,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      if (data.success && data.token) {
        localStorage.setItem('token', data.token);
        setSuccess(true);
        setTimeout(() => {
          router.push('/shopper');
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    }
  };

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('theme', newDarkMode ? 'dark' : 'light');
    
    // Apply theme to HTML
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(newDarkMode ? 'dark' : 'light');
    root.setAttribute('data-theme', newDarkMode ? 'dark' : 'light');
    root.style.colorScheme = newDarkMode ? 'dark' : 'light';
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 ${
      darkMode 
        ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900' 
        : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'
    } flex items-center justify-center p-4 relative overflow-hidden`}>
      {/* Animated Background Particles */}
      {mounted && (
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          {particles.map((particle, i) => (
            <motion.div
              key={i}
              className={`absolute rounded-full ${
                darkMode ? 'bg-white/10' : 'bg-blue-300/30'
              }`}
              style={{
                width: particle.width,
                height: particle.height,
                left: `${particle.left}%`,
                top: `${particle.top}%`,
              }}
              animate={{
                x: particle.x,
                y: particle.y,
                scale: particle.scale,
                opacity: particle.opacity,
              }}
              transition={{
                duration: particle.duration,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: particle.delay,
              }}
            />
          ))}
        </div>
      )}

      {/* Gradient Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className={`absolute top-20 left-10 w-96 h-96 ${
            darkMode ? 'bg-blue-500/20' : 'bg-blue-300'
          } rounded-full mix-blend-multiply filter blur-3xl opacity-30`}
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className={`absolute bottom-20 right-10 w-96 h-96 ${
            darkMode ? 'bg-purple-500/20' : 'bg-purple-300'
          } rounded-full mix-blend-multiply filter blur-3xl opacity-30`}
          animate={{
            x: [0, -100, 0],
            y: [0, 50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className={`absolute top-1/2 left-1/2 w-96 h-96 ${
            darkMode ? 'bg-pink-500/20' : 'bg-pink-300'
          } rounded-full mix-blend-multiply filter blur-3xl opacity-20`}
          animate={{
            x: [0, 50, 0],
            y: [0, -30, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      {/* Mouse Follow Effect */}
      <div
        className="fixed pointer-events-none z-0"
        style={{
          left: mousePosition.x - 150,
          top: mousePosition.y - 150,
          transition: 'all 0.3s ease-out',
        }}
      >
        <div className={`w-72 h-72 rounded-full ${
          darkMode ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10' : 'bg-gradient-to-r from-blue-200/20 to-purple-200/20'
        } blur-3xl`} />
      </div>

      {/* Theme Toggle */}
      <motion.button
        onClick={toggleDarkMode}
        className={`fixed top-6 right-6 z-50 p-3 rounded-full ${
          darkMode 
            ? 'bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30' 
            : 'bg-gray-800/20 text-gray-700 hover:bg-gray-800/30'
        } backdrop-blur-md border ${
          darkMode ? 'border-yellow-500/30' : 'border-gray-300/30'
        } transition-all shadow-lg`}
        whileHover={{ scale: 1.1, rotate: 180 }}
        whileTap={{ scale: 0.9 }}
      >
        {darkMode ? <FiSun className="text-xl" /> : <FiMoon className="text-xl" />}
      </motion.button>

      <main id="main-content" role="main" className="w-full max-w-md relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Glassmorphism Card */}
          <div className={`${
            darkMode 
              ? 'bg-gray-800/40 backdrop-blur-xl border-gray-700/50' 
              : 'bg-white/70 backdrop-blur-xl border-white/50'
          } rounded-3xl shadow-2xl p-8 border relative overflow-hidden`}>
            {/* Shine Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-shimmer" />
            
            {/* Header with Logo */}
            <div className="text-center mb-8 relative z-10">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="flex items-center justify-center mx-auto mb-4"
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="relative"
                >
                  <Image
                    src="/uploads/logo2 copy.png"
                    alt="8rupiya.com Logo"
                    width={128}
                    height={128}
                    className="h-32 w-auto object-contain drop-shadow-2xl filter brightness-110 contrast-110"
                    priority
                  />
                  <motion.div
                    animate={{
                      scale: [1, 1.1, 1],
                      opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    className="absolute inset-0 bg-gradient-to-r from-yellow-400/30 via-amber-400/30 to-yellow-400/30 blur-3xl -z-10"
                  />
                  <motion.div
                    animate={{
                      rotate: [0, 360],
                    }}
                    transition={{
                      duration: 20,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-300/20 to-transparent blur-xl -z-10"
                  />
                </motion.div>
              </motion.div>
              <motion.h1
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className={`text-4xl font-bold mb-2 bg-gradient-to-r ${
                  darkMode 
                    ? 'from-blue-400 via-purple-400 to-pink-400' 
                    : 'from-blue-600 via-purple-600 to-pink-600'
                } bg-clip-text text-transparent`}
              >
                Add Your Shop
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}
              >
                Create your shopper account to add and manage your shop
              </motion.p>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center justify-center mb-8 relative z-10">
              <div className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                  step >= 1 ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg' : darkMode ? 'bg-gray-700 text-gray-500' : 'bg-gray-200 text-gray-500'
                }`}>
                  {step > 1 ? <FiCheck /> : '1'}
                </div>
                <div className={`w-16 h-1 transition-all ${step >= 2 ? 'bg-gradient-to-r from-green-500 to-emerald-500' : darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                  step >= 2 ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg' : darkMode ? 'bg-gray-700 text-gray-500' : 'bg-gray-200 text-gray-500'
                }`}>
                  {step > 2 ? <FiCheck /> : '2'}
                </div>
              </div>
            </div>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="bg-red-500/10 border border-red-500/30 text-red-500 dark:text-red-400 px-4 py-3 rounded-xl mb-6 backdrop-blur-sm relative z-10 flex items-start gap-3"
                >
                  <FiAlertCircle className="text-xl flex-shrink-0 mt-0.5" />
                  <p className="text-sm">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Success Message */}
            <AnimatePresence>
              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="bg-green-500/10 border border-green-500/30 text-green-500 dark:text-green-400 px-4 py-3 rounded-xl mb-6 backdrop-blur-sm relative z-10 flex items-start gap-3"
                >
                  <FiCheck className="text-xl flex-shrink-0 mt-0.5" />
                  <p className="text-sm">
                    Registration successful! Redirecting to your panel...
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Step 1: Registration Form */}
            {step === 1 && (
              <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Full Name *
                  </label>
                  <div className="relative group">
                    <FiUser className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${
                      darkMode ? 'text-gray-400' : 'text-gray-400'
                    } group-focus-within:text-blue-500 transition-colors`} />
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={`w-full pl-12 pr-4 py-3.5 rounded-xl border-2 ${
                        darkMode
                          ? 'bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500'
                          : 'bg-white/80 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-500'
                      } focus:ring-2 focus:ring-blue-500/20 outline-none transition-all backdrop-blur-sm`}
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Email *
                  </label>
                  <div className="relative group">
                    <FiMail className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${
                      darkMode ? 'text-gray-400' : 'text-gray-400'
                    } group-focus-within:text-blue-500 transition-colors`} />
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className={`w-full pl-12 pr-4 py-3.5 rounded-xl border-2 ${
                        darkMode
                          ? 'bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500'
                          : 'bg-white/80 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-500'
                      } focus:ring-2 focus:ring-blue-500/20 outline-none transition-all backdrop-blur-sm`}
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Phone *
                  </label>
                  <div className="relative group">
                    <FiPhone className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${
                      darkMode ? 'text-gray-400' : 'text-gray-400'
                    } group-focus-within:text-blue-500 transition-colors`} />
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                      className={`w-full pl-12 pr-4 py-3.5 rounded-xl border-2 ${
                        darkMode
                          ? 'bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500'
                          : 'bg-white/80 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-500'
                      } focus:ring-2 focus:ring-blue-500/20 outline-none transition-all backdrop-blur-sm`}
                      placeholder="Enter your phone number"
                      maxLength={10}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Password *
                  </label>
                  <div className="relative group">
                    <FiLock className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${
                      darkMode ? 'text-gray-400' : 'text-gray-400'
                    } group-focus-within:text-blue-500 transition-colors`} />
                    <input
                      type="password"
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className={`w-full pl-12 pr-4 py-3.5 rounded-xl border-2 ${
                        darkMode
                          ? 'bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500'
                          : 'bg-white/80 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-500'
                      } focus:ring-2 focus:ring-blue-500/20 outline-none transition-all backdrop-blur-sm`}
                      placeholder="Enter password (min 6 characters)"
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Confirm Password *
                  </label>
                  <div className="relative group">
                    <FiLock className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${
                      darkMode ? 'text-gray-400' : 'text-gray-400'
                    } group-focus-within:text-blue-500 transition-colors`} />
                    <input
                      type="password"
                      required
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className={`w-full pl-12 pr-4 py-3.5 rounded-xl border-2 ${
                        darkMode
                          ? 'bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500'
                          : 'bg-white/80 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-500'
                      } focus:ring-2 focus:ring-blue-500/20 outline-none transition-all backdrop-blur-sm`}
                      placeholder="Confirm your password"
                    />
                  </div>
                </div>

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-blue-700 via-purple-700 to-pink-700 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="relative z-10 flex items-center justify-center">
                    {loading ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                        />
                        Sending OTP...
                      </>
                    ) : (
                      'Continue'
                    )}
                  </span>
                </motion.button>
              </form>
            )}

            {/* Step 2: OTP Verification */}
            {step === 2 && !otpVerified && (
              <div className="space-y-5 relative z-10">
                <div className="text-center mb-4">
                  <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-2`}>
                    We've sent a 6-digit OTP to <strong>{formData.email}</strong>
                  </p>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Please check your email and enter the OTP below
                  </p>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Enter OTP *
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    className={`w-full px-4 py-3.5 text-center text-2xl tracking-widest rounded-xl border-2 ${
                      darkMode
                        ? 'bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500'
                        : 'bg-white/80 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-500'
                    } focus:ring-2 focus:ring-blue-500/20 outline-none transition-all backdrop-blur-sm`}
                    placeholder="000000"
                  />
                </div>

                <motion.button
                  onClick={handleVerifyOTP}
                  disabled={loading || otp.length !== 6}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-blue-700 via-purple-700 to-pink-700 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="relative z-10 flex items-center justify-center">
                    {loading ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                        />
                        Verifying...
                      </>
                    ) : (
                      'Verify & Register'
                    )}
                  </span>
                </motion.button>

                <motion.button
                  onClick={() => setStep(1)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full py-2.5 text-sm hover:underline font-medium transition-all ${
                    darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Back to form
                </motion.button>
              </div>
            )}

            {/* Footer */}
            <div className={`mt-6 text-center relative z-10 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              <p>
                Already have an account?{' '}
                <Link 
                  href="/login" 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-semibold hover:from-blue-700 hover:to-purple-700 transition-all"
                >
                  Login
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </main>

      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
          100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
        }
        .animate-shimmer {
          animation: shimmer 3s infinite;
        }
      `}</style>

      {/* Footer */}
      <Footer />
    </div>
  );
}
