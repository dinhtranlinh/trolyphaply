'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppShell from '@/components/layout/AppShell';
import Chip from '@/components/ui/Chip';
import EmptyState from '@/components/ui/EmptyState';
import MiniAppCard from '@/components/content/MiniAppCard';

interface MiniApp {
  slug: string;
  name: string;
  description: string;
  category: string;
  icon?: string;
  published: boolean;
}

/**
 * Fun AI Apps Catalog Page
 * Browse and launch mini-apps
 */
export default function AppsPage() {
  const router = useRouter();
  const [apps, setApps] = useState<MiniApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const categories = [
    'Tất cả',
    'Tử vi',
    'Lời chúc',
    'Thơ',
    'Caption',
    'Khác',
  ];

  useEffect(() => {
    fetchApps();
  }, [selectedCategory]);

  const fetchApps = async () => {
    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams();
      if (selectedCategory && selectedCategory !== 'Tất cả') {
        params.append('category', selectedCategory);
      }
      params.append('published', 'true');

      const response = await fetch(`/api/apps?${params.toString()}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || 'Không thể tải ứng dụng');
        return;
      }

      setApps(data.apps || []);
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Không thể tải ứng dụng. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category === selectedCategory ? '' : category);
  };

  const handleAppClick = (slug: string) => {
    router.push(`/apps/${slug}`);
  };

  return (
    <AppShell
      showHeader={true}
      headerTitle="Ứng dụng AI Vui"
      showBackButton={true}
      showBottomNav={true}
    >
      <div className="space-y-6">
        {/* Intro Block */}
        <div className="p-4 text-center">
          <h1 className="page-title mb-2">✨ Ứng dụng AI Vui</h1>
          <p className="text-muted">
            Tạo lời chúc, thơ, tử vi và nhiều hơn nữa với AI
          </p>
        </div>

        {/* Category Filters */}
        <div className="px-4">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((cat) => (
              <Chip
                key={cat}
                active={cat === 'Tất cả' ? !selectedCategory : selectedCategory === cat}
                onClick={() => handleCategoryClick(cat)}
              >
                {cat}
              </Chip>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="px-4 pb-6">
          {loading && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-primary border-r-transparent" />
              <p className="text-sm text-muted mt-2">Đang tải...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <p className="text-sm text-error mb-4">{error}</p>
              <button
                onClick={fetchApps}
                className="text-sm text-primary font-medium hover:underline"
              >
                Thử lại
              </button>
            </div>
          )}

          {!loading && !error && apps.length === 0 && (
            <EmptyState
              title="Chưa có ứng dụng nào"
              description="Các ứng dụng sẽ sớm được thêm vào"
            />
          )}

          {!loading && !error && apps.length > 0 && (
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {apps.map((app) => (
                <MiniAppCard
                  key={app.slug}
                  slug={app.slug}
                  title={app.name}
                  description={app.description}
                  icon={app.icon}
                  category={app.category}
                  tags={[]}
                  isPublished={app.published}
                  onClick={() => handleAppClick(app.slug)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
