'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

interface LegalStyle {
  id: string;
  name: string;
  description: string;
  example_content: string;
  tone: string;
  characteristics: string[];
  created_at: string;
  updated_at: string;
}

export default function EditLegalStylePage() {
  const router = useRouter();
  const params = useParams();
  const styleId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const [style, setStyle] = useState<LegalStyle | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [exampleContent, setExampleContent] = useState('');
  const [tone, setTone] = useState('');
  const [characteristics, setCharacteristics] = useState<string[]>([]);
  const [newCharacteristic, setNewCharacteristic] = useState('');

  useEffect(() => {
    loadStyle();
  }, [styleId]);

  const loadStyle = async () => {
    try {
      const response = await fetch(`/api/admin/legal-writing-styles/${styleId}`);
      if (!response.ok) {
        throw new Error('Không thể tải văn phong');
      }
      const data = await response.json();
      const styleData = data.data || data;
      
      setStyle(styleData);
      setName(styleData.name);
      setDescription(styleData.description || '');
      setExampleContent(styleData.example_content || '');
      setTone(styleData.tone || '');
      setCharacteristics(styleData.characteristics || []);
      
      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const response = await fetch(`/api/admin/legal-writing-styles/${styleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          example_content: exampleContent,
          tone,
          characteristics,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Không thể cập nhật văn phong');
      }

      router.push('/admin/legal-styles');
    } catch (err: any) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  const addCharacteristic = () => {
    if (newCharacteristic.trim()) {
      setCharacteristics([...characteristics, newCharacteristic.trim()]);
      setNewCharacteristic('');
    }
  };

  const removeCharacteristic = (index: number) => {
    setCharacteristics(characteristics.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center">Đang tải...</div>
      </div>
    );
  }

  if (error && !style) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
          {error}
        </div>
        <Link href="/admin/legal-styles" className="text-blue-600 hover:underline mt-4 inline-block">
          ← Quay lại danh sách
        </Link>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Chỉnh sửa Văn Phong Luật</h1>
          <Link href="/admin/legal-styles" className="text-blue-600 hover:underline">
            ← Quay lại
          </Link>
        </div>

        {style && (
          <div className="bg-gray-50 border border-gray-200 px-4 py-3 rounded mb-6 text-sm">
            <div className="flex justify-between">
              <span>Tạo: {new Date(style.created_at).toLocaleDateString('vi-VN')}</span>
              <span>Cập nhật: {new Date(style.updated_at).toLocaleDateString('vi-VN')}</span>
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
                Tên Văn Phong <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="VD: Phản biện xây dựng"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mô tả
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Mô tả ngắn gọn về văn phong này..."
              />
            </div>

            {/* Tone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Giọng văn
              </label>
              <input
                type="text"
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="VD: Phản biện, xây dựng"
              />
            </div>

            {/* Example Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ví dụ mẫu
              </label>
              <textarea
                value={exampleContent}
                onChange={(e) => setExampleContent(e.target.value)}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                placeholder="Ví dụ văn bản thực tế sử dụng văn phong này..."
              />
            </div>

            {/* Characteristics */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Đặc điểm
              </label>
              <div className="space-y-2">
                {characteristics.map((char, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm">
                      {char}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeCharacteristic(index)}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md"
                    >
                      Xóa
                    </button>
                  </div>
                ))}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newCharacteristic}
                    onChange={(e) => setNewCharacteristic(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCharacteristic())}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Thêm đặc điểm mới..."
                  />
                  <button
                    type="button"
                    onClick={addCharacteristic}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Thêm
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Nhấn Enter hoặc click "Thêm" để thêm đặc điểm
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between">
            <Link
              href="/admin/legal-styles"
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
