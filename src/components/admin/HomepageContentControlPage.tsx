'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FiToggleLeft, 
  FiToggleRight, 
  FiSave, 
  FiRefreshCw, 
  FiCheck, 
  FiX,
  FiLayout,
  FiShoppingBag,
  FiImage,
  FiFileText,
  FiGrid,
  FiSidebar,
  FiStar,
  FiMapPin,
  FiTrendingUp,
  FiBarChart,
  FiType,
  FiDollarSign,
  FiEye,
  FiEyeOff
} from 'react-icons/fi';

interface HomepageLayout {
  _id?: string;
  name: string;
  isActive: boolean;
  sections: {
    topCTA: { enabled: boolean; order: number };
    hero: { enabled: boolean; order: number };
    connectionStatus: { enabled: boolean; order: number };
    aboutSection: { enabled: boolean; order: number };
    seoTextSection: { enabled: boolean; order: number };
    leftRail: { enabled: boolean; order: number };
    rightRail: { enabled: boolean; order: number };
    featuredShops: { enabled: boolean; order: number; title?: string; limit?: number };
    paidShops: { enabled: boolean; order: number; title?: string; limit?: number };
    topRated: { enabled: boolean; order: number; title?: string; limit?: number };
    nearbyShops: { enabled: boolean; order: number; title?: string; limit?: number };
    mixedContent1: { enabled: boolean; order: number; variant?: string };
    mixedContent2: { enabled: boolean; order: number; variant?: string };
    mixedContent3: { enabled: boolean; order: number; variant?: string };
    mixedContent4: { enabled: boolean; order: number; variant?: string };
    displayAd1: { enabled: boolean; order: number };
    displayAd2: { enabled: boolean; order: number };
    inFeedAds: { enabled: boolean; order: number };
    stats: { enabled: boolean; order: number };
    footer: { enabled: boolean; order: number };
  };
}

interface SectionConfig {
  key: string;
  label: string;
  icon: any;
  category: 'top' | 'content' | 'sidebar' | 'shops' | 'mixed' | 'ads' | 'other';
  description?: string;
}

const sectionConfigs: SectionConfig[] = [
  // Top Sections
  { key: 'topCTA', label: 'Top CTA Section', icon: FiType, category: 'top', description: 'Start your local business journey banner' },
  { key: 'hero', label: 'Hero Section', icon: FiImage, category: 'top', description: 'Main hero carousel with featured shops' },
  { key: 'connectionStatus', label: 'Connection Status', icon: FiCheck, category: 'top', description: 'Database connection indicator' },
  
  // Content Sections
  { key: 'aboutSection', label: 'About Section', icon: FiFileText, category: 'content', description: 'About 8rupiya.com information' },
  { key: 'seoTextSection', label: 'SEO Text Section', icon: FiFileText, category: 'content', description: 'Long-form SEO content (600-800 words)' },
  
  // Sidebars
  { key: 'leftRail', label: 'Left Rail (Filters)', icon: FiSidebar, category: 'sidebar', description: 'Category and city filters' },
  { key: 'rightRail', label: 'Right Rail', icon: FiSidebar, category: 'sidebar', description: 'Top rated and trending shops' },
  
  // Shop Sections
  { key: 'featuredShops', label: 'Featured Shops', icon: FiStar, category: 'shops', description: 'Featured shop listings' },
  { key: 'paidShops', label: 'Paid Shops', icon: FiDollarSign, category: 'shops', description: 'Premium/paid shop listings' },
  { key: 'topRated', label: 'Top Rated Shops', icon: FiTrendingUp, category: 'shops', description: 'Highest rated shops' },
  { key: 'nearbyShops', label: 'Nearby Shops', icon: FiMapPin, category: 'shops', description: 'All nearby shops' },
  
  // Mixed Content Sections
  { key: 'mixedContent1', label: 'Mixed Content 1', icon: FiGrid, category: 'mixed', description: 'Text + Shops mixed layout (variant: text-left)' },
  { key: 'mixedContent2', label: 'Mixed Content 2', icon: FiGrid, category: 'mixed', description: 'Text + Shops mixed layout (variant: text-right)' },
  { key: 'mixedContent3', label: 'Mixed Content 3', icon: FiGrid, category: 'mixed', description: 'Text + Shops mixed layout (variant: text-center)' },
  { key: 'mixedContent4', label: 'Mixed Content 4', icon: FiGrid, category: 'mixed', description: 'Text-only section' },
  
  // Ad Sections
  { key: 'displayAd1', label: 'Display Ad 1', icon: FiEye, category: 'ads', description: 'Display ad after SEO section' },
  { key: 'displayAd2', label: 'Display Ad 2', icon: FiEye, category: 'ads', description: 'Display ad between sections' },
  { key: 'inFeedAds', label: 'In-Feed Ads', icon: FiEye, category: 'ads', description: 'Ads between shop cards' },
  
  // Other Sections
  { key: 'stats', label: 'Stats Section', icon: FiBarChart, category: 'other', description: 'Platform statistics' },
  { key: 'footer', label: 'Footer', icon: FiLayout, category: 'other', description: 'Page footer' },
];

