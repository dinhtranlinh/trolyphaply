'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { SearchBar } from '@/components/ui/SearchBar';
import { Chip } from '@/components/ui/Chip';
import { useRouter } from 'next/navigation';

interface StyleGuide {
  id: string;
  name: string;
  description: string;
  characteristics: string[];
  tone: string[];
  language: string;
  is_default: boolean;
  examples: any[];
  created_at: string;
}

export default function StyleGuidesPage() {
  const router = useRouter();
  const [styleGuides, setStyleGuides] = useState<StyleGuide[]>([]);
  const [filteredGuides, setFilteredGuides] = useState<StyleGuide[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchStyleGuides();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = styleGuides.filter(sg =>
        sg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sg.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredGuides(filtered);
    } else {
      setFilteredGuides(styleGuides);
    }
  }, [searchQuery, styleGuides]);

  const fetchStyleGuides = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/style-guides');
      const data = await res.json();
      
      if (data.success) {
        setStyleGuides(data.data);
        setFilteredGuides(data.data);
      }
    } catch (error) {
      console.error('Error fetching style guides:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/style-guides/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isDefault: true }),
      });

      if (res.ok) {
        fetchStyleGuides();
      }
    } catch (error) {
      console.error('Error setting default:', error);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Xóa văn phong "${name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/style-guides/${id}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      
      if (data.success) {
        fetchStyleGuides();
      } else {
        alert(data.error || 'Không thể xóa');
      }
    } catch (error) {
      console.error('Error deleting:', error);
      alert('Có lỗi xảy ra');
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
            <p className="mt-4 text-text-secondary">Đang tải...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-text-primary mb-2">
              Quản lý Văn Phong
            </h1>
            <p className="text-text-secondary">
              Quản lý các văn phong trả lời cho Q&A system
            </p>
          </div>
          <Button
            variant="accent"
            onClick={() => router.push('/admin/style-guides/create')}
          >
            ➕ Tạo văn phong mới
          </Button>
        </div>

        {/* Search */}
        <div className="max-w-md">
          <SearchBar
            placeholder="Tìm văn phong..."
            value={searchQuery}
            onChange={setSearchQuery}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="p-4">
          <div className="text-text-secondary text-sm mb-1">Tổng số</div>
          <div className="text-2xl font-bold text-primary">{styleGuides.length}</div>
        </Card>
        <Card className="p-4">
          <div className="text-text-secondary text-sm mb-1">Mặc định</div>
          <div className="text-2xl font-bold text-success">
            {styleGuides.filter(sg => sg.is_default).length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-text-secondary text-sm mb-1">Tổng ví dụ</div>
          <div className="text-2xl font-bold text-accent">
            {styleGuides.reduce((sum, sg) => sum + (sg.examples?.length || 0), 0)}
          </div>
        </Card>
      </div>

      {/* List */}
      {filteredGuides.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="text-4xl mb-4">📝</div>
          <p className="text-text-secondary mb-4">
            {searchQuery ? 'Không tìm thấy văn phong nào' : 'Chưa có văn phong nào'}
          </p>
          {!searchQuery && (
            <Button
              variant="primary"
              onClick={() => router.push('/admin/style-guides/create')}
            >
              Tạo văn phong đầu tiên
            </Button>
          )}
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredGuides.map((sg) => (
            <Card key={sg.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-text-primary">
                      {sg.name}
                    </h3>
                    {sg.is_default && (
                      <Chip variant="success" size="sm">
                        ⭐ Mặc định
                      </Chip>
                    )}
                  </div>
                  <p className="text-text-secondary text-sm mb-3">
                    {sg.description}
                  </p>
                  
                  {/* Meta */}
                  <div className="flex items-center gap-4 text-sm text-text-secondary">
                    <span>📋 {sg.characteristics?.length || 0} đặc điểm</span>
                    <span>🎭 {sg.tone?.length || 0} giọng điệu</span>
                    <span>💬 {sg.examples?.length || 0} ví dụ</span>
                    <span>🌍 {sg.language}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 ml-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push(`/admin/style-guides/${sg.id}`)}
                  >
                    👁️ Xem
                  </Button>
                  {!sg.is_default && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSetDefault(sg.id)}
                    >
                      ⭐ Đặt mặc định
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(sg.id, sg.name)}
                    className="text-error hover:bg-error/10"
                  >
                    🗑️ Xóa
                  </Button>
                </div>
              </div>

              {/* Characteristics preview */}
              {sg.characteristics && sg.characteristics.length > 0 && (
                <div className="border-t border-border pt-4">
                  <div className="text-xs text-text-secondary mb-2">
                    Đặc điểm nổi bật:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {sg.characteristics.slice(0, 3).map((char, idx) => (
                      <Chip key={idx} variant="neutral" size="sm">
                        {char}
                      </Chip>
                    ))}
                    {sg.characteristics.length > 3 && (
                      <Chip variant="neutral" size="sm">
                        +{sg.characteristics.length - 3} khác
                      </Chip>
                    )}
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
