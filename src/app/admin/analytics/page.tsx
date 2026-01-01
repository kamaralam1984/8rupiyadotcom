'use client';

import React, { useState, useEffect } from 'react';
import { 
  FiEye, 
  FiUsers, 
  FiClock, 
  FiShoppingBag,
  FiSmartphone,
  FiMonitor,
  FiTablet,
  FiTrendingUp,
  FiMapPin,
  FiFileText,
  FiCalendar,
  FiDownload,
  FiGlobe,
  FiUserCheck,
  FiActivity,
  FiZap,
} from 'react-icons/fi';
import StatCard from '@/components/analytics/StatCard';
import { exportCompleteReport, exportStatsToCSV, exportTopPagesToCSV, exportDailyTrendToCSV } from '@/lib/export-utils';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface AnalyticsStats {
  totalVisits: number;
  uniqueVisitors: number;
  returningVisitors: number;
  loggedInUsers: number;
  anonymousUsers: number;
  avgTimeSpent: number;
  totalHoursSpent: number;
  bounceRate: number;
  totalShops: number;
  activeShops: number;
  inactiveShops: number;
  deviceBreakdown: {
    mobile: number;
    desktop: number;
    tablet: number;
  };
  trafficSource: {
    direct: number;
    search: number;
    social: number;
    referral: number;
  };
  topPages: Array<{ path: string; views: number }>;
  trends: {
    daily: Array<{ date: string; visits: number }>;
    hourly: Array<{ hour: number; visits: number }>;
  };
}

interface RealtimeData {
  onlineUsers: number;
  loggedInUsers: number;
  anonymousUsers: number;
  deviceBreakdown: {
    mobile: number;
    desktop: number;
    tablet: number;
  };
  currentPages: Array<{ path: string; users: number }>;
  topCountries: Array<{
    country: string;
    users: number;
    cities: Array<{ city: string; count: number }>;
  }>;
  recentVisitors: Array<{
    visitorId: string;
    userName: string;
    device: string;
    country: string;
    city: string;
    isLoggedIn: boolean;
    lastSeen: string;
    timeAgo: number;
  }>;
  lastUpdated: string;
}

interface GeographyData {
  countries: Array<{
    country: string;
    visitors: number;
    totalVisits: number;
    avgTimeSpent: number;
  }>;
  cities: Array<{
    country: string;
    state: string;
    city: string;
    visitors: number;
    totalVisits: number;
    avgTimeSpent: number;
  }>;
}