const categoryLabels = {
  top: 'Top Sections',
  content: 'Content Sections',
  sidebar: 'Sidebars',
  shops: 'Shop Sections',
  mixed: 'Mixed Content',
  ads: 'Advertisement Sections',
  other: 'Other Sections'
};

export default function HomepageContentControlPage() {
  const [layout, setLayout] = useState<HomepageLayout | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchLayout();
  }, []);

  const fetchLayout = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/homepage-layouts');
      const data = await res.json();
      
      if (data.success && data.activeLayout) {
        setLayout(data.activeLayout);
      } else if (data.success && data.layouts && data.layouts.length > 0) {
        setLayout(data.layouts[0]);
      }
    } catch (error) {
      console.error('Error fetching layout:', error);
      setMessage({ type: 'error', text: 'Failed to load layout' });
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (sectionKey: string) => {
    if (!layout) return;
    
    setLayout({
      ...layout,
      sections: {
        ...layout.sections,
        [sectionKey]: {
          ...layout.sections[sectionKey as keyof typeof layout.sections],
          enabled: !layout.sections[sectionKey as keyof typeof layout.sections].enabled
        }
      }
    });
  };

  const saveLayout = async () => {
    if (!layout) return;

    try {
      setSaving(true);
      setMessage(null);

      const res = await fetch('/api/admin/homepage-layouts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          layoutId: layout._id,
          sections: layout.sections,
          isActive: true
        })
      });

      const data = await res.json();

      if (data.success) {
        setMessage({ type: 'success', text: 'Layout saved successfully!' });
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to save layout' });
      }
    } catch (error) {
      console.error('Error saving layout:', error);
      setMessage({ type: 'error', text: 'Failed to save layout' });
    } finally {
      setSaving(false);
    }
  };

  const toggleAllInCategory = (category: string) => {
    if (!layout) return;

    const categorySections = sectionConfigs.filter(s => s.category === category);
    const allEnabled = categorySections.every(s => 
      layout.sections[s.key as keyof typeof layout.sections].enabled
    );

    const updatedSections = { ...layout.sections };
    categorySections.forEach(s => {
      updatedSections[s.key as keyof typeof updatedSections] = {
        ...updatedSections[s.key as keyof typeof updatedSections],
        enabled: !allEnabled
      };
    });

    setLayout({ ...layout, sections: updatedSections });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!layout) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <p className="text-yellow-800 dark:text-yellow-200">
            No homepage layout found. Please create one first.
          </p>
        </div>
      </div>
    );
  }

  const categories = ['top', 'content', 'sidebar', 'shops', 'mixed', 'ads', 'other'] as const;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <FiLayout className="text-blue-600 dark:text-blue-400" />
            Homepage Content Control
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Enable or disable homepage content sections
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchLayout}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center gap-2"
          >
            <FiRefreshCw />
            Refresh
          </button>
          <button
            onClick={saveLayout}
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <FiRefreshCw className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <FiSave />
                Save Changes
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
          className={`p-4 rounded-lg flex items-center gap-3 ${
            message.type === 'success'
              ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
          }`}
        >
          {message.type === 'success' ? (
            <FiCheck className="text-green-600 dark:text-green-400" />
          ) : (
            <FiX className="text-red-600 dark:text-red-400" />
          )}
          <span className={message.type === 'success' ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}>
            {message.text}
          </span>
        </motion.div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {Object.values(layout.sections).filter(s => s.enabled).length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Enabled</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {Object.values(layout.sections).filter(s => !s.enabled).length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Disabled</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {Object.keys(layout.sections).length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Sections</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {layout.isActive ? 'Active' : 'Inactive'}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Layout Status</div>
        </div>
      </div>

      {/* Sections by Category */}
      {categories.map(category => {
        const categorySections = sectionConfigs.filter(s => s.category === category);
        if (categorySections.length === 0) return null;

        const allEnabled = categorySections.every(s => 
          layout.sections[s.key as keyof typeof layout.sections].enabled
        );

        return (
          <motion.div
            key={category}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            {/* Category Header */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {categoryLabels[category]}
              </h2>
              <button
                onClick={() => toggleAllInCategory(category)}
                className="px-4 py-2 text-sm bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors flex items-center gap-2"
              >
                {allEnabled ? <FiEyeOff /> : <FiEye />}
                {allEnabled ? 'Disable All' : 'Enable All'}
              </button>
            </div>

            {/* Sections Grid */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categorySections.map(section => {
                const sectionData = layout.sections[section.key as keyof typeof layout.sections];
                const isEnabled = sectionData.enabled;

                return (
                  <motion.div
                    key={section.key}
                    whileHover={{ scale: 1.02 }}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      isEnabled
                        ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20'
                        : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <section.icon className={`text-xl ${isEnabled ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`} />
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {section.label}
                          </h3>
                          {section.description && (
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                              {section.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleSection(section.key)}
                      className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                        isEnabled
                          ? 'bg-green-600 hover:bg-green-700 text-white'
                          : 'bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {isEnabled ? (
                        <>
                          <FiToggleRight className="text-xl" />
                          Enabled
                        </>
                      ) : (
                        <>
                          <FiToggleLeft className="text-xl" />
                          Disabled
                        </>
                      )}
                    </button>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

