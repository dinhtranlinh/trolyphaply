'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppShell from '@/components/layout/AppShell';
import SearchBar from '@/components/ui/SearchBar';
import Chip from '@/components/ui/Chip';
import Button from '@/components/ui/Button';
import BottomSheet from '@/components/ui/BottomSheet';
import EmptyState from '@/components/ui/EmptyState';
import AIPromptCard from '@/components/content/AIPromptCard';
import CreateAIPromptForm from '@/components/forms/CreateAIPromptForm';

interface AIPrompt {
  id: string;
  title: string;
  description: string;
  prompt_template: string;
  example_image_url: string | null;
  creator_code: string;
  tags: string[];
  category: string;
  likes_count: number;
  views_count: number;
  is_public: boolean;
  created_at: string;
}

type TabType = 'all' | 'mine' | 'popular';

const CATEGORIES = [
  { value: 'all', label: 'Tất cả', icon: '🎨' },
  { value: 'Portrait', label: 'Chân dung', icon: '👤' },
  { value: 'Landscape', label: 'Phong cảnh', icon: '🌄' },
  { value: 'Product', label: 'Sản phẩm', icon: '📦' },
  { value: 'Abstract', label: 'Trừu tượng', icon: '🎭' },
  { value: 'Video', label: 'Video', icon: '🎬' },
  { value: 'Interior', label: 'Nội thất', icon: '🏠' },
  { value: 'Food', label: 'Đồ ăn', icon: '🍔' },
  { value: 'Business', label: 'Kinh doanh', icon: '💼' },
  { value: 'Other', label: 'Khác', icon: '🌈' },
];

/**
 * AI Prompts Library Page
 * Thư viện prompts tạo ảnh AI cho Banana
 */
