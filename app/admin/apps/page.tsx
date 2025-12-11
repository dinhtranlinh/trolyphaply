'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface App {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  category: string;
  status: string;
  type: string;
  input_schema: any;
  prompt_template: string;
  output_schema: any;
  render_config: any;
  share_config: any;
  limits: any;
  created_at: string;
  updated_at: string;
}

interface AppStats {
  views: number;
  submits: number;
  shares: number;
  results: number;
  affiliateClicks?: number;
}

const CATEGORIES = ['tuvi', 'greeting', 'poetry', 'caption', 'other'];
const TYPES = ['text_only', 'image_template', 'svg_dynamic'];

export default function AppsManagementPage() {
  const router = useRouter();
  const [apps, setApps] = useState<App[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedApp, setSelectedApp] = useState<App | null>(null);
  
  // Stats modal
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [statsData, setStatsData] = useState<AppStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    slug: '',
    name: '',
    description: '',
    category: 'other',
    status: 'draft',
    type: 'text_only',
    inputSchema: '',
    promptTemplate: '',
    outputSchema: '',
    renderConfig: '',
    shareConfig: '',
    limits: '',
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [cloneSlug, setCloneSlug] = useState('');

  // Check authorization
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin');
      return;
    }
    fetchApps();
  }, [router, search, categoryFilter, statusFilter]);

  const fetchApps = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (categoryFilter !== 'all') params.append('category', categoryFilter);
      if (statusFilter !== 'all') params.append('status', statusFilter);

      const res = await fetch(`/api/admin/apps?${params}`);
      const data = await res.json();
      
      if (res.ok) {
        setApps(data.apps || []);
      } else {
        setError(data.error || 'Failed to fetch apps');
      }
    } catch (err) {
      setError('Failed to fetch apps');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setModalMode('create');
    setFormData({
      slug: '',
      name: '',
      description: '',
      category: 'other',
      status: 'draft',
      type: 'text_only',
      inputSchema: '[]',
      promptTemplate: '',
      outputSchema: '{}',
      renderConfig: '{}',
      shareConfig: '{}',
      limits: '{}',
    });
    setShowAdvanced(false);
    setIsModalOpen(true);
  };

  const handleEdit = (app: App) => {
    setModalMode('edit');
    setSelectedApp(app);
    setFormData({
      slug: app.slug,
      name: app.name,
      description: app.description || '',
      category: app.category,
      status: app.status,
      type: app.type,
      inputSchema: JSON.stringify(app.input_schema, null, 2),
      promptTemplate: app.prompt_template,
      outputSchema: JSON.stringify(app.output_schema, null, 2),
      renderConfig: JSON.stringify(app.render_config, null, 2),
      shareConfig: JSON.stringify(app.share_config, null, 2),
      limits: JSON.stringify(app.limits, null, 2),
    });
    setShowAdvanced(false);
    setIsModalOpen(true);
  };

  const validateJSON = (jsonString: string, fieldName: string): boolean => {
    if (!jsonString.trim()) return true; // Empty is ok
    try {
      JSON.parse(jsonString);
      return true;
    } catch (e) {
      setError(`Invalid JSON in ${fieldName}`);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate required JSON fields
    if (!validateJSON(formData.inputSchema, 'Input Schema')) return;
    if (!validateJSON(formData.outputSchema, 'Output Schema')) return;
    if (!validateJSON(formData.renderConfig, 'Render Config')) return;
    if (!validateJSON(formData.shareConfig, 'Share Config')) return;
    if (!validateJSON(formData.limits, 'Limits')) return;

    try {
      const payload = {
        slug: formData.slug,
        name: formData.name,
        description: formData.description || null,
        category: formData.category,
        status: formData.status,
        type: formData.type,
        inputSchema: formData.inputSchema ? JSON.parse(formData.inputSchema) : [],
        promptTemplate: formData.promptTemplate,
        outputSchema: formData.outputSchema ? JSON.parse(formData.outputSchema) : {},
        renderConfig: formData.renderConfig ? JSON.parse(formData.renderConfig) : {},
        shareConfig: formData.shareConfig ? JSON.parse(formData.shareConfig) : {},
        limits: formData.limits ? JSON.parse(formData.limits) : {},
      };

      const url = modalMode === 'create' 
        ? '/api/admin/apps'
        : `/api/admin/apps/${selectedApp?.id}`;
      
      const method = modalMode === 'create' ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        setIsModalOpen(false);
        fetchApps();
      } else {
        setError(data.error || 'Failed to save app');
      }
    } catch (err) {
      setError('Failed to save app. Check JSON format.');
      console.error(err);
    }
  };

  const handleToggleStatus = async (app: App) => {
    try {
      const newStatus = app.status === 'published' ? 'draft' : 'published';
      
      const res = await fetch(`/api/admin/apps/${app.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...app,
          status: newStatus,
          inputSchema: app.input_schema,
          promptTemplate: app.prompt_template,
          outputSchema: app.output_schema,
          renderConfig: app.render_config,
          shareConfig: app.share_config,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        fetchApps();
      } else {
        setError(data.error || 'Failed to toggle status');
      }
    } catch (err) {
      setError('Failed to toggle status');
      console.error(err);
    }
  };

  const handleShowStats = async (app: App) => {
    setStatsLoading(true);
    setIsStatsModalOpen(true);
    setStatsData(null);

    try {
      const res = await fetch(`/api/admin/apps/${app.id}/stats`);
      const data = await res.json();

      if (res.ok) {
        setStatsData(data.totals);
      } else {
        setError(data.error || 'Failed to fetch stats');
      }
    } catch (err) {
      setError('Failed to fetch stats');
      console.error(err);
    } finally {
      setStatsLoading(false);
    }
  };

  const handleClone = async (app: App) => {
    const newSlug = prompt('Enter new slug for cloned app:', `${app.slug}-copy`);
    if (!newSlug) return;

    try {
      const res = await fetch(`/api/admin/apps/${app.id}/clone`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newSlug }),
      });

      const data = await res.json();

      if (res.ok) {
        fetchApps();
        alert(`App cloned successfully as "${newSlug}"`);
      } else {
        setError(data.error || 'Failed to clone app');
      }
    } catch (err) {
      setError('Failed to clone app');
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (deleteConfirm !== id) {
      setDeleteConfirm(id);
      return;
    }

    try {
      const res = await fetch(`/api/admin/apps/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        fetchApps();
        setDeleteConfirm(null);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to delete app');
      }
    } catch (err) {
      setError('Failed to delete app');
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
            <h1 className="text-3xl font-bold text-gray-900">Apps Management</h1>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <input
              type="text"
              placeholder="Search by name or slug..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>

          <button
            onClick={handleCreate}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            + Create App
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

        {/* Apps Table */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Loading...</div>
          </div>
        ) : apps.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-gray-400 text-6xl mb-4">🚀</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No apps found</h3>
            <p className="text-gray-500 mb-4">Create your first mini-app to get started.</p>
            <button
              onClick={handleCreate}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Create App
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name / Slug
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {apps.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{app.name}</div>
                      <div className="text-sm text-gray-500">/{app.slug}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {app.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{app.type}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleStatus(app)}
                        className={`px-3 py-1 text-xs font-semibold rounded-full transition ${
                          app.status === 'published'
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                        }`}
                      >
                        {app.status}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleShowStats(app)}
                        className="text-purple-600 hover:text-purple-900"
                      >
                        Stats
                      </button>
                      <button
                        onClick={() => handleClone(app)}
                        className="text-teal-600 hover:text-teal-900"
                      >
                        Clone
                      </button>
                      <button
                        onClick={() => handleEdit(app)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(app.id)}
                        className={`${
                          deleteConfirm === app.id
                            ? 'text-red-900 font-bold'
                            : 'text-red-600 hover:text-red-900'
                        }`}
                      >
                        {deleteConfirm === app.id ? 'Confirm?' : 'Delete'}
                      </button>
                      {deleteConfirm === app.id && (
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

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-4xl w-full my-8">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {modalMode === 'create' ? 'Create App' : 'Edit App'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Slug <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      disabled={modalMode === 'edit'}
                      required
                      pattern="[a-z0-9-]+"
                      title="Only lowercase letters, numbers, and hyphens"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      rows={2}
                    />
                  </div>

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
                        <option key={cat} value={cat}>
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      {TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Input Schema (JSON) <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={formData.inputSchema}
                      onChange={(e) => setFormData({ ...formData, inputSchema: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                      rows={6}
                      placeholder='[{"name": "userName", "type": "text", "label": "Your name", "required": true}]'
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">Array of input field definitions</p>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prompt Template <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={formData.promptTemplate}
                      onChange={(e) => setFormData({ ...formData, promptTemplate: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                      rows={8}
                      placeholder="Use {{variableName}} for input values"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                    </select>
                  </div>
                </div>

                {/* Advanced Config Accordion */}
                <div className="border border-gray-200 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="w-full px-4 py-3 flex justify-between items-center text-left font-medium text-gray-700 hover:bg-gray-50 transition"
                  >
                    <span>Advanced Configuration (Optional)</span>
                    <span className="text-xl">{showAdvanced ? '−' : '+'}</span>
                  </button>

                  {showAdvanced && (
                    <div className="p-4 space-y-4 border-t border-gray-200">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Output Schema (JSON)
                        </label>
                        <textarea
                          value={formData.outputSchema}
                          onChange={(e) => setFormData({ ...formData, outputSchema: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                          rows={4}
                          placeholder='{"type": "object", "properties": {...}}'
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Render Config (JSON)
                        </label>
                        <textarea
                          value={formData.renderConfig}
                          onChange={(e) => setFormData({ ...formData, renderConfig: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                          rows={4}
                          placeholder='{"template": "default", "style": {...}}'
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Share Config (JSON)
                        </label>
                        <textarea
                          value={formData.shareConfig}
                          onChange={(e) => setFormData({ ...formData, shareConfig: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                          rows={4}
                          placeholder='{"title": "...", "image": "...", "platforms": [...]}'
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Limits (JSON)
                        </label>
                        <textarea
                          value={formData.limits}
                          onChange={(e) => setFormData({ ...formData, limits: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                          rows={4}
                          placeholder='{"maxLength": 500, "rateLimit": {"requests": 10, "window": "1h"}}'
                        />
                      </div>
                    </div>
                  )}
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

      {/* Stats Modal */}
      {isStatsModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">App Statistics</h2>
                <button
                  onClick={() => setIsStatsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              {statsLoading ? (
                <div className="flex items-center justify-center h-48">
                  <div className="text-gray-500">Loading stats...</div>
                </div>
              ) : statsData ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-6 rounded-lg">
                    <div className="text-blue-600 text-4xl font-bold">{statsData.views}</div>
                    <div className="text-blue-800 text-sm font-medium mt-2">Views</div>
                  </div>
                  <div className="bg-green-50 p-6 rounded-lg">
                    <div className="text-green-600 text-4xl font-bold">{statsData.submits}</div>
                    <div className="text-green-800 text-sm font-medium mt-2">Submits</div>
                  </div>
                  <div className="bg-purple-50 p-6 rounded-lg">
                    <div className="text-purple-600 text-4xl font-bold">{statsData.shares}</div>
                    <div className="text-purple-800 text-sm font-medium mt-2">Shares</div>
                  </div>
                  <div className="bg-orange-50 p-6 rounded-lg">
                    <div className="text-orange-600 text-4xl font-bold">{statsData.results}</div>
                    <div className="text-orange-800 text-sm font-medium mt-2">Results</div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-12">No stats available</div>
              )}

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setIsStatsModalOpen(false)}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
