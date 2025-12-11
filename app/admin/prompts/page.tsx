'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Prompt {
  id: string;
  title: string;
  body: string;
  category: string;
  tags: string[];
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

interface CategoryConfig {
  value: string;
  label: string;
  description: string;
  color: string;
  badgeClass: string;
  icon: string;
}

const CATEGORIES: CategoryConfig[] = [
  {
    value: 'qa',
    label: 'Hỏi đáp Pháp Luật',
    description: 'Prompts cho hệ thống Q&A pháp lý',
    color: 'blue',
    badgeClass: 'bg-blue-100 text-blue-900',
    icon: '❓',
  },
  {
    value: 'mini_app',
    label: 'Ứng Dụng AI',
    description: 'Prompts cho các mini app vui',
    color: 'purple',
    badgeClass: 'bg-purple-100 text-purple-900',
    icon: '🎨',
  },
  {
    value: 'video',
    label: 'Video Prompts',
    description: 'Prompts cho video generation',
    color: 'pink',
    badgeClass: 'bg-pink-100 text-pink-900',
    icon: '🎬',
  },
  {
    value: 'other',
    label: 'Khác',
    description: 'Các loại prompt khác',
    color: 'gray',
    badgeClass: 'bg-gray-100 text-gray-900',
    icon: '📋',
  },
];

function getCategoryLabel(value: string): string {
  const cat = CATEGORIES.find(c => c.value === value);
  return cat ? `${cat.icon} ${cat.label}` : value;
}

function getCategoryBadgeClass(value: string): string {
  const cat = CATEGORIES.find(c => c.value === value);
  return cat ? cat.badgeClass : 'bg-gray-100 text-gray-900';
}

export default function PromptsManagementPage() {
  const router = useRouter();
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    category: 'qa',
    tags: '',
    isPublic: true,
  });

  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Check authorization
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin');
      return;
    }
    fetchPrompts();
  }, [router, search, categoryFilter]);

  const fetchPrompts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (categoryFilter) params.append('category', categoryFilter);

      const res = await fetch(`/api/prompts?${params}`);
      const data = await res.json();
      
      if (res.ok && data.success) {
        setPrompts(data.prompts || []);
      } else {
        setError(data.error || 'Failed to fetch prompts');
      }
    } catch (err) {
      setError('Failed to fetch prompts');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setModalMode('create');
    setFormData({
      title: '',
      body: '',
      category: 'qa',
      tags: '',
      isPublic: true,
    });
    setIsModalOpen(true);
  };

  const handleEdit = (prompt: Prompt) => {
    setModalMode('edit');
    setSelectedPrompt(prompt);
    setFormData({
      title: prompt.title,
      body: prompt.body,
      category: prompt.category,
      tags: prompt.tags.join(', '),
      isPublic: prompt.is_public,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.title.length > 200) {
      setError('Title must be 200 characters or less');
      return;
    }

    if (formData.body.length > 5000) {
      setError('Body must be 5000 characters or less');
      return;
    }

    try {
      const payload = {
        title: formData.title,
        body: formData.body,
        category: formData.category,
        tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean),
        isPublic: formData.isPublic,
      };

      const url = modalMode === 'create' 
        ? '/api/prompts'
        : `/api/prompts/${selectedPrompt?.id}`;
      
      const method = modalMode === 'create' ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setIsModalOpen(false);
        fetchPrompts();
      } else {
        setError(data.error || 'Failed to save prompt');
      }
    } catch (err) {
      setError('Failed to save prompt');
      console.error(err);
    }
  };

  const handleTogglePublic = async (prompt: Prompt) => {
    try {
      const res = await fetch(`/api/prompts/${prompt.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: prompt.title,
          body: prompt.body,
          category: prompt.category,
          tags: prompt.tags,
          isPublic: !prompt.is_public,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        fetchPrompts();
      } else {
        setError(data.error || 'Failed to toggle public status');
      }
    } catch (err) {
      setError('Failed to toggle public status');
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (deleteConfirm !== id) {
      setDeleteConfirm(id);
      return;
    }

    try {
      const res = await fetch(`/api/prompts/${id}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (res.ok && data.success) {
        fetchPrompts();
        setDeleteConfirm(null);
      } else {
        setError(data.error || 'Failed to delete prompt');
      }
    } catch (err) {
      setError('Failed to delete prompt');
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    router.push('/admin');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/admin/dashboard')}
              className="text-gray-600 hover:text-gray-900"
            >
              ← Back
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Prompts Management</h1>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              placeholder="Search by title or body..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.icon} {cat.label}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleCreate}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            + Create Prompt
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
            <button
              onClick={() => setError('')}
              className="float-right text-red-900 hover:text-red-700"
            >
              ×
            </button>
          </div>
        )}

        {/* Prompts Table */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Loading...</div>
          </div>
        ) : prompts.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-gray-400 text-6xl mb-4">💡</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No prompts found</h3>
            <p className="text-gray-500 mb-4">Create your first AI prompt to get started.</p>
            <button
              onClick={handleCreate}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Create Prompt
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tags
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Public
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {prompts.map((prompt) => (
                  <tr key={prompt.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{prompt.title}</div>
                      <div className="text-sm text-gray-500 truncate max-w-md">
                        {prompt.body.substring(0, 100)}...
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getCategoryBadgeClass(prompt.category)}`}>
                        {getCategoryLabel(prompt.category)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {prompt.tags.slice(0, 3).map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                        {prompt.tags.length > 3 && (
                          <span className="px-2 py-1 text-xs text-gray-500">
                            +{prompt.tags.length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleTogglePublic(prompt)}
                        className={`px-3 py-1 text-xs font-semibold rounded-full transition ${
                          prompt.is_public
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                      >
                        {prompt.is_public ? 'Public' : 'Private'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEdit(prompt)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(prompt.id)}
                        className={`${
                          deleteConfirm === prompt.id
                            ? 'text-red-900 font-bold'
                            : 'text-red-600 hover:text-red-900'
                        }`}
                      >
                        {deleteConfirm === prompt.id ? 'Confirm?' : 'Delete'}
                      </button>
                      {deleteConfirm === prompt.id && (
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {modalMode === 'create' ? 'Create Prompt' : 'Edit Prompt'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title <span className="text-red-500">*</span>
                    <span className="text-gray-400 text-xs ml-2">
                      ({formData.title.length}/200)
                    </span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    maxLength={200}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Body <span className="text-red-500">*</span>
                    <span className="text-gray-400 text-xs ml-2">
                      ({formData.body.length}/5000)
                    </span>
                  </label>
                  <textarea
                    value={formData.body}
                    onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                    rows={10}
                    maxLength={5000}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.icon} {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tags (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={formData.tags}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="ai, content, writing"
                    />
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isPublic"
                    checked={formData.isPublic}
                    onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-900">
                    Public (Allow users to view this prompt)
                  </label>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    {modalMode === 'create' ? 'Create' : 'Update'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