export default function AIPromptsPage() {
  const router = useRouter();
  const [prompts, setPrompts] = useState<AIPrompt[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [myCreatorCode, setMyCreatorCode] = useState<string>('');
  
  const [filterOpen, setFilterOpen] = useState(false);
  const [createFormOpen, setCreateFormOpen] = useState(false);
  const [copiedPromptId, setCopiedPromptId] = useState<string>('');

  useEffect(() => {
    // Load my creator code from localStorage
    const saved = localStorage.getItem('my_creator_code');
    if (saved) setMyCreatorCode(saved);
  }, []);

  useEffect(() => {
    fetchPrompts();
  }, [activeTab, searchQuery, selectedCategory, myCreatorCode]);

  const fetchPrompts = async () => {
    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams();
      
      if (searchQuery) params.append('search', searchQuery);
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      
      if (activeTab === 'mine' && myCreatorCode) {
        params.append('creatorCode', myCreatorCode);
      } else if (activeTab === 'popular') {
        params.append('sortBy', 'likes_count');
      }

      const response = await fetch(`/api/ai-prompts?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch prompts');
      }

      const data = await response.json();
      setPrompts(data.prompts || []);
    } catch (err: any) {
      console.error('Fetch error:', err);
      setError(err.message || 'Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handlePromptClick = (id: string) => {
    router.push(`/ai-prompts/${id}`);
  };

  const handleCopyPrompt = (prompt: string, id: string) => {
    setCopiedPromptId(id);
    setTimeout(() => setCopiedPromptId(''), 2000);
  };

  const handleCreateSuccess = () => {
    setCreateFormOpen(false);
    fetchPrompts();
  };

  return (
    <AppShell
      showHeader={true}
      headerTitle="AI Prompts"
      showBackButton={true}
      showBottomNav={true}
    >
      <div className="space-y-4 pb-24">
        {/* Filter Bar */}
        <div className="p-4 space-y-3 bg-white border-b border-gray-100">
          {/* Tabs */}
          <div className="flex gap-2">
            <Chip
              active={activeTab === 'all'}
              onClick={() => setActiveTab('all')}
            >
              Tất cả
            </Chip>
            <Chip
              active={activeTab === 'mine'}
              onClick={() => setActiveTab('mine')}
            >
              Của tôi
            </Chip>
            <Chip
              active={activeTab === 'popular'}
              onClick={() => setActiveTab('popular')}
            >
              Phổ biến
            </Chip>
          </div>

          {/* Search */}
          <SearchBar
            placeholder="Tìm theo từ khóa, tags..."
            value={searchQuery}
            onChange={setSearchQuery}
            onSearch={handleSearch}
          />

          {/* Filter Button */}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setFilterOpen(true)}
            leftIcon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
            }
          >
            Danh mục {selectedCategory !== 'all' && `(${CATEGORIES.find(c => c.value === selectedCategory)?.label})`}
          </Button>

          {/* Tab "Của tôi" - Input creator code */}
          {activeTab === 'mine' && (
            <div className="flex gap-2">
              <input
                type="text"
                value={myCreatorCode}
                onChange={(e) => {
                  setMyCreatorCode(e.target.value);
                  localStorage.setItem('my_creator_code', e.target.value);
                }}
                placeholder="Nhập mã của bạn..."
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="px-4 space-y-4">
          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-solid border-blue-500 border-r-transparent" />
              <p className="text-sm text-gray-500 mt-3">Đang tải prompts...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-12">
              <p className="text-sm text-red-600 mb-3">{error}</p>
              <Button variant="secondary" size="sm" onClick={fetchPrompts}>
                Thử lại
              </Button>
            </div>
          )}

          {!loading && !error && prompts.length === 0 && (
            <EmptyState
              title="Chưa có prompt nào"
              description={
                activeTab === 'mine' && !myCreatorCode
                  ? 'Nhập mã của bạn để xem các prompt đã tạo'
                  : 'Hãy tạo prompt đầu tiên của bạn!'
              }
              action={{
                label: 'Tạo prompt mới',
                onClick: () => setCreateFormOpen(true),
              }}
            />
          )}

          {!loading && !error && prompts.length > 0 && (
            <div className="grid grid-cols-1 gap-4">
              {prompts.map((prompt) => (
                <AIPromptCard
                  key={prompt.id}
                  id={prompt.id}
                  title={prompt.title}
                  description={prompt.description}
                  promptTemplate={prompt.prompt_template}
                  exampleImageUrl={prompt.example_image_url || undefined}
                  creatorCode={prompt.creator_code}
                  category={prompt.category}
                  tags={prompt.tags}
                  likesCount={prompt.likes_count}
                  viewsCount={prompt.views_count}
                  onClick={() => handlePromptClick(prompt.id)}
                  onCopy={(p) => handleCopyPrompt(p, prompt.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* FAB - Floating Action Button */}
        <button
          onClick={() => setCreateFormOpen(true)}
          className="fixed bottom-24 right-6 w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all z-40 flex items-center justify-center"
          aria-label="Tạo prompt mới"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {/* Filter Bottom Sheet */}
      <BottomSheet
        isOpen={filterOpen}
        onClose={() => setFilterOpen(false)}
        title="Chọn danh mục"
      >
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => {
                  setSelectedCategory(cat.value);
                  setFilterOpen(false);
                }}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  selectedCategory === cat.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-2xl mb-1">{cat.icon}</div>
                <div className="text-sm font-medium text-gray-900">{cat.label}</div>
              </button>
            ))}
          </div>
        </div>
      </BottomSheet>

      {/* Create Prompt Bottom Sheet */}
      <BottomSheet
        isOpen={createFormOpen}
        onClose={() => setCreateFormOpen(false)}
        title="Tạo Prompt Mới"
      >
        <CreateAIPromptForm
          onSuccess={handleCreateSuccess}
          onCancel={() => setCreateFormOpen(false)}
        />
      </BottomSheet>

      {/* Copy Success Toast */}
      {copiedPromptId && (
        <div className="fixed bottom-32 left-1/2 -translate-x-1/2 px-4 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg z-50 animate-fade-in">
          ✓ Đã copy prompt!
        </div>
      )}
    </AppShell>
  );
}
