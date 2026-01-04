'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FiEdit,
  FiSave,
  FiX,
  FiFileText,
  FiThumbsUp,
  FiPackage,
  FiStar,
  FiSearch,
  FiCheckCircle,
  FiPlus,
  FiTrash2,
} from 'react-icons/fi';

interface Shop {
  _id: string;
  name: string;
  category: string;
  city: string;
}

interface PageContent {
  about?: string;
  whyChoose?: {
    verified?: string;
    customerSatisfaction?: string;
    convenientLocation?: string;
    qualityAssured?: string;
  };
  services?: {
    intro?: string;
    paragraph1?: string;
    paragraph2?: string;
  };
  whatMakesSpecial?: string[];
  seoContent?: {
    intro?: string;
    paragraph1?: string;
    paragraph2?: string;
    paragraph3?: string;
  };
}

export default function ShopPageEditor() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [pageContent, setPageContent] = useState<PageContent>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchShops();
  }, []);

  const fetchShops = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/shops', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setShops(data.shops || []);
      }
    } catch (error) {
      console.error('Error fetching shops:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectShop = async (shop: Shop) => {
    setSelectedShop(shop);
    setError('');
    setSuccess('');
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/shops/${shop._id}`);
      const data = await response.json();
      
      if (response.ok && data.shop) {
        // Load existing page content or use defaults
        setPageContent(data.shop.pageContent || {
          about: '',
          whyChoose: {
            verified: '',
            customerSatisfaction: '',
            convenientLocation: '',
            qualityAssured: '',
          },
          services: {
            intro: '',
            paragraph1: '',
            paragraph2: '',
          },
          whatMakesSpecial: ['', '', '', ''],
          seoContent: {
            intro: '',
            paragraph1: '',
            paragraph2: '',
            paragraph3: '',
          },
        });
      }
    } catch (error) {
      console.error('Error fetching shop:', error);
      setError('Failed to load shop details');
    }
  };

  const handleSave = async () => {
    if (!selectedShop) return;

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/shops/${selectedShop._id}/page-content`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ pageContent }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Page content saved successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error || 'Failed to save page content');
      }
    } catch (error) {
      console.error('Error saving page content:', error);
      setError('Failed to save page content. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const addSpecialFeature = () => {
    setPageContent({
      ...pageContent,
      whatMakesSpecial: [...(pageContent.whatMakesSpecial || []), ''],
    });
  };

  const removeSpecialFeature = (index: number) => {
    const updated = [...(pageContent.whatMakesSpecial || [])];
    updated.splice(index, 1);
    setPageContent({
      ...pageContent,
      whatMakesSpecial: updated,
    });
  };

  const updateSpecialFeature = (index: number, value: string) => {
    const updated = [...(pageContent.whatMakesSpecial || [])];
    updated[index] = value;
    setPageContent({
      ...pageContent,
      whatMakesSpecial: updated,
    });
  };

  const filteredShops = shops.filter(shop =>
    shop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shop.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shop.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Shop Page Content Editor</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Edit and customize shop detail page content</p>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-800 dark:text-green-200"
        >
          {success}
        </motion.div>
      )}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-800 dark:text-red-200"
        >
          {error}
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Sidebar - Shop List */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Select Shop</h2>
            
            {/* Search */}
            <div className="relative mb-4">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search shops..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Shop List */}
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {filteredShops.map((shop) => (
                <button
                  key={shop._id}
                  onClick={() => handleSelectShop(shop)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedShop?._id === shop._id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-900 dark:text-white'
                  }`}
                >
                  <div className="font-semibold">{shop.name}</div>
                  <div className={`text-sm ${selectedShop?._id === shop._id ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'}`}>
                    {shop.category} • {shop.city}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side - Editor */}
        <div className="lg:col-span-2">
          {selectedShop ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 space-y-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedShop.name}</h2>
                  <p className="text-gray-600 dark:text-gray-400">{selectedShop.category} • {selectedShop.city}</p>
                </div>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50"
                >
                  <FiSave />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>

              {/* About Section */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <FiFileText className="text-blue-600 text-xl" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">About Section</h3>
                </div>
                <textarea
                  value={pageContent.about || ''}
                  onChange={(e) => setPageContent({ ...pageContent, about: e.target.value })}
                  rows={4}
                  placeholder="Enter custom about text (leave empty to use default shop description)"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  This will replace the default "About {selectedShop.name}" section
                </p>
              </div>

              {/* Why Choose Section */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <FiThumbsUp className="text-blue-600 text-xl" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Why Choose Section</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Verified & Trusted
                    </label>
                    <textarea
                      value={pageContent.whyChoose?.verified || ''}
                      onChange={(e) => setPageContent({
                        ...pageContent,
                        whyChoose: { ...pageContent.whyChoose, verified: e.target.value }
                      })}
                      rows={2}
                      placeholder="Enter text for Verified & Trusted section"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Customer Satisfaction
                    </label>
                    <textarea
                      value={pageContent.whyChoose?.customerSatisfaction || ''}
                      onChange={(e) => setPageContent({
                        ...pageContent,
                        whyChoose: { ...pageContent.whyChoose, customerSatisfaction: e.target.value }
                      })}
                      rows={2}
                      placeholder="Enter text for Customer Satisfaction section"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Convenient Location
                    </label>
                    <textarea
                      value={pageContent.whyChoose?.convenientLocation || ''}
                      onChange={(e) => setPageContent({
                        ...pageContent,
                        whyChoose: { ...pageContent.whyChoose, convenientLocation: e.target.value }
                      })}
                      rows={2}
                      placeholder="Enter text for Convenient Location section"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Quality Assured
                    </label>
                    <textarea
                      value={pageContent.whyChoose?.qualityAssured || ''}
                      onChange={(e) => setPageContent({
                        ...pageContent,
                        whyChoose: { ...pageContent.whyChoose, qualityAssured: e.target.value }
                      })}
                      rows={2}
                      placeholder="Enter text for Quality Assured section"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Services Section */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <FiPackage className="text-blue-600 text-xl" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Services & Products Section</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Introduction Paragraph
                    </label>
                    <textarea
                      value={pageContent.services?.intro || ''}
                      onChange={(e) => setPageContent({
                        ...pageContent,
                        services: { ...pageContent.services, intro: e.target.value }
                      })}
                      rows={3}
                      placeholder="Enter introduction paragraph"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Paragraph 1
                    </label>
                    <textarea
                      value={pageContent.services?.paragraph1 || ''}
                      onChange={(e) => setPageContent({
                        ...pageContent,
                        services: { ...pageContent.services, paragraph1: e.target.value }
                      })}
                      rows={3}
                      placeholder="Enter first paragraph"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Paragraph 2
                    </label>
                    <textarea
                      value={pageContent.services?.paragraph2 || ''}
                      onChange={(e) => setPageContent({
                        ...pageContent,
                        services: { ...pageContent.services, paragraph2: e.target.value }
                      })}
                      rows={3}
                      placeholder="Enter second paragraph"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* What Makes Special Section */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <FiStar className="text-blue-600 text-xl" />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">What Makes Us Special</h3>
                  </div>
                  <button
                    onClick={addSpecialFeature}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                  >
                    <FiPlus />
                    Add Feature
                  </button>
                </div>
                <div className="space-y-3">
                  {(pageContent.whatMakesSpecial || []).map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={feature}
                          onChange={(e) => updateSpecialFeature(index, e.target.value)}
                          placeholder={`Special feature ${index + 1}`}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <button
                        onClick={() => removeSpecialFeature(index)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* SEO Content Section */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <FiSearch className="text-blue-600 text-xl" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">SEO Content Section</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Introduction
                    </label>
                    <textarea
                      value={pageContent.seoContent?.intro || ''}
                      onChange={(e) => setPageContent({
                        ...pageContent,
                        seoContent: { ...pageContent.seoContent, intro: e.target.value }
                      })}
                      rows={3}
                      placeholder="Enter SEO introduction paragraph"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Paragraph 1
                    </label>
                    <textarea
                      value={pageContent.seoContent?.paragraph1 || ''}
                      onChange={(e) => setPageContent({
                        ...pageContent,
                        seoContent: { ...pageContent.seoContent, paragraph1: e.target.value }
                      })}
                      rows={3}
                      placeholder="Enter SEO paragraph 1"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Paragraph 2
                    </label>
                    <textarea
                      value={pageContent.seoContent?.paragraph2 || ''}
                      onChange={(e) => setPageContent({
                        ...pageContent,
                        seoContent: { ...pageContent.seoContent, paragraph2: e.target.value }
                      })}
                      rows={3}
                      placeholder="Enter SEO paragraph 2"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Paragraph 3
                    </label>
                    <textarea
                      value={pageContent.seoContent?.paragraph3 || ''}
                      onChange={(e) => setPageContent({
                        ...pageContent,
                        seoContent: { ...pageContent.seoContent, paragraph3: e.target.value }
                      })}
                      rows={3}
                      placeholder="Enter SEO paragraph 3"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Save Button (Bottom) */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6 flex justify-end">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50"
                >
                  <FiSave />
                  {saving ? 'Saving...' : 'Save All Changes'}
                </button>
              </div>
            </motion.div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
              <FiFileText className="text-6xl text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Shop Selected</h3>
              <p className="text-gray-600 dark:text-gray-400">Select a shop from the list to edit its page content</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

