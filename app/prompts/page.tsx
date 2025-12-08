'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppShell from '@/components/layout/AppShell';
import SearchBar from '@/components/ui/SearchBar';
import Chip from '@/components/ui/Chip';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import PromptCard from '@/components/content/PromptCard';

interface Prompt {
  id: string;
  title: string;
  body: string;
  category: string;
  tags: string[];
  is_public: boolean;
  created_at: string;
}

type ViewMode = 'list' | 'grid';

/**
 * Prompt Hub Page
 * Browse and manage AI prompts
 */
export default function PromptHubPage() {
  const router = useRouter();
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  const categories = [
    'Tất cả',
    'Pháp luật',
    'Hợp đồng',
    'Đơn từ',
    'Tư vấn',
    'Phân tích',
    'Khác',
  ];

  useEffect(() => {
    fetchPrompts();
  }, [searchQuery, selectedCategory]);

  const fetchPrompts = async () => {
    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (selectedCategory && selectedCategory !== 'Tất cả') {
        params.append('category', selectedCategory);
      }

      const response = await fetch(`/api/prompts?${params.toString()}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || 'Không thể tải prompts');
        return;
      }

      setPrompts(data.prompts || []);
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Không thể tải prompts. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category === selectedCategory ? '' : category);
  };

  const handlePromptClick = (id: string) => {
    router.push(`/prompts/${id}`);
  };

  const handleNewPrompt = () => {
    // TODO: Navigate to create prompt page or open modal
    alert('Chức năng tạo prompt mới đang phát triển');
  };

  return (
    <AppShell
      showHeader={true}
      headerTitle="Câu hỏi mẫu"
      showBackButton={true}
      showBottomNav={true}
      headerRightAction={
        <Button
          variant="accent"
          size="sm"
          onClick={handleNewPrompt}
          leftIcon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          }
        >
          Tạo mới
        </Button>
      }
    >
      <div className="space-y-4">
        {/* Search & Filters */}
        <div className="sticky top-14 z-30 p-4 space-y-3" style={{ background: 'var(--color-bg)' }}>
          <SearchBar
            placeholder="Tìm prompt..."
            value={searchQuery}
            onChange={setSearchQuery}
            onSearch={handleSearch}
          />

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
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

          {/* View Toggle */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted">
              {prompts.length} prompt{prompts.length !== 1 ? 's' : ''}
            </p>
            <div className="flex gap-1">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${
                  viewMode === 'list' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'
                }`}
                aria-label="List view"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${
                  viewMode === 'grid' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'
                }`}
                aria-label="Grid view"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"
                  />
                </svg>
              </button>
            </div>
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
              <p className="text-sm text-error">{error}</p>
              <Button variant="secondary" size="sm" onClick={fetchPrompts} className="mt-3">
                Thử lại
              </Button>
            </div>
          )}

          {!loading && !error && prompts.length === 0 && (
            <EmptyState
              title="Chưa có prompt nào"
              description="Tạo prompt đầu tiên của bạn"
              action={{
                label: 'Tạo prompt mới',
                onClick: handleNewPrompt,
              }}
            />
          )}

          {!loading && !error && prompts.length > 0 && (
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 gap-3'
                  : 'space-y-3'
              }
            >
              {prompts.map((prompt) => (
                <PromptCard
                  key={prompt.id}
                  title={prompt.title}
                  body={prompt.body}
                  category={prompt.category}
                  tags={prompt.tags}
                  isPublic={prompt.is_public}
                  onClick={() => handlePromptClick(prompt.id)}
                  onCopy={() => {
                    navigator.clipboard.writeText(prompt.body);
                    alert('Đã copy prompt!');
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
