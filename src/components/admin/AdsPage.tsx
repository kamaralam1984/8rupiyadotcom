'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiToggleLeft, FiToggleRight, FiSave, FiCheck, FiPlus, FiEdit, FiTrash2, FiX, FiEye, FiChevronDown, FiChevronUp } from 'react-icons/fi';

const adSlots = [
  { id: 'homepage', name: 'Homepage Ads', key: 'homepageAds', description: 'Ads will appear on the homepage' },
  { id: 'category', name: 'Category Ads', key: 'categoryAds', description: 'Ads will appear on category pages' },
  { id: 'search', name: 'Search Ads', key: 'searchAds', description: 'Ads will appear on search results' },
  { id: 'shop', name: 'Shop Page Ads', key: 'shopPageAds', description: 'Ads will appear on individual shop pages' },
];

interface CustomAd {
  id: string;
  name: string;
  code: string;
  enabled: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export default function AdsPage() {
  const [ads, setAds] = useState(adSlots.map(ad => ({ ...ad, enabled: true })));
  const [adsenseCode, setAdsenseCode] = useState('');
  const [customAds, setCustomAds] = useState<Record<string, CustomAd[]>>({
    homepage: [],
    category: [],
    search: [],
    shop: [],
  });
  const [expandedSlots, setExpandedSlots] = useState<Record<string, boolean>>({});
  const [editingAd, setEditingAd] = useState<{ slot: string; ad: CustomAd | null } | null>(null);
  const [showAddModal, setShowAddModal] = useState<{ slot: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login again');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/admin/ads', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.settings) {
          const settings = data.settings;
          setAds(adSlots.map(ad => ({
            ...ad,
            enabled: settings[ad.key] ?? true,
          })));
          setAdsenseCode(settings.adsenseCode || '');
          setCustomAds(settings.customAds || {
            homepage: [],
            category: [],
            search: [],
            shop: [],
          });
        }
      }
    } catch (err: any) {
      console.error('Error loading settings:', err);
      setError('Failed to load ad settings');
    } finally {
      setLoading(false);
    }
  };

  const toggleAd = (id: string) => {
    setAds((prev) =>
      prev.map((ad) => (ad.id === id ? { ...ad, enabled: !ad.enabled } : ad))
    );
  };

  const toggleSlotExpanded = (slotId: string) => {
    setExpandedSlots(prev => ({
      ...prev,
      [slotId]: !prev[slotId],
    }));
  };

  const handleAddAd = async (slot: string, name: string, code: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login again');
        return;
      }

      const response = await fetch('/api/admin/ads/custom', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ slot, name, code }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setCustomAds(prev => ({
            ...prev,
            [slot]: [...(prev[slot] || []), data.ad],
          }));
          setShowAddModal(null);
          setSuccess('Ad added successfully!');
          setTimeout(() => setSuccess(''), 3000);
        } else {
          setError(data.error || 'Failed to add ad');
        }
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        setError(errorData.error || 'Failed to add ad');
      }
    } catch (err: any) {
      console.error('Error adding ad:', err);
      setError('Failed to add ad');
    }
  };

  const handleUpdateAd = async (slot: string, adId: string, name: string, code: string, enabled: boolean) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login again');
        return;
      }

      const response = await fetch('/api/admin/ads/custom', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ slot, adId, name, code, enabled }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setCustomAds(prev => ({
            ...prev,
            [slot]: (prev[slot] || []).map(ad => ad.id === adId ? data.ad : ad),
          }));
          setEditingAd(null);
          setSuccess('Ad updated successfully!');
          setTimeout(() => setSuccess(''), 3000);
        } else {
          setError(data.error || 'Failed to update ad');
        }
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        setError(errorData.error || 'Failed to update ad');
      }
    } catch (err: any) {
      console.error('Error updating ad:', err);
      setError('Failed to update ad');
    }
  };

  const handleDeleteAd = async (slot: string, adId: string) => {
    if (!confirm('Are you sure you want to delete this ad?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login again');
        return;
      }

      const response = await fetch(`/api/admin/ads/custom?slot=${slot}&adId=${adId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setCustomAds(prev => ({
            ...prev,
            [slot]: (prev[slot] || []).filter(ad => ad.id !== adId),
          }));
          setSuccess('Ad deleted successfully!');
          setTimeout(() => setSuccess(''), 3000);
        } else {
          setError(data.error || 'Failed to delete ad');
        }
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        setError(errorData.error || 'Failed to delete ad');
      }
    } catch (err: any) {
      console.error('Error deleting ad:', err);
      setError('Failed to delete ad');
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login again');
        setSaving(false);
        return;
      }

      const settings: any = {
        adsenseCode,
        customAds,
      };

      ads.forEach(ad => {
        settings[ad.key] = ad.enabled;
      });

      const response = await fetch('/api/admin/ads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSuccess('Ad settings saved successfully!');
          setTimeout(() => setSuccess(''), 3000);
        } else {
          setError(data.error || 'Failed to save settings');
        }
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        setError(errorData.error || 'Failed to save settings');
      }
    } catch (err: any) {
      console.error('Error saving settings:', err);
      setError('Failed to save ad settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading ad settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Ads & Google AdSense</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Manage ad placements and AdSense integration</p>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <FiCheck className="text-green-600" />
          {success}
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Ad Slots with Custom Ads */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Ad Slots & Custom Ads</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Enable or disable ads on different pages and manage custom ads for each slot
        </p>
        <div className="space-y-4">
          {ads.map((ad) => (
            <div
              key={ad.id}
              className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
            >
              {/* Slot Header */}
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700">
                <div className="flex items-center gap-4 flex-1">
                  <button
                    onClick={() => toggleSlotExpanded(ad.id)}
                    className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                  >
                    {expandedSlots[ad.id] ? (
                      <FiChevronUp className="text-lg" />
                    ) : (
                      <FiChevronDown className="text-lg" />
                    )}
                  </button>
                  <div className="flex-1">
                    <span className="font-medium text-gray-900 dark:text-white">{ad.name}</span>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{ad.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setShowAddModal({ slot: ad.id })}
                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                  >
                    <FiPlus className="text-sm" />
                    Add Ad
                  </button>
                  <button
                    onClick={() => toggleAd(ad.id)}
                    className="flex items-center gap-2 cursor-pointer"
                    disabled={saving}
                  >
                    {ad.enabled ? (
                      <FiToggleRight className="text-4xl text-green-600" />
                    ) : (
                      <FiToggleLeft className="text-4xl text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* Custom Ads List */}
              <AnimatePresence>
                {expandedSlots[ad.id] && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 space-y-3 border-t border-gray-200 dark:border-gray-700">
                      {customAds[ad.id] && customAds[ad.id].length > 0 ? (
                        customAds[ad.id].map((customAd) => (
                          <div
                            key={customAd.id}
                            className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-900 dark:text-white">{customAd.name}</span>
                                {customAd.enabled ? (
                                  <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded">Enabled</span>
                                ) : (
                                  <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded">Disabled</span>
                                )}
                              </div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {customAd.code.substring(0, 100)}...
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setEditingAd({ slot: ad.id, ad: customAd })}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                title="Edit"
                              >
                                <FiEdit />
                              </button>
                              <button
                                onClick={() => handleDeleteAd(ad.id, customAd.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                title="Delete"
                              >
                                <FiTrash2 />
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                          No custom ads added yet. Click "Add Ad" to add one.
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>

      {/* AdSense Code */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Google AdSense Code</h2>
        <textarea
          value={adsenseCode}
          onChange={(e) => setAdsenseCode(e.target.value)}
          rows={8}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white font-mono text-sm"
          placeholder="Paste your Google AdSense code here..."
          disabled={saving}
        />
        <div className="mt-3 space-y-3">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Paste your AdSense code to enable ads across the website
          </p>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FiSave />
          {saving ? 'Saving...' : 'Save Settings'}
        </motion.button>
      </div>

      {/* Add Ad Modal */}
      <AnimatePresence>
        {showAddModal && (
          <AdModal
            slot={showAddModal.slot}
            slotName={adSlots.find(a => a.id === showAddModal.slot)?.name || ''}
            onClose={() => setShowAddModal(null)}
            onSave={(name, code) => {
              handleAddAd(showAddModal.slot, name, code);
            }}
          />
        )}
      </AnimatePresence>

      {/* Edit Ad Modal */}
      <AnimatePresence>
        {editingAd && (
          <AdModal
            slot={editingAd.slot}
            slotName={adSlots.find(a => a.id === editingAd.slot)?.name || ''}
            ad={editingAd.ad}
            onClose={() => setEditingAd(null)}
            onSave={(name, code, enabled) => {
              if (editingAd.ad) {
                handleUpdateAd(editingAd.slot, editingAd.ad.id, name, code, enabled ?? editingAd.ad.enabled);
              }
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

interface AdModalProps {
  slot: string;
  slotName: string;
  ad?: CustomAd | null;
  onClose: () => void;
  onSave: (name: string, code: string, enabled?: boolean) => void;
}

function AdModal({ slot, slotName, ad, onClose, onSave }: AdModalProps) {
  const [name, setName] = useState(ad?.name || '');
  const [code, setCode] = useState(ad?.code || '');
  const [enabled, setEnabled] = useState(ad?.enabled ?? true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) {
      alert('Please fill in all fields');
      return;
    }
    onSave(name, code, enabled);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            {ad ? 'Edit Ad' : 'Add New Ad'} - {slotName}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <FiX className="text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Ad Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="e.g., Banner Ad 1, Sidebar Ad, etc."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Ad Code (HTML/JavaScript)
            </label>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              rows={12}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white font-mono text-sm"
              placeholder="Paste your ad code here (HTML, JavaScript, or AdSense code)..."
              required
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              You can paste Google AdSense code, HTML banner code, or any JavaScript ad code here.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setEnabled(!enabled)}
              className="flex items-center gap-2"
            >
              {enabled ? (
                <FiToggleRight className="text-3xl text-green-600" />
              ) : (
                <FiToggleLeft className="text-3xl text-gray-400" />
              )}
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {enabled ? 'Enabled' : 'Disabled'}
              </span>
            </button>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {ad ? 'Update Ad' : 'Add Ad'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
