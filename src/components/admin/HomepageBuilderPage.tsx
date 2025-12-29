'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FiGrid,
  FiImage,
  FiStar,
  FiMessageSquare,
  FiUsers,
  FiShoppingBag,
  FiEye,
  FiSave,
  FiRefreshCw,
  FiChevronUp,
  FiChevronDown,
  FiTrash2,
  FiPlus,
} from 'react-icons/fi';

interface Block {
  id: string;
  type: 'hero' | 'featured-shops' | 'categories' | 'ads' | 'jyotish' | 'testimonials';
  title: string;
  enabled: boolean;
  order: number;
  config: any;
}

export default function HomepageBuilderPage() {
  const [blocks, setBlocks] = useState<Block[]>([
    {
      id: '1',
      type: 'hero',
      title: 'Hero Section',
      enabled: true,
      order: 1,
      config: { heading: 'Welcome to 8Rupiya', subheading: 'Find the best shops near you' },
    },
    {
      id: '2',
      type: 'categories',
      title: 'Categories Grid',
      enabled: true,
      order: 2,
      config: { columns: 4 },
    },
    {
      id: '3',
      type: 'featured-shops',
      title: 'Featured Shops',
      enabled: true,
      order: 3,
      config: { limit: 8 },
    },
    {
      id: '4',
      type: 'jyotish',
      title: 'Jyotish Services',
      enabled: true,
      order: 4,
      config: { showPandits: true },
    },
    {
      id: '5',
      type: 'testimonials',
      title: 'Customer Testimonials',
      enabled: false,
      order: 5,
      config: { limit: 6 },
    },
    {
      id: '6',
      type: 'ads',
      title: 'Advertisement Banner',
      enabled: true,
      order: 6,
      config: { position: 'middle' },
    },
  ]);

  const [selectedBlock, setSelectedBlock] = useState<Block | null>(null);

  const toggleBlock = (blockId: string) => {
    setBlocks(blocks.map(b => 
      b.id === blockId ? { ...b, enabled: !b.enabled } : b
    ));
  };

  const moveBlock = (blockId: string, direction: 'up' | 'down') => {
    const index = blocks.findIndex(b => b.id === blockId);
    if (index === -1) return;

    const newBlocks = [...blocks];
    if (direction === 'up' && index > 0) {
      [newBlocks[index], newBlocks[index - 1]] = [newBlocks[index - 1], newBlocks[index]];
    } else if (direction === 'down' && index < blocks.length - 1) {
      [newBlocks[index], newBlocks[index + 1]] = [newBlocks[index + 1], newBlocks[index]];
    }

    // Update order
    newBlocks.forEach((block, idx) => {
      block.order = idx + 1;
    });

    setBlocks(newBlocks);
  };

  const deleteBlock = (blockId: string) => {
    if (confirm('Are you sure you want to delete this block?')) {
      setBlocks(blocks.filter(b => b.id !== blockId));
    }
  };

  const getBlockIcon = (type: Block['type']) => {
    switch (type) {
      case 'hero': return FiImage;
      case 'featured-shops': return FiStar;
      case 'categories': return FiGrid;
      case 'ads': return FiImage;
      case 'jyotish': return FiUsers;
      case 'testimonials': return FiMessageSquare;
      default: return FiGrid;
    }
  };

  const handleSave = () => {
    alert('Homepage layout saved successfully!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Homepage Builder</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Customize your homepage layout and blocks</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            <FiEye />
            Preview
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <FiSave />
            Save Layout
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Blocks List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Homepage Blocks</h2>
              <button className="flex items-center gap-2 px-3 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                <FiPlus />
                Add Block
              </button>
            </div>

            <div className="space-y-3">
              {blocks.map((block, index) => {
                const Icon = getBlockIcon(block.type);
                return (
                  <motion.div
                    key={block.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      block.enabled
                        ? 'bg-white dark:bg-gray-700 border-purple-300 dark:border-purple-600'
                        : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          block.enabled 
                            ? 'bg-purple-100 dark:bg-purple-900/30' 
                            : 'bg-gray-200 dark:bg-gray-700'
                        }`}>
                          <Icon className={`text-xl ${
                            block.enabled 
                              ? 'text-purple-600 dark:text-purple-400' 
                              : 'text-gray-400'
                          }`} />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">{block.title}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Order: {block.order}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => moveBlock(block.id, 'up')}
                          disabled={index === 0}
                          className="p-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <FiChevronUp />
                        </button>
                        <button
                          onClick={() => moveBlock(block.id, 'down')}
                          disabled={index === blocks.length - 1}
                          className="p-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <FiChevronDown />
                        </button>
                        <button
                          onClick={() => toggleBlock(block.id)}
                          className={`px-3 py-2 text-sm font-medium rounded-lg ${
                            block.enabled
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                          }`}
                        >
                          {block.enabled ? 'Enabled' : 'Disabled'}
                        </button>
                        <button
                          onClick={() => setSelectedBlock(block)}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg"
                        >
                          <FiGrid />
                        </button>
                        <button
                          onClick={() => deleteBlock(block.id)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Configuration Panel */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Block Configuration</h2>
            
            {selectedBlock ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Block Title
                  </label>
                  <input
                    type="text"
                    value={selectedBlock.title}
                    onChange={(e) => {
                      const updated = { ...selectedBlock, title: e.target.value };
                      setSelectedBlock(updated);
                      setBlocks(blocks.map(b => b.id === updated.id ? updated : b));
                    }}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Block Type
                  </label>
                  <p className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white">
                    {selectedBlock.type}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Status
                  </label>
                  <button
                    onClick={() => toggleBlock(selectedBlock.id)}
                    className={`w-full px-4 py-2 rounded-lg font-medium ${
                      selectedBlock.enabled
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-red-600 text-white hover:bg-red-700'
                    }`}
                  >
                    {selectedBlock.enabled ? 'Enabled' : 'Disabled'}
                  </button>
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Configure block-specific settings here. More options coming soon!
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <FiGrid className="mx-auto text-4xl mb-2 opacity-50" />
                <p>Select a block to configure</p>
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Layout Stats</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Total Blocks</span>
                <span className="font-semibold text-gray-900 dark:text-white">{blocks.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Enabled</span>
                <span className="font-semibold text-green-600">{blocks.filter(b => b.enabled).length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Disabled</span>
                <span className="font-semibold text-red-600">{blocks.filter(b => !b.enabled).length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

