'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';

interface LegalStyle {
  id: string;
  name: string;
  description: string;
}

export default function CreateQAPromptPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [styles, setStyles] = useState<LegalStyle[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    prompt_text: '',
    is_active: false,
    writing_style_ids: [] as string[]
  });

  useEffect(() => {
    fetchStyles();
  }, []);

  const fetchStyles = async () => {
    try {
      const response = await fetch('/api/admin/legal-writing-styles');
      const data = await response.json();
      if (data.success) {
        setStyles(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching styles:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/admin/qa-prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        router.push('/admin/qa-prompts');
      } else {
        alert('Lỗi: ' + data.error);
      }
    } catch (err: any) {
      alert('Lỗi: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStyleToggle = (styleId: string) => {
    setFormData(prev => ({
      ...prev,
      writing_style_ids: prev.writing_style_ids.includes(styleId)
        ? prev.writing_style_ids.filter(id => id !== styleId)
        : [...prev.writing_style_ids, styleId]
    }));
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <Link
          href="/admin/qa-prompts"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-5 w-5" />
          Quay lại
        </Link>
        <h1 className="mt-4 text-3xl font-bold text-gray-900">Tạo Q&A Prompt Mới</h1>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl space-y-6">
        <div className="rounded-lg bg-white p-6 shadow">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Tên Prompt <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                placeholder="VD: Prompt mặc định cho Q&A"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Mô tả
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                placeholder="Mô tả ngắn gọn về prompt này"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nội dung Prompt <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                value={formData.prompt_text}
                onChange={(e) => setFormData({ ...formData, prompt_text: e.target.value })}
                rows={12}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm focus:border-blue-500 focus:outline-none"
                placeholder="Nhập system prompt cho AI..."
              />
              <p className="mt-1 text-sm text-gray-500">
                Đây là system prompt sẽ được gửi cho AI để xác định cách trả lời câu hỏi
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Văn phong trả lời
              </label>
              <div className="space-y-2">
                {styles.map((style) => (
                  <label key={style.id} className="flex items-start gap-3 p-3 rounded border border-gray-200 hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.writing_style_ids.includes(style.id)}
                      onChange={() => handleStyleToggle(style.id)}
                      className="mt-1"
                    />
                    <div>
                      <div className="font-medium text-gray-900">{style.name}</div>
                      <div className="text-sm text-gray-600">{style.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 pt-4">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                Kích hoạt ngay (sẽ hủy kích hoạt prompt hiện tại)
              </label>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            <Save className="h-5 w-5" />
            {loading ? 'Đang lưu...' : 'Lưu Prompt'}
          </button>
          <Link
            href="/admin/qa-prompts"
            className="rounded-lg border border-gray-300 px-6 py-2 text-gray-700 hover:bg-gray-50"
          >
            Hủy
          </Link>
        </div>
      </form>
    </div>
  );
}
