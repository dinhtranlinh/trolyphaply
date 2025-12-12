'use client';

import React, { useState, useEffect } from 'react';
import EditPromptModal from '@/components/admin/EditPromptModal';
import DeleteConfirmDialog from '@/components/admin/DeleteConfirmDialog';
import Button from '@/components/ui/Button';

interface AIPrompt {
  id: string;
  title: string;
  description: string | null;
  prompt_template: string;
  example_image_url: string | null;
  creator_code: string | null;
  tags: string[];
  category: string;
  likes_count: number;
  views_count: number;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

const CATEGORIES = [
  'Portrait', 'Landscape', 'Product', 'Abstract', 
  'Video', 'Interior', 'Food', 'Business', 'Other'
];

export default function AdminAIPromptsPage() {
  const [prompts, setPrompts] = useState<AIPrompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showPublicOnly, setShowPublicOnly] = useState(false);
  
  const [editingPrompt, setEditingPrompt] = useState<AIPrompt | null>(null);
  const [deletingPrompt, setDeletingPrompt] = useState<AIPrompt | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchPrompts();
  }, [selectedCategory, showPublicOnly]);

  const fetchPrompts = async () => {
    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      params.append('limit', '1000'); // Get all for admin

      const response = await fetch(`/api/ai-prompts?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch prompts');

      const data = await response.json();
      let filtered = data.prompts || [];
      
      if (showPublicOnly) {
        filtered = filtered.filter((p: AIPrompt) => p.is_public);
      }

      setPrompts(filtered);
    } catch (err: any) {
      console.error('Fetch error:', err);
      setError(err.message || 'Không thể tải danh sách prompts');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingPrompt) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/ai-prompts/${deletingPrompt.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete prompt');

      setDeletingPrompt(null);
      fetchPrompts();
    } catch (err: any) {
      console.error('Delete error:', err);
      alert('Lỗi khi xóa prompt: ' + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredPrompts = prompts.filter(prompt => {
    const matchSearch = !searchQuery || 
      prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prompt.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prompt.creator_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prompt.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchSearch;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý AI Prompts</h1>
          <p className="text-sm text-gray-500 mt-1">
            Tổng số: <span className="font-semibold text-gray-900">{filteredPrompts.length}</span> prompts
          </p>
        </div>
        <Button variant="primary" onClick={fetchPrompts}>
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Làm mới
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
        <div className="flex gap-4 flex-wrap">
          {/* Search */}
          <div className="flex-1 min-w-[300px]">
            <input
              type="text"
              placeholder="Tìm theo tiêu đề, mô tả, creator code, tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          >
            <option value="all">Tất cả danh mục</option>
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          {/* Public Filter */}
          <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="checkbox"
              checked={showPublicOnly}
              onChange={(e) => setShowPublicOnly(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <span className="text-sm font-medium text-gray-700">Chỉ prompts công khai</span>
          </label>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-solid border-blue-500 border-r-transparent" />
            <p className="text-sm text-gray-500 mt-3">Đang tải...</p>
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

        {!loading && !error && filteredPrompts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sm text-gray-500">Không tìm thấy prompt nào</p>
          </div>
        )}

        {!loading && !error && filteredPrompts.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Tiêu đề
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Creator
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Danh mục
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Views
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Likes
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Ngày tạo
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredPrompts.map((prompt) => (
                  <tr key={prompt.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="max-w-xs">
                        <p className="font-medium text-gray-900 truncate">{prompt.title}</p>
                        {prompt.description && (
                          <p className="text-xs text-gray-500 truncate mt-1">{prompt.description}</p>
                        )}
                        {prompt.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {prompt.tags.slice(0, 3).map((tag, idx) => (
                              <span key={idx} className="px-1.5 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                                #{tag}
                              </span>
                            ))}
                            {prompt.tags.length > 3 && (
                              <span className="text-xs text-gray-400">+{prompt.tags.length - 3}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-700">
                        {prompt.creator_code ? `@${prompt.creator_code}` : (
                          <span className="text-gray-400 italic">Ẩn danh</span>
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                        {prompt.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-gray-600">
                      {prompt.views_count}
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-gray-600">
                      {prompt.likes_count}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {prompt.is_public ? (
                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                          Công khai
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded">
                          Riêng tư
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                      {formatDate(prompt.created_at)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setEditingPrompt(prompt)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Sửa"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setDeletingPrompt(prompt)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Xóa"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <EditPromptModal
        prompt={editingPrompt}
        open={!!editingPrompt}
        onClose={() => setEditingPrompt(null)}
        onSuccess={() => {
          setEditingPrompt(null);
          fetchPrompts();
        }}
      />

      {/* Delete Confirmation */}
      <DeleteConfirmDialog
        open={!!deletingPrompt}
        promptTitle={deletingPrompt?.title || ''}
        onConfirm={handleDelete}
        onCancel={() => setDeletingPrompt(null)}
        deleting={isDeleting}
      />
    </div>
  );
}
