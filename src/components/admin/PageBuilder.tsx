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
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  FiMenu, FiSave, FiEye, FiEyeOff, FiCopy, FiSettings, FiX,
  FiChevronDown, FiLayout, FiPlus, FiTrash2, FiCheck, FiEdit2,
  FiExternalLink, FiLink, FiImage, FiType, FiSliders, FiZap,
  FiAlignLeft, FiAlignRight, FiFileText, FiArrowLeft
} from 'react-icons/fi';
import { PageComponentType, PageComponent, AnimationEffect, CustomPage } from '@/types/CustomPage';
import Link from 'next/link';

function SortableComponent({
  component,
  onEdit,
  onDelete,
  onToggle,
}: {
  component: PageComponent;
  onEdit: (component: PageComponent) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: component._id || '' });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const componentLabels: Record<PageComponentType, string> = {
    [PageComponentType.HERO]: 'Hero Section',
    [PageComponentType.LEFT_RAIL]: 'Left Rail',
    [PageComponentType.RIGHT_RAIL]: 'Right Rail',
    [PageComponentType.AD_SPACE]: 'Ad Space',
    [PageComponentType.BUTTON]: 'Button',
    [PageComponentType.SLIDER]: 'Slider',
    [PageComponentType.CONTENT]: 'Content',
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      whileHover={{ scale: 1.02, x: 5 }}
      className={`bg-white/80 backdrop-blur-md rounded-xl shadow-lg p-5 mb-4 border ${
        component.isActive ? 'border-green-200' : 'border-gray-200/50 opacity-60'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiMenu className="w-6 h-6 text-gray-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 text-lg">
              {componentLabels[component.type]}
            </h3>
            <p className="text-sm text-gray-500">
              Order: {component.order} | 
              {component.animation && component.animation.type !== 'none' && (
                <span className="ml-2">Animation: {component.animation.type}</span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <motion.button
            onClick={() => onEdit(component)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
            title="Edit Component"
          >
            <FiEdit2 className="text-blue-600 text-xl" />
          </motion.button>
          <motion.button
            onClick={() => component._id && onDelete(component._id)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete Component"
          >
            <FiTrash2 className="text-red-600 text-xl" />
          </motion.button>
          <motion.label
            whileTap={{ scale: 0.95 }}
            className="relative inline-flex items-center cursor-pointer"
          >
            <input
              type="checkbox"
              checked={component.isActive}
              className="sr-only peer"
              onChange={() => component._id && onToggle(component._id)}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-blue-500 peer-checked:to-purple-500"></div>
          </motion.label>
          {component.isActive ? (
            <FiEye className="text-green-500 text-xl" />
          ) : (
            <FiEyeOff className="text-gray-400 text-xl" />
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function PageBuilder() {
  const [pages, setPages] = useState<CustomPage[]>([]);
  const [selectedPage, setSelectedPage] = useState<CustomPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPageModal, setShowPageModal] = useState(false);
  const [showComponentModal, setShowComponentModal] = useState(false);
  const [editingComponent, setEditingComponent] = useState<PageComponent | null>(null);
  const [pageForm, setPageForm] = useState({
    title: '',
    slug: '',
    description: '',
    isPublished: false,
  });
  const [componentForm, setComponentForm] = useState<PageComponent>({
    type: PageComponentType.HERO,
    order: 0,
    isActive: true,
    content: {},
    animation: { type: 'none', duration: 500, delay: 0 },
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/pages', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      });
      const data = await response.json();
      if (data.pages) {
        setPages(data.pages);
      }
    } catch (error) {
      console.error('Failed to fetch pages:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPage = async (pageId: string) => {
    try {
      const token = localStorage.getItem('token');
      // Fetch full page data with components
      const response = await fetch(`/api/admin/pages?id=${pageId}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      });
      if (response.ok) {
        const data = await response.json();
        if (data.page) {
          setSelectedPage(data.page);
        }
      } else {
        console.error('Failed to fetch page');
      }
    } catch (error) {
      console.error('Failed to fetch page:', error);
    }
  };

  const handleCreatePage = () => {
    setPageForm({
      title: '',
      slug: '',
      description: '',
      isPublished: false,
    });
    setSelectedPage(null);
    setShowPageModal(true);
  };

  const handleEditPage = (page: CustomPage) => {
    setPageForm({
      title: page.title,
      slug: page.slug,
      description: page.description || '',
      isPublished: page.isPublished,
    });
    setShowPageModal(true);
  };

  const handleSavePage = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      const url = selectedPage
        ? '/api/admin/pages'
        : '/api/admin/pages';
      const method = selectedPage ? 'PUT' : 'POST';

      const body = selectedPage
        ? { pageId: selectedPage._id, ...pageForm }
        : { ...pageForm, components: [] };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        await fetchPages();
        setShowPageModal(false);
        if (!selectedPage) {
          const data = await response.json();
          setSelectedPage(data.page);
        }
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to save page');
      }
    } catch (error) {
      console.error('Failed to save page:', error);
      alert('Failed to save page');
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePage = async (pageId: string) => {
    if (!confirm('Are you sure you want to delete this page?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/pages?id=${pageId}`, {
        method: 'DELETE',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      });

      if (response.ok) {
        await fetchPages();
        if (selectedPage?._id === pageId) {
          setSelectedPage(null);
        }
      }
    } catch (error) {
      console.error('Failed to delete page:', error);
      alert('Failed to delete page');
    }
  };

  const handleAddComponent = () => {
    setEditingComponent(null);
    setComponentForm({
      type: PageComponentType.HERO,
      order: selectedPage?.components.length || 0,
      isActive: true,
      content: {},
      animation: { type: 'none', duration: 500, delay: 0 },
    });
    setShowComponentModal(true);
  };

  const handleEditComponent = (component: PageComponent) => {
    setEditingComponent(component);
    setComponentForm(component);
    setShowComponentModal(true);
  };

  const handleSaveComponent = () => {
    if (!selectedPage) return;

    const components = [...selectedPage.components];
    if (editingComponent && editingComponent._id) {
      const index = components.findIndex((c) => c._id === editingComponent._id);
      if (index !== -1) {
        components[index] = { ...componentForm, _id: editingComponent._id };
      }
    } else {
      components.push({ ...componentForm, _id: `temp-${Date.now()}` });
    }

    setSelectedPage({ ...selectedPage, components });
    setShowComponentModal(false);
  };

  const handleDeleteComponent = (componentId: string) => {
    if (!selectedPage) return;
    const components = selectedPage.components.filter((c) => c._id !== componentId);
    setSelectedPage({ ...selectedPage, components });
  };

  const handleToggleComponent = (componentId: string) => {
    if (!selectedPage) return;
    const components = selectedPage.components.map((c) =>
      c._id === componentId ? { ...c, isActive: !c.isActive } : c
    );
    setSelectedPage({ ...selectedPage, components });
  };

  const handleDragEnd = (event: any) => {
    if (!selectedPage) return;
    const { active, over } = event;

    if (active.id !== over.id) {
      const components = [...selectedPage.components];
      const oldIndex = components.findIndex((c) => c._id === active.id);
      const newIndex = components.findIndex((c) => c._id === over.id);
      const newComponents = arrayMove(components, oldIndex, newIndex);

      setSelectedPage({
        ...selectedPage,
        components: newComponents.map((comp, index) => ({
          ...comp,
          order: index,
        })),
      });
    }
  };

  const handleSavePageComponents = async () => {
    if (!selectedPage) return;

    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/pages', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          pageId: selectedPage._id,
          components: selectedPage.components,
        }),
      });

      if (response.ok) {
        await fetchPages();
        const data = await response.json();
        setSelectedPage(data.page);
        alert('Page saved successfully!');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to save page');
      }
    } catch (error) {
      console.error('Failed to save page:', error);
      alert('Failed to save page');
    } finally {
      setSaving(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading pages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-6 mb-6 border border-gray-200/50"
        >
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                Page Builder
              </h1>
              <p className="text-gray-600">Create and manage custom pages with drag-and-drop components</p>
            </div>
            <div className="flex gap-3">
              {selectedPage && (
                <>
                  <motion.button
                    onClick={() => setSelectedPage(null)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold transition-colors flex items-center gap-2"
                  >
                    <FiArrowLeft /> Back to Pages
                  </motion.button>
                  <motion.a
                    href={`/pages/${selectedPage.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
                  >
                    <FiExternalLink /> View Page
                  </motion.a>
                </>
              )}
              <motion.button
                onClick={selectedPage ? handleSavePageComponents : handleCreatePage}
                disabled={saving}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-semibold transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <FiSave /> {saving ? 'Saving...' : selectedPage ? 'Save Page' : 'New Page'}
              </motion.button>
            </div>
          </div>

          {selectedPage && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900">{selectedPage.title}</h2>
                  <p className="text-sm text-gray-600 mt-1">{selectedPage.description}</p>
                  <div className="mt-2 flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      selectedPage.isPublished
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedPage.isPublished ? 'Published' : 'Draft'}
                    </span>
                    <a
                      href={`/pages/${selectedPage.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 flex items-center gap-2 text-sm font-medium"
                    >
                      <FiLink /> /pages/{selectedPage.slug}
                    </a>
                  </div>
                </div>
                <button
                  onClick={() => handleEditPage(selectedPage)}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
                >
                  <FiEdit2 /> Edit Page Info
                </button>
              </div>
            </div>
          )}
        </motion.div>

        {!selectedPage ? (
          /* Pages List */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pages.map((page) => (
              <motion.div
                key={page._id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.02 }}
                className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg p-6 border border-gray-200/50 cursor-pointer"
                onClick={() => fetchPage(page._id)}
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">{page.title}</h3>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    page.isPublished
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {page.isPublished ? 'Published' : 'Draft'}
                  </span>
                </div>
                {page.description && (
                  <p className="text-gray-600 text-sm mb-4">{page.description}</p>
                )}
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{page.components.length} components</span>
                  <a
                    href={`/pages/${page.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    <FiExternalLink /> View
                  </a>
                </div>
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      fetchPage(page._id);
                    }}
                    className="flex-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-semibold transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeletePage(page._id);
                    }}
                    className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-semibold transition-colors"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          /* Page Builder */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Components List */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-6 border border-gray-200/50"
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Components</h2>
                  <motion.button
                    onClick={handleAddComponent}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold flex items-center gap-2"
                  >
                    <FiPlus /> Add Component
                  </motion.button>
                </div>

                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={selectedPage.components.map((c) => c._id || '')}
                    strategy={verticalListSortingStrategy}
                  >
                    {selectedPage.components.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        <FiLayout className="text-6xl mx-auto mb-4 opacity-50" />
                        <p className="text-lg">No components yet</p>
                        <p className="text-sm">Click "Add Component" to get started</p>
                      </div>
                    ) : (
                      selectedPage.components
                        .sort((a, b) => a.order - b.order)
                        .map((component) => (
                          <SortableComponent
                            key={component._id}
                            component={component}
                            onEdit={handleEditComponent}
                            onDelete={handleDeleteComponent}
                            onToggle={handleToggleComponent}
                          />
                        ))
                    )}
                  </SortableContext>
                </DndContext>
              </motion.div>
            </div>

            {/* Preview */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-6 border border-gray-200/50 sticky top-6"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Preview</h2>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 min-h-[400px]">
                  <p className="text-sm text-gray-500 text-center py-8">
                    Component preview will appear here
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        )}

        {/* Page Modal */}
        <AnimatePresence>
          {showPageModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
              onClick={() => setShowPageModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md"
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedPage ? 'Edit Page' : 'Create New Page'}
                  </h2>
                  <button
                    onClick={() => setShowPageModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <FiX className="text-xl" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Page Title *
                    </label>
                    <input
                      type="text"
                      value={pageForm.title}
                      onChange={(e) => {
                        setPageForm({
                          ...pageForm,
                          title: e.target.value,
                          slug: pageForm.slug || generateSlug(e.target.value),
                        });
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter page title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      URL Slug *
                    </label>
                    <input
                      type="text"
                      value={pageForm.slug}
                      onChange={(e) =>
                        setPageForm({ ...pageForm, slug: generateSlug(e.target.value) })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="page-url-slug"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      URL: /pages/{pageForm.slug || 'your-slug'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={pageForm.description}
                      onChange={(e) =>
                        setPageForm({ ...pageForm, description: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                      placeholder="Page description"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isPublished"
                      checked={pageForm.isPublished}
                      onChange={(e) =>
                        setPageForm({ ...pageForm, isPublished: e.target.checked })
                      }
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="isPublished" className="ml-2 text-sm font-semibold text-gray-700">
                      Publish immediately
                    </label>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setShowPageModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSavePage}
                    disabled={!pageForm.title || !pageForm.slug || saving}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold transition-all disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Component Modal */}
        <AnimatePresence>
          {showComponentModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto"
              onClick={() => setShowComponentModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-2xl my-8"
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingComponent ? 'Edit Component' : 'Add Component'}
                  </h2>
                  <button
                    onClick={() => setShowComponentModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <FiX className="text-xl" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Component Type */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Component Type *
                    </label>
                    <select
                      value={componentForm.type}
                      onChange={(e) =>
                        setComponentForm({
                          ...componentForm,
                          type: e.target.value as PageComponentType,
                          content: {},
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value={PageComponentType.HERO}>Hero Section</option>
                      <option value={PageComponentType.LEFT_RAIL}>Left Rail</option>
                      <option value={PageComponentType.RIGHT_RAIL}>Right Rail</option>
                      <option value={PageComponentType.AD_SPACE}>Ad Space</option>
                      <option value={PageComponentType.BUTTON}>Button</option>
                      <option value={PageComponentType.SLIDER}>Slider</option>
                      <option value={PageComponentType.CONTENT}>Content</option>
                    </select>
                  </div>

                  {/* Component-specific fields */}
                  {componentForm.type === PageComponentType.HERO && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Title
                        </label>
                        <input
                          type="text"
                          value={componentForm.content.title || ''}
                          onChange={(e) =>
                            setComponentForm({
                              ...componentForm,
                              content: { ...componentForm.content, title: e.target.value },
                            })
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="Hero title"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Subtitle
                        </label>
                        <input
                          type="text"
                          value={componentForm.content.subtitle || ''}
                          onChange={(e) =>
                            setComponentForm({
                              ...componentForm,
                              content: { ...componentForm.content, subtitle: e.target.value },
                            })
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="Hero subtitle"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Background Image URL
                        </label>
                        <input
                          type="url"
                          value={componentForm.content.backgroundImage || ''}
                          onChange={(e) =>
                            setComponentForm({
                              ...componentForm,
                              content: { ...componentForm.content, backgroundImage: e.target.value },
                            })
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="https://example.com/image.jpg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          CTA Button Text
                        </label>
                        <input
                          type="text"
                          value={componentForm.content.ctaText || ''}
                          onChange={(e) =>
                            setComponentForm({
                              ...componentForm,
                              content: { ...componentForm.content, ctaText: e.target.value },
                            })
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="Get Started"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          CTA Button Link
                        </label>
                        <input
                          type="url"
                          value={componentForm.content.ctaLink || ''}
                          onChange={(e) =>
                            setComponentForm({
                              ...componentForm,
                              content: { ...componentForm.content, ctaLink: e.target.value },
                            })
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="/contact"
                        />
                      </div>
                    </div>
                  )}

                  {componentForm.type === PageComponentType.BUTTON && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Button Text *
                        </label>
                        <input
                          type="text"
                          value={componentForm.content.buttonText || ''}
                          onChange={(e) =>
                            setComponentForm({
                              ...componentForm,
                              content: { ...componentForm.content, buttonText: e.target.value },
                            })
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="Click Me"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Link
                        </label>
                        <input
                          type="url"
                          value={componentForm.content.buttonLink || ''}
                          onChange={(e) =>
                            setComponentForm({
                              ...componentForm,
                              content: { ...componentForm.content, buttonLink: e.target.value },
                            })
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="/page"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Style
                          </label>
                          <select
                            value={componentForm.content.style || 'primary'}
                            onChange={(e) =>
                              setComponentForm({
                                ...componentForm,
                                content: { 
                                  ...componentForm.content, 
                                  style: e.target.value as 'primary' | 'secondary' | 'outline' | 'ghost' 
                                },
                              })
                            }
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="primary">Primary</option>
                            <option value="secondary">Secondary</option>
                            <option value="outline">Outline</option>
                            <option value="ghost">Ghost</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Size
                          </label>
                          <select
                            value={componentForm.content.size || 'md'}
                            onChange={(e) =>
                              setComponentForm({
                                ...componentForm,
                                content: { 
                                  ...componentForm.content, 
                                  size: e.target.value as 'sm' | 'md' | 'lg' 
                                },
                              })
                            }
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="sm">Small</option>
                            <option value="md">Medium</option>
                            <option value="lg">Large</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {componentForm.type === PageComponentType.AD_SPACE && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Ad Type
                        </label>
                        <select
                          value={componentForm.content.adType || 'google_adsense'}
                          onChange={(e) =>
                            setComponentForm({
                              ...componentForm,
                              content: { 
                                ...componentForm.content, 
                                adType: e.target.value as 'google_adsense' | 'custom' 
                              },
                            })
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="google_adsense">Google AdSense</option>
                          <option value="custom">Custom Ad Code</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Ad Code / Script
                        </label>
                        <textarea
                          value={componentForm.content.adCode || ''}
                          onChange={(e) =>
                            setComponentForm({
                              ...componentForm,
                              content: { ...componentForm.content, adCode: e.target.value },
                            })
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          rows={4}
                          placeholder="Paste ad code here"
                        />
                      </div>
                    </div>
                  )}

                  {componentForm.type === PageComponentType.SLIDER && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Slides (JSON format)
                        </label>
                        <textarea
                          value={JSON.stringify(componentForm.content.slides || [], null, 2)}
                          onChange={(e) => {
                            try {
                              const slides = JSON.parse(e.target.value);
                              setComponentForm({
                                ...componentForm,
                                content: { ...componentForm.content, slides },
                              });
                            } catch (err) {
                              // Invalid JSON, keep as is
                            }
                          }}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                          rows={8}
                          placeholder='[{"image": "url", "title": "Title", "description": "Desc", "link": "/"}]'
                        />
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="autoplay"
                          checked={componentForm.content.autoplay || false}
                          onChange={(e) =>
                            setComponentForm({
                              ...componentForm,
                              content: { ...componentForm.content, autoplay: e.target.checked },
                            })
                          }
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                        <label htmlFor="autoplay" className="ml-2 text-sm font-semibold text-gray-700">
                          Autoplay
                        </label>
                      </div>
                    </div>
                  )}

                  {componentForm.type === PageComponentType.CONTENT && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          HTML Content
                        </label>
                        <textarea
                          value={componentForm.content.html || ''}
                          onChange={(e) =>
                            setComponentForm({
                              ...componentForm,
                              content: { ...componentForm.content, html: e.target.value },
                            })
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                          rows={8}
                          placeholder="<div>Your HTML content here</div>"
                        />
                      </div>
                    </div>
                  )}

                  {(componentForm.type === PageComponentType.LEFT_RAIL ||
                    componentForm.type === PageComponentType.RIGHT_RAIL) && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Width
                        </label>
                        <input
                          type="text"
                          value={componentForm.content.width || '300px'}
                          onChange={(e) =>
                            setComponentForm({
                              ...componentForm,
                              content: { ...componentForm.content, width: e.target.value },
                            })
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="300px"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Position
                        </label>
                        <select
                          value={componentForm.content.position || 'sticky'}
                          onChange={(e) =>
                            setComponentForm({
                              ...componentForm,
                              content: { 
                                ...componentForm.content, 
                                position: e.target.value as 'fixed' | 'sticky' | 'relative' 
                              },
                            })
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="fixed">Fixed</option>
                          <option value="sticky">Sticky</option>
                          <option value="relative">Relative</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Animation Settings */}
                  <div className="border-t pt-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <FiZap /> Animation Effects
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Animation Type
                        </label>
                        <select
                          value={componentForm.animation?.type || 'none'}
                          onChange={(e) =>
                            setComponentForm({
                              ...componentForm,
                              animation: {
                                ...componentForm.animation,
                                type: e.target.value as AnimationEffect['type'],
                              },
                            })
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="none">None</option>
                          <option value="fade">Fade</option>
                          <option value="slide">Slide</option>
                          <option value="zoom">Zoom</option>
                          <option value="bounce">Bounce</option>
                          <option value="rotate">Rotate</option>
                        </select>
                      </div>
                      {componentForm.animation?.type !== 'none' && (
                        <>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Duration (ms)
                              </label>
                              <input
                                type="number"
                                value={componentForm.animation?.duration || 500}
                                onChange={(e) =>
                                  setComponentForm({
                                    ...componentForm,
                                    animation: {
                                      ...componentForm.animation!,
                                      duration: parseInt(e.target.value),
                                    },
                                  })
                                }
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                min="0"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Delay (ms)
                              </label>
                              <input
                                type="number"
                                value={componentForm.animation?.delay || 0}
                                onChange={(e) =>
                                  setComponentForm({
                                    ...componentForm,
                                    animation: {
                                      ...componentForm.animation!,
                                      delay: parseInt(e.target.value),
                                    },
                                  })
                                }
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                min="0"
                              />
                            </div>
                          </div>
                          {componentForm.animation?.type === 'slide' && (
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Direction
                              </label>
                              <select
                                value={componentForm.animation?.direction || 'up'}
                                onChange={(e) =>
                                  setComponentForm({
                                    ...componentForm,
                                    animation: {
                                      ...componentForm.animation!,
                                      direction: e.target.value as AnimationEffect['direction'],
                                    },
                                  })
                                }
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="up">Up</option>
                                <option value="down">Down</option>
                                <option value="left">Left</option>
                                <option value="right">Right</option>
                              </select>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setShowComponentModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveComponent}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold transition-all"
                  >
                    {editingComponent ? 'Update' : 'Add'} Component
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

