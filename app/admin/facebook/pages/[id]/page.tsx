'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Page {
  id: string;
  page_id: string;
  name: string;
  category: string;
  followers_count: number;
  automation_enabled: boolean;
  access_token: string;
  created_at: string;
  updated_at: string;
}

interface PageStats {
  today_sent: number;
  today_failed: number;
  total_sent: number;
  total_failed: number;
  success_rate: number;
}

interface RecentLog {
  id: string;
  action_type: string;
  status: string;
  user_name: string;
  created_at: string;
}

export default function PageDetail({ params }: { params: Promise<{ id: string }> }) {
  const [page, setPage] = useState<Page | null>(null);
  const [stats, setStats] = useState<PageStats | null>(null);
  const [recentLogs, setRecentLogs] = useState<RecentLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [pageId, setPageId] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    params.then((p) => {
      setPageId(p.id);
      loadPageData(p.id);
    });
  }, [params]);

  const loadPageData = async (id: string) => {
    setLoading(true);
    try {
      // Load page details
      const pageRes = await fetch(`/api/facebook/pages/${id}`);
      const pageData = await pageRes.json();

      if (pageData.success) {
        setPage(pageData.page);

        // Load page stats
        const statsRes = await fetch(
          `/api/facebook/logs/stats?type=summary&page_id=${pageData.page.page_id}`
        );
        const statsData = await statsRes.json();
        if (statsData.success) {
          setStats(statsData.stats);
        }

        // Load recent logs
        const logsRes = await fetch(
          `/api/facebook/logs?page_id=${pageData.page.page_id}&limit=5`
        );
        const logsData = await logsRes.json();
        if (logsData.success) {
          setRecentLogs(logsData.logs);
        }
      } else {
        alert('Page not found');
        router.push('/admin/facebook/pages');
      }
    } catch (error) {
      console.error('Failed to load page:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleAutomation = async () => {
    if (!page) return;

    setUpdating(true);
    try {
      const response = await fetch(`/api/facebook/pages/${page.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ automation_enabled: !page.automation_enabled }),
      });

      const data = await response.json();

      if (data.success) {
        setPage((prev) => prev ? { ...prev, automation_enabled: !prev.automation_enabled } : null);
      } else {
        alert(`Failed to update: ${data.error}`);
      }
    } catch (error) {
      console.error('Failed to toggle automation:', error);
      alert('Failed to update automation status');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-2 text-sm text-gray-600">Loading page details...</p>
        </div>
      </div>
    );
  }

  if (!page) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Link href="/admin/facebook/pages" className="hover:text-gray-900">
          Pages
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">{page.name}</span>
      </div>

      {/* Page Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center text-3xl">
              📄
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{page.name}</h1>
              <div className="mt-2 space-y-1 text-sm text-gray-600">
                <p>
                  <span className="font-medium">Category:</span> {page.category}
                </p>
                <p>
                  <span className="font-medium">Page ID:</span> {page.page_id}
                </p>
                <p>
                  <span className="font-medium">Followers:</span>{' '}
                  {page.followers_count?.toLocaleString() || 'N/A'}
                </p>
                <p>
                  <span className="font-medium">Added:</span>{' '}
                  {new Date(page.created_at).toLocaleDateString('vi-VN')}
                </p>
              </div>
            </div>
          </div>

          {/* Automation Toggle */}
          <div className="text-right">
            <p className="text-sm text-gray-600 mb-2">Automation Status</p>
            <button
              onClick={toggleAutomation}
              disabled={updating}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors disabled:opacity-50 ${
                page.automation_enabled ? 'bg-green-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                  page.automation_enabled ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
            <p className="text-xs text-gray-500 mt-1">
              {page.automation_enabled ? 'Enabled' : 'Disabled'}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Today Sent</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {stats?.today_sent || 0}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Today Failed</p>
          <p className="text-2xl font-bold text-red-600 mt-1">
            {stats?.today_failed || 0}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Total Sent</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">
            {stats?.total_sent || 0}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Success Rate</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {stats?.success_rate?.toFixed(1) || 0}%
          </p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
          <Link
            href={`/admin/facebook/logs?page_id=${page.page_id}`}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            View all →
          </Link>
        </div>

        {recentLogs.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-8">
            No activity yet. Actions will appear here once automation runs.
          </p>
        ) : (
          <div className="space-y-3">
            {recentLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">
                    {log.action_type === 'reply_sent' ? '💬' : '📨'}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {log.action_type === 'reply_sent'
                        ? 'Reply to comment'
                        : 'Inbox message'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {log.user_name} • {new Date(log.created_at).toLocaleString('vi-VN')}
                    </p>
                  </div>
                </div>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded ${
                    log.status === 'success'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {log.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href={`/admin/facebook/reply-rules?page_id=${page.page_id}`}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:border-blue-300 transition-colors"
        >
          <span className="text-3xl mb-3 block">💬</span>
          <h3 className="font-semibold text-gray-900">Reply Rules</h3>
          <p className="text-sm text-gray-600 mt-1">
            Manage auto-reply rules for this page's comments
          </p>
        </Link>

        <Link
          href={`/admin/facebook/message-rules?page_id=${page.page_id}`}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:border-blue-300 transition-colors"
        >
          <span className="text-3xl mb-3 block">📨</span>
          <h3 className="font-semibold text-gray-900">Message Rules</h3>
          <p className="text-sm text-gray-600 mt-1">
            Configure inbox automation triggers for this page
          </p>
        </Link>
      </div>

      {/* Delete Warning */}
      <div className="bg-red-50 rounded-lg border border-red-200 p-6">
        <h3 className="text-lg font-semibold text-red-900 mb-2">Danger Zone</h3>
        <p className="text-sm text-red-700 mb-4">
          Removing this page will delete all associated rules, logs, and statistics.
          This action cannot be undone.
        </p>
        <button
          onClick={() => {
            if (
              confirm(
                `Are you sure you want to remove ${page.name}? This will delete all associated data.`
              )
            ) {
              fetch(`/api/facebook/pages/${page.id}`, { method: 'DELETE' })
                .then((res) => res.json())
                .then((data) => {
                  if (data.success) {
                    router.push('/admin/facebook/pages');
                  } else {
                    alert(`Failed to remove: ${data.error}`);
                  }
                })
                .catch((error) => {
                  console.error('Failed to delete:', error);
                  alert('Failed to remove page');
                });
            }
          }}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
        >
          Remove Page
        </button>
      </div>
    </div>
  );
}
