'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FiUpload, FiImage, FiClock, FiDroplet, FiSettings, 
  FiSave, FiRefreshCw, FiCheck, FiX, FiEye
} from 'react-icons/fi';
import { HeroEffect } from '@/models/HeroSettings';

const HERO_EFFECTS: HeroEffect[] = [
  'card', '3d', 'glass', 'highlighted', 'spotlight',
  'gradient', 'neon', 'minimal', 'bold', 'elegant',
  'modern', 'classic', 'vibrant', 'subtle', 'dynamic',
  'smooth', 'sharp', 'rounded', 'angular', 'curved',
  'glow', 'shadow', 'border', 'outline', 'filled',
  'animated', 'static', 'hover', 'pulse', 'fade'
];

interface HeroSettings {
  backgroundImage?: string;
  centerEffect: HeroEffect;
  leftEffect: HeroEffect;
  rightEffect: HeroEffect;
  rotationSpeed: number;
  animationSpeed: number;
  transitionDuration: number;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  showLeftShop: boolean;
  showRightShop: boolean;
  showSearchBar: boolean;
}

export default function HeroSettingsPage() {
  const [settings, setSettings] = useState<HeroSettings>({
    centerEffect: 'card',
    leftEffect: '3d',
    rightEffect: 'glass',
    rotationSpeed: 5000,
    animationSpeed: 0.5,
    transitionDuration: 0.5,
    primaryColor: '#3B82F6',
    secondaryColor: '#8B5CF6',
    accentColor: '#EC4899',
    showLeftShop: true,
    showRightShop: true,
    showSearchBar: true,
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/hero-settings', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success && data.settings) {
        setSettings(data.settings);
        if (data.settings.backgroundImage) {
          setPreviewImage(data.settings.backgroundImage);
        }
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      setMessage({ type: 'error', text: 'Failed to load settings' });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Please upload an image file' });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Image size should be less than 5MB' });
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'hero');

      const token = localStorage.getItem('token');
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();
      if (data.success && data.url) {
        setSettings({ ...settings, backgroundImage: data.url });
        setPreviewImage(data.url);
        setMessage({ type: 'success', text: 'Image uploaded successfully' });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to upload image' });
      }
    } catch (error) {
      console.error('Upload error:', error);
      setMessage({ type: 'error', text: 'Failed to upload image' });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/hero-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });

      const data = await response.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Settings saved successfully!' });
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to save settings' });
      }
    } catch (error) {
      console.error('Save error:', error);
      setMessage({ type: 'error', text: 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  const removeImage = () => {
    setSettings({ ...settings, backgroundImage: '' });
    setPreviewImage(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Hero Section Settings</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Configure hero section appearance, effects, and timing</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchSettings}
            className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            <FiRefreshCw />
            Refresh
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Saving...
              </>
            ) : (
              <>
                <FiSave />
                Save Settings
              </>
            )}
          </button>
        </div>
      </div>

      {/* Message */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-lg flex items-center justify-between ${
            message.type === 'success'
              ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200'
              : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {message.type === 'success' ? (
              <FiCheck className="text-green-600" />
            ) : (
              <FiX className="text-red-600" />
            )}
            <span>{message.text}</span>
          </div>
          <button onClick={() => setMessage(null)} className="text-gray-500 hover:text-gray-700">
            <FiX />
          </button>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Background Image Upload */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
          >
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <FiImage />
              Background Image
            </h2>
            
            {previewImage ? (
              <div className="relative mb-4">
                <img
                  src={previewImage}
                  alt="Hero background preview"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <button
                  onClick={removeImage}
                  className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  <FiX />
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center mb-4">
                <FiImage className="text-4xl text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 dark:text-gray-400">No image uploaded</p>
              </div>
            )}

            <label className="block">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
                className="hidden"
                id="image-upload"
              />
              <div className="flex items-center gap-2">
                <label
                  htmlFor="image-upload"
                  className={`flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors ${
                    uploading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <FiUpload />
                      {previewImage ? 'Change Image' : 'Upload Image'}
                    </>
                  )}
                </label>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Max 5MB, JPG/PNG/WebP
                </span>
              </div>
            </label>
          </motion.div>

          {/* Effect Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
          >
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <FiSettings />
              Hero Effects (30 Options)
            </h2>

            <div className="space-y-4">
              {/* Center Effect */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Center Effect
                </label>
                <select
                  value={settings.centerEffect}
                  onChange={(e) => setSettings({ ...settings, centerEffect: e.target.value as HeroEffect })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {HERO_EFFECTS.map((effect) => (
                    <option key={effect} value={effect}>
                      {effect.charAt(0).toUpperCase() + effect.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Left Effect */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Left Effect
                </label>
                <select
                  value={settings.leftEffect}
                  onChange={(e) => setSettings({ ...settings, leftEffect: e.target.value as HeroEffect })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {HERO_EFFECTS.map((effect) => (
                    <option key={effect} value={effect}>
                      {effect.charAt(0).toUpperCase() + effect.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Right Effect */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Right Effect
                </label>
                <select
                  value={settings.rightEffect}
                  onChange={(e) => setSettings({ ...settings, rightEffect: e.target.value as HeroEffect })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {HERO_EFFECTS.map((effect) => (
                    <option key={effect} value={effect}>
                      {effect.charAt(0).toUpperCase() + effect.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Time Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
          >
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <FiClock />
              Time Settings
            </h2>

            <div className="space-y-4">
              {/* Rotation Speed */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Rotation Speed: {settings.rotationSpeed}ms ({settings.rotationSpeed / 1000}s)
                </label>
                <input
                  type="range"
                  min="1000"
                  max="60000"
                  step="1000"
                  value={settings.rotationSpeed}
                  onChange={(e) => setSettings({ ...settings, rotationSpeed: parseInt(e.target.value) })}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span>1s (Fast)</span>
                  <span>30s</span>
                  <span>60s (Slow)</span>
                </div>
              </div>

              {/* Animation Speed */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Animation Speed: {settings.animationSpeed}s
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="5"
                  step="0.1"
                  value={settings.animationSpeed}
                  onChange={(e) => setSettings({ ...settings, animationSpeed: parseFloat(e.target.value) })}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span>0.1s (Fast)</span>
                  <span>2.5s</span>
                  <span>5s (Slow)</span>
                </div>
              </div>

              {/* Transition Duration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Transition Duration: {settings.transitionDuration}s
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="5"
                  step="0.1"
                  value={settings.transitionDuration}
                  onChange={(e) => setSettings({ ...settings, transitionDuration: parseFloat(e.target.value) })}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span>0.1s (Fast)</span>
                  <span>2.5s</span>
                  <span>5s (Slow)</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Color Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
          >
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <FiDroplet />
              Color Settings
            </h2>

            <div className="space-y-4">
              {/* Primary Color */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Primary Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={settings.primaryColor}
                    onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                    className="w-16 h-10 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={settings.primaryColor}
                    onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="#3B82F6"
                  />
                </div>
              </div>

              {/* Secondary Color */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Secondary Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={settings.secondaryColor}
                    onChange={(e) => setSettings({ ...settings, secondaryColor: e.target.value })}
                    className="w-16 h-10 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={settings.secondaryColor}
                    onChange={(e) => setSettings({ ...settings, secondaryColor: e.target.value })}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="#8B5CF6"
                  />
                </div>
              </div>

              {/* Accent Color */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Accent Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={settings.accentColor}
                    onChange={(e) => setSettings({ ...settings, accentColor: e.target.value })}
                    className="w-16 h-10 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={settings.accentColor}
                    onChange={(e) => setSettings({ ...settings, accentColor: e.target.value })}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="#EC4899"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Display Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
          >
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Display Settings
            </h2>

            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.showLeftShop}
                  onChange={(e) => setSettings({ ...settings, showLeftShop: e.target.checked })}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-gray-700 dark:text-gray-300">Show Left Shop</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.showRightShop}
                  onChange={(e) => setSettings({ ...settings, showRightShop: e.target.checked })}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-gray-700 dark:text-gray-300">Show Right Shop</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.showSearchBar}
                  onChange={(e) => setSettings({ ...settings, showSearchBar: e.target.checked })}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-gray-700 dark:text-gray-300">Show Search Bar</span>
              </label>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Preview Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
      >
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <FiEye />
          Preview
        </h2>
        <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            Preview will be available after saving settings and refreshing the homepage
          </p>
        </div>
      </motion.div>
    </div>
  );
}

