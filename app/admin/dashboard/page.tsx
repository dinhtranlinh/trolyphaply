'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

type Summary = {
  views: number;
  submits: number;
  shares: number;
  affiliate_clicks: number;
};

type Daily = {
  date: string;
  views: number;
  submits: number;
  shares: number;
  affiliate_clicks: number;
};

export default function AdminDashboard() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [summary, setSummary] = useState<Summary>({
    views: 0,
    submits: 0,
    shares: 0,
    affiliate_clicks: 0,
  });
  const [daily, setDaily] = useState<Daily[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin');
      return;
    }
    setAuthorized(true);
    setLoading(false);
  }, [router]);

  useEffect(() => {
    if (!authorized) return;

    const fetchStats = async () => {
      try {
        setStatsLoading(true);
        setStatsError(null);
        const res = await fetch('/api/admin/stats');
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Không lấy được thống kê');
        }
        setSummary(data.summary || summary);
        setDaily(data.daily || []);
      } catch (err: any) {
        setStatsError(err.message || 'Có lỗi khi lấy thống kê');
      } finally {
        setStatsLoading(false);
      }
    };

    fetchStats();
  }, [authorized]);

  const dailyTotalSeries = useMemo(() => {
    return daily.map((d) => ({
      date: d.date,
      total: d.views + d.submits + d.shares + d.affiliate_clicks,
    }));
  }, [daily]);

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

  const cards: { key: keyof Summary; label: string; color: string }[] = [
    { key: 'views', label: 'Lượt xem', color: 'bg-blue-50 text-blue-700' },
    { key: 'submits', label: 'Gửi yêu cầu', color: 'bg-green-50 text-green-700' },
    { key: 'shares', label: 'Chia sẻ', color: 'bg-orange-50 text-orange-700' },
    { key: 'affiliate_clicks', label: 'Affiliate clicks', color: 'bg-purple-50 text-purple-700' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-500">Tổng quan traffic và tương tác</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 flex-1 w-full">
        {statsError ? (
          <div className="p-4 mb-6 bg-red-50 text-red-700 rounded border border-red-200">
            {statsError}
          </div>
        ) : null}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {cards.map((c) => (
            <div key={c.key} className="bg-white rounded-lg shadow p-4">
              <div className={`text-xs font-semibold inline-block px-2 py-1 rounded ${c.color}`}>
                {c.label}
              </div>
              <div className="mt-3 text-3xl font-bold text-gray-900">
                {statsLoading ? '...' : summary[c.key] || 0}
              </div>
              <p className="text-sm text-gray-500 mt-1">Tổng cộng 30 ngày gần nhất</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Daily traffic (14 ngày)</h2>
              <p className="text-sm text-gray-500">Tổng số event mỗi ngày (view + submit + share + affiliate)</p>
            </div>
            {statsLoading && <span className="text-sm text-gray-400">Đang tải...</span>}
          </div>

          {dailyTotalSeries.length === 0 ? (
            <div className="text-sm text-gray-500">Chưa có dữ liệu.</div>
          ) : (
            <div className="space-y-2">
              {dailyTotalSeries.map((d) => {
                const max = Math.max(...dailyTotalSeries.map((v) => v.total), 1);
                const pct = Math.min(100, Math.round((d.total / max) * 100));
                return (
                  <div key={d.date}>
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>{d.date}</span>
                      <span>{d.total}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500" style={{ width: `${pct}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
