'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface StyleGuide {
  id: string;
  name: string;
  description: string;
  characteristics: string[];
  tone: string[];
  language: string;
  is_default: boolean;
  examples?: any[];
  created_at: string;
  updated_at: string;
}

export default function StyleGuidesListPage() {
  const router = useRouter();
  const [styleGuides, setStyleGuides] = useState<StyleGuide[]>([]);
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
    fetchStyleGuides();
  }, [router]);

  const fetchStyleGuides = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/style-guides');
      const data = await res.json();
      
      if (res.ok && data.success) {
        setStyleGuides(data.data || []);
      } else {
        setError(data.error || 'Failed to fetch style guides');
      }
    } catch (err) {
      setError('Failed to fetch style guides');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/style-guides/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isDefault: true }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        fetchStyleGuides();
      } else {
        setError(data.error || 'Failed to set default');
      }
    } catch (err) {
      setError('Failed to set default');
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (deleteConfirm !== id) {
      setDeleteConfirm(id);
      return;
    }

    try {
      const res = await fetch(`/api/admin/style-guides/${id}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (res.ok && data.success) {
        fetchStyleGuides();
        setDeleteConfirm(null);
      } else {
        setError(data.error || 'Failed to delete style guide');
      }
    } catch (err) {
      setError('Failed to delete style guide');
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    router.push('/admin');
  };

  const filteredGuides = styleGuides.filter((guide) =>
    search
      ? guide.name.toLowerCase().includes(search.toLowerCase()) ||
        guide.description.toLowerCase().includes(search.toLowerCase())
      : true
  );

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
            <h1 className="text-3xl font-bold text-gray-900">Style Guides Management</h1>
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
              placeholder="Search by name or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <Link
            href="/admin/style-guides/create"
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            + Create Style Guide
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

        {/* Style Guides Table */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Loading...</div>
          </div>
        ) : filteredGuides.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-gray-400 text-6xl mb-4">✍️</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No style guides found</h3>
            <p className="text-gray-500 mb-4">Create your first writing style guide.</p>
            <Link
              href="/admin/style-guides/create"
              className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Create Style Guide
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Default
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Examples
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredGuides.map((guide) => (
                  <tr key={guide.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-medium text-gray-900">{guide.name}</div>
                        {guide.is_default && (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            DEFAULT
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 truncate max-w-md">
                        {guide.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {!guide.is_default && (
                        <button
                          onClick={() => handleSetDefault(guide.id)}
                          className="text-sm text-blue-600 hover:text-blue-900"
                        >
                          Set as Default
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 inline-flex text-sm font-semibold rounded-full bg-gray-100 text-gray-800">
                        {guide.examples?.length || 0} examples
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <Link
                        href={`/admin/style-guides/${guide.id}`}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        View
                      </Link>
                      <Link
                        href={`/admin/style-guides/${guide.id}/edit`}
                        className="text-green-600 hover:text-green-900"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(guide.id)}
                        className={`${
                          deleteConfirm === guide.id
                            ? 'text-red-900 font-bold'
                            : 'text-red-600 hover:text-red-900'
                        }`}
                      >
                        {deleteConfirm === guide.id ? 'Confirm?' : 'Delete'}
                      </button>
                      {deleteConfirm === guide.id && (
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
    </div>
  );
}
