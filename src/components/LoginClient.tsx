'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiMail, FiLock, FiMoon, FiSun, FiEye, FiEyeOff } from 'react-icons/fi';

export default function LoginClient() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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

  useEffect(() => {
    // Check system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(prefersDark);
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


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!formData.email || !formData.password) {
        setError('Please enter both email and password');
        setLoading(false);
        return;
      }

      const loginPayload = {
        email: formData.email.trim(),
        password: formData.password,
      };
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(loginPayload),
      });

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        setError('Invalid response from server. Please try again.');
        setLoading(false);
        return;
      }

      if (response.ok && data.success && data.token) {
        const userRole = data.user?.role || 'user';
        
        // Homepage login is ONLY for regular users
        if (userRole !== 'user') {
          let loginPage = '';
          let roleDisplay = '';
          
          if (userRole === 'admin' || userRole === 'accountant') {
            loginPage = '/admin/login';
            roleDisplay = 'Admin/Accountant';
          } else if (userRole === 'agent') {
            loginPage = '/agent/login';
            roleDisplay = 'Agent';
          } else if (userRole === 'shopper') {
            loginPage = '/shopper/login';
            roleDisplay = 'Shopper';
          } else if (userRole === 'operator') {
            loginPage = '/operator/login';
            roleDisplay = 'Operator';
          }
          
          setError(`❌ Access Denied!\n\nThis login is for regular users only.\n\nYou are registered as ${roleDisplay}.\nPlease use your dedicated login page: ${loginPage}`);
          setLoading(false);
          return;
        }

        // User role - allow login
        localStorage.setItem('token', data.token);
        window.location.href = '/';
      } else {
        const errorMsg = data.error || data.message || 'Login failed';
        setError(errorMsg);
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
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
        onClick={() => setDarkMode(!darkMode)}
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
            
            {/* Header */}
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
                  <img
                    src="/uploads/logo.png"
                    alt="8rupiya.com Logo"
                    className="h-32 w-auto object-contain drop-shadow-2xl filter brightness-110 contrast-110"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/uploads/logo2.png';
                    }}
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
                Welcome Back
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}
              >
                Login to your account
              </motion.p>
              
              {/* User Login Notice */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className={`mt-4 p-3 rounded-xl ${
                  darkMode 
                    ? 'bg-blue-500/10 border border-blue-500/30 text-blue-300' 
                    : 'bg-blue-50 border border-blue-200 text-blue-700'
                }`}
              >
                <p className="text-sm font-medium">
                  🙋‍♂️ This login is for regular users only
                </p>
                <p className="text-xs mt-1 opacity-90">
                  Admin, Agent, Shopper? Use your dedicated login page
                </p>
              </motion.div>
            </div>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="bg-red-500/10 border border-red-500/30 text-red-500 dark:text-red-400 px-4 py-3 rounded-xl mb-6 backdrop-blur-sm relative z-10"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
              <div>
                <label htmlFor="login-email" className={`block text-sm font-medium mb-2 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Email
                </label>
                <div className="relative group">
                  <FiMail className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${
                    darkMode ? 'text-gray-400' : 'text-gray-400'
                  } group-focus-within:text-blue-500 transition-colors`} />
                  <input
                    id="login-email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
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
                <label htmlFor="login-password" className={`block text-sm font-medium mb-2 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Password
                </label>
                <div className="relative group">
                  <FiLock className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${
                    darkMode ? 'text-gray-400' : 'text-gray-400'
                  } group-focus-within:text-blue-500 transition-colors`} />
                  <input
                    id="login-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className={`w-full pl-12 pr-12 py-3.5 rounded-xl border-2 ${
                      darkMode
                        ? 'bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500'
                        : 'bg-white/80 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-500'
                    } focus:ring-2 focus:ring-blue-500/20 outline-none transition-all backdrop-blur-sm`}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute right-4 top-1/2 transform -translate-y-1/2 ${
                      darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'
                    } transition-colors`}
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label htmlFor="remember-me" className={`flex items-center cursor-pointer ${
                  darkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  <input 
                    id="remember-me"
                    name="remember-me"
                    type="checkbox" 
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                  />
                  <span className="ml-2 text-sm">Remember me</span>
                </label>
                <Link 
                  href="/forgot-password" 
                  className="text-sm bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-semibold hover:from-blue-700 hover:to-purple-700 transition-all"
                >
                  Forgot password?
                </Link>
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
                      Logging in...
                    </>
                  ) : (
                    'Login'
                  )}
                </span>
              </motion.button>
            </form>

            {/* Register Link */}
            <div className={`mt-6 text-center relative z-10 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              <p>
                Don't have an account?{' '}
                <Link 
                  href="/register" 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-semibold hover:from-blue-700 hover:to-purple-700 transition-all"
                >
                  Register here
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
    </div>
  );
}
