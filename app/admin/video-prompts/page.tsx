'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface VideoPrompt {
  name: string;
  filename: string;
  title: string;
  segments: number;
  created: number;
  size: number;
}

export default function VideoPromptsListPage() {
  const router = useRouter();
  const [prompts, setPrompts] = useState<VideoPrompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin');
      return;
    }
    fetchPrompts();
  }, [router]);

  const fetchPrompts = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/video-prompts');
      const data = await res.json();
      
      if (res.ok && data.success) {
        setPrompts(data.data || []);
      } else {
        setError(data.error || 'Failed to fetch video prompts');
      }
    } catch (err) {
      setError('Failed to fetch video prompts');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (name: string) => {
    if (deleteConfirm !== name) {
      setDeleteConfirm(name);
      return;
    }

    try {
      const res = await fetch(`/api/admin/video-prompts/${name}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (res.ok && data.success) {
        fetchPrompts();
        setDeleteConfirm(null);
      } else {
        setError(data.error || 'Failed to delete video prompt');
      }
    } catch (err) {
      setError('Failed to delete video prompt');
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    router.push('/admin');
  };

  const filteredPrompts = prompts.filter((prompt) =>
    search
      ? prompt.name.toLowerCase().includes(search.toLowerCase()) ||
        prompt.title.toLowerCase().includes(search.toLowerCase())
      : true
  );

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
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
            <h1 className="text-3xl font-bold text-gray-900">Video Prompts Manager</h1>
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
        {/* Search & Create */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex gap-4 mb-4">
            <input
              type="text"
              placeholder="Search by name or title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <Link
            href="/admin/video-prompts/create"
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            + Create Video Prompt
          </Link>
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

        {/* Video Prompts Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Loading...</div>
          </div>
        ) : filteredPrompts.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-gray-400 text-6xl mb-4">🎬</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No video prompts found</h3>
            <p className="text-gray-500 mb-4">Create your first video prompt to get started.</p>
            <Link
              href="/admin/video-prompts/create"
              className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Create Video Prompt
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPrompts.map((prompt) => (
              <div
                key={prompt.name}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-bold text-gray-900 flex-1 mr-2">
                      {prompt.title || prompt.name}
                    </h3>
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800 whitespace-nowrap">
                      {prompt.segments} segments
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 mb-4">
                    <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                      {prompt.name}
                    </span>
                  </p>

                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                    <span>📅 {formatDate(prompt.created)}</span>
                    <span>📦 {formatSize(prompt.size)}</span>
                  </div>

                  <div className="flex gap-2">
                    <Link
                      href={`/admin/video-prompts/${prompt.name}`}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700 transition text-sm"
                    >
                      View
                    </Link>
                    <button
                      onClick={() => handleDelete(prompt.name)}
                      className={`px-4 py-2 rounded-lg transition text-sm ${
                        deleteConfirm === prompt.name
                          ? 'bg-red-700 text-white'
                          : 'bg-red-600 text-white hover:bg-red-700'
                      }`}
                    >
                      {deleteConfirm === prompt.name ? 'Confirm?' : 'Delete'}
                    </button>
                  </div>
                  
                  {deleteConfirm === prompt.name && (
                    <button
                      onClick={() => setDeleteConfirm(null)}
                      className="w-full mt-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition text-sm"
                    >
                      Cancel
                    </button>
                  )}
                </div>

                <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
                  <div className="flex flex-wrap gap-1">
                    <span className="text-xs text-gray-600">Segments:</span>
                    {Array.from({ length: Math.min(prompt.segments, 9) }, (_, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded"
                      >
                        P{i + 1}
                      </span>
                    ))}
                    {prompt.segments > 9 && (
                      <span className="text-xs text-gray-500">+{prompt.segments - 9} more</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
