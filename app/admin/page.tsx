'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import { createClient } from '@/lib/supabase';

interface Stats {
  documents: number;
  procedures: number;
  prompts: number;
  apps: number;
  results: number;
}

interface RecentResult {
  id: string;
  app_slug: string;
  created_at: string;
  input_params: Record<string, unknown>;
}

/**
 * Admin Dashboard Home
 */
export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats>({
    documents: 0,
    procedures: 0,
    prompts: 0,
    apps: 0,
    results: 0,
  });
  const [recentResults, setRecentResults] = useState<RecentResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const supabase = createClient();

      // Fetch all stats in parallel
      const [
        { count: documentsCount },
        { count: proceduresCount },
        { count: promptsCount },
        { count: appsCount },
        { count: resultsCount },
        { data: resultsData },
      ] = await Promise.all([
        supabase.from('legal_documents').select('*', { count: 'exact', head: true }),
        supabase.from('legal_procedures').select('*', { count: 'exact', head: true }),
        supabase.from('prompts').select('*', { count: 'exact', head: true }),
        supabase.from('mini_apps').select('*', { count: 'exact', head: true }),
        supabase.from('app_results').select('*', { count: 'exact', head: true }),
        supabase
          .from('app_results')
          .select('id, app_slug, created_at, input_params')
          .order('created_at', { ascending: false })
          .limit(10),
      ]);

      setStats({
        documents: documentsCount || 0,
        procedures: proceduresCount || 0,
        prompts: promptsCount || 0,
        apps: appsCount || 0,
        results: resultsCount || 0,
      });

      setRecentResults(resultsData || []);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: 'Văn bản', value: stats.documents, icon: '📜', href: '/admin/documents', color: 'var(--color-primary)' },
    { label: 'Thủ tục', value: stats.procedures, icon: '📋', href: '/admin/procedures', color: 'var(--color-accent)' },
    { label: 'Prompts', value: stats.prompts, icon: '💬', href: '/admin/prompts', color: 'var(--color-success)' },
    { label: 'Mini Apps', value: stats.apps, icon: '🎯', href: '/admin/apps', color: 'var(--color-warning)' },
    { label: 'Kết quả', value: stats.results, icon: '✨', href: '/admin', color: 'var(--color-info)' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="page-title mb-2">Dashboard</h1>
        <p className="text-muted">Tổng quan hệ thống TroLyPhapLy</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {statCards.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-start justify-between mb-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                  style={{ background: `${stat.color}15` }}
                >
                  {stat.icon}
                </div>
              </div>
              <div className="text-3xl font-bold mb-1" style={{ color: stat.color }}>
                {stat.value.toLocaleString()}
              </div>
              <div className="text-sm text-muted">{stat.label}</div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Recent Activity */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h2 className="section-title">Hoạt động gần đây</h2>
          <span className="text-sm text-muted">{recentResults.length} kết quả</span>
        </div>

        {recentResults.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-3">📭</div>
            <p className="text-muted">Chưa có hoạt động nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '2px solid var(--color-border-subtle)' }}>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted">ID</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted">App</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted">Thời gian</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-muted">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {recentResults.map((result, index) => (
                  <tr
                    key={result.id}
                    style={{
                      borderBottom: index < recentResults.length - 1 ? '1px solid var(--color-border-subtle)' : 'none',
                    }}
                  >
                    <td className="py-3 px-4 text-sm font-mono text-muted">{result.id.slice(0, 8)}...</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{result.app_slug}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-muted">
                      {new Date(result.created_at).toLocaleString('vi-VN')}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          alert(`Chi tiết kết quả:\n\n${JSON.stringify(result.input_params, null, 2)}`);
                        }}
                        className="text-sm text-primary hover:underline"
                      >
                        Xem chi tiết
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
        <Link href="/admin/documents">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="text-2xl">➕</div>
              <div>
                <div className="font-semibold">Thêm văn bản</div>
                <div className="text-sm text-muted">Tạo văn bản mới</div>
              </div>
            </div>
          </Card>
        </Link>

        <Link href="/admin/prompts">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="text-2xl">💬</div>
              <div>
                <div className="font-semibold">Thêm prompt</div>
                <div className="text-sm text-muted">Tạo prompt mới</div>
              </div>
            </div>
          </Card>
        </Link>

        <Link href="/admin/apps">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="text-2xl">🎯</div>
              <div>
                <div className="font-semibold">Thêm app</div>
                <div className="text-sm text-muted">Tạo mini app mới</div>
              </div>
            </div>
          </Card>
        </Link>

        <Link href="/">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="text-2xl">🏠</div>
              <div>
                <div className="font-semibold">Về trang chủ</div>
                <div className="text-sm text-muted">Xem giao diện người dùng</div>
              </div>
            </div>
          </Card>
        </Link>
      </div>
    </div>
  );
}
