'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiPlus,
  FiEdit,
  FiTrash2,
  FiX,
  FiSave,
  FiSearch,
  FiGrid,
  FiList,
  FiEye,
  FiEyeOff,
  FiTrendingUp,
  FiPackage,
  FiCheckCircle,
  FiRefreshCw,
} from 'react-icons/fi';

interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt?: string;
}

interface FormData {
  name: string;
  description: string;
  icon: string;
  displayOrder: number;
  isActive: boolean;
}

export default function CategoryManagementPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    icon: '',
    displayOrder: 0,
    isActive: true,
  });
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/categories', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
        calculateStats(data.categories || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (cats: Category[]) => {
    setStats({
      total: cats.length,
      active: cats.filter(c => c.isActive).length,
      inactive: cats.filter(c => !c.isActive).length,
    });
  };

  const handleOpenModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        description: category.description || '',
        icon: category.icon || '',
        displayOrder: category.displayOrder,
        isActive: category.isActive,
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        description: '',
        icon: '',
        displayOrder: categories.length,
        isActive: true,
      });
    }
    setError('');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Category name is required');
      return;
    }

    try {
      setFormLoading(true);
      setError('');

      const token = localStorage.getItem('token');
      const url = editingCategory 
        ? `/api/admin/categories/${editingCategory._id}`
        : '/api/admin/categories';
      const method = editingCategory ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        await fetchCategories();
        handleCloseModal();
      } else {
        setError(data.error || 'Failed to save category');
      }
    } catch (error) {
      console.error('Error saving category:', error);
      setError('Failed to save category. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (category: Category) => {
    if (!confirm(`Are you sure you want to delete "${category.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/categories/${category._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        await fetchCategories();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete category');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Failed to delete category. Please try again.');
    }
  };

  const toggleActive = async (category: Category) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/categories/${category._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: !category.isActive }),
      });

      if (response.ok) {
        await fetchCategories();
      }
    } catch (error) {
      console.error('Error toggling category status:', error);
    }
  };

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const emojiList = ['📱', '👕', '🏪', '🍔', '🏥', '🎓', '🏋️', '🎨', '🔧', '💼', '🏠', '🚗', '📚', '💻', '🎮', '⚽', '🎵', '🍕', '💊', '✂️'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Category Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage shop categories and classifications</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchCategories()}
            className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            <FiRefreshCw className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl"
          >
            <FiPlus />
            Add Category
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Categories', value: stats.total, icon: FiPackage, color: 'purple' },
          { label: 'Active', value: stats.active, icon: FiCheckCircle, color: 'green' },
          { label: 'Inactive', value: stats.inactive, icon: FiEyeOff, color: 'gray' },
        ].map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
              </div>
              <div className={`p-4 rounded-xl bg-${stat.color}-100 dark:bg-${stat.color}-900/30`}>
                <stat.icon className={`text-${stat.color}-600 dark:text-${stat.color}-400 text-2xl`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Search & View Mode */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-gray-600 text-purple-600 shadow'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <FiGrid />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-gray-600 text-purple-600 shadow'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <FiList />
            </button>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent"></div>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="text-center py-20">
            <FiPackage className="mx-auto text-6xl text-gray-400 mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              {searchTerm ? 'No categories found matching your search' : 'No categories yet'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => handleOpenModal()}
                className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Create First Category
              </button>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
            {filteredCategories.map((category, index) => (
              <motion.div
                key={category._id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className={`relative bg-gradient-to-br ${
                  category.isActive
                    ? 'from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800'
                    : 'from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 border-gray-300 dark:border-gray-600'
                } rounded-xl p-6 border-2 hover:shadow-xl transition-all duration-300 group`}
              >
                {/* Icon & Name */}
                <div className="mb-4">
                  <div className="text-4xl mb-3">{category.icon || '📦'}</div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                    {category.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{category.slug}</p>
                </div>

                {/* Description */}
                {category.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                    {category.description}
                  </p>
                )}

                {/* Status & Order */}
                <div className="flex items-center gap-2 mb-4">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      category.isActive
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                    }`}
                  >
                    {category.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                    Order: {category.displayOrder}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleActive(category)}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm ${
                      category.isActive
                        ? 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                    title={category.isActive ? 'Deactivate' : 'Activate'}
                  >
                    {category.isActive ? <FiEyeOff /> : <FiEye />}
                    {category.isActive ? 'Hide' : 'Show'}
                  </button>
                  <button
                    onClick={() => handleOpenModal(category)}
                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    title="Edit"
                  >
                    <FiEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(category)}
                    className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    title="Delete"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Category
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Slug
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Description
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Order
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredCategories.map((category) => (
                  <motion.tr
                    key={category._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{category.icon || '📦'}</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {category.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {category.slug}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {category.description || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white font-medium">
                      {category.displayOrder}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 text-xs font-medium rounded-full ${
                          category.isActive
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                        }`}
                      >
                        {category.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleActive(category)}
                          className={`p-2 rounded-lg transition-colors ${
                            category.isActive
                              ? 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
                              : 'text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/30'
                          }`}
                          title={category.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {category.isActive ? <FiEyeOff /> : <FiEye />}
                        </button>
                        <button
                          onClick={() => handleOpenModal(category)}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <FiEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(category)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 rounded-t-2xl z-10">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">
                    {editingCategory ? 'Edit Category' : 'Add New Category'}
                  </h2>
                  <button
                    onClick={handleCloseModal}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <FiX className="text-2xl" />
                  </button>
                </div>
              </div>

              {/* Modal Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <p className="text-red-600 dark:text-red-400">{error}</p>
                  </div>
                )}

                {/* Category Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                    placeholder="Electronics, Clothing, Food, etc."
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                    placeholder="Brief description of this category..."
                  />
                </div>

                {/* Icon Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Icon (Emoji)
                  </label>
                  <div className="grid grid-cols-10 gap-2 mb-3">
                    {emojiList.map((emoji, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setFormData({ ...formData, icon: emoji })}
                        className={`text-2xl p-2 rounded-lg transition-all ${
                          formData.icon === emoji
                            ? 'bg-purple-100 dark:bg-purple-900/30 ring-2 ring-purple-500 scale-110'
                            : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                    placeholder="Or paste any emoji..."
                  />
                </div>

                {/* Display Order & Status */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Display Order
                    </label>
                    <input
                      type="number"
                      value={formData.displayOrder}
                      onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                      min="0"
                    />
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors w-full">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                      />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        Active
                      </span>
                    </label>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    disabled={formLoading}
                    className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading || !formData.name.trim()}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg"
                  >
                    {formLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <FiSave />
                        {editingCategory ? 'Update Category' : 'Create Category'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

