'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  FiHome,
  FiUsers,
  FiShoppingBag,
  FiCreditCard,
  FiDollarSign,
  FiTrendingUp,
  FiMapPin,
  FiTag,
  FiStar,
  FiLayout,
  FiFileText,
  FiSettings,
  FiLogOut,
  FiMenu,
  FiX,
  FiChevronDown,
  FiChevronRight,
  FiDatabase,
  FiFile,
  FiGlobe,
  FiAlertCircle,
} from 'react-icons/fi';

interface MenuItem {
  name: string;
  icon?: any;
  href?: string;
  children?: Omit<MenuItem, 'icon'>[];
}

const menuItems: MenuItem[] = [
  { name: 'Dashboard', icon: FiHome, href: '/admin' },
  {
    name: 'Users',
    icon: FiUsers,
    children: [
      { name: 'Admin', href: '/admin/users/admin' },
      { name: 'Agents', href: '/admin/users/agents' },
      { name: 'Operators', href: '/admin/users/operators' },
      { name: 'Accountants', href: '/admin/users/accountants' },
      { name: 'Shoppers', href: '/admin/users/shoppers' },
    ],
  },
  {
    name: 'Shops',
    icon: FiShoppingBag,
    children: [
      { name: 'Pending Approval', href: '/admin/shops?status=pending' },
      { name: 'Active Shops', href: '/admin/shops?status=active' },
      { name: 'Expired Shops', href: '/admin/shops?status=expired' },
      { name: 'Rejected Shops', href: '/admin/shops?status=rejected' },
    ],
  },
  {
    name: 'Other Panels',
    icon: FiUsers,
    children: [
      { name: 'Agent Panel', href: '/agent' },
      { name: 'Operator Panel', href: '/operator' },
      { name: 'Operator Details', href: '/admin/operators' },
      { name: 'Agent Requests', href: '/admin/agent-requests' },
    ],
  },
  { name: 'Plans', icon: FiCreditCard, href: '/admin/plans' },
  { name: 'Commissions', icon: FiDollarSign, href: '/admin/commissions' },
  { name: 'Payments', icon: FiTrendingUp, href: '/admin/payments' },
  { name: 'Withdraw Requests', icon: FiDollarSign, href: '/admin/withdrawals' },
  { name: 'Locations', icon: FiMapPin, href: '/admin/locations' },
  { name: 'Categories', icon: FiTag, href: '/admin/categories' },
  { name: 'Rank & Featured', icon: FiStar, href: '/admin/rank' },
  { name: 'Homepage Builder', icon: FiLayout, href: '/admin/homepage-builder' },
  { name: 'Pages', icon: FiFile, href: '/admin/pages' },
  { name: 'Ads & AdSense', icon: FiFileText, href: '/admin/ads' },
  { name: 'Advertisements', icon: FiGlobe, href: '/admin/advertisements' },
  { name: 'Reports', icon: FiFileText, href: '/admin/reports' },
  { name: 'Database Viewer', icon: FiDatabase, href: '/admin/database' },
  { name: 'Settings', icon: FiSettings, href: '/admin/settings' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['Users', 'Shops', 'Other Panels']);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [adminName, setAdminName] = useState('Admin');
  const [adminEmail, setAdminEmail] = useState('');
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Verify admin or accountant role
    const checkAdmin = async () => {
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
            // Allow both admin and accountant
            if (data.user.role !== 'admin' && data.user.role !== 'accountant') {
              // Show error modal for non-admin/accountant users
              setShowErrorModal(true);
              // Redirect to login after 2 seconds
              setTimeout(() => {
                localStorage.removeItem('token');
                router.push('/login');
              }, 2000);
              return;
            }
            // Set admin name and email
            setAdminName(data.user.name || 'Admin');
            setAdminEmail(data.user.email || '');
          } else {
            router.push('/login');
          }
        } else {
          router.push('/login');
        }
      } catch (err) {
        console.error('Failed to verify admin:', err);
        router.push('/login');
      }
    };

    checkAdmin();
  }, [router]);

  const toggleMenu = (menuName: string) => {
    setExpandedMenus((prev) =>
      prev.includes(menuName) ? prev.filter((m) => m !== menuName) : [...prev, menuName]
    );
  };

  const isActive = (href?: string) => {
    if (!href) return false;
    if (href.includes('?')) {
      const [path] = href.split('?');
      return pathname.startsWith(path);
    }
    return pathname === href;
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile Header */}
      <header className="lg:hidden bg-white dark:bg-gray-800 shadow-md p-4 flex items-center justify-between" role="banner">
        <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          8rupiya.com
        </h2>
        <button
          type="button"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          aria-label="Toggle sidebar"
          aria-expanded={sidebarOpen}
        >
          {sidebarOpen ? <FiX className="text-2xl" aria-hidden="true" /> : <FiMenu className="text-2xl" aria-hidden="true" />}
        </button>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              className="fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-xl lg:shadow-none border-r border-gray-200 dark:border-gray-700"
            >
              <div className="h-full flex flex-col">
                {/* Logo */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    8rupiya.com
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Admin Dashboard</p>
                </div>

                {/* User Info */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <p className="font-semibold text-gray-900 dark:text-white">{adminName}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{adminEmail}</p>
                </div>

                {/* Menu */}
                <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                  {menuItems.map((item) => (
                    <div key={item.name}>
                      {item.children ? (
                        <>
                          <button
                            onClick={() => toggleMenu(item.name)}
                            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                              expandedMenus.includes(item.name)
                                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <item.icon className="text-xl" />
                              <span className="font-medium">{item.name}</span>
                            </div>
                            {expandedMenus.includes(item.name) ? (
                              <FiChevronDown className="text-sm" />
                            ) : (
                              <FiChevronRight className="text-sm" />
                            )}
                          </button>
                          <AnimatePresence>
                            {expandedMenus.includes(item.name) && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="ml-4 mt-1 space-y-1"
                              >
                                {item.children.map((child) => (
                                  <Link
                                    key={child.name}
                                    href={child.href || '#'}
                                    className={`block px-4 py-2 rounded-lg transition-colors ${
                                      isActive(child.href)
                                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                                    }`}
                                  >
                                    {child.name}
                                  </Link>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </>
                      ) : (
                        <Link
                          href={item.href || '#'}
                          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                            isActive(item.href)
                              ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium'
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                        >
                          <item.icon className="text-xl" />
                          <span>{item.name}</span>
                        </Link>
                      )}
                    </div>
                  ))}
                </nav>

                {/* Logout */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <FiLogOut className="text-xl" />
                    <span className="font-medium">Logout</span>
                  </button>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="flex-1 lg:ml-0">
          {/* Overlay for mobile */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black/50 lg:hidden z-40"
              onClick={() => setSidebarOpen(false)}
            />
          )}
          <main id="main-content" role="main" className="p-6 flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>

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
                  Sorry Not Valid account
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

