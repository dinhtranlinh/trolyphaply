'use client';

import { useEffect, useState } from 'react';

interface FacebookEvent {
  id: number;
  event_id: string;
  event_type: string;
  page_id: string;
  user_id: string;
  post_id: string | null;
  comment_id: string | null;
  status: string;
  created_at: string;
}

interface Page {
  id: number;
  page_id: string;
  name: string;
}

export default function EventsPage() {
  const [events, setEvents] = useState<FacebookEvent[]>([]);
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [filters, setFilters] = useState({
    page_id: 'all',
    event_type: 'all',
    status: 'all',
  });
  const [selectedEvent, setSelectedEvent] = useState<FacebookEvent | null>(null);

  useEffect(() => {
    loadData();
    loadPages();
  }, [filters]);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadData();
    }, 10000); // Refresh every 10 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, filters]);

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
      const params = new URLSearchParams();
      if (filters.page_id !== 'all') params.append('page_id', filters.page_id);
      if (filters.event_type !== 'all') params.append('event_type', filters.event_type);
      if (filters.status !== 'all') params.append('status', filters.status);
      params.append('limit', '50');

      const res = await fetch(`/api/facebook/events?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setEvents(data.events || []);
      }
    } catch (error) {
      console.error('Failed to load events:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPageName = (pageId: string) => {
    const page = pages.find(p => p.page_id === pageId);
    return page?.name || pageId;
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'comment': return 'bg-blue-100 text-blue-800';
      case 'reaction': return 'bg-green-100 text-green-800';
      case 'message': return 'bg-purple-100 text-purple-800';
      case 'mention': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    
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
          <h1 className="text-2xl font-bold text-gray-900">Event Stream</h1>
          <p className="text-sm text-gray-600 mt-1">
            Real-time webhook events from Facebook
          </p>
        </div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={autoRefresh}
            onChange={(e) => setAutoRefresh(e.target.checked)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">Auto-refresh (10s)</span>
        </label>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                  {page.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Event Type</label>
            <select
              value={filters.event_type}
              onChange={(e) => setFilters({ ...filters, event_type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="all">All Types</option>
              <option value="comment">Comment</option>
              <option value="reaction">Reaction</option>
              <option value="message">Message</option>
              <option value="mention">Mention</option>
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
              <option value="pending">Pending</option>
              <option value="processed">Processed</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Events Timeline */}
      {loading ? (
        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading events...</p>
        </div>
      ) : events.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
          <p className="text-gray-500">No events found</p>
          <p className="text-sm text-gray-400 mt-2">Events will appear here when users interact with your Facebook pages</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="divide-y divide-gray-200">
            {events.map(event => (
              <div
                key={event.id}
                onClick={() => setSelectedEvent(event)}
                className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`mt-1 w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                    event.event_type === 'comment' ? 'bg-blue-500' :
                    event.event_type === 'reaction' ? 'bg-green-500' :
                    event.event_type === 'message' ? 'bg-purple-500' :
                    'bg-yellow-500'
                  }`}>
                    {event.event_type === 'comment' ? '💬' :
                     event.event_type === 'reaction' ? '👍' :
                     event.event_type === 'message' ? '✉️' : '📢'}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getEventTypeColor(event.event_type)}`}>
                        {event.event_type}
                      </span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                        {event.status}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDate(event.created_at)}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-900 font-medium">
                      {getPageName(event.page_id)}
                    </p>
                    
                    <div className="text-xs text-gray-500 mt-1 space-x-3">
                      <span>User: {event.user_id}</span>
                      {event.post_id && <span>Post: {event.post_id.slice(0, 15)}...</span>}
                      {event.comment_id && <span>Comment: {event.comment_id.slice(0, 15)}...</span>}
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="text-gray-400">
                    →
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedEvent(null)}
        >
          <div
            className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Event Details</h2>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-gray-600 font-medium">Event ID:</span>
                  <span className="col-span-2 text-gray-900">{selectedEvent.event_id}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-gray-600 font-medium">Type:</span>
                  <span className="col-span-2">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getEventTypeColor(selectedEvent.event_type)}`}>
                      {selectedEvent.event_type}
                    </span>
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-gray-600 font-medium">Status:</span>
                  <span className="col-span-2">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedEvent.status)}`}>
                      {selectedEvent.status}
                    </span>
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-gray-600 font-medium">Page:</span>
                  <span className="col-span-2 text-gray-900">{getPageName(selectedEvent.page_id)}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-gray-600 font-medium">Page ID:</span>
                  <span className="col-span-2 text-gray-900 font-mono text-xs">{selectedEvent.page_id}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-gray-600 font-medium">User ID:</span>
                  <span className="col-span-2 text-gray-900 font-mono text-xs">{selectedEvent.user_id}</span>
                </div>
                {selectedEvent.post_id && (
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-gray-600 font-medium">Post ID:</span>
                    <span className="col-span-2 text-gray-900 font-mono text-xs break-all">{selectedEvent.post_id}</span>
                  </div>
                )}
                {selectedEvent.comment_id && (
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-gray-600 font-medium">Comment ID:</span>
                    <span className="col-span-2 text-gray-900 font-mono text-xs break-all">{selectedEvent.comment_id}</span>
                  </div>
                )}
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-gray-600 font-medium">Created:</span>
                  <span className="col-span-2 text-gray-900">
                    {new Date(selectedEvent.created_at).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setSelectedEvent(null)}
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
