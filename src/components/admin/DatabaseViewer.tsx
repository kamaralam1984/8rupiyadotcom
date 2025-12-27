'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiDatabase, FiSearch, FiEye, FiRefreshCw, FiChevronRight, FiChevronLeft } from 'react-icons/fi';

interface Collection {
  name: string;
  count: number;
  type: string;
}

interface Document {
  [key: string]: any;
}

export default function DatabaseViewer() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, pages: 1 });
  const [expandedDoc, setExpandedDoc] = useState<string | null>(null);

  useEffect(() => {
    fetchCollections();
  }, []);

  useEffect(() => {
    if (selectedCollection) {
      fetchDocuments();
    }
  }, [selectedCollection, page, search]);

  const fetchCollections = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login again');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/admin/database/collections', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setCollections(data.collections || []);
      } else {
        setError(data.error || 'Failed to fetch collections');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch collections');
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async () => {
    if (!selectedCollection) return;

    setDocumentsLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login again');
        setDocumentsLoading(false);
        return;
      }

      const params = new URLSearchParams({
        collection: selectedCollection,
        page: page.toString(),
        limit: '50',
      });
      if (search) {
        params.append('search', search);
      }

      const response = await fetch(`/api/admin/database/documents?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setDocuments(data.documents || []);
        setPagination(data.pagination || { page: 1, limit: 50, total: 0, pages: 1 });
      } else {
        setError(data.error || 'Failed to fetch documents');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch documents');
    } finally {
      setDocumentsLoading(false);
    }
  };

  const handleCollectionSelect = (collectionName: string) => {
    setSelectedCollection(collectionName);
    setPage(1);
    setSearch('');
    setExpandedDoc(null);
  };

  const formatValue = (value: any): string => {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Database Viewer</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">View and explore database collections</p>
        </div>
        <button
          onClick={fetchCollections}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <FiRefreshCw />
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Collections Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <FiDatabase />
              Collections ({collections.length})
            </h2>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {collections.map((collection) => (
                <button
                  key={collection.name}
                  onClick={() => handleCollectionSelect(collection.name)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    selectedCollection === collection.name
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                      : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{collection.name}</span>
                    <span className="text-xs bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                      {collection.count}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Documents View */}
        <div className="lg:col-span-3">
          {selectedCollection ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {selectedCollection} ({pagination.total} documents)
                </h2>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => {
                        setSearch(e.target.value);
                        setPage(1);
                      }}
                      placeholder="Search documents..."
                      className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {documentsLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
                </div>
              ) : documents.length === 0 ? (
                <div className="text-center py-12">
                  <FiDatabase className="text-6xl text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">No documents found</p>
                </div>
              ) : (
                <>
                  <div className="space-y-3 max-h-[600px] overflow-y-auto">
                    {documents.map((doc, index) => (
                      <motion.div
                        key={doc._id || index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <button
                          onClick={() => setExpandedDoc(expandedDoc === doc._id ? null : doc._id)}
                          className="w-full flex justify-between items-center"
                        >
                          <div className="flex-1 text-left">
                            <div className="font-medium text-gray-900 dark:text-white mb-1">
                              Document ID: {doc._id || 'N/A'}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {Object.keys(doc).length} fields
                            </div>
                          </div>
                          <FiEye className="text-gray-400" />
                        </button>

                        {expandedDoc === doc._id && (
                          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <pre className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg overflow-x-auto text-xs">
                              {JSON.stringify(doc, null, 2)}
                            </pre>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {pagination.pages > 1 && (
                    <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Showing {((page - 1) * pagination.limit) + 1} to {Math.min(page * pagination.limit, pagination.total)} of {pagination.total} documents
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setPage(p => Math.max(1, p - 1))}
                          disabled={page === 1}
                          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          <FiChevronLeft />
                        </button>
                        <span className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                          Page {page} of {pagination.pages}
                        </span>
                        <button
                          onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                          disabled={page === pagination.pages}
                          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          <FiChevronRight />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
              <FiDatabase className="text-6xl text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                Select a collection to view documents
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

