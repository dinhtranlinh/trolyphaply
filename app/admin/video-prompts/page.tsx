'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { VideoPromptListItem, ApiResponse } from '@/types/video-prompt';

export default function VideoPromptsPage() {
  const [prompts, setPrompts] = useState<VideoPromptListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPrompts();
  }, []);

  const fetchPrompts = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/video-prompts');
      const data: ApiResponse<VideoPromptListItem[]> = await res.json();
      
      if (data.success && data.data) {
        setPrompts(data.data);
      } else {
        setError(data.error || 'Failed to load prompts');
      }
    } catch (err) {
      setError('Network error');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredPrompts = prompts.filter(p =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (name: string) => {
    if (!confirm(`Xóa video prompt "${name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/video-prompts/${name}`, {
        method: 'DELETE'
      });
      
      const data: ApiResponse<unknown> = await res.json();
      
      if (data.success) {
        setPrompts(prompts.filter(p => p.name !== name));
      } else {
        alert(data.error || 'Failed to delete');
      }
    } catch (err) {
      alert('Network error');
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-8 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Video Prompt Manager</h1>
              <p className="text-blue-100 mt-1">
                Quản lý AI video generation prompts
              </p>
            </div>
            <Link
              href="/admin/video-prompts/create"
              className="inline-flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors shadow-md"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Thêm Prompt Mới
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên hoặc title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-96 px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
          />
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
            <p className="mt-4 text-gray-600">Đang tải...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-300 text-red-800 px-6 py-4 rounded-lg">
            <p className="font-semibold">Lỗi:</p>
            <p>{error}</p>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && filteredPrompts.length === 0 && (
          <div className="text-center py-12">
            <svg className="w-24 h-24 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h3 className="mt-4 text-xl font-semibold text-gray-700">
              {searchTerm ? 'Không tìm thấy kết quả' : 'Chưa có video prompt nào'}
            </h3>
            <p className="mt-2 text-gray-500">
              {searchTerm ? 'Thử từ khóa khác' : 'Nhấn "Thêm Prompt Mới" để bắt đầu'}
            </p>
          </div>
        )}

        {/* Prompt Grid */}
        {!loading && !error && filteredPrompts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPrompts.map((prompt) => (
              <div
                key={prompt.name}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden border border-gray-200"
              >
                {/* Card Header */}
                <div className="bg-gradient-to-br from-white to-gray-50 border-b-2 border-gray-200 p-5">
                  <h3 className="text-lg font-semibold text-gray-800 line-clamp-2 min-h-[3.5rem]">
                    {prompt.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-2 font-mono">
                    {prompt.name}
                  </p>
                </div>

                {/* Card Body */}
                <div className="p-5">
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                      </svg>
                      <span className="font-semibold">{prompt.segments}</span> segments
                    </div>
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>{(prompt.size / 1024).toFixed(1)} KB</span>
                    </div>
                  </div>

                  <div className="text-xs text-gray-500 mb-4">
                    Cập nhật: {new Date(prompt.created).toLocaleDateString('vi-VN')}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link
                      href={`/admin/video-prompts/${prompt.name}`}
                      className="flex-1 text-center bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                      Xem & Sửa
                    </Link>
                    <button
                      onClick={() => handleDelete(prompt.name)}
                      className="px-4 py-2 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition-colors"
                      title="Xóa"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats */}
        {!loading && !error && prompts.length > 0 && (
          <div className="mt-8 text-center text-gray-600">
            Hiển thị {filteredPrompts.length} / {prompts.length} prompts
          </div>
        )}
      </div>
    </div>
  );
}
