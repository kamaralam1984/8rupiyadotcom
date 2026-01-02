'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FiSave, FiPlus, FiTrash2, FiEdit, FiEye, FiEyeOff,
  FiAlignLeft, FiAlignCenter, FiAlignRight, FiLink, FiX
} from 'react-icons/fi';

interface AdSpaceContent {
  _id?: string;
  rail: 'left' | 'right';
  position: number;
  title?: string;
  content: string;
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  isActive: boolean;
  showBorder: boolean;
  showBackground: boolean;
  padding?: string;
  margin?: string;
  textAlign?: 'left' | 'center' | 'right';
  linkUrl?: string;
  linkText?: string;
}

export default function AdSpaceContentPage() {
  const [contents, setContents] = useState<AdSpaceContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [selectedRail, setSelectedRail] = useState<'left' | 'right'>('left');

  useEffect(() => {
    fetchContents();
  }, []);

  const fetchContents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/ad-space-content', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setContents(data.contents || []);
      }
    } catch (error) {
      console.error('Failed to fetch contents:', error);
      setMessage({ type: 'error', text: 'Failed to load content' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (content: AdSpaceContent) => {
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      const url = content._id 
        ? `/api/admin/ad-space-content/${content._id}`
        : '/api/admin/ad-space-content';
      
      const method = content._id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(content),
      });

      const data = await response.json();
      if (data.success) {
        setMessage({ type: 'success', text: content._id ? 'Content updated!' : 'Content added!' });
        setEditingId(null);
        fetchContents();
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to save' });
      }
    } catch (error) {
      console.error('Failed to save:', error);
      setMessage({ type: 'error', text: 'Failed to save content' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this content?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/ad-space-content/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Content deleted!' });
        fetchContents();
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to delete' });
      }
    } catch (error) {
      console.error('Failed to delete:', error);
      setMessage({ type: 'error', text: 'Failed to delete content' });
    }
  };

  const handleAddNew = () => {
    const newContent: AdSpaceContent = {
      rail: selectedRail,
      position: contents.filter(c => c.rail === selectedRail).length + 1,
      title: '',
      content: '',
      backgroundColor: '#FFFFFF',
      textColor: '#1F2937',
      borderColor: '#E5E7EB',
      isActive: true,
      showBorder: true,
      showBackground: true,
      padding: 'p-4',
      margin: 'mb-4',
      textAlign: 'left',
      linkUrl: '',
      linkText: '',
    };
    setContents([...contents, newContent]);
    setEditingId('new');
  };

  const filteredContents = contents.filter(c => c.rail === selectedRail);
  const sortedContents = [...filteredContents].sort((a, b) => a.position - b.position);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Ad Space Content</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage text content for left and right rails
          </p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={selectedRail}
            onChange={(e) => setSelectedRail(e.target.value as 'left' | 'right')}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="left">Left Rail</option>
            <option value="right">Right Rail</option>
          </select>
          <button
            onClick={handleAddNew}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <FiPlus /> Add Content
          </button>
        </div>
      </div>

      {/* Message */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' 
              : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
          }`}
        >
          {message.text}
        </motion.div>
      )}

      {/* Content List */}
      <div className="space-y-4">
        {sortedContents.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="text-gray-600 dark:text-gray-400">No content yet. Click "Add Content" to get started.</p>
          </div>
        ) : (
          sortedContents.map((content, index) => {
            const isEditing = editingId === content._id || (editingId === 'new' && !content._id && index === sortedContents.length - 1);
            
            return (
              <motion.div
                key={content._id || 'new'}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
              >
                {isEditing ? (
                  <EditForm
                    content={content}
                    onSave={(updated) => {
                      handleSave(updated);
                    }}
                    onCancel={() => {
                      if (!content._id) {
                        setContents(contents.filter(c => c !== content));
                      }
                      setEditingId(null);
                    }}
                    saving={saving}
                  />
                ) : (
                  <ContentView
                    content={content}
                    onEdit={() => setEditingId(content._id || null)}
                    onDelete={() => content._id && handleDelete(content._id)}
                    onToggleActive={() => {
                      const updated = { ...content, isActive: !content.isActive };
                      handleSave(updated);
                    }}
                  />
                )}
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}

function ContentView({ 
  content, 
  onEdit, 
  onDelete, 
  onToggleActive 
}: { 
  content: AdSpaceContent; 
  onEdit: () => void;
  onDelete: () => void;
  onToggleActive: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-sm font-semibold">
              Position {content.position}
            </span>
            {content.isActive ? (
              <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded text-sm flex items-center gap-1">
                <FiEye className="text-xs" /> Active
              </span>
            ) : (
              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded text-sm flex items-center gap-1">
                <FiEyeOff className="text-xs" /> Inactive
              </span>
            )}
          </div>
          {content.title && (
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {content.title}
            </h3>
          )}
          <div 
            className="text-gray-700 dark:text-gray-300 prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: content.content }}
          />
          {content.linkUrl && (
            <a 
              href={content.linkUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline mt-2 inline-flex items-center gap-1"
            >
              <FiLink className="text-xs" /> {content.linkText || content.linkUrl}
            </a>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleActive}
            className={`p-2 rounded-lg ${
              content.isActive 
                ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
            title={content.isActive ? 'Deactivate' : 'Activate'}
          >
            {content.isActive ? <FiEye /> : <FiEyeOff />}
          </button>
          <button
            onClick={onEdit}
            className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800"
            title="Edit"
          >
            <FiEdit />
          </button>
          <button
            onClick={onDelete}
            className="p-2 rounded-lg bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800"
            title="Delete"
          >
            <FiTrash2 />
          </button>
        </div>
      </div>
    </div>
  );
}

