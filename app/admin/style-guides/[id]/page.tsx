'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

interface StyleGuide {
  id: string;
  name: string;
  description: string;
  characteristics: string[];
  tone: string[];
  language: string;
  is_default: boolean;
  examples: Example[];
  created_at: string;
  updated_at: string;
}

interface Example {
  id: string;
  style_guide_id: string;
  before: string;
  after: string;
  created_at: string;
}

export default function StyleGuideDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [styleGuide, setStyleGuide] = useState<StyleGuide | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  
  // Example modal state
  const [isExampleModalOpen, setIsExampleModalOpen] = useState(false);
  const [exampleMode, setExampleMode] = useState<'create' | 'edit'>('create');
  const [selectedExample, setSelectedExample] = useState<Example | null>(null);
  const [exampleForm, setExampleForm] = useState({
    before: '',
    after: '',
  });

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin');
      return;
    }
    fetchStyleGuide();
  }, []);

  const fetchStyleGuide = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/style-guides/${params.id}`);
      const data = await res.json();
      
      if (res.ok && data.success) {
        setStyleGuide(data.data);
      } else {
        setError(data.error || 'Failed to fetch style guide');
      }
    } catch (err) {
      setError('Failed to fetch style guide');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (deleteConfirm !== 'DELETE') {
      setDeleteConfirm('DELETE');
      return;
    }

    try {
      const res = await fetch(`/api/admin/style-guides/${params.id}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (res.ok && data.success) {
        router.push('/admin/style-guides');
      } else {
        setError(data.error || 'Failed to delete style guide');
      }
    } catch (err) {
      setError('Failed to delete style guide');
      console.error(err);
    }
  };

  const handleCreateExample = () => {
    setExampleMode('create');
    setExampleForm({ before: '', after: '' });
    setIsExampleModalOpen(true);
  };

  const handleEditExample = (example: Example) => {
    setExampleMode('edit');
    setSelectedExample(example);
    setExampleForm({
      before: example.before,
      after: example.after,
    });
    setIsExampleModalOpen(true);
  };

  const handleSubmitExample = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const url = exampleMode === 'create'
        ? `/api/admin/style-guides/${params.id}/examples`
        : `/api/admin/style-guides/${params.id}/examples/${selectedExample?.id}`;
      
      const method = exampleMode === 'create' ? 'POST' : 'PATCH';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(exampleForm),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setIsExampleModalOpen(false);
        fetchStyleGuide();
      } else {
        setError(data.error || 'Failed to save example');
      }
    } catch (err) {
      setError('Failed to save example');
      console.error(err);
    }
  };

  const handleDeleteExample = async (exampleId: string) => {
    if (deleteConfirm !== exampleId) {
      setDeleteConfirm(exampleId);
      return;
    }

    try {
      const res = await fetch(`/api/admin/style-guides/${params.id}/examples/${exampleId}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (res.ok && data.success) {
        fetchStyleGuide();
        setDeleteConfirm(null);
      } else {
        setError(data.error || 'Failed to delete example');
      }
    } catch (err) {
      setError('Failed to delete example');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!styleGuide) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-red-500">Style guide not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/admin/style-guides"
                className="text-gray-600 hover:text-gray-900"
              >
                ← Back
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  {styleGuide.name}
                  {styleGuide.is_default && (
                    <span className="px-3 py-1 text-sm font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      DEFAULT
                    </span>
                  )}
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Language: {styleGuide.language.toUpperCase()}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link
                href={`/admin/style-guides/${params.id}/edit`}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Edit
              </Link>
              <button
                onClick={handleDelete}
                className={`px-4 py-2 rounded-lg transition ${
                  deleteConfirm === 'DELETE'
                    ? 'bg-red-700 text-white'
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                {deleteConfirm === 'DELETE' ? 'Confirm Delete?' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
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

        {/* Style Guide Info */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Style Guide Details</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Description</h3>
              <p className="text-gray-900">{styleGuide.description}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Characteristics</h3>
              <div className="flex flex-wrap gap-2">
                {styleGuide.characteristics.map((char, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {char}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Tone</h3>
              <div className="flex flex-wrap gap-2">
                {styleGuide.tone.map((t, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Examples Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              Examples ({styleGuide.examples?.length || 0})
            </h2>
            <button
              onClick={handleCreateExample}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              + Add Example
            </button>
          </div>

          {styleGuide.examples && styleGuide.examples.length > 0 ? (
            <div className="space-y-4">
              {styleGuide.examples.map((example) => (
                <div key={example.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-2">❌ Before</h4>
                      <div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-gray-800">
                        {example.before}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-2">✅ After</h4>
                      <div className="bg-green-50 border border-green-200 rounded p-3 text-sm text-gray-800">
                        {example.after}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-3">
                    <button
                      onClick={() => handleEditExample(example)}
                      className="text-sm text-blue-600 hover:text-blue-900"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteExample(example.id)}
                      className={`text-sm ${
                        deleteConfirm === example.id
                          ? 'text-red-900 font-bold'
                          : 'text-red-600 hover:text-red-900'
                      }`}
                    >
                      {deleteConfirm === example.id ? 'Confirm?' : 'Delete'}
                    </button>
                    {deleteConfirm === example.id && (
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="text-sm text-gray-600 hover:text-gray-900"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 text-5xl mb-4">📝</div>
              <p className="text-gray-500 mb-4">No examples yet</p>
              <button
                onClick={handleCreateExample}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                Add First Example
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Example Modal */}
      {isExampleModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {exampleMode === 'create' ? 'Add Example' : 'Edit Example'}
              </h2>

              <form onSubmit={handleSubmitExample} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Before (Original) <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={exampleForm.before}
                    onChange={(e) => setExampleForm({ ...exampleForm, before: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={6}
                    placeholder="Enter the original text (before applying style guide)..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    After (Improved) <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={exampleForm.after}
                    onChange={(e) => setExampleForm({ ...exampleForm, after: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={6}
                    placeholder="Enter the improved text (after applying style guide)..."
                    required
                  />
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsExampleModalOpen(false)}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                  >
                    {exampleMode === 'create' ? 'Add Example' : 'Update Example'}
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
