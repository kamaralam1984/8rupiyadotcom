'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiHome,
  FiShoppingBag,
  FiDollarSign,
  FiSettings,
  FiMenu,
  FiX,
  FiLogOut,
  FiAlertCircle,
} from 'react-icons/fi';

export default function ShopperLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [shopper, setShopper] = useState({ name: 'Shopper', email: '' });
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
          // Only allow shopper or admin
          if (data.user.role !== 'shopper' && data.user.role !== 'admin') {
            setShowErrorModal(true);
            setTimeout(() => {
              localStorage.removeItem('token');
              router.push('/login');
            }, 2000);
            return;
          }
          setShopper({ name: data.user.name, email: data.user.email });
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

  const menuItems = [
    { name: 'Dashboard', icon: FiHome, href: '/shopper' },
    { name: 'My Shops', icon: FiShoppingBag, href: '/shopper/shops' },
    { name: 'Add Shop', icon: FiShoppingBag, href: '/shopper/shops/new' },
    { name: 'Payments', icon: FiDollarSign, href: '/shopper/payments' },
    { name: 'Settings', icon: FiSettings, href: '/shopper/settings' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Shopper Panel</h1>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          {sidebarOpen ? <FiX className="text-xl" /> : <FiMenu className="text-xl" />}
        </button>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-transform duration-300 lg:translate-x-0`}
        >
          <div className="flex flex-col h-full">
            {/* Logo & User Info */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {shopper.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Shopper Panel</p>
                </div>
              </div>
              <div className="mt-4">
                <p className="font-semibold text-gray-900 dark:text-white">{shopper.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{shopper.email}</p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="text-xl" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Logout */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
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

      {/* Error Modal for Non-Shopper Users */}
      <AnimatePresence>
        {showErrorModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 max-w-md w-full mx-4"
            >
              <div className="text-center">
                <FiAlertCircle className="text-red-600 dark:text-red-400 text-5xl mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Access Denied
                </h3>
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
                  This panel is only accessible to shoppers. Redirecting to login...
                </p>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 2 }}
                    className="bg-red-600 h-2 rounded-full"
                  />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Please login with a shopper account
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