export default function AnalyticsPage() {
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [realtime, setRealtime] = useState<RealtimeData | null>(null);
  const [geography, setGeography] = useState<GeographyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<'today' | '7days' | '30days'>('7days');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
    fetchRealtime();
    fetchGeography();
    
    // Refresh realtime data every 30 seconds
    const interval = setInterval(() => {
      fetchRealtime();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [range]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      const response = await fetch(`/api/analytics/stats?range=${range}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }

      const data = await response.json();
      setStats(data.stats);
    } catch (err: any) {
      console.error('Analytics error:', err);
      setError(err.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const fetchRealtime = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/analytics/realtime', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setRealtime(data.realtime);
      }
    } catch (err: any) {
      console.error('Realtime analytics error:', err);
    }
  };

  const fetchGeography = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/analytics/geography?range=${range}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setGeography(data.geography);
      }
    } catch (err: any) {
      console.error('Geography analytics error:', err);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  };

  // Device breakdown data for pie chart
  const deviceData = stats
    ? [
        { name: 'Mobile', value: stats.deviceBreakdown.mobile, color: '#3b82f6' },
        { name: 'Desktop', value: stats.deviceBreakdown.desktop, color: '#10b981' },
        { name: 'Tablet', value: stats.deviceBreakdown.tablet, color: '#f59e0b' },
      ]
    : [];

  // Traffic source data for pie chart
  const trafficData = stats
    ? [
        { name: 'Direct', value: stats.trafficSource.direct, color: '#3b82f6' },
        { name: 'Search', value: stats.trafficSource.search, color: '#10b981' },
        { name: 'Social', value: stats.trafficSource.social, color: '#f59e0b' },
        { name: 'Referral', value: stats.trafficSource.referral, color: '#8b5cf6' },
      ]
    : [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <FiTrendingUp className="text-blue-600" />
                Analytics Dashboard
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Complete website traffic & performance insights
              </p>
            </div>

            {/* Date range selector */}
            <div className="flex items-center gap-2">
              <FiCalendar className="text-gray-400" />
              <select
                value={range}
                onChange={(e) => setRange(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="today">Today</option>
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
              </select>
              <button
                onClick={fetchStats}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Refresh
              </button>
              <button
                onClick={() => stats && exportCompleteReport(stats, range)}
                disabled={!stats}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <FiDownload />
                Export CSV
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 font-medium">❌ {error}</p>
            <button
              onClick={fetchStats}
              className="mt-2 text-red-600 hover:text-red-800 underline text-sm"
            >
              Try again
            </button>
          </div>
        )}

        {/* Real-Time Stats Cards */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FiActivity className="text-green-600 animate-pulse" />
            Live Statistics
            {realtime && (
              <span className="text-sm font-normal text-gray-500">
                Updated {new Date(realtime.lastUpdated).toLocaleTimeString()}
              </span>
            )}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="🟢 Online Now"
              value={realtime?.onlineUsers.toLocaleString() || '0'}
              icon={<FiZap />}
              color="green"
              loading={!realtime}
            />
            <StatCard
              title="👤 Logged In"
              value={realtime?.loggedInUsers.toLocaleString() || '0'}
              icon={<FiUserCheck />}
              color="blue"
              loading={!realtime}
            />
            <StatCard
              title="Total Hours"
              value={stats ? `${stats.totalHoursSpent.toLocaleString()}h` : '0h'}
              icon={<FiClock />}
              color="purple"
              loading={loading}
            />
            <StatCard
              title="Countries"
              value={geography?.countries.length.toLocaleString() || '0'}
              icon={<FiGlobe />}
              color="orange"
              loading={!geography}
            />
          </div>
        </div>

        {/* Overview Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Visits"
            value={stats?.totalVisits.toLocaleString() || '0'}
            change={12.5}
            icon={<FiEye />}
            color="blue"
            loading={loading}
          />
          <StatCard
            title="Unique Visitors"
            value={stats?.uniqueVisitors.toLocaleString() || '0'}
            change={8.3}
            icon={<FiUsers />}
            color="green"
            loading={loading}
          />
          <StatCard
            title="Avg. Time Spent"
            value={stats ? formatTime(stats.avgTimeSpent) : '0s'}
            change={15.2}
            icon={<FiClock />}
            color="purple"
            loading={loading}
          />
          <StatCard
            title="Active Shops"
            value={stats?.activeShops.toLocaleString() || '0'}
            change={5.1}
            icon={<FiShoppingBag />}
            color="orange"
            loading={loading}
          />
        </div>

        {/* Geography & Online Users Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Top Countries/Cities */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FiGlobe className="text-blue-600" />
              Geographic Distribution
            </h3>
            {!geography ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Top Countries</h4>
                  {geography.countries.slice(0, 10).map((country, index) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">
                          {country.country === 'India' ? '🇮🇳' : 
                           country.country === 'United States' ? '🇺🇸' : 
                           country.country === 'United Kingdom' ? '🇬🇧' : '🌍'}
                        </span>
                        <span className="font-medium text-gray-900">{country.country}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-blue-600">{country.visitors}</div>
                        <div className="text-xs text-gray-500">{country.totalVisits} visits</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2 mt-4">Top Cities</h4>
                  {geography.cities.slice(0, 10).map((city, index) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100">
                      <div>
                        <div className="font-medium text-gray-900">{city.city}</div>
                        <div className="text-xs text-gray-500">{city.state}, {city.country}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-green-600">{city.visitors}</div>
                        <div className="text-xs text-gray-500">{formatTime(city.avgTimeSpent)} avg</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Online Users */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FiActivity className="text-green-600" />
              Online Users
              {realtime && (
                <span className="ml-2 px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded-full">
                  {realtime.onlineUsers} live
                </span>
              )}
            </h3>
            {!realtime ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {realtime.topCountries.map((country, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">
                          {country.country === 'India' ? '🇮🇳' : 
                           country.country === 'United States' ? '🇺🇸' : '🌍'}
                        </span>
                        <span className="font-semibold text-gray-900">{country.country}</span>
                      </div>
                      <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded">
                        {country.users} online
                      </span>
                    </div>
                    {country.cities.length > 0 && (
                      <div className="ml-7 text-sm text-gray-600">
                        {country.cities.slice(0, 3).map((city, idx) => (
                          <span key={idx} className="mr-3">
                            📍 {city.city} ({city.count})
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                
                {realtime.recentVisitors.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Recent Activity</h4>
                    {realtime.recentVisitors.slice(0, 5).map((visitor, index) => (
                      <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${visitor.timeAgo < 60 ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {visitor.userName} • {visitor.city}, {visitor.country}
                            </div>
                            <div className="text-xs text-gray-500">
                              {visitor.device} • {visitor.isLoggedIn ? '👤 Logged in' : '👻 Guest'}
                            </div>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">
                          {visitor.timeAgo < 60 ? 'just now' : `${Math.floor(visitor.timeAgo / 60)}m ago`}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Traffic Trend Chart */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FiTrendingUp className="text-blue-600" />
              Traffic Trend
            </h3>
            {loading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stats?.trends.daily || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="visits"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Device Breakdown */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FiSmartphone className="text-green-600" />
              Device Breakdown
            </h3>
            {loading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={deviceData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${percent ? (percent * 100).toFixed(0) : '0'}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {deviceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Traffic Source */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FiMapPin className="text-purple-600" />
              Traffic Source
            </h3>
            {loading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={trafficData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${percent ? (percent * 100).toFixed(0) : '0'}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {trafficData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Hourly Pattern */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FiClock className="text-orange-600" />
              Hourly Traffic Pattern
            </h3>
            {loading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats?.trends.hourly || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="visits" fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Top Pages Table */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FiFileText className="text-blue-600" />
            Top Pages
          </h3>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="animate-pulse flex items-center gap-4">
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Page
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Views
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stats?.topPages.map((page, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {page.path}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                        {page.views.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

