'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FiAlertCircle,
  FiCheckCircle,
  FiXCircle,
  FiRefreshCw,
  FiFilter,
  FiSearch,
  FiTrash2,
  FiEye,
  FiZap,
  FiDatabase,
  FiTool,
} from 'react-icons/fi';
import { ErrorStatus, ErrorType } from '@/types/error';

interface Error {
  _id: string;
  errorType: ErrorType;
  status: ErrorStatus;
  message: string;
  stack?: string;
  endpoint?: string;
  method?: string;
  createdAt: string;
  fixAttempts: number;
  autoFixed?: boolean;
  fixDetails?: string;
  metadata?: {
    occurrenceCount?: number;
  };
}

interface ErrorStats {
  pending: number;
  fixed: number;
  autoFixed: number;
  ignored: number;
  byType: Array<{ _id: string; count: number }>;
}

export default function ErrorManagementPage() {
  const [errors, setErrors] = useState<Error[]>([]);
  const [stats, setStats] = useState<ErrorStats>({
    pending: 0,
    fixed: 0,
    autoFixed: 0,
    ignored: 0,
    byType: [],
  });
  const [loading, setLoading] = useState(true);
  const [fixing, setFixing] = useState<string | null>(null);
  const [repairing, setRepairing] = useState<string | null>(null);
  const [repairResult, setRepairResult] = useState<{ success: boolean; message: string; details?: any } | null>(null);
  const [filters, setFilters] = useState({
    status: 'pending',
    errorType: '',
    endpoint: '',
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchErrors();
  }, [filters, page]);

  const fetchErrors = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(filters.status && { status: filters.status }),
        ...(filters.errorType && { errorType: filters.errorType }),
        ...(filters.endpoint && { endpoint: filters.endpoint }),
      });

      const response = await fetch(`/api/admin/errors?${params}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setErrors(data.errors);
        setStats(data.stats);
        setTotalPages(data.pagination.pages);
      }
    } catch (error) {
      console.error('Failed to fetch errors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAutoFix = async (errorId: string) => {
    try {
      setFixing(errorId);
      const response = await fetch('/api/admin/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          errorId,
          action: 'auto_fix',
        }),
      });

      const result = await response.json();
      if (result.success) {
        alert(`✅ ${result.message}`);
        fetchErrors();
      } else {
        alert(`❌ ${result.message}`);
      }
    } catch (error) {
      alert('Failed to fix error');
    } finally {
      setFixing(null);
    }
  };

  const handleIgnore = async (errorId: string) => {
    try {
      setFixing(errorId);
      const response = await fetch('/api/admin/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          errorId,
          action: 'ignore',
        }),
      });

      const result = await response.json();
      if (result.success) {
        fetchErrors();
      }
    } catch (error) {
      alert('Failed to ignore error');
    } finally {
      setFixing(null);
    }
  };

  const handleMarkFixed = async (errorId: string) => {
    try {
      setFixing(errorId);
      const response = await fetch('/api/admin/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          errorId,
          action: 'mark_fixed',
        }),
      });

      const result = await response.json();
      if (result.success) {
        fetchErrors();
      }
    } catch (error) {
      alert('Failed to mark error as fixed');
    } finally {
      setFixing(null);
    }
  };

  const handleDatabaseRepair = async (repairType: string) => {
    try {
      setRepairing(repairType);
      setRepairResult(null);
      
      const response = await fetch('/api/admin/database/repair', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ repairType }),
      });

      const result = await response.json();
      setRepairResult({
        success: result.success,
        message: result.message,
        details: result.details,
      });

      if (result.success) {
        // Refresh errors after successful repair
        setTimeout(() => {
          fetchErrors();
        }, 1000);
      }
    } catch (error: any) {
      setRepairResult({
        success: false,
        message: `Failed to repair database: ${error.message}`,
      });
    } finally {
      setRepairing(null);
    }
  };

  const getStatusColor = (status: ErrorStatus) => {
    switch (status) {
      case ErrorStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case ErrorStatus.FIXED:
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case ErrorStatus.AUTO_FIXED:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case ErrorStatus.IGNORED:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getErrorTypeColor = (type: ErrorType) => {
    switch (type) {
      case ErrorType.API_ERROR:
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case ErrorType.DATABASE_ERROR:
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case ErrorType.VALIDATION_ERROR:
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Error Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Monitor and fix website errors automatically
          </p>
        </div>
        <button
          onClick={fetchErrors}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FiRefreshCw className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Pending Errors
              </p>
              <p className="text-3xl font-bold text-yellow-600 mt-2">
                {stats.pending}
              </p>
            </div>
            <FiAlertCircle className="text-4xl text-yellow-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Auto Fixed
              </p>
              <p className="text-3xl font-bold text-blue-600 mt-2">
                {stats.autoFixed}
              </p>
            </div>
            <FiZap className="text-4xl text-blue-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Manually Fixed
              </p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {stats.fixed}
              </p>
            </div>
            <FiCheckCircle className="text-4xl text-green-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Ignored
              </p>
              <p className="text-3xl font-bold text-gray-600 mt-2">
                {stats.ignored}
              </p>
            </div>
            <FiXCircle className="text-4xl text-gray-600" />
          </div>
        </motion.div>
      </div>

      {/* Database Repair Tools */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <FiDatabase className="text-2xl text-purple-600" />
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Database Repair Tools
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Fix database errors with one click
            </p>
          </div>
        </div>

        {repairResult && (
          <div
            className={`mb-4 p-4 rounded-lg ${
              repairResult.success
                ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
            }`}
          >
            <p
              className={`font-medium ${
                repairResult.success
                  ? 'text-green-800 dark:text-green-200'
                  : 'text-red-800 dark:text-red-200'
              }`}
            >
              {repairResult.success ? '✅' : '❌'} {repairResult.message}
            </p>
            {repairResult.details && (
              <details className="mt-2">
                <summary className="cursor-pointer text-sm text-gray-600 dark:text-gray-400">
                  View Details
                </summary>
                <pre className="mt-2 text-xs bg-gray-100 dark:bg-gray-900 p-2 rounded overflow-auto max-h-40">
                  {JSON.stringify(repairResult.details, null, 2)}
                </pre>
              </details>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <button
            onClick={() => handleDatabaseRepair('connection')}
            disabled={!!repairing}
            className="flex items-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
          >
            {repairing === 'connection' ? (
              <FiRefreshCw className="animate-spin" />
            ) : (
              <FiDatabase />
            )}
            Fix Connection
          </button>

          <button
            onClick={() => handleDatabaseRepair('indexes')}
            disabled={!!repairing}
            className="flex items-center gap-2 px-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
          >
            {repairing === 'indexes' ? (
              <FiRefreshCw className="animate-spin" />
            ) : (
              <FiTool />
            )}
            Fix Missing Indexes
          </button>

          <button
            onClick={() => handleDatabaseRepair('duplicates')}
            disabled={!!repairing}
            className="flex items-center gap-2 px-4 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
          >
            {repairing === 'duplicates' ? (
              <FiRefreshCw className="animate-spin" />
            ) : (
              <FiTool />
            )}
            Fix Duplicate Keys
          </button>

          <button
            onClick={() => handleDatabaseRepair('orphaned')}
            disabled={!!repairing}
            className="flex items-center gap-2 px-4 py-3 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
          >
            {repairing === 'orphaned' ? (
              <FiRefreshCw className="animate-spin" />
            ) : (
              <FiTool />
            )}
            Clean Orphaned Docs
          </button>

          <button
            onClick={() => handleDatabaseRepair('rebuild')}
            disabled={!!repairing}
            className="flex items-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
          >
            {repairing === 'rebuild' ? (
              <FiRefreshCw className="animate-spin" />
            ) : (
              <FiTool />
            )}
            Rebuild All Indexes
          </button>

          <button
            onClick={() => handleDatabaseRepair('all')}
            disabled={!!repairing}
            className="flex items-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-lg transition-colors font-semibold"
          >
            {repairing === 'all' ? (
              <FiRefreshCw className="animate-spin" />
            ) : (
              <FiZap />
            )}
            Run All Repairs
          </button>
        </div>
      </motion.div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => {
                setFilters({ ...filters, status: e.target.value });
                setPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="pending">Pending</option>
              <option value="fixed">Fixed</option>
              <option value="auto_fixed">Auto Fixed</option>
              <option value="ignored">Ignored</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Error Type
            </label>
            <select
              value={filters.errorType}
              onChange={(e) => {
                setFilters({ ...filters, errorType: e.target.value });
                setPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">All Types</option>
              <option value="api_error">API Error</option>
              <option value="database_error">Database Error</option>
              <option value="validation_error">Validation Error</option>
              <option value="network_error">Network Error</option>
              <option value="runtime_error">Runtime Error</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Endpoint
            </label>
            <input
              type="text"
              value={filters.endpoint}
              onChange={(e) => {
                setFilters({ ...filters, endpoint: e.target.value });
                setPage(1);
              }}
              placeholder="Filter by endpoint"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setFilters({ status: 'pending', errorType: '', endpoint: '' });
                setPage(1);
              }}
              className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Errors Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-600 dark:text-gray-400">
            Loading errors...
          </div>
        ) : errors.length === 0 ? (
          <div className="p-8 text-center text-gray-600 dark:text-gray-400">
            No errors found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Error
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Endpoint
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Occurrences
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {errors.map((error) => (
                  <tr key={error._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {error.message.substring(0, 100)}
                        {error.message.length > 100 && '...'}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {new Date(error.createdAt).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${getErrorTypeColor(
                          error.errorType
                        )}`}
                      >
                        {error.errorType.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {error.endpoint || 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                          error.status
                        )}`}
                      >
                        {error.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {error.metadata?.occurrenceCount || 1}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {error.status === ErrorStatus.PENDING && (
                          <>
                            <button
                              onClick={() => handleAutoFix(error._id)}
                              disabled={fixing === error._id}
                              className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1"
                              title="Auto Fix"
                            >
                              <FiZap className="w-3 h-3" />
                              Fix
                            </button>
                            <button
                              onClick={() => handleIgnore(error._id)}
                              disabled={fixing === error._id}
                              className="px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700 disabled:opacity-50"
                              title="Ignore"
                            >
                              <FiXCircle className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleMarkFixed(error._id)}
                              disabled={fixing === error._id}
                              className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:opacity-50"
                              title="Mark as Fixed"
                            >
                              <FiCheckCircle className="w-3 h-3" />
                            </button>
                          </>
                        )}
                        {error.fixDetails && (
                          <button
                            onClick={() => alert(error.fixDetails)}
                            className="px-3 py-1 bg-purple-600 text-white text-xs rounded hover:bg-purple-700"
                            title="View Fix Details"
                          >
                            <FiEye className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              Page {page} of {totalPages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

