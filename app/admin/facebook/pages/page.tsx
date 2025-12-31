'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Page {
  id: string;
  page_id: string;
  page_name: string;
  category: string;
  followers_count: number;
  automation_enabled: boolean;
  access_token: string;
  created_at: string;
  updated_at: string;
}

export default function PagesManagement() {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadPages();
  }, []);

  const loadPages = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/facebook/pages');
      const data = await response.json();

      if (data.success) {
        setPages(data.pages || []);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to load pages' });
      }
    } catch (error) {
      console.error('Failed to load pages:', error);
      setMessage({ type: 'error', text: 'Failed to load pages' });
    } finally {
      setLoading(false);
    }
  };

  const syncPages = async () => {
    setSyncing(true);
    setMessage(null);

    try {
      const response = await fetch('/api/facebook/pages/sync', {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        setMessage({
          type: 'success',
          text: `Successfully synced ${data.pages?.length || 0} pages from Facebook!`,
        });
        await loadPages();
      } else {
        setMessage({
          type: 'error',
          text: `Failed to sync: ${data.error}`,
        });
      }
    } catch (error) {
      console.error('Failed to sync pages:', error);
      setMessage({ type: 'error', text: 'Failed to sync pages' });
    } finally {
      setSyncing(false);
    }
  };

  const toggleAutomation = async (pageId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/facebook/pages/${pageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ automation_enabled: !currentStatus }),
      });

      const data = await response.json();

      if (data.success) {
        setPages((prev) =>
          prev.map((p) =>
            p.id === pageId ? { ...p, automation_enabled: !currentStatus } : p
          )
        );
        setMessage({
          type: 'success',
          text: `Automation ${!currentStatus ? 'enabled' : 'disabled'} successfully`,
        });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to update page' });
      }
    } catch (error) {
      console.error('Failed to toggle automation:', error);
      setMessage({ type: 'error', text: 'Failed to update automation status' });
    }
  };

  const deletePage = async (pageId: string, pageName: string) => {
    if (!confirm(`Are you sure you want to remove ${pageName}? This will delete all associated rules and logs.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/facebook/pages/${pageId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        setPages((prev) => prev.filter((p) => p.id !== pageId));
        setMessage({ type: 'success', text: 'Page removed successfully' });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to remove page' });
      }
    } catch (error) {
      console.error('Failed to delete page:', error);
      setMessage({ type: 'error', text: 'Failed to remove page' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-2 text-sm text-gray-600">Loading pages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pages Management</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage your Facebook pages and automation settings
          </p>
        </div>
        <button
          onClick={syncPages}
          disabled={syncing}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm font-medium flex items-center gap-2"
        >
          {syncing ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></div>
              Syncing...
            </>
          ) : (
            <>
              <span>🔄</span>
              Sync from Facebook
            </>
          )}
        </button>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`p-4 rounded-lg border ${
            message.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Pages Table */}
      {pages.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
          <div className="text-center">
            <span className="text-6xl mb-4 block">📄</span>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No pages yet</h3>
            <p className="text-sm text-gray-600 mb-4">
              Connect your Facebook account and sync your pages to get started
            </p>
            <div className="flex gap-3 justify-center">
              <Link
                href="/admin/facebook/connection"
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
              >
                Connect Facebook
              </Link>
              <button
                onClick={syncPages}
                disabled={syncing}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm font-medium"
              >
                Sync Pages
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Page
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Followers
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Automation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pages.map((page) => (
                  <tr key={page.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {page.page_name || 'Unnamed Page'}
                          </div>
                          <div className="text-xs text-gray-500">ID: {page.page_id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-700">
                        {page.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {page.followers_count?.toLocaleString() || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleAutomation(page.id, page.automation_enabled)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          page.automation_enabled ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            page.automation_enabled ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/facebook/pages/${page.id}`}
                          className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                          View
                        </Link>
                        <span className="text-gray-300">|</span>
                        <button
                          onClick={() => deletePage(page.id, page.page_name || 'this page')}
                          className="text-red-600 hover:text-red-700 font-medium"
                        >
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Stats Summary */}
      {pages.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-600">Total Pages</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{pages.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-600">Automation Enabled</p>
            <p className="text-2xl font-bold text-green-600 mt-1">
              {pages.filter((p) => p.automation_enabled).length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-600">Total Followers</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">
              {pages.reduce((sum, p) => sum + (p.followers_count || 0), 0).toLocaleString()}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
