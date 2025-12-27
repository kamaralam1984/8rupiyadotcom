'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  FiMenu, FiSave, FiEye, FiEyeOff, FiCopy, FiSettings, FiX, 
  FiChevronDown, FiLayout, FiPlus, FiTrash2, FiCheck, FiEdit2,
  FiHome, FiShoppingBag, FiTag, FiCreditCard, FiFileText, FiBarChart2,
  FiUser, FiLogIn, FiUserPlus, FiExternalLink, FiUsers
} from 'react-icons/fi';
import Link from 'next/link';

interface HomepageBlock {
  _id: string;
  type: string;
  title?: string;
  content: Record<string, any>;
  order: number;
  isActive: boolean;
}

interface HeroSettings {
  centerEffect: 'card' | '3d' | 'glass' | 'highlighted' | 'spotlight';
  leftEffect: 'card' | '3d' | 'glass' | 'highlighted' | 'spotlight';
  rightEffect: 'card' | '3d' | 'glass' | 'highlighted' | 'spotlight';
  rotationSpeed: number;
  animationSpeed: number;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  showLeftShop: boolean;
  showRightShop: boolean;
  showSearchBar: boolean;
}

interface HomepageLayout {
  _id: string;
  name: string;
  isActive: boolean;
  isDefault: boolean;
  sections: {
    hero: { enabled: boolean; order: number };
    connectionStatus: { enabled: boolean; order: number };
    leftRail: { enabled: boolean; order: number };
    rightRail: { enabled: boolean; order: number };
    featuredShops: { enabled: boolean; order: number; title?: string; limit?: number };
    paidShops: { enabled: boolean; order: number; title?: string; limit?: number };
    topRated: { enabled: boolean; order: number; title?: string; limit?: number };
    nearbyShops: { enabled: boolean; order: number; title?: string; limit?: number };
    stats: { enabled: boolean; order: number };
    footer: { enabled: boolean; order: number };
  };
}

