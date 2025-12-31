'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiHome,
  FiShoppingBag,
  FiUsers,
  FiDollarSign,
  FiSettings,
  FiMenu,
  FiX,
  FiLogOut,
  FiAlertCircle,
  FiDatabase,
  FiTrendingUp,
  FiUserCheck,
  FiGrid,
  FiImage,
  FiCpu,
  FiStar,
  FiFileText,
  FiLayers,
  FiPercent,
  FiPackage,
} from 'react-icons/fi';
import ThemeToggle from '../ThemeToggle';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [admin, setAdmin] = useState({ name: 'Admin', email: '' });
  const [userRole, setUserRole] = useState<string>('');
  const [showErrorModal, setShowErrorModal] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    fetch('/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user) {
          // Only allow admin
          if (data.user.role !== 'admin' && data.user.role !== 'accountant') {
            setShowErrorModal(true);
            setTimeout(() => {
              localStorage.removeItem('token');
              router.push('/login');
            }, 2000);
            return;
          }
          setAdmin({ name: data.user.name, email: data.user.email });
          setUserRole(data.user.role || '');
        } else {
          router.push('/login');
        }
      })
      .catch(() => router.push('/login'));
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  // Admin menu items - Enterprise grade admin panel
  const menuItems = [
    { name: 'Dashboard', icon: FiHome, href: '/admin', badge: null },
    { name: 'Users', icon: FiUsers, href: '/admin/users', badge: null },
    { name: 'Shops', icon: FiShoppingBag, href: '/admin/shops', badge: 'pending' },
    { name: 'Categories', icon: FiPackage, href: '/admin/categories', badge: null },
    { name: 'Payments', icon: FiDollarSign, href: '/admin/payments', badge: null },
    { name: 'Commissions', icon: FiPercent, href: '/admin/commissions', badge: null },
    { name: 'Plans', icon: FiLayers, href: '/admin/plans', badge: null },
    { name: 'Agents', icon: FiUserCheck, href: '/admin/agents', badge: null },
    { name: 'Operators', icon: FiUsers, href: '/admin/operators', badge: null },
    { name: 'Homepage', icon: FiGrid, href: '/admin/homepage-builder', badge: null },
    { name: 'Advertisements', icon: FiImage, href: '/admin/advertisements', badge: null },
    { name: 'AI & Golu', icon: FiCpu, href: '/admin/ai', badge: null },
    { name: 'Jyotish', icon: FiStar, href: '/admin/jyotish', badge: null },
    { name: 'Reports', icon: FiFileText, href: '/admin/reports', badge: null },
    { name: 'Database', icon: FiDatabase, href: '/admin/database', badge: null },
    { name: 'Settings', icon: FiSettings, href: '/admin/settings', badge: null },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Admin Panel</h1>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {sidebarOpen ? <FiX className="text-xl" /> : <FiMenu className="text-xl" />}
          </button>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-transform duration-300 lg:translate-x-0`}
        >
          <div className="h-full flex flex-col">
            {/* Logo/Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                8Rupiya
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Admin Panel</p>
            </div>

            {/* User Profile */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  {admin.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-white truncate">{admin.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{admin.email}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400">
                    {userRole === 'admin' ? 'Admin' : 'Accountant'}
                  </span>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="text-xl" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Theme Toggle and Logout */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
              <div className="flex justify-center">
                <ThemeToggle />
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <FiLogOut className="text-xl" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 lg:ml-0">
          <div className="p-6">{children}</div>
        </main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Error Modal for Non-Admin Users */}
      <AnimatePresence>
        {showErrorModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 max-w-md w-full mx-4"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
                  <FiAlertCircle className="text-red-600 dark:text-red-400 text-3xl" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Access Denied
                </h3>
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
                  Admin access required
                </p>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 2, ease: 'linear' }}
                    className="bg-red-600 h-2 rounded-full"
                  />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Redirecting to login page...
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

