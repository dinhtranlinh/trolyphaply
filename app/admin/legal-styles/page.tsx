'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Edit, Trash2, Plus } from 'lucide-react';

interface LegalStyle {
  id: string;
  name: string;
  description: string;
  tone: string;
  is_active: boolean;
  created_at: string;
}

export default function LegalStylesPage() {
  const [styles, setStyles] = useState<LegalStyle[]>([]);
  const [loading, setLoading] = useState(true);

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
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa văn phong này?')) return;

    try {
      const response = await fetch(`/api/admin/legal-writing-styles/${id}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      
      if (data.success) {
        fetchStyles();
      } else {
        alert('Lỗi: ' + data.error);
      }
    } catch (err: any) {
      alert('Lỗi: ' + err.message);
    }
  };

  if (loading) {
    return <div className="p-8">Đang tải...</div>;
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Văn Phong Luật</h1>
          <p className="mt-2 text-gray-600">
            Quản lý các phong cách viết pháp lý cho câu trả lời
          </p>
        </div>
        <Link
          href="/admin/legal-styles/create"
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          <Plus className="h-5 w-5" />
          Thêm Văn Phong
        </Link>
      </div>

      <div className="grid gap-6">
        {styles.map((style) => (
          <div key={style.id} className="rounded-lg bg-white p-6 shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">{style.name}</h3>
                <p className="mt-1 text-gray-600">{style.description}</p>
                <div className="mt-3 flex items-center gap-4 text-sm">
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-blue-800">
                    {style.tone}
                  </span>
                  {style.is_active && (
                    <span className="text-green-600">Đang kích hoạt</span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/admin/legal-styles/${style.id}/edit`}
                  className="text-blue-600 hover:text-blue-900"
                >
                  <Edit className="h-5 w-5" />
                </Link>
                <button
                  onClick={() => handleDelete(style.id)}
                  className="text-red-600 hover:text-red-900"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
