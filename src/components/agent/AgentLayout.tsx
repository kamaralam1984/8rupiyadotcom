'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
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
  FiTrendingUp,
  FiUserCheck,
  FiArrowLeft,
  FiGlobe,
} from 'react-icons/fi';

export default function AgentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [agentName, setAgentName] = useState('Agent');
  const [agentEmail, setAgentEmail] = useState('');
  const [userRole, setUserRole] = useState<string>('');
  const [showErrorModal, setShowErrorModal] = useState(false);

  useEffect(() => {
    // Fetch agent info and verify role
    const fetchAgentInfo = async () => {
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
            // Only allow agent or admin
            if (data.user.role !== 'agent' && data.user.role !== 'admin') {
              setShowErrorModal(true);
              setTimeout(() => {
                localStorage.removeItem('token');
                router.push('/login');
              }, 2000);
              return;
            }
            setAgentName(data.user?.name || 'Agent');
            setAgentEmail(data.user?.email || '');
            setUserRole(data.user.role || '');
          } else {
            router.push('/login');
          }
        } else {
          router.push('/login');
        }
      } catch (err) {
        console.error('Failed to fetch agent info:', err);
        router.push('/login');
      }
    };

    fetchAgentInfo();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  // Menu items - removed Shops, Agents, Shoppers from agent panel
  const allMenuItems = [
    { name: 'Dashboard', icon: FiHome, href: '/agent' },
    { name: 'Payments', icon: FiDollarSign, href: '/agent/payments' },
    { name: 'Settings', icon: FiSettings, href: '/agent/settings' },
  ];

  // Filter menu items based on user role
  const menuItems = userRole === 'admin' 
    ? allMenuItems.filter(item => item.name === 'Dashboard' || item.name === 'Settings')
    : allMenuItems;

  return (
    <div className="min-h-screen bg-gray-50 agent-panel" suppressHydrationWarning>
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Agent Panel</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-900"
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
          } fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transition-transform duration-300 lg:translate-x-0`}
        >
          <div className="h-full flex flex-col">
            {/* Logo/Header */}
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                8Rupiya
              </h2>
              <p className="text-sm text-gray-500 mt-1">Agent Panel</p>
            </div>

            {/* User Profile */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  {agentName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{agentName}</p>
                  <p className="text-xs text-gray-500 truncate">{agentEmail}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                    Agent
                  </span>
                </div>
              </div>
            </div>

            {/* Back to Homepage Button */}
            <div className="p-4 border-b border-gray-200">
              <Link
                href="/"
                className="flex items-center space-x-3 px-4 py-3 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg"
              >
                <FiGlobe className="text-xl" />
                <span className="font-semibold">Back to Homepage</span>
              </Link>
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
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="text-xl" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Logout */}
            <div className="p-4 border-t border-gray-200 space-y-2">
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
              >
                <FiLogOut className="text-xl" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 lg:ml-0 agent-panel">
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

      {/* Error Modal for Non-Agent Users */}
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
              className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <FiAlertCircle className="text-red-600 text-3xl" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Access Denied
                </h3>
                <p className="text-lg text-gray-600 mb-6">
                  Sorry Not Valid account
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 2, ease: 'linear' }}
                    className="bg-red-600 h-2 rounded-full"
                  />
                </div>
                <p className="text-sm text-gray-500">
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
