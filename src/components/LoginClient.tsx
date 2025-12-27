'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiMail, FiLock, FiShoppingBag, FiUser, FiShield, FiUsers } from 'react-icons/fi';

type LoginRole = 'admin' | 'agent' | 'operator' | 'all';

export default function LoginClient() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<LoginRole>('all');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const getRedirectPath = (role: string): string => {
    switch (role) {
      case 'admin':
        return '/admin';
      case 'agent':
        return '/agent';
      case 'operator':
        return '/operator';
      case 'accountant':
        return '/accountant';
      case 'shopper':
        return '/shopper';
      default:
        return '/';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate form
      if (!formData.email || !formData.password) {
        setError('Please enter both email and password');
        setLoading(false);
        return;
      }

      const loginPayload = {
        email: formData.email.trim(),
        password: formData.password,
      };
      
      console.log('Login attempt:', { 
        email: loginPayload.email, 
        passwordLength: loginPayload.password.length,
        role: selectedRole 
      });
      
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
        console.error('Failed to parse response:', parseError);
        const text = await response.text();
        console.error('Response text:', text);
        setError('Invalid response from server. Please try again.');
        setLoading(false);
        return;
      }

      console.log('Login response:', { 
        status: response.status, 
        ok: response.ok,
        success: data.success, 
        hasToken: !!data.token, 
        userRole: data.user?.role,
        error: data.error,
        message: data.message
      });

      if (response.ok && data.success && data.token) {
        // Validate role if a specific role was selected
        if (selectedRole !== 'all' && data.user?.role !== selectedRole) {
          setError(`This account is not registered as ${selectedRole}. Please select the correct role or use "All Roles".`);
          setLoading(false);
          return;
        }

        // Store token
        localStorage.setItem('token', data.token);
        console.log('Token stored, redirecting to:', getRedirectPath(data.user?.role || 'user'));

        // Redirect based on role
        const redirectPath = getRedirectPath(data.user?.role || 'user');
        
        // Use window.location for more reliable redirect
        window.location.href = redirectPath;
      } else {
        const errorMsg = data.error || data.message || 'Login failed';
        console.error('Login failed:', errorMsg);
        setError(errorMsg);
      }
    } catch (err: any) {
      console.error('Login exception:', err);
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20"
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20"
          animate={{
            x: [0, -100, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      <main id="main-content" role="main" className="w-full max-w-md relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-gray-200/50">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg"
            >
              <FiShoppingBag className="text-white text-3xl" />
            </motion.div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              Welcome Back
            </h1>
            <p className="text-gray-600">Login to your account</p>
          </div>

          {/* Role Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Login As
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSelectedRole('admin')}
                className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all ${
                  selectedRole === 'admin'
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                }`}
              >
                <FiShield className="text-xl mb-1" />
                <span className="text-xs font-medium">Admin</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole('agent')}
                className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all ${
                  selectedRole === 'agent'
                    ? 'border-purple-600 bg-purple-50 text-purple-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                }`}
              >
                <FiUser className="text-xl mb-1" />
                <span className="text-xs font-medium">Agent</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole('operator')}
                className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all ${
                  selectedRole === 'operator'
                    ? 'border-green-600 bg-green-50 text-green-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                }`}
              >
                <FiUsers className="text-xl mb-1" />
                <span className="text-xs font-medium">Operator</span>
              </button>
            </div>
            <button
              type="button"
              onClick={() => setSelectedRole('all')}
              className={`mt-2 w-full py-2 rounded-lg text-sm font-medium transition-all ${
                selectedRole === 'all'
                  ? 'bg-gray-800 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Roles
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6"
            >
              {error}
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" aria-hidden="true" />
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="Enter your email"
                  aria-required="true"
                />
              </div>
            </div>

            <div>
              <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" aria-hidden="true" />
                <input
                  id="login-password"
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="Enter your password"
                  aria-required="true"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label htmlFor="remember-me" className="flex items-center cursor-pointer">
                <input 
                  id="remember-me"
                  name="remember-me"
                  type="checkbox" 
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                />
                <span className="ml-2 text-sm text-gray-600">Remember me</span>
              </label>
              <Link href="/forgot-password" className="text-sm text-blue-600 hover:text-purple-600 transition-colors">
                Forgot password?
              </Link>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                  />
                  Logging in...
                </span>
              ) : (
                'Login'
              )}
            </motion.button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link href="/register" className="text-blue-600 hover:text-purple-600 font-semibold transition-colors">
                Register here
              </Link>
            </p>
          </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