function EditForm({ 
  content, 
  onSave, 
  onCancel, 
  saving 
}: { 
  content: AdSpaceContent; 
  onSave: (content: AdSpaceContent) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [formData, setFormData] = useState<AdSpaceContent>(content);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Position
          </label>
          <input
            type="number"
            min="1"
            value={formData.position}
            onChange={(e) => setFormData({ ...formData, position: parseInt(e.target.value) || 1 })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Title (Optional)
          </label>
          <input
            type="text"
            value={formData.title || ''}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="Enter title..."
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Content (HTML supported)
        </label>
        <textarea
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          rows={6}
          required
          placeholder="Enter content... (HTML supported)"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Background Color
          </label>
          <div className="flex gap-2">
            <input
              type="color"
              value={formData.backgroundColor || '#FFFFFF'}
              onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
              className="w-16 h-10 border border-gray-300 dark:border-gray-600 rounded"
            />
            <input
              type="text"
              value={formData.backgroundColor || '#FFFFFF'}
              onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="#FFFFFF"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Text Color
          </label>
          <div className="flex gap-2">
            <input
              type="color"
              value={formData.textColor || '#1F2937'}
              onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
              className="w-16 h-10 border border-gray-300 dark:border-gray-600 rounded"
            />
            <input
              type="text"
              value={formData.textColor || '#1F2937'}
              onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="#1F2937"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Text Align
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, textAlign: 'left' })}
              className={`p-2 rounded-lg ${formData.textAlign === 'left' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}
            >
              <FiAlignLeft />
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, textAlign: 'center' })}
              className={`p-2 rounded-lg ${formData.textAlign === 'center' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}
            >
              <FiAlignCenter />
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, textAlign: 'right' })}
              className={`p-2 rounded-lg ${formData.textAlign === 'right' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}
            >
              <FiAlignRight />
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Padding
          </label>
          <input
            type="text"
            value={formData.padding || 'p-4'}
            onChange={(e) => setFormData({ ...formData, padding: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="p-4"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Margin
          </label>
          <input
            type="text"
            value={formData.margin || 'mb-4'}
            onChange={(e) => setFormData({ ...formData, margin: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="mb-4"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Link URL (Optional)
          </label>
          <input
            type="url"
            value={formData.linkUrl || ''}
            onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="https://example.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Link Text (Optional)
          </label>
          <input
            type="text"
            value={formData.linkText || ''}
            onChange={(e) => setFormData({ ...formData, linkText: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="Click here"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.isActive}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            className="w-4 h-4 text-blue-600 rounded"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">Active</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.showBorder}
            onChange={(e) => setFormData({ ...formData, showBorder: e.target.checked })}
            className="w-4 h-4 text-blue-600 rounded"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">Show Border</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.showBackground}
            onChange={(e) => setFormData({ ...formData, showBackground: e.target.checked })}
            className="w-4 h-4 text-blue-600 rounded"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">Show Background</span>
        </label>
      </div>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
        >
          <FiSave /> {saving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </form>
  );
}

