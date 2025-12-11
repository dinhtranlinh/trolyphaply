'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminDashboard() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin');
      return;
    }
    setAuthorized(true);
    setLoading(false);
  }, [router]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!authorized) {
    return null;
  }

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    router.push('/admin');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-white shadow-lg h-screen sticky top-0 hidden md:block">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Admin Panel</h2>
          <nav className="space-y-2">
            <Link
              href="/admin/dashboard"
              className="flex items-center gap-3 px-4 py-3 text-gray-900 bg-blue-50 border-l-4 border-blue-600 font-medium"
            >
              <span>📊</span>
              <span>Dashboard</span>
            </Link>
            <Link
              href="/admin/documents"
              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition"
            >
              <span>📜</span>
              <span>Documents</span>
            </Link>
            <Link
              href="/admin/procedures"
              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition"
            >
              <span>📋</span>
              <span>Procedures</span>
            </Link>
            <Link
              href="/admin/prompts"
              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition"
            >
              <span>💬</span>
              <span>Prompts</span>
            </Link>
            <Link
              href="/admin/apps"
              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition"
            >
              <span>🎯</span>
              <span>Apps</span>
            </Link>
            <Link
              href="/admin/style-guides"
              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition"
            >
              <span>✍️</span>
              <span>Style Guides</span>
            </Link>
            <Link
              href="/admin/video-prompts"
              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition"
            >
              <span>🎬</span>
              <span>Video Prompts</span>
            </Link>
            <Link
              href="/admin/documents/import"
              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition"
            >
              <span>📥</span>
              <span>Import/Export</span>
            </Link>
          </nav>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1">
        {/* Header */}
        <header className="bg-white shadow">
          <div className="px-4 py-6 flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Documents */}
            <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
              <div className="flex items-center justify-between mb-4">
                <span className="text-4xl">📜</span>
                <span className="text-sm font-medium text-gray-500">DOCUMENTS</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Legal Documents</h3>
              <p className="text-gray-600 mb-4 text-sm">Manage legal documents library</p>
              <Link
                href="/admin/documents"
                className="inline-block px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium"
              >
                Manage
              </Link>
            </div>

            {/* Procedures */}
            <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
              <div className="flex items-center justify-between mb-4">
                <span className="text-4xl">📋</span>
                <span className="text-sm font-medium text-gray-500">PROCEDURES</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Procedures</h3>
              <p className="text-gray-600 mb-4 text-sm">Manage administrative procedures</p>
              <Link
                href="/admin/procedures"
                className="inline-block px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm font-medium"
              >
                Manage
              </Link>
            </div>

            {/* Prompts */}
            <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
              <div className="flex items-center justify-between mb-4">
                <span className="text-4xl">💬</span>
                <span className="text-sm font-medium text-gray-500">PROMPTS</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Q&A Prompts</h3>
              <p className="text-gray-600 mb-4 text-sm">Manage prompts for Q&A system</p>
              <Link
                href="/admin/prompts"
                className="inline-block px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition text-sm font-medium"
              >
                Manage
              </Link>
            </div>

            {/* Apps */}
            <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
              <div className="flex items-center justify-between mb-4">
                <span className="text-4xl">🎯</span>
                <span className="text-sm font-medium text-gray-500">APPS</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Mini Apps</h3>
              <p className="text-gray-600 mb-4 text-sm">Manage AI-powered applications</p>
              <Link
                href="/admin/apps"
                className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium"
              >
                Manage
              </Link>
            </div>

            {/* Style Guides */}
            <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
              <div className="flex items-center justify-between mb-4">
                <span className="text-4xl">✍️</span>
                <span className="text-sm font-medium text-gray-500">STYLE GUIDES</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Style Guides</h3>
              <p className="text-gray-600 mb-4 text-sm">Manage writing style guides</p>
              <Link
                href="/admin/style-guides"
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
              >
                Manage
              </Link>
            </div>

            {/* Video Prompts */}
            <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
              <div className="flex items-center justify-between mb-4">
                <span className="text-4xl">🎬</span>
                <span className="text-sm font-medium text-gray-500">VIDEO PROMPTS</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Video Prompts</h3>
              <p className="text-gray-600 mb-4 text-sm">Manage video prompt templates</p>
              <Link
                href="/admin/video-prompts"
                className="inline-block px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition text-sm font-medium"
              >
                Manage
              </Link>
            </div>

            {/* Import/Export */}
            <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
              <div className="flex items-center justify-between mb-4">
                <span className="text-4xl">📥</span>
                <span className="text-sm font-medium text-gray-500">IMPORT/EXPORT</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Import/Export</h3>
              <p className="text-gray-600 mb-4 text-sm">Import documents and export data</p>
              <Link
                href="/admin/documents/import"
                className="inline-block px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition text-sm font-medium"
              >
                Import/Export
              </Link>
            </div>

            {/* Analytics */}
            <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition opacity-60">
              <div className="flex items-center justify-between mb-4">
                <span className="text-4xl">📈</span>
                <span className="text-sm font-medium text-gray-500">ANALYTICS</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Analytics</h3>
              <p className="text-gray-600 mb-4 text-sm">View system statistics</p>
              <button className="px-4 py-2 bg-gray-600 text-white rounded-lg cursor-not-allowed text-sm font-medium">
                Coming Soon
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
