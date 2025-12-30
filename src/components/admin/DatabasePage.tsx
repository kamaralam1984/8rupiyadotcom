'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiDatabase,
  FiFolder,
  FiFile,
  FiRefreshCw,
  FiSearch,
  FiEye,
  FiEdit,
  FiTrash2,
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiLayers,
} from 'react-icons/fi';

interface Collection {
  name: string;
  count: number;
  type: string;
}

interface Document {
  _id: string;
  [key: string]: any;
}

export default function DatabasePage() {
  const [loading, setLoading] = useState(true);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });

  useEffect(() => {
    fetchCollections();
  }, []);

  useEffect(() => {
    if (selectedCollection) {
      fetchDocuments();
    }
  }, [selectedCollection, page, searchQuery]);

  const fetchCollections = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/database/collections', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (data.success) {
        setCollections(data.collections);
      }
    } catch (error) {
      console.error('Error fetching collections:', error);
      alert('Failed to fetch collections');
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        collection: selectedCollection!,
        page: page.toString(),
        limit: '10',
      });

      if (searchQuery) {
        params.append('search', searchQuery);
      }

      const response = await fetch(`/api/admin/database/documents?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (data.success) {
        setDocuments(data.documents);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
      alert('Failed to fetch documents');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDocument = (doc: Document) => {
    setSelectedDocument(doc);
    setShowDocumentModal(true);
  };

  const handleEditDocument = (doc: Document) => {
    setSelectedDocument(doc);
    setEditData(JSON.stringify(doc, null, 2));
    setShowEditModal(true);
  };

  const handleSaveDocument = async () => {
    if (!selectedDocument) return;

    try {
      setSaving(true);
      const parsedData = JSON.parse(editData);
      const token = localStorage.getItem('token');

      const response = await fetch(
        `/api/admin/database/documents/${selectedDocument._id}?collection=${selectedCollection}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(parsedData),
        }
      );

      const data = await response.json();
      if (data.success) {
        alert('Document updated successfully!');
        setShowEditModal(false);
        setSelectedDocument(null);
        setEditData('');
        fetchDocuments();
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      console.error('Error saving document:', error);
      if (error instanceof SyntaxError) {
        alert('Invalid JSON format. Please check your syntax.');
      } else {
        alert(error.message || 'Failed to save document');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteDocument = async (id: string) => {
    if (!confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `/api/admin/database/documents/${id}?collection=${selectedCollection}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await response.json();
      if (data.success) {
        alert('Document deleted successfully');
        fetchDocuments();
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      console.error('Error deleting document:', error);
      alert(error.message || 'Failed to delete document');
    }
  };

  const renderValue = (value: any, maxLength: number = 50): string => {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    if (typeof value === 'object') {
      const str = JSON.stringify(value);
      return str.length > maxLength ? str.substring(0, maxLength) + '...' : str;
    }
    const str = String(value);
    return str.length > maxLength ? str.substring(0, maxLength) + '...' : str;
  };

  const getCollectionIcon = (name: string) => {
    if (name.includes('user')) return '👤';
    if (name.includes('shop')) return '🏪';
    if (name.includes('payment')) return '💳';
    if (name.includes('commission')) return '💰';
    if (name.includes('plan')) return '📋';
    if (name.includes('advertisement')) return '📢';
    return '📄';
  };

  const totalDocuments = collections.reduce((sum, col) => sum + col.count, 0);

  if (loading && collections.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Database Browser</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            View and manage MongoDB collections and documents
          </p>
        </div>
        <button
          onClick={fetchCollections}
          className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          <FiRefreshCw className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl shadow-lg p-6 text-white"
        >
          <div className="flex items-center justify-between mb-2">
            <FiLayers className="text-3xl" />
          </div>
          <p className="text-sm opacity-90 mb-1">Total Collections</p>
          <p className="text-4xl font-bold">{collections.length}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl shadow-lg p-6 text-white"
        >
          <div className="flex items-center justify-between mb-2">
            <FiFile className="text-3xl" />
          </div>
          <p className="text-sm opacity-90 mb-1">Total Documents</p>
          <p className="text-4xl font-bold">{totalDocuments.toLocaleString()}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg p-6 text-white"
        >
          <div className="flex items-center justify-between mb-2">
            <FiDatabase className="text-3xl" />
          </div>
          <p className="text-sm opacity-90 mb-1">Database Status</p>
          <p className="text-2xl font-bold">Connected</p>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Collections List */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <FiFolder />
                Collections
              </h2>
            </div>
            <div className="p-4 space-y-2 max-h-[600px] overflow-y-auto">
              {collections.map((collection) => (
                <button
                  key={collection.name}
                  onClick={() => {
                    setSelectedCollection(collection.name);
                    setPage(1);
                    setSearchQuery('');
                  }}
                  className={`w-full text-left p-4 rounded-lg transition-colors ${
                    selectedCollection === collection.name
                      ? 'bg-purple-100 dark:bg-purple-900/30 border-2 border-purple-500'
                      : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border-2 border-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getCollectionIcon(collection.name)}</span>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{collection.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {collection.count} documents
                        </p>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Documents View */}
        <div className="lg:col-span-2">
          {selectedCollection ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {selectedCollection}
                  </h2>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {pagination.total} documents
                  </span>
                </div>

                {/* Search */}
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setPage(1);
                    }}
                    placeholder="Search documents..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                  </div>
                ) : documents.length === 0 ? (
                  <div className="text-center py-12">
                    <FiFile className="mx-auto text-6xl text-gray-400 mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">No documents found</p>
                  </div>
                ) : (
                  documents.map((doc, index) => (
                    <motion.div
                      key={doc._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-mono text-gray-500 dark:text-gray-400 mb-2">
                            ID: {doc._id}
                          </p>
                          <div className="space-y-1">
                            {Object.entries(doc)
                              .filter(([key]) => key !== '_id')
                              .slice(0, 3)
                              .map(([key, value]) => (
                                <p key={key} className="text-sm text-gray-900 dark:text-white truncate">
                                  <span className="font-medium">{key}:</span>{' '}
                                  <span className="text-gray-600 dark:text-gray-400">
                                    {renderValue(value)}
                                  </span>
                                </p>
                              ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <button
                            onClick={() => handleViewDocument(doc)}
                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                            title="View"
                          >
                            <FiEye />
                          </button>
                          <button
                            onClick={() => handleEditDocument(doc)}
                            className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <FiEdit />
                          </button>
                          <button
                            onClick={() => handleDeleteDocument(doc._id)}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Page {pagination.page} of {pagination.pages}
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setPage(page - 1)}
                        disabled={page === 1}
                        className="p-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <FiChevronLeft />
                      </button>
                      <button
                        onClick={() => setPage(page + 1)}
                        disabled={page === pagination.pages}
                        className="p-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <FiChevronRight />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-12">
              <div className="text-center">
                <FiFolder className="mx-auto text-6xl text-gray-400 mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  Select a collection to view documents
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Document Modal */}
      <AnimatePresence>
        {showEditModal && selectedDocument && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Document</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Edit the JSON below and click Save
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedDocument(null);
                    setEditData('');
                  }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <FiX className="text-xl" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <textarea
                  value={editData}
                  onChange={(e) => setEditData(e.target.value)}
                  className="w-full h-[500px] p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-300 dark:border-gray-600 text-sm font-mono text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Edit JSON here..."
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  ⚠️ Warning: Editing documents directly can affect your application. Make sure JSON is valid.
                </p>
              </div>

              <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end gap-3">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedDocument(null);
                    setEditData('');
                  }}
                  className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveDocument}
                  disabled={saving}
                  className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Document View Modal */}
      <AnimatePresence>
        {showDocumentModal && selectedDocument && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Document Details</h2>
                <button
                  onClick={() => {
                    setShowDocumentModal(false);
                    setSelectedDocument(null);
                  }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <FiX className="text-xl" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <pre className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg overflow-x-auto text-sm">
                  <code className="text-gray-900 dark:text-white">
                    {JSON.stringify(selectedDocument, null, 2)}
                  </code>
                </pre>
              </div>

              <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end gap-3">
                <button
                  onClick={() => {
                    setShowDocumentModal(false);
                    setSelectedDocument(null);
                  }}
                  className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
