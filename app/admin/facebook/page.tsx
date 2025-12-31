'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Stats {
  today_sent: number;
  today_failed: number;
  today_total: number;
  total_sent: number;
  total_failed: number;
  comment_replies: number;
  messages_sent: number;
  success_rate: number;
}

interface DailyStat {
  date: string;
  total: number;
  successful: number;
  failed: number;
}

interface RecentEvent {
  id: string;
  event_type: string;
  status: string;
  created_at: string;
}

interface SafeModeStatus {
  enabled: boolean;
}

export default function FacebookDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [dailyStats, setDailyStats] = useState<DailyStat[]>([]);
  const [recentEvents, setRecentEvents] = useState<RecentEvent[]>([]);
  const [safeMode, setSafeMode] = useState<SafeModeStatus>({ enabled: false });
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load stats
      const statsRes = await fetch('/api/facebook/logs/stats?type=summary');
      const statsData = await statsRes.json();
      if (statsData.success) {
        setStats(statsData.stats);
      }

      // Load daily stats for chart
      const dailyRes = await fetch('/api/facebook/logs/stats?type=daily&days=7');
      const dailyData = await dailyRes.json();
      if (dailyData.success) {
        setDailyStats(dailyData.stats);
      }

      // Load recent events
      const eventsRes = await fetch('/api/facebook/events?limit=5');
      const eventsData = await eventsRes.json();
      if (eventsData.success) {
        setRecentEvents(eventsData.events);
      }

      // Load safe mode status
      const safeModeRes = await fetch('/api/facebook/safe-mode');
      const safeModeData = await safeModeRes.json();
      if (safeModeData.success) {
        setSafeMode({ enabled: safeModeData.safe_mode_enabled });
      }
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSafeMode = async () => {
    try {
      const response = await fetch('/api/facebook/safe-mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !safeMode.enabled }),
      });

      const data = await response.json();
      if (data.success) {
        setSafeMode({ enabled: data.safe_mode_enabled });
      }
    } catch (error) {
      console.error('Failed to toggle safe mode:', error);
    }
  };

  const syncPages = async () => {
    setSyncing(true);
    try {
      const response = await fetch('/api/facebook/pages/sync', {
        method: 'POST',
      });

      const data = await response.json();
      if (data.success) {
        alert(`Synced ${data.pages?.length || 0} pages successfully!`);
      } else {
        alert(`Failed to sync: ${data.error}`);
      }
    } catch (error) {
      console.error('Failed to sync pages:', error);
      alert('Failed to sync pages');
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-2 text-sm text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Safe Mode Alert */}
      {safeMode.enabled && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <div className="flex-1">
              <h3 className="font-semibold text-yellow-900">Safe Mode Active</h3>
              <p className="text-sm text-yellow-700">
                All automation is currently paused. Toggle safe mode below to resume.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Today Sent</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {stats?.today_sent || 0}
              </p>
            </div>
            <span className="text-4xl">✅</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Today Failed</p>
              <p className="text-3xl font-bold text-red-600 mt-1">
                {stats?.today_failed || 0}
              </p>
            </div>
            <span className="text-4xl">❌</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Success Rate</p>
              <p className="text-3xl font-bold text-green-600 mt-1">
                {stats?.success_rate?.toFixed(1) || 0}%
              </p>
            </div>
            <span className="text-4xl">📊</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Actions</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">
                {stats?.total_sent || 0}
              </p>
            </div>
            <span className="text-4xl">🚀</span>
          </div>
        </div>
      </div>

      {/* 7-Day Trend Chart */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          7-Day Activity Trend
        </h2>
        <div className="space-y-2">
          {dailyStats.map((day) => {
            const maxTotal = Math.max(...dailyStats.map(d => d.total), 1);
            const successPercent = (day.successful / maxTotal) * 100;
            const failedPercent = (day.failed / maxTotal) * 100;

            return (
              <div key={day.date} className="flex items-center gap-3">
                <div className="w-24 text-sm text-gray-600">
                  {new Date(day.date).toLocaleDateString('vi-VN', { 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </div>
                <div className="flex-1 h-8 bg-gray-100 rounded-full overflow-hidden flex">
                  <div
                    className="bg-green-500 h-full"
                    style={{ width: `${successPercent}%` }}
                    title={`Success: ${day.successful}`}
                  ></div>
                  <div
                    className="bg-red-500 h-full"
                    style={{ width: `${failedPercent}%` }}
                    title={`Failed: ${day.failed}`}
                  ></div>
                </div>
                <div className="w-16 text-sm text-gray-600 text-right">
                  {day.total}
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-4 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-gray-600">Success</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span className="text-gray-600">Failed</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Safe Mode Toggle */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Safe Mode
          </h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                {safeMode.enabled ? 'Automation is paused' : 'Automation is running'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Toggle to {safeMode.enabled ? 'resume' : 'pause'} all automation
              </p>
            </div>
            <button
              onClick={toggleSafeMode}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                safeMode.enabled ? 'bg-yellow-500' : 'bg-green-500'
              }`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                  safeMode.enabled ? 'translate-x-1' : 'translate-x-7'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Sync Pages */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Sync Pages
          </h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                Fetch latest pages from Facebook
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Updates page list and access tokens
              </p>
            </div>
            <button
              onClick={syncPages}
              disabled={syncing}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm font-medium"
            >
              {syncing ? 'Syncing...' : 'Sync Now'}
            </button>
          </div>
        </div>
      </div>

      {/* Recent Events */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Recent Events
          </h2>
          <Link
            href="/admin/facebook/events"
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            View all →
          </Link>
        </div>
        
        {recentEvents.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-8">
            No events yet. Webhook events will appear here.
          </p>
        ) : (
          <div className="space-y-3">
            {recentEvents.map((event) => (
              <div
                key={event.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">
                    {event.event_type === 'comment' ? '💬' : 
                     event.event_type === 'message' ? '📨' : 
                     event.event_type === 'reaction' ? '❤️' : '📡'}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {event.event_type}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(event.created_at).toLocaleString('vi-VN')}
                    </p>
                  </div>
                </div>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded ${
                    event.status === 'processed'
                      ? 'bg-green-100 text-green-700'
                      : event.status === 'failed'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  {event.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/admin/facebook/reply-rules"
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:border-blue-300 transition-colors"
        >
          <span className="text-3xl mb-3 block">💬</span>
          <h3 className="font-semibold text-gray-900">Reply Rules</h3>
          <p className="text-sm text-gray-600 mt-1">
            Manage auto-reply templates for comments
          </p>
        </Link>

        <Link
          href="/admin/facebook/message-rules"
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:border-blue-300 transition-colors"
        >
          <span className="text-3xl mb-3 block">📨</span>
          <h3 className="font-semibold text-gray-900">Message Rules</h3>
          <p className="text-sm text-gray-600 mt-1">
            Configure inbox automation triggers
          </p>
        </Link>

        <Link
          href="/admin/facebook/logs"
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:border-blue-300 transition-colors"
        >
          <span className="text-3xl mb-3 block">📋</span>
          <h3 className="font-semibold text-gray-900">Audit Logs</h3>
          <p className="text-sm text-gray-600 mt-1">
            View complete automation history
          </p>
        </Link>
      </div>
    </div>
  );
}
