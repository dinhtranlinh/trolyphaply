'use client';

import React, { useEffect, useState } from 'react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import SearchBar from '@/components/ui/SearchBar';
import TextInput from '@/components/forms/TextInput';
import TextArea from '@/components/forms/TextArea';
import Select from '@/components/forms/Select';

interface Prompt {
  id: string;
  title: string;
  body: string;
  category: string;
  tags: string[];
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Admin Prompts Management Page
 */
export default function AdminPromptsPage() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    category: 'writing',
    tags: '',
    isPublic: true,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadPrompts();
  }, [search, categoryFilter]);

  const loadPrompts = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (categoryFilter !== 'all') params.append('category', categoryFilter);

      const response = await fetch(`/api/prompts?${params}`);
      const data = await response.json();
      setPrompts(data.prompts || []);
    } catch (error) {
      console.error('Error loading prompts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingPrompt(null);
    setFormData({
      title: '',
      body: '',
      category: 'writing',
      tags: '',
      isPublic: true,
    });
    setShowModal(true);
  };

  const handleEdit = (prompt: Prompt) => {
    setEditingPrompt(prompt);
    setFormData({
      title: prompt.title,
      body: prompt.body,
      category: prompt.category,
      tags: prompt.tags.join(', '),
      isPublic: prompt.is_public,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        title: formData.title,
        body: formData.body,
        category: formData.category,
        tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean),
        isPublic: formData.isPublic,
      };

      const url = editingPrompt ? `/api/prompts/${editingPrompt.id}` : '/api/prompts';
      const method = editingPrompt ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setShowModal(false);
        loadPrompts();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to save prompt');
      }
    } catch (error) {
      console.error('Error saving prompt:', error);
      alert('Failed to save prompt');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa prompt này?')) return;

    try {
      const response = await fetch(`/api/prompts/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        loadPrompts();
      } else {
        alert('Failed to delete prompt');
      }
    } catch (error) {
      console.error('Error deleting prompt:', error);
    }
  };

  const togglePublic = async (prompt: Prompt) => {
    try {
      const response = await fetch(`/api/prompts/${prompt.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...prompt,
          isPublic: !prompt.is_public,
        }),
      });

      if (response.ok) {
        loadPrompts();
      }
    } catch (error) {
      console.error('Error toggling public status:', error);
    }
  };

  const categories = [
    { value: 'all', label: 'Tất cả' },
    { value: 'writing', label: 'Viết lách' },
    { value: 'analysis', label: 'Phân tích' },
    { value: 'coding', label: 'Lập trình' },
    { value: 'creative', label: 'Sáng tạo' },
    { value: 'education', label: 'Giáo dục' },
    { value: 'business', label: 'Kinh doanh' },
    { value: 'other', label: 'Khác' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title mb-1">Quản lý Prompts</h1>
          <p className="text-muted">{prompts.length} prompts</p>
        </div>
        <Button variant="primary" onClick={handleCreate}>
          ➕ Thêm prompt
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Tìm theo tên prompt..."
          />
          <Select
            label="Danh mục"
            value={categoryFilter}
            onChange={setCategoryFilter}
            options={categories}
          />
        </div>
      </Card>

      {/* Table */}
      <Card>
        {prompts.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-3">💬</div>
            <p className="text-muted">Chưa có prompt nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '2px solid var(--color-border-subtle)' }}>
                  <th className="text-left py-3 px-4 text-sm font-semibold">Tên prompt</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold">Danh mục</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold">Public</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold">Tags</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {prompts.map((prompt, index) => (
                  <tr
                    key={prompt.id}
                    style={{
                      borderBottom:
                        index < prompts.length - 1 ? '1px solid var(--color-border-subtle)' : 'none',
                    }}
                  >
                    <td className="py-3 px-4">
                      <div className="font-medium">{prompt.title}</div>
                      <div className="text-sm text-muted line-clamp-1">{prompt.body.slice(0, 80)}...</div>
                    </td>
                    <td className="py-3 px-4 text-sm">{prompt.category}</td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => togglePublic(prompt)}
                        className="px-3 py-1 rounded text-xs transition-colors"
                        style={{
                          background: prompt.is_public
                            ? 'var(--color-success-light)'
                            : 'var(--color-muted)',
                          color: prompt.is_public ? 'var(--color-success)' : 'var(--color-text-muted)',
                        }}
                      >
                        {prompt.is_public ? '✓ Public' : '✗ Private'}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {prompt.tags.slice(0, 3).map((tag, i) => (
                        <span
                          key={i}
                          className="inline-block px-2 py-1 rounded text-xs mr-1 mb-1"
                          style={{ background: 'var(--color-primary-soft)', color: 'var(--color-primary)' }}
                        >
                          {tag}
                        </span>
                      ))}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleEdit(prompt)}
                        className="text-primary hover:underline text-sm mr-3"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(prompt.id)}
                        className="text-error hover:underline text-sm"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={() => setShowModal(false)}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="section-title mb-6">
              {editingPrompt ? 'Sửa prompt' : 'Thêm prompt mới'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <TextInput
                label="Tiêu đề *"
                value={formData.title}
                onChange={(val) => setFormData({ ...formData, title: val })}
                maxLength={200}
                helperText={`${formData.title.length}/200 ký tự`}
                required
              />

              <TextArea
                label="Nội dung prompt *"
                value={formData.body}
                onChange={(val) => setFormData({ ...formData, body: val })}
                rows={10}
                maxLength={5000}
                helperText={`${formData.body.length}/5000 ký tự`}
                required
              />

              <Select
                label="Danh mục *"
                value={formData.category}
                onChange={(val) => setFormData({ ...formData, category: val })}
                options={categories.filter((c) => c.value !== 'all')}
              />

              <TextInput
                label="Tags (phân cách bằng dấu phẩy)"
                value={formData.tags}
                onChange={(val) => setFormData({ ...formData, tags: val })}
                placeholder="viết email, formal, business"
              />

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={formData.isPublic}
                  onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                  className="w-5 h-5 rounded"
                />
                <label htmlFor="isPublic" className="text-sm font-medium cursor-pointer">
                  Công khai prompt (hiển thị cho tất cả người dùng)
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="secondary"
                  type="button"
                  onClick={() => setShowModal(false)}
                  fullWidth
                >
                  Hủy
                </Button>
                <Button variant="primary" type="submit" loading={submitting} fullWidth>
                  {editingPrompt ? 'Cập nhật' : 'Tạo mới'}
                </Button>
              </div>
            </form>
          </Card>
          </div>
        </div>
      )}
    </div>
  );
}
