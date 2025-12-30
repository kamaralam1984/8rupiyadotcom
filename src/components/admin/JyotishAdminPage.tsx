'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiStar,
  FiUser,
  FiCalendar,
  FiDollarSign,
  FiCheckCircle,
  FiXCircle,
  FiEye,
  FiMail,
  FiPhone,
  FiMapPin,
  FiClock,
  FiRefreshCw,
  FiTrendingUp,
  FiUsers,
} from 'react-icons/fi';
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';

interface Pandit {
  _id: string;
  name: string;
  email: string;
  phone: string;
  image?: string;
  expertise: string[];
  specialties: string[];
  experience: string;
  rating: number;
  totalReviews: number;
  totalBookings: number;
  languages: string[];
  plan: 'free' | 'silver' | 'gold' | 'premium';
  price: number;
  available: boolean;
  bio?: string;
  education?: string[];
  certifications?: string[];
  isVerified: boolean;
  isActive: boolean;
  status: 'pending' | 'approved' | 'rejected' | 'blocked';
  createdAt: string;
  updatedAt: string;
}

interface Booking {
  _id: string;
  userId?: string;
  panditId: string;
  panditName: string;
  serviceType: 'call' | 'video';
  customerName: string;
  phone: string;
  email?: string;
  query: string;
  plan: 'free' | 'silver' | 'gold' | 'premium';
  price: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  scheduledAt?: string;
  completedAt?: string;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  paymentId?: string;
  rating?: number;
  review?: string;
  createdAt: string;
  updatedAt: string;
}