function SortableBlock({ 
  block, 
  onToggle, 
  onDuplicate 
}: { 
  block: HomepageBlock;
  onToggle: (id: string) => void;
  onDuplicate: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      whileHover={{ scale: 1.02, x: 5 }}
      className={`bg-white/80 backdrop-blur-md rounded-xl shadow-lg p-5 mb-4 border ${
        block.isActive ? 'border-green-200' : 'border-gray-200/50 opacity-60'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiMenu className="w-6 h-6 text-gray-400" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-lg">{block.title || block.type}</h3>
            <p className="text-sm text-gray-500 capitalize">Type: {block.type.replace('_', ' ')}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <motion.button
            onClick={() => onDuplicate(block._id)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
            title="Duplicate Block"
          >
            <FiCopy className="text-blue-600 text-xl" />
          </motion.button>
          <motion.label
            whileTap={{ scale: 0.95 }}
            className="relative inline-flex items-center cursor-pointer"
          >
            <input
              type="checkbox"
              checked={block.isActive}
              className="sr-only peer"
              onChange={() => onToggle(block._id)}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-blue-500 peer-checked:to-purple-500"></div>
          </motion.label>
          {block.isActive ? (
            <FiEye className="text-green-500 text-xl" />
          ) : (
            <FiEyeOff className="text-gray-400 text-xl" />
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function HomepageBuilder() {
  const [blocks, setBlocks] = useState<HomepageBlock[]>([]);
  const [layouts, setLayouts] = useState<HomepageLayout[]>([]);
  const [activeLayout, setActiveLayout] = useState<HomepageLayout | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showHeroSettings, setShowHeroSettings] = useState(false);
  const [showLayoutSettings, setShowLayoutSettings] = useState(false);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [newLayoutName, setNewLayoutName] = useState('');
  const [heroSettings, setHeroSettings] = useState<HeroSettings>({
    centerEffect: 'card',
    leftEffect: '3d',
    rightEffect: 'glass',
    rotationSpeed: 5000,
    animationSpeed: 0.5,
    primaryColor: '#3B82F6',
    secondaryColor: '#8B5CF6',
    accentColor: '#EC4899',
    showLeftShop: true,
    showRightShop: true,
    showSearchBar: true,
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchBlocks();
    fetchHeroSettings();
    fetchLayouts();
  }, []);

  const fetchBlocks = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/homepage-blocks', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      });
      const data = await response.json();
      if (data.blocks) {
        setBlocks(data.blocks);
      }
    } catch (error) {
      console.error('Failed to fetch blocks:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLayouts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/homepage-layouts', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      });
      const data = await response.json();
      if (data.success) {
        setLayouts(data.layouts || []);
        setActiveLayout(data.activeLayout);
      }
    } catch (error) {
      console.error('Failed to fetch layouts:', error);
    }
  };

  const fetchHeroSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/hero-settings', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      });
      const data = await response.json();
      if (data.success && data.settings) {
        setHeroSettings(data.settings);
      }
    } catch (error) {
      console.error('Failed to fetch hero settings:', error);
    }
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setBlocks((items) => {
        const oldIndex = items.findIndex((item) => item._id === active.id);
        const newIndex = items.findIndex((item) => item._id === over.id);
        const newBlocks = arrayMove(items, oldIndex, newIndex);
        
        return newBlocks.map((block, index) => ({
          ...block,
          order: index,
        }));
      });
    }
  };

  const handleToggle = async (blockId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/homepage-blocks', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          action: 'toggle',
          blockId,
        }),
      });

      if (response.ok) {
        setBlocks((prev) =>
          prev.map((block) =>
            block._id === blockId ? { ...block, isActive: !block.isActive } : block
          )
        );
      }
    } catch (error) {
      console.error('Failed to toggle block:', error);
      alert('Failed to toggle block');
    }
  };

  const handleDuplicate = async (blockId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/homepage-blocks', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          action: 'duplicate',
          blockId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.block) {
          setBlocks((prev) => [...prev, data.block]);
          alert('Block duplicated successfully!');
        }
      }
    } catch (error) {
      console.error('Failed to duplicate block:', error);
      alert('Failed to duplicate block');
    }
  };

  const handleDuplicateHomepage = async () => {
    if (!activeLayout) {
      alert('No active layout to duplicate');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/homepage-layouts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          action: 'duplicate',
          sourceLayoutId: activeLayout._id,
          name: newLayoutName || `${activeLayout.name} (Copy)`,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          await fetchLayouts();
          setShowDuplicateModal(false);
          setNewLayoutName('');
          alert('Homepage duplicated successfully!');
        }
      }
    } catch (error) {
      console.error('Failed to duplicate homepage:', error);
      alert('Failed to duplicate homepage');
    }
  };

  const handleToggleSection = async (sectionKey: string) => {
    if (!activeLayout) return;

    const updatedSections = {
      ...activeLayout.sections,
      [sectionKey]: {
        ...activeLayout.sections[sectionKey as keyof typeof activeLayout.sections],
        enabled: !activeLayout.sections[sectionKey as keyof typeof activeLayout.sections].enabled,
      },
    };

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/homepage-layouts', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          layoutId: activeLayout._id,
          sections: updatedSections,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setActiveLayout(data.layout);
          await fetchLayouts();
        }
      }
    } catch (error) {
      console.error('Failed to toggle section:', error);
      alert('Failed to toggle section');
    }
  };

  const handleActivateLayout = async (layoutId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/homepage-layouts', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          layoutId,
          isActive: true,
        }),
      });

      if (response.ok) {
        await fetchLayouts();
        alert('Layout activated successfully!');
      }
    } catch (error) {
      console.error('Failed to activate layout:', error);
      alert('Failed to activate layout');
    }
  };

  const saveOrder = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/homepage-blocks', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          blocks: blocks.map((block) => ({
            id: block._id,
            order: block.order,
          })),
        }),
      });

      if (response.ok) {
        alert('Order saved successfully!');
      }
    } catch (error) {
      console.error('Failed to save order:', error);
      alert('Failed to save order');
    } finally {
      setSaving(false);
    }
  };

  const saveHeroSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/hero-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(heroSettings),
      });

      if (response.ok) {
        alert('Hero settings saved successfully!');
        setShowHeroSettings(false);
      }
    } catch (error) {
      console.error('Failed to save hero settings:', error);
      alert('Failed to save hero settings');
    }
  };

  const saveLayoutSettings = async () => {
    if (!activeLayout) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/homepage-layouts', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          layoutId: activeLayout._id,
          sections: activeLayout.sections,
        }),
      });

      if (response.ok) {
        alert('Layout settings saved successfully!');
        setShowLayoutSettings(false);
        await fetchLayouts();
      }
    } catch (error) {
      console.error('Failed to save layout settings:', error);
      alert('Failed to save layout settings');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  const sectionLabels: Record<string, string> = {
    hero: 'Hero Section',
    connectionStatus: 'Connection Status',
    leftRail: 'Left Sidebar',
    rightRail: 'Right Sidebar',
    featuredShops: 'Featured Shops',
    paidShops: 'Premium Shops',
    topRated: 'Top Rated Shops',
    nearbyShops: 'Nearby/All Shops',
    stats: 'Stats Section',
    footer: 'Footer',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 p-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-6 mb-6 border border-gray-200/50"
        >
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                Homepage Builder
              </h1>
              <p className="text-gray-600">Control all homepage components and layouts</p>
              {activeLayout && (
                <p className="text-sm text-gray-500 mt-1">
                  Active Layout: <span className="font-semibold text-blue-600">{activeLayout.name}</span>
                </p>
              )}
            </div>
            <div className="flex gap-3">
              <motion.button
                onClick={() => setShowDuplicateModal(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
              >
                <FiCopy className="text-xl" />
                Duplicate Homepage
              </motion.button>
              <motion.button
                onClick={() => setShowLayoutSettings(!showLayoutSettings)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
              >
                <FiLayout className="text-xl" />
                Layout Settings
              </motion.button>
              <motion.button
                onClick={() => setShowHeroSettings(!showHeroSettings)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
              >
                <FiSettings className="text-xl" />
                Hero Settings
              </motion.button>
              <motion.button
                onClick={saveOrder}
                disabled={saving}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 disabled:opacity-50"
              >
                <FiSave className="text-xl" />
                {saving ? 'Saving...' : 'Save Order'}
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Layouts List */}
        {layouts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-6 mb-6 border border-gray-200/50"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Homepage Layouts</h2>
              <Link
                href="/"
                target="_blank"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
              >
                View Homepage
                <FiExternalLink className="text-xs" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {layouts.map((layout) => (
                <div
                  key={layout._id}
                  className={`p-4 rounded-lg border-2 ${
                    layout.isActive
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{layout.name}</h3>
                    {layout.isActive && (
                      <span className="px-2 py-1 bg-green-500 text-white text-xs rounded-full">
                        Active
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2 mt-3">
                    {!layout.isActive && (
                      <button
                        onClick={() => handleActivateLayout(layout._id)}
                        className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Activate
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Quick Links to Other Pages */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-6 mb-6 border border-gray-200/50"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Links to Other Pages</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {/* Admin Pages */}
            <Link
              href="/admin"
              className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-2 mb-1">
                <FiHome className="text-blue-600 text-sm" />
                <span className="text-sm font-semibold text-gray-900">Admin Dashboard</span>
              </div>
              <p className="text-xs text-gray-600">/admin</p>
            </Link>

            <Link
              href="/admin/shops"
              className="p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200 hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-2 mb-1">
                <FiShoppingBag className="text-purple-600 text-sm" />
                <span className="text-sm font-semibold text-gray-900">Shops</span>
              </div>
              <p className="text-xs text-gray-600">/admin/shops</p>
            </Link>

            <Link
              href="/admin/categories"
              className="p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200 hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-2 mb-1">
                <FiTag className="text-green-600 text-sm" />
                <span className="text-sm font-semibold text-gray-900">Categories</span>
              </div>
              <p className="text-xs text-gray-600">/admin/categories</p>
            </Link>

            <Link
              href="/admin/plans"
              className="p-3 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg border border-yellow-200 hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-2 mb-1">
                <FiCreditCard className="text-yellow-600 text-sm" />
                <span className="text-sm font-semibold text-gray-900">Plans</span>
              </div>
              <p className="text-xs text-gray-600">/admin/plans</p>
            </Link>

            <Link
              href="/admin/ads"
              className="p-3 bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg border border-pink-200 hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-2 mb-1">
                <FiFileText className="text-pink-600 text-sm" />
                <span className="text-sm font-semibold text-gray-900">Ads & AdSense</span>
              </div>
              <p className="text-xs text-gray-600">/admin/ads</p>
            </Link>

            <Link
              href="/admin/reports"
              className="p-3 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg border border-indigo-200 hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-2 mb-1">
                <FiBarChart2 className="text-indigo-600 text-sm" />
                <span className="text-sm font-semibold text-gray-900">Reports</span>
              </div>
              <p className="text-xs text-gray-600">/admin/reports</p>
            </Link>

            {/* Agent Pages */}
            <Link
              href="/agent"
              className="p-3 bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-lg border border-cyan-200 hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-2 mb-1">
                <FiUser className="text-cyan-600 text-sm" />
                <span className="text-sm font-semibold text-gray-900">Agent Dashboard</span>
              </div>
              <p className="text-xs text-gray-600">/agent</p>
            </Link>

            <Link
              href="/agent/shops"
              className="p-3 bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg border border-teal-200 hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-2 mb-1">
                <FiShoppingBag className="text-teal-600 text-sm" />
                <span className="text-sm font-semibold text-gray-900">Agent Shops</span>
              </div>
              <p className="text-xs text-gray-600">/agent/shops</p>
            </Link>

            {/* Public Pages */}
            <Link
              href="/"
              className="p-3 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200 hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-2 mb-1">
                <FiHome className="text-orange-600 text-sm" />
                <span className="text-sm font-semibold text-gray-900">Homepage</span>
              </div>
              <p className="text-xs text-gray-600">/</p>
            </Link>

            <Link
              href="/login"
              className="p-3 bg-gradient-to-br from-red-50 to-red-100 rounded-lg border border-red-200 hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-2 mb-1">
                <FiUser className="text-red-600 text-sm" />
                <span className="text-sm font-semibold text-gray-900">Login</span>
              </div>
              <p className="text-xs text-gray-600">/login</p>
            </Link>

            <Link
              href="/register"
              className="p-3 bg-gradient-to-br from-violet-50 to-violet-100 rounded-lg border border-violet-200 hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-2 mb-1">
                <FiUsers className="text-violet-600 text-sm" />
                <span className="text-sm font-semibold text-gray-900">Register</span>
              </div>
              <p className="text-xs text-gray-600">/register</p>
            </Link>
          </div>
        </motion.div>

        {/* Duplicate Modal */}
        <AnimatePresence>
          {showDuplicateModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowDuplicateModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full"
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">Duplicate Homepage</h2>
                  <button
                    onClick={() => setShowDuplicateModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <FiX className="text-xl" />
                  </button>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    New Layout Name
                  </label>
                  <input
                    type="text"
                    value={newLayoutName}
                    onChange={(e) => setNewLayoutName(e.target.value)}
                    placeholder={`${activeLayout?.name || 'Homepage'} (Copy)`}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDuplicateModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDuplicateHomepage}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:shadow-lg transition-all"
                  >
                    Duplicate
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Layout Settings Panel */}
        <AnimatePresence>
          {showLayoutSettings && activeLayout && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-6 mb-6 border border-gray-200/50"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Homepage Sections Control</h2>
                <button
                  onClick={() => setShowLayoutSettings(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FiX className="text-xl text-gray-600" />
                </button>
              </div>

              <div className="space-y-4">
                {Object.entries(activeLayout.sections).map(([key, section]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div>
                      <h3 className="font-semibold text-gray-900">{sectionLabels[key] || key}</h3>
                      <p className="text-sm text-gray-500">Order: {section.order}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={section.enabled}
                        onChange={() => handleToggleSection(key)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-blue-500 peer-checked:to-purple-500"></div>
                    </label>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex justify-end">
                <motion.button
                  onClick={saveLayoutSettings}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Save Layout Settings
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hero Settings Panel - Keep existing code */}
        <AnimatePresence>
          {showHeroSettings && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-6 mb-6 border border-gray-200/50"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Hero Section Settings</h2>
                <button
                  onClick={() => setShowHeroSettings(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FiX className="text-xl text-gray-600" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Effects */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Center Effect</label>
                  <select
                    value={heroSettings.centerEffect}
                    onChange={(e) => setHeroSettings({ ...heroSettings, centerEffect: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="card">Card</option>
                    <option value="3d">3D</option>
                    <option value="glass">Glass</option>
                    <option value="highlighted">Highlighted</option>
                    <option value="spotlight">Spotlight</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Left Effect</label>
                  <select
                    value={heroSettings.leftEffect}
                    onChange={(e) => setHeroSettings({ ...heroSettings, leftEffect: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="card">Card</option>
                    <option value="3d">3D</option>
                    <option value="glass">Glass</option>
                    <option value="highlighted">Highlighted</option>
                    <option value="spotlight">Spotlight</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Right Effect</label>
                  <select
                    value={heroSettings.rightEffect}
                    onChange={(e) => setHeroSettings({ ...heroSettings, rightEffect: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="card">Card</option>
                    <option value="3d">3D</option>
                    <option value="glass">Glass</option>
                    <option value="highlighted">Highlighted</option>
                    <option value="spotlight">Spotlight</option>
                  </select>
                </div>

                {/* Speed Settings */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Rotation Speed: {heroSettings.rotationSpeed}ms
                  </label>
                  <input
                    type="range"
                    min="2000"
                    max="10000"
                    step="500"
                    value={heroSettings.rotationSpeed}
                    onChange={(e) => setHeroSettings({ ...heroSettings, rotationSpeed: parseInt(e.target.value) })}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Animation Speed: {heroSettings.animationSpeed}s
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="2"
                    step="0.1"
                    value={heroSettings.animationSpeed}
                    onChange={(e) => setHeroSettings({ ...heroSettings, animationSpeed: parseFloat(e.target.value) })}
                    className="w-full"
                  />
                </div>

                {/* Colors */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Primary Color</label>
                  <input
                    type="color"
                    value={heroSettings.primaryColor}
                    onChange={(e) => setHeroSettings({ ...heroSettings, primaryColor: e.target.value })}
                    className="w-full h-10 rounded-lg border border-gray-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Secondary Color</label>
                  <input
                    type="color"
                    value={heroSettings.secondaryColor}
                    onChange={(e) => setHeroSettings({ ...heroSettings, secondaryColor: e.target.value })}
                    className="w-full h-10 rounded-lg border border-gray-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Accent Color</label>
                  <input
                    type="color"
                    value={heroSettings.accentColor}
                    onChange={(e) => setHeroSettings({ ...heroSettings, accentColor: e.target.value })}
                    className="w-full h-10 rounded-lg border border-gray-300"
                  />
                </div>

                {/* Display Toggles */}
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={heroSettings.showLeftShop}
                      onChange={(e) => setHeroSettings({ ...heroSettings, showLeftShop: e.target.checked })}
                      className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-semibold text-gray-700">Show Left Shop</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={heroSettings.showRightShop}
                      onChange={(e) => setHeroSettings({ ...heroSettings, showRightShop: e.target.checked })}
                      className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-semibold text-gray-700">Show Right Shop</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={heroSettings.showSearchBar}
                      onChange={(e) => setHeroSettings({ ...heroSettings, showSearchBar: e.target.checked })}
                      className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-semibold text-gray-700">Show Search Bar</span>
                  </label>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <motion.button
                  onClick={saveHeroSettings}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Save Hero Settings
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={blocks.map((b) => b._id)} strategy={verticalListSortingStrategy}>
            {blocks.map((block, index) => (
              <motion.div
                key={block._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <SortableBlock 
                  block={block} 
                  onToggle={handleToggle}
                  onDuplicate={handleDuplicate}
                />
              </motion.div>
            ))}
          </SortableContext>
        </DndContext>

        {blocks.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-12 text-center border border-gray-200/50"
          >
            <div className="text-6xl mb-4">📦</div>
            <p className="text-gray-600 text-lg">No blocks found. Create your first block!</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
