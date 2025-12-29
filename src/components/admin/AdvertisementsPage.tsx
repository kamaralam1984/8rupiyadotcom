'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiUpload,
  FiImage,
  FiEye,
  FiTrash2,
  FiToggleLeft,
  FiToggleRight,
  FiCalendar,
  FiBarChart2,
  FiMousePointer,
  FiTrendingUp,
  FiPlus,
  FiRefreshCw,
} from 'react-icons/fi';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, LineChart, Line } from 'recharts';

interface Ad {
  _id: string;
  title: string;
  image: string;
  position: 'header' | 'sidebar' | 'footer' | 'middle';
  clicks: number;
  impressions: number;
  ctr: number;
  isActive: boolean;
  startDate: string;
  endDate: string;
  revenue: number;
}

export default function AdvertisementsPage() {
  const [ads, setAds] = useState<Ad[]>([
    {
      _id: '1',
      title: 'Holiday Sale Banner',
      image: '/ads/banner1.jpg',
      position: 'header',
      clicks: 1250,
      impressions: 45000,
      ctr: 2.78,
      isActive: true,
      startDate: '2025-12-01',
      endDate: '2025-12-31',
      revenue: 15000,
    },
    {
      _id: '2',
      title: 'Sidebar Promotion',
      image: '/ads/banner2.jpg',
      position: 'sidebar',
      clicks: 890,
      impressions: 32000,
      ctr: 2.78,
      isActive: true,
      startDate: '2025-12-15',
      endDate: '2026-01-15',
      revenue: 8500,
    },
  ]);

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const performanceData = [
    { name: 'Mon', clicks: 400, impressions: 15000, revenue: 2400 },
    { name: 'Tue', clicks: 300, impressions: 12000, revenue: 2210 },
    { name: 'Wed', clicks: 500, impressions: 18000, revenue: 2900 },
    { name: 'Thu', clicks: 450, impressions: 16000, revenue: 2700 },
    { name: 'Fri', clicks: 600, impressions: 20000, revenue: 3500 },
    { name: 'Sat', clicks: 700, impressions: 25000, revenue: 4200 },
    { name: 'Sun', clicks: 550, impressions: 19000, revenue: 3300 },
  ];

  const toggleAdStatus = (adId: string) => {
    setAds(ads.map(ad => 
      ad._id === adId ? { ...ad, isActive: !ad.isActive } : ad
    ));
  };

  const deleteAd = (adId: string) => {
    if (confirm('Are you sure you want to delete this advertisement?')) {
      setAds(ads.filter(ad => ad._id !== adId));
      alert('Advertisement deleted!');
    }
  };

  const totalStats = {
    totalAds: ads.length,
    activeAds: ads.filter(a => a.isActive).length,
    totalClicks: ads.reduce((sum, ad) => sum + ad.clicks, 0),
    totalImpressions: ads.reduce((sum, ad) => sum + ad.impressions, 0),
    totalRevenue: ads.reduce((sum, ad) => sum + ad.revenue, 0),
    avgCTR: ads.length > 0 ? (ads.reduce((sum, ad) => sum + ad.ctr, 0) / ads.length).toFixed(2) : 0,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Advertisement Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage banner ads and track performance</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setLoading(!loading)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            <FiRefreshCw className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <FiPlus />
            Upload Ad
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
        {[
          { label: 'Total Ads', value: totalStats.totalAds, icon: FiImage, color: 'blue' },
          { label: 'Active Ads', value: totalStats.activeAds, icon: FiToggleRight, color: 'green' },
          { label: 'Total Clicks', value: totalStats.totalClicks.toLocaleString(), icon: FiMousePointer, color: 'purple' },
          { label: 'Impressions', value: totalStats.totalImpressions.toLocaleString(), icon: FiEye, color: 'yellow' },
          { label: 'Avg CTR', value: `${totalStats.avgCTR}%`, icon: FiTrendingUp, color: 'pink' },
          { label: 'Revenue', value: `₹${totalStats.totalRevenue.toLocaleString()}`, icon: FiBarChart2, color: 'green' },
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

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Clicks & Impressions (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={performanceData}>
              <XAxis dataKey="name" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip />
              <Legend />
              <Bar dataKey="clicks" fill="#8b5cf6" name="Clicks" />
              <Bar dataKey="impressions" fill="#3b82f6" name="Impressions" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Revenue Trend (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={performanceData}>
              <XAxis dataKey="name" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} name="Revenue (₹)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Ads Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ads.map((ad, index) => (
          <motion.div
            key={ad._id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            {/* Ad Image */}
            <div className="relative h-48 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 flex items-center justify-center">
              <FiImage className="text-white text-6xl opacity-50" />
              {ad.isActive && (
                <div className="absolute top-3 right-3">
                  <span className="px-3 py-1 text-xs font-medium rounded-full bg-green-500 text-white">
                    Active
                  </span>
                </div>
              )}
            </div>

            {/* Ad Details */}
            <div className="p-6 space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{ad.title}</h3>
                <span className="px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                  {ad.position}
                </span>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Clicks</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{ad.clicks.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Impressions</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{ad.impressions.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">CTR</p>
                  <p className="text-lg font-semibold text-purple-600">{ad.ctr}%</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Revenue</p>
                  <p className="text-lg font-semibold text-green-600">₹{ad.revenue.toLocaleString()}</p>
                </div>
              </div>

              {/* Dates */}
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <FiCalendar className="text-xs" />
                <span>{new Date(ad.startDate).toLocaleDateString()} - {new Date(ad.endDate).toLocaleDateString()}</span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => toggleAdStatus(ad._id)}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                    ad.isActive
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {ad.isActive ? <FiToggleLeft /> : <FiToggleRight />}
                  {ad.isActive ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                  title="Preview"
                >
                  <FiEye />
                </button>
                <button
                  onClick={() => deleteAd(ad._id)}
                  className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                  title="Delete"
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 max-w-md w-full"
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Upload Advertisement</h2>
              
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                  <FiUpload className="mx-auto text-4xl text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">Drag & drop or click to upload</p>
                  <input type="file" className="hidden" accept="image/*" />
                </div>

                <input
                  type="text"
                  placeholder="Ad Title"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />

                <select className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                  <option value="header">Header</option>
                  <option value="sidebar">Sidebar</option>
                  <option value="footer">Footer</option>
                  <option value="middle">Middle</option>
                </select>

                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="date"
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                  <input
                    type="date"
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowUploadModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setShowUploadModal(false);
                      alert('Ad uploaded successfully!');
                    }}
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    Upload
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