export default function JyotishAdminPage() {
  const [loading, setLoading] = useState(true);
  const [selectedPandit, setSelectedPandit] = useState<Pandit | null>(null);
  const [activeTab, setActiveTab] = useState<'pandits' | 'bookings'>('pandits');
  const [stats, setStats] = useState<any>(null);
  const [pandits, setPandits] = useState<Pandit[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const [statsRes, panditsRes, bookingsRes] = await Promise.all([
        fetch('/api/admin/jyotish/stats', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/admin/jyotish/pandits', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/admin/jyotish/bookings', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const [statsData, panditsData, bookingsData] = await Promise.all([
        statsRes.json(),
        panditsRes.json(),
        bookingsRes.json(),
      ]);

      if (statsData.success) {
        setStats(statsData.stats);
      }

      if (panditsData.success) {
        // Map database pandit structure and derive status
        const mappedPandits = panditsData.pandits.map((p: any) => ({
          ...p,
          status: p.isActive && p.isVerified ? 'approved' as const : 
                  p.isActive && !p.isVerified ? 'pending' as const : 
                  'blocked' as const,
        }));
        setPandits(mappedPandits);
      }

      if (bookingsData.success) {
        // Map database booking structure to component structure
        const mappedBookings = bookingsData.bookings.map((b: any) => ({
          _id: b._id,
          panditName: b.panditName,
          userName: b.customerName,
          service: b.serviceType === 'call' ? 'Phone Consultation' : 'Video Consultation',
          date: new Date(b.createdAt).toISOString().split('T')[0],
          amount: b.price,
          status: b.status,
        }));
        setBookings(mappedBookings);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const earningsData = stats?.earningsData || [];
  const servicesData = stats?.servicesData?.map((s: any) => ({
    ...s,
    color: ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'][Math.floor(Math.random() * 5)],
  })) || [];

  const handleApprove = (panditId: string) => {
    setPandits(pandits.map(p => 
      p._id === panditId ? { ...p, status: 'approved' as const } : p
    ));
    alert('Pandit approved successfully!');
  };

  const handleReject = (panditId: string) => {
    if (confirm('Are you sure you want to reject this pandit?')) {
      setPandits(pandits.map(p => 
        p._id === panditId ? { ...p, status: 'rejected' as const } : p
      ));
      alert('Pandit rejected!');
    }
  };

  const handleBlock = (panditId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'blocked' ? 'approved' : 'blocked';
    setPandits(pandits.map(p => 
      p._id === panditId ? { ...p, status: newStatus as any } : p
    ));
    alert(`Pandit ${newStatus === 'blocked' ? 'blocked' : 'unblocked'} successfully!`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'blocked':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Jyotish Admin</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage pandits, bookings, and services</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setLoading(!loading)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            <FiRefreshCw className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
      {[
        { label: 'Total Pandits', value: stats?.totalPandits || 0, icon: FiUsers, color: 'purple' },
        { label: 'Active Pandits', value: stats?.activePandits || 0, icon: FiCheckCircle, color: 'green' },
        { label: 'Pending Approval', value: stats?.pendingApproval || 0, icon: FiClock, color: 'yellow' },
        { label: 'Total Bookings', value: stats?.totalBookings || 0, icon: FiCalendar, color: 'blue' },
        { label: 'Total Earnings', value: `₹${((stats?.totalEarnings || 0) / 1000).toFixed(0)}K`, icon: FiDollarSign, color: 'green' },
        { label: 'Avg Rating', value: stats?.avgRating || '0.0', icon: FiStar, color: 'yellow' },
      ].map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-2">
              <stat.icon className={`text-${stat.color}-600 dark:text-${stat.color}-400 text-xl`} />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{stat.label}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Monthly Earnings Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={earningsData}>
              <XAxis dataKey="month" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip formatter={(value: any) => `₹${value.toLocaleString()}`} />
              <Legend />
              <Line type="monotone" dataKey="earnings" stroke="#8b5cf6" strokeWidth={2} name="Earnings" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Services Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={servicesData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name}: ${entry.value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {servicesData.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('pandits')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'pandits'
              ? 'text-purple-600 border-b-2 border-purple-600'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Pandits ({pandits.length})
        </button>
        <button
          onClick={() => setActiveTab('bookings')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'bookings'
              ? 'text-purple-600 border-b-2 border-purple-600'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Bookings ({bookings.length})
        </button>
      </div>

      {/* Pandits List */}
      {activeTab === 'pandits' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pandits.map((pandit, index) => (
            <motion.div
              key={pandit._id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              {/* Pandit Header */}
              <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                    <FiUser className="text-purple-600 text-2xl" />
                  </div>
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(pandit.status)}`}>
                    {pandit.status}
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-1">{pandit.name}</h3>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <FiStar
                        key={i}
                        className={`text-sm ${
                          i < Math.floor(pandit.rating)
                            ? 'text-yellow-300 fill-yellow-300'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm">{pandit.rating}</span>
                </div>
              </div>

              {/* Pandit Details */}
              <div className="p-6 space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <FiMail className="text-xs" />
                    {pandit.email}
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <FiPhone className="text-xs" />
                    {pandit.phone}
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <FiMapPin className="text-xs" />
                    Plan: {pandit.plan}
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Specialization:</p>
                  <div className="flex flex-wrap gap-2">
                    {(pandit.specialties || pandit.expertise || []).slice(0, 3).map((spec, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Experience</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">{pandit.experience}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Bookings</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">{pandit.totalBookings}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Price</p>
                    <p className="text-lg font-semibold text-green-600">₹{pandit.price}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                  {pandit.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleApprove(pandit._id)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                      >
                        <FiCheckCircle />
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(pandit._id)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                      >
                        <FiXCircle />
                        Reject
                      </button>
                    </>
                  )}
                  {(pandit.status === 'approved' || pandit.status === 'blocked') && (
                    <button
                      onClick={() => handleBlock(pandit._id, pandit.status)}
                      className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm ${
                        pandit.status === 'blocked'
                          ? 'bg-green-600 text-white hover:bg-green-700'
                          : 'bg-gray-600 text-white hover:bg-gray-700'
                      }`}
                    >
                      {pandit.status === 'blocked' ? 'Unblock' : 'Block'}
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedPandit(pandit)}
                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                  >
                    <FiEye />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Bookings List */}
      {activeTab === 'bookings' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Pandit</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">User</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Service</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Amount</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {bookings.map((booking) => (
                  <tr key={booking._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{booking.panditName}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{booking.customerName}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {booking.serviceType === 'call' ? 'Phone Call' : 'Video Call'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {new Date(booking.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-green-600">₹{booking.price}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
