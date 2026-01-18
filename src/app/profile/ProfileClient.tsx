'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  FiUser, 
  FiMail, 
  FiPhone, 
  FiMapPin, 
  FiEdit2, 
  FiSave, 
  FiX,
  FiArrowLeft,
  FiShield,
  FiCalendar,
  FiShoppingBag
} from 'react-icons/fi';
import NavbarAirbnb from '@/components/NavbarAirbnb';
import FooterMinimal from '@/components/FooterMinimal';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  createdAt?: string;
}

export default function ProfileClient() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }

        const response = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.user) {
        const userData = {
          ...data.user,
          role: data.user.role || 'user', // Default role if not provided
        };
        setUser(userData);
        setFormData({
          name: data.user.name || '',
          email: data.user.email || '',
          phone: data.user.phone || '',
        });
          } else {
            router.push('/login');
          }
        } else {
          router.push('/login');
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  const handleEdit = () => {
    setIsEditing(true);
    setError('');
    setSuccess('');
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    }
    setError('');
    setSuccess('');
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      // Update profile based on user role
      let updateEndpoint = '';
      let method = 'POST';
      
      if (user?.role === 'shopper') {
        updateEndpoint = '/api/shopper/profile';
        method = 'PUT';
      } else if (user?.role === 'operator') {
        updateEndpoint = '/api/operator/profile';
        method = 'POST';
      } else {
        // For regular users, profile updates are not available via API
        setError('Profile updates are only available for shoppers and operators. Please contact support for assistance.');
        setSaving(false);
        return;
      }

      const response = await fetch(updateEndpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setUser({
          ...user!,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
        });
        setIsEditing(false);
        setSuccess('Profile updated successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error || 'Failed to update profile');
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);
      setError('An error occurred while updating your profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/80">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <NavbarAirbnb user={user} onLogout={() => router.push('/login')} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Back to Home Link */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-yellow-400 hover:text-yellow-300 font-medium transition-colors group mb-6"
        >
          <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
          <span>Back to Home</span>
        </Link>

        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-gray-800/80 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-yellow-400/20 mb-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center text-gray-900 text-3xl font-bold">
                {user.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {isEditing ? 'Edit Profile' : 'My Profile'}
                </h1>
                {user.role && (
                  <span className="inline-block px-3 py-1 bg-yellow-400/20 text-yellow-400 rounded-full text-sm font-medium border border-yellow-400/30">
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </span>
                )}
              </div>
            </div>
            {!isEditing ? (
              (user.role === 'shopper' || user.role === 'operator') ? (
                <button
                  onClick={handleEdit}
                  className="flex items-center gap-2 px-4 py-2 bg-yellow-400 text-gray-900 rounded-xl font-semibold hover:bg-yellow-300 transition-all shadow-lg hover:shadow-xl"
                >
                  <FiEdit2 />
                  <span>Edit</span>
                </button>
              ) : null
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-xl font-semibold hover:bg-gray-600 transition-all"
                >
                  <FiX />
                  <span>Cancel</span>
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-yellow-400 text-gray-900 rounded-xl font-semibold hover:bg-yellow-300 transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <FiSave />
                      <span>Save</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Success/Error Messages */}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-4 bg-green-500/20 border border-green-500/50 rounded-xl text-green-400"
            >
              {success}
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-400"
            >
              {error}
            </motion.div>
          )}

          {/* Profile Information */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-white/70 mb-2">
                  <FiUser className="text-yellow-400" />
                  Full Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-yellow-400/30 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all"
                    placeholder="Enter your name"
                  />
                ) : (
                  <p className="text-white text-lg font-medium">{user.name || 'Not set'}</p>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-white/70 mb-2">
                  <FiMail className="text-yellow-400" />
                  Email Address
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-yellow-400/30 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all"
                    placeholder="Enter your email"
                  />
                ) : (
                  <p className="text-white text-lg font-medium">{user.email || 'Not set'}</p>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-white/70 mb-2">
                  <FiPhone className="text-yellow-400" />
                  Phone Number
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-yellow-400/30 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all"
                    placeholder="Enter your phone number"
                  />
                ) : (
                  <p className="text-white text-lg font-medium">{user.phone || 'Not set'}</p>
                )}
              </div>
            </div>

            <div className="space-y-6">
              {user.role && (
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-white/70 mb-2">
                    <FiShield className="text-yellow-400" />
                    Account Type
                  </label>
                  <p className="text-white text-lg font-medium capitalize">{user.role}</p>
                </div>
              )}

              {user.createdAt && (
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-white/70 mb-2">
                    <FiCalendar className="text-yellow-400" />
                    Member Since
                  </label>
                  <p className="text-white text-lg font-medium">
                    {new Date(user.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              )}

              <div className="pt-6">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 rounded-xl font-semibold hover:from-yellow-300 hover:to-yellow-400 transition-all shadow-lg hover:shadow-xl"
                >
                  <FiShoppingBag />
                  <span>Explore Shops</span>
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <FooterMinimal />
    </div>
  );
}
