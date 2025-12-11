'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Edit, Trash2, Power, History, CheckCircle, Circle } from 'lucide-react';

interface QAPrompt {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
  version: number;
  created_at: string;
  updated_at: string;
  writing_styles?: Array<{
    priority: number;
    style: {
      id: string;
      name: string;
    };
  }>;
}

export default function QAPromptsPage() {
  const router = useRouter();
  const [prompts, setPrompts] = useState<QAPrompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPrompts();
  }, []);

  const fetchPrompts = async () => {
    try {
      const response = await fetch('/api/admin/qa-prompts');
      const data = await response.json();
      
      if (data.success) {
        setPrompts(data.data || []);
      } else {
        setError(data.error || 'Không thể tải danh sách prompts');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async (id: string) => {
    if (!confirm('Bạn có chắc muốn kích hoạt prompt này? Prompt hiện tại sẽ bị hủy kích hoạt.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/qa-prompts/${id}/activate`, {
        method: 'POST'
      });
      const data = await response.json();
      
      if (data.success) {
        fetchPrompts();
      } else {
        alert('Lỗi: ' + data.error);
      }
    } catch (err: any) {
      alert('Lỗi: ' + err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa prompt này?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/qa-prompts/${id}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      
      if (data.success) {
        fetchPrompts();
      } else {
        alert('Lỗi: ' + data.error);
      }
    } catch (err: any) {
      alert('Lỗi: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">Đang tải...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý Q&A Prompts</h1>
          <p className="mt-2 text-gray-600">
            Cấu hình system prompts cho tính năng Hỏi/Đáp pháp lý
          </p>
        </div>
        <Link
          href="/admin/qa-prompts/create"
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          <Plus className="h-5 w-5" />
          Tạo Prompt Mới
        </Link>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-600">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-lg bg-white shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Trạng thái
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Tên Prompt
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Văn phong
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Phiên bản
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Cập nhật
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {prompts.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  Chưa có prompt nào. Hãy tạo prompt đầu tiên!
                </td>
              </tr>
            ) : (
              prompts.map((prompt) => (
                <tr key={prompt.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4">
                    {prompt.is_active ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                        <CheckCircle className="h-3 w-3" />
                        Đang dùng
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                        <Circle className="h-3 w-3" />
                        Không dùng
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{prompt.name}</div>
                    <div className="text-sm text-gray-500">{prompt.description}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {prompt.writing_styles && prompt.writing_styles.length > 0 ? (
                        prompt.writing_styles
                          .sort((a, b) => a.priority - b.priority)
                          .map((ws) => (
                            <span
                              key={ws.style.id}
                              className="inline-block rounded bg-blue-100 px-2 py-1 text-xs text-blue-800"
                            >
                              {ws.style.name}
                            </span>
                          ))
                      ) : (
                        <span className="text-sm text-gray-400">Chưa có</span>
                      )}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    v{prompt.version}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {new Date(prompt.updated_at).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      {!prompt.is_active && (
                        <button
                          onClick={() => handleActivate(prompt.id)}
                          className="text-green-600 hover:text-green-900"
                          title="Kích hoạt"
                        >
                          <Power className="h-5 w-5" />
                        </button>
                      )}
                      <Link
                        href={`/admin/qa-prompts/${prompt.id}/edit`}
                        className="text-blue-600 hover:text-blue-900"
                        title="Chỉnh sửa"
                      >
                        <Edit className="h-5 w-5" />
                      </Link>
                      <button
                        onClick={() => router.push(`/admin/qa-prompts/${prompt.id}/edit#history`)}
                        className="text-purple-600 hover:text-purple-900"
                        title="Lịch sử"
                      >
                        <History className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(prompt.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Xóa"
                        disabled={prompt.is_active}
                      >
                        <Trash2 className={`h-5 w-5 ${prompt.is_active ? 'opacity-30' : ''}`} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
