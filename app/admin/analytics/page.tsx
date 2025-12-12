'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

/**
 * Analytics Dashboard Page
 * Hiển thị Google Analytics metrics và embedded reports
 */
export default function AnalyticsDashboard() {
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

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/admin/dashboard"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                ← Back to Dashboard
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">📊 Analytics Dashboard</h1>
            </div>
            <Link
              href="https://analytics.google.com/analytics/web/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Open Full GA4 Dashboard ↗
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Card 1: Total Users */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Total Users</h3>
              <span className="text-2xl">👥</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">-</p>
            <p className="text-xs text-gray-500 mt-2">Last 30 days</p>
          </div>

          {/* Card 2: Q&A Queries */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Q&A Queries</h3>
              <span className="text-2xl">💬</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">-</p>
            <p className="text-xs text-gray-500 mt-2">Total submissions</p>
          </div>

          {/* Card 3: Prompts Copied */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Prompts Copied</h3>
              <span className="text-2xl">📋</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">-</p>
            <p className="text-xs text-gray-500 mt-2">Copy interactions</p>
          </div>

          {/* Card 4: Social Shares */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Social Shares</h3>
              <span className="text-2xl">🔗</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">-</p>
            <p className="text-xs text-gray-500 mt-2">Facebook + Zalo + Copy</p>
          </div>
        </div>

        {/* Setup Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
          <h2 className="text-lg font-bold text-blue-900 mb-4">🔧 Setup Instructions</h2>
          <div className="space-y-3 text-sm text-blue-800">
            <div className="flex items-start gap-3">
              <span className="font-bold text-blue-600">1.</span>
              <div>
                <p className="font-medium">Create Google Analytics 4 Property</p>
                <p className="text-blue-700">Visit <a href="https://analytics.google.com" target="_blank" className="underline">analytics.google.com</a> and create a new GA4 property for <code className="bg-blue-100 px-2 py-0.5 rounded">trolyphaply.vn</code></p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="font-bold text-blue-600">2.</span>
              <div>
                <p className="font-medium">Get Measurement ID</p>
                <p className="text-blue-700">Copy your Measurement ID (format: <code className="bg-blue-100 px-2 py-0.5 rounded">G-XXXXXXXXXX</code>) from GA4 Admin → Data Streams</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="font-bold text-blue-600">3.</span>
              <div>
                <p className="font-medium">Update Layout Configuration</p>
                <p className="text-blue-700">Replace <code className="bg-blue-100 px-2 py-0.5 rounded">G-XXXXXXXXXX</code> in <code className="bg-blue-100 px-2 py-0.5 rounded">app/layout.tsx</code> and <code className="bg-blue-100 px-2 py-0.5 rounded">lib/analytics.ts</code> with your real Measurement ID</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="font-bold text-blue-600">4.</span>
              <div>
                <p className="font-medium">Verify Tracking</p>
                <p className="text-blue-700">Use GA4 DebugView or Real-time reports to verify events are being tracked correctly</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="font-bold text-blue-600">5.</span>
              <div>
                <p className="font-medium">Configure Custom Reports (Optional)</p>
                <p className="text-blue-700">Create custom reports in GA4 for Q&A queries, prompt interactions, and social shares</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tracked Events Reference */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">📈 Tracked Events</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Event Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Description</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Parameters</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr>
                  <td className="py-3 px-4"><code className="bg-gray-100 px-2 py-1 rounded text-xs">qa_query_submit</code></td>
                  <td className="py-3 px-4">User submits Q&A question</td>
                  <td className="py-3 px-4 text-xs text-gray-600">question_length, has_answer, response_time</td>
                </tr>
                <tr>
                  <td className="py-3 px-4"><code className="bg-gray-100 px-2 py-1 rounded text-xs">prompt_copy</code></td>
                  <td className="py-3 px-4">User copies AI prompt</td>
                  <td className="py-3 px-4 text-xs text-gray-600">prompt_id, prompt_title, category</td>
                </tr>
                <tr>
                  <td className="py-3 px-4"><code className="bg-gray-100 px-2 py-1 rounded text-xs">share_facebook</code></td>
                  <td className="py-3 px-4">Share to Facebook</td>
                  <td className="py-3 px-4 text-xs text-gray-600">content_type, content_id</td>
                </tr>
                <tr>
                  <td className="py-3 px-4"><code className="bg-gray-100 px-2 py-1 rounded text-xs">share_zalo</code></td>
                  <td className="py-3 px-4">Share to Zalo</td>
                  <td className="py-3 px-4 text-xs text-gray-600">content_type, content_id</td>
                </tr>
                <tr>
                  <td className="py-3 px-4"><code className="bg-gray-100 px-2 py-1 rounded text-xs">share_copy</code></td>
                  <td className="py-3 px-4">Copy share link</td>
                  <td className="py-3 px-4 text-xs text-gray-600">content_type, content_id</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Embedded GA4 Report Placeholder */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">📊 Real-time Analytics</h2>
          <div className="aspect-video bg-gray-50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
            <div className="text-center space-y-2">
              <p className="text-gray-600">Embedded GA4 Report will appear here</p>
              <p className="text-sm text-gray-500">Configure in GA4 Admin → Data Studio or use iframe embed</p>
              <a
                href="https://analytics.google.com/analytics/web/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                Open GA4 Dashboard ↗
              </a>
            </div>
          </div>
        </div>

        {/* Usage Guide */}
        <div className="mt-8 bg-gray-50 rounded-xl p-6 border border-gray-200">
          <h3 className="font-bold text-gray-900 mb-3">💡 How to View Analytics</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span>•</span>
              <span><strong>Real-time:</strong> Visit GA4 → Reports → Realtime to see live events</span>
            </li>
            <li className="flex items-start gap-2">
              <span>•</span>
              <span><strong>Events:</strong> Visit GA4 → Reports → Engagement → Events to see all tracked events</span>
            </li>
            <li className="flex items-start gap-2">
              <span>•</span>
              <span><strong>Custom Reports:</strong> Use GA4 Explore to create custom reports for specific metrics</span>
            </li>
            <li className="flex items-start gap-2">
              <span>•</span>
              <span><strong>Embed Reports:</strong> Share reports via Looker Studio (formerly Data Studio) for iframe embedding</span>
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}
