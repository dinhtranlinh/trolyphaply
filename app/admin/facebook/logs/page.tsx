'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface AutomationLog {
  id: string;
  page_id: string;
  post_id: string | null;
  target_id: string | null;
  rule_id: string | null;
  action_type: string;
  status: string;
  content_sent: string | null;
  metadata: {
    user_name?: string;
    comment_text?: string;
    error_message?: string;
    trigger?: string;
  } | null;
  created_at: string;
}

interface Page {
  id: number;
  page_id: string;
  page_name: string;
}

export default function LogsPage() {
  const [logs, setLogs] = useState<AutomationLog[]>([]);
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [filters, setFilters] = useState({
    page_id: 'all',
    action_type: 'all',
    status: 'all',
    start_date: '',
    end_date: '',
  });
  const [selectedLog, setSelectedLog] = useState<AutomationLog | null>(null);

  useEffect(() => {
    loadData();
    loadPages();
  }, [filters]);

  const loadPages = async () => {
    try {
      const res = await fetch('/api/facebook/pages');
      if (res.ok) {
        const data = await res.json();
        setPages(data.pages || []);
      }
    } catch (error) {
      console.error('Failed to load pages:', error);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.page_id !== 'all') params.append('page_id', filters.page_id);
      if (filters.action_type !== 'all') params.append('action_type', filters.action_type);
      if (filters.status !== 'all') params.append('status', filters.status);
      if (filters.start_date) params.append('start_date', filters.start_date);
      if (filters.end_date) params.append('end_date', filters.end_date);
      params.append('limit', '100');

      const res = await fetch(`/api/facebook/logs?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
      }
    } catch (error) {
      console.error('Failed to load logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = async () => {
    try {
      setExporting(true);
      const params = new URLSearchParams();
      if (filters.page_id !== 'all') params.append('page_id', filters.page_id);
      if (filters.action_type !== 'all') params.append('action_type', filters.action_type);
      if (filters.status !== 'all') params.append('status', filters.status);
      if (filters.start_date) params.append('start_date', filters.start_date);
      if (filters.end_date) params.append('end_date', filters.end_date);

      const res = await fetch(`/api/facebook/logs/export?${params.toString()}`);
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `facebook-logs-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Failed to export CSV:', error);
      alert('Failed to export logs');
    } finally {
      setExporting(false);
    }
  };

  const getPageName = (pageId: string) => {
    const page = pages.find(p => p.page_id === pageId);
    return page?.page_name || pageId;
  };

  const getActionTypeColor = (type: string) => {
    return type === 'reply_sent' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800';
  };

  const getStatusColor = (status: string) => {
    return status === 'sent' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Automation Logs</h1>
          <p className="text-sm text-gray-600 mt-1">
            Complete history of automated actions
          </p>
        </div>
        <button
          onClick={exportCSV}
          disabled={exporting || logs.length === 0}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {exporting ? 'Exporting...' : '📥 Export CSV'}
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Page</label>
            <select
              value={filters.page_id}
              onChange={(e) => setFilters({ ...filters, page_id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="all">All Pages</option>
              {pages.map(page => (
                <option key={page.id} value={page.page_id}>
                  {page.page_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Action Type</label>
            <select
              value={filters.action_type}
              onChange={(e) => setFilters({ ...filters, action_type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="all">All Types</option>
              <option value="reply_sent">Comment Reply</option>
              <option value="message_sent">Inbox Message</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="all">All Status</option>
              <option value="sent">Sent</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
            <input
              type="date"
              value={filters.start_date}
              onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
            <input
              type="date"
              value={filters.end_date}
              onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            {logs.length} {logs.length === 1 ? 'log' : 'logs'} found
          </p>
          {(filters.page_id !== 'all' || filters.action_type !== 'all' || filters.status !== 'all' || filters.start_date || filters.end_date) && (
            <button
              onClick={() => setFilters({ page_id: 'all', action_type: 'all', status: 'all', start_date: '', end_date: '' })}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Logs Table */}
      {loading ? (
        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading logs...</p>
        </div>
      ) : logs.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
          <p className="text-gray-500">No logs found</p>
          <p className="text-sm text-gray-400 mt-2">Automation logs will appear here after actions are performed</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Page</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {logs.map(log => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                      {formatDate(log.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getActionTypeColor(log.action_type)}`}>
                        {log.action_type === 'reply_sent' ? 'Comment Reply' : 'Inbox Message'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {getPageName(log.page_id)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm">
                        <p className="text-gray-900 font-medium">
                          {log.metadata?.user_name || 'Unknown'}
                        </p>
                        <p className="text-gray-500 text-xs font-mono">
                          {log.target_id ? `${log.target_id.slice(0, 12)}...` : 'N/A'}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(log.status)}`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="text-sm text-blue-600 hover:text-blue-700"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Log Detail Modal */}
      {selectedLog && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedLog(null)}
        >
          <div
            className="bg-white rounded-lg max-w-3xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Log Details</h2>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                {/* Basic Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Basic Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-gray-600">Action Type:</span>
                      <span className="col-span-2">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getActionTypeColor(selectedLog.action_type)}`}>
                          {selectedLog.action_type === 'reply_sent' ? 'Comment Reply' : 'Inbox Message'}
                        </span>
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-gray-600">Status:</span>
                      <span className="col-span-2">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedLog.status)}`}>
                          {selectedLog.status}
                        </span>
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-gray-600">Page:</span>
                      <span className="col-span-2 text-gray-900">{getPageName(selectedLog.page_id)}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-gray-600">Rule ID:</span>
                      <span className="col-span-2 text-gray-900">{selectedLog.rule_id || 'N/A'}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-gray-600">Created At:</span>
                      <span className="col-span-2 text-gray-900">
                        {new Date(selectedLog.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* User Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">User Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-gray-600">Name:</span>
                      <span className="col-span-2 text-gray-900">{selectedLog.metadata?.user_name || 'Unknown'}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-gray-600">Target ID:</span>
                      <span className="col-span-2 text-gray-900 font-mono text-xs break-all">{selectedLog.target_id || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Content */}
                {selectedLog.metadata?.comment_text && (
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">User Comment</h3>
                    <p className="text-sm text-gray-800">{selectedLog.metadata.comment_text}</p>
                  </div>
                )}

                {selectedLog.content_sent && (
                  <div className="bg-green-50 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">Bot Response</h3>
                    <p className="text-sm text-gray-800">{selectedLog.content_sent}</p>
                  </div>
                )}

                {selectedLog.metadata?.error_message && (
                  <div className="bg-red-50 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-red-900 mb-2">Error Message</h3>
                    <p className="text-sm text-red-800 font-mono">{selectedLog.metadata.error_message}</p>
                  </div>
                )}

                {selectedLog.metadata?.trigger && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">Trigger Details</h3>
                    <p className="text-sm text-gray-800">{selectedLog.metadata.trigger}</p>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setSelectedLog(null)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
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
