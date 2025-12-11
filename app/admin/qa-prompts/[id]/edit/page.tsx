'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

interface LegalStyle {
  id: string;
  name: string;
  description: string;
  tone: string;
}

interface QAPrompt {
  id: string;
  name: string;
  system_prompt: string;
  formatting_instructions: string | null;
  is_active: boolean;
  version: number;
  created_at: string;
  updated_at: string;
}

export default function EditQAPromptPage() {
  const router = useRouter();
  const params = useParams();
  const promptId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const [prompt, setPrompt] = useState<QAPrompt | null>(null);
  const [name, setName] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [formattingInstructions, setFormattingInstructions] = useState('');
  const [isActive, setIsActive] = useState(false);
  
  const [allStyles, setAllStyles] = useState<LegalStyle[]>([]);
  const [selectedStyleIds, setSelectedStyleIds] = useState<string[]>([]);

  useEffect(() => {
    loadPrompt();
    loadStyles();
  }, [promptId]);

  const loadPrompt = async () => {
    try {
      const response = await fetch(`/api/admin/qa-prompts/${promptId}`);
      if (!response.ok) {
        throw new Error('Không thể tải prompt');
      }
      const data = await response.json();
      
      setPrompt(data);
      setName(data.name);
      setSystemPrompt(data.system_prompt);
      setFormattingInstructions(data.formatting_instructions || '');
      setIsActive(data.is_active);
      
      // Load selected styles
      if (data.writing_styles) {
        setSelectedStyleIds(data.writing_styles.map((s: any) => s.id));
      }
      
      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const loadStyles = async () => {
    try {
      const response = await fetch('/api/admin/legal-writing-styles');
      if (!response.ok) throw new Error('Không thể tải văn phong');
      const data = await response.json();
      setAllStyles(Array.isArray(data) ? data : (data.data || []));
    } catch (err) {
      console.error('Error loading styles:', err);
      setAllStyles([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const response = await fetch(`/api/admin/qa-prompts/${promptId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          system_prompt: systemPrompt,
          formatting_instructions: formattingInstructions || null,
          is_active: isActive,
          writing_style_ids: selectedStyleIds,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Không thể cập nhật prompt');
      }

      router.push('/admin/qa-prompts');
    } catch (err: any) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  const toggleStyle = (styleId: string) => {
    setSelectedStyleIds(prev => 
      prev.includes(styleId)
        ? prev.filter(id => id !== styleId)
        : [...prev, styleId]
    );
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center">Đang tải...</div>
      </div>
    );
  }

  if (error && !prompt) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
          {error}
        </div>
        <Link href="/admin/qa-prompts" className="text-blue-600 hover:underline mt-4 inline-block">
          ← Quay lại danh sách
        </Link>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Chỉnh sửa Prompt Hỏi/Đáp</h1>
          <Link href="/admin/qa-prompts" className="text-blue-600 hover:underline">
            ← Quay lại
          </Link>
        </div>

        {prompt && (
          <div className="bg-gray-50 border border-gray-200 px-4 py-3 rounded mb-6 text-sm">
            <div className="flex justify-between">
              <span>Version: <strong>{prompt.version}</strong></span>
              <span>Tạo: {new Date(prompt.created_at).toLocaleDateString('vi-VN')}</span>
              <span>Cập nhật: {new Date(prompt.updated_at).toLocaleDateString('vi-VN')}</span>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên Prompt <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="VD: Prompt Hỏi Đáp Pháp Lý v2.0"
              />
            </div>

            {/* System Prompt */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                System Prompt <span className="text-red-500">*</span>
              </label>
              <textarea
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                required
                rows={15}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                placeholder="Bạn là một trợ lý pháp lý AI..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Prompt chính cho AI. Hướng dẫn cách AI trả lời câu hỏi pháp lý.
              </p>
            </div>

            {/* Formatting Instructions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hướng dẫn định dạng
              </label>
              <textarea
                value={formattingInstructions}
                onChange={(e) => setFormattingInstructions(e.target.value)}
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                placeholder="Định dạng câu trả lời:&#10;- Ngắn gọn, súc tích&#10;- Chia thành các đoạn..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Hướng dẫn cách trình bày câu trả lời (markdown, cấu trúc, độ dài...)
              </p>
            </div>

            {/* Writing Styles */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Văn phong áp dụng
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Array.isArray(allStyles) && allStyles.map((style) => (
                  <label
                    key={style.id}
                    className={`flex items-start p-3 border rounded-md cursor-pointer transition ${
                      selectedStyleIds.includes(style.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedStyleIds.includes(style.id)}
                      onChange={() => toggleStyle(style.id)}
                      className="mt-1 mr-3"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900">{style.name}</div>
                      <div className="text-sm text-gray-600 truncate">{style.description}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        <span className="px-2 py-0.5 bg-gray-100 rounded">{style.tone}</span>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Chọn các văn phong sẽ được áp dụng khi sử dụng prompt này
              </p>
            </div>

            {/* Is Active */}
            <div>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Kích hoạt prompt này (tự động hủy kích hoạt các prompt khác)
                </span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between">
            <Link
              href="/admin/qa-prompts"
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Hủy
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
