'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { TextInput } from '@/components/ui/TextInput';
import { TextArea } from '@/components/ui/TextArea';
import { CheckboxGroup } from '@/components/ui/CheckboxGroup';

export default function CreateStyleGuidePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    characteristics: '',
    tone: '',
    language: 'Tiếng Việt',
    isDefault: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate
    if (!formData.name || !formData.description || !formData.characteristics || !formData.tone) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/admin/style-guides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          characteristics: formData.characteristics.split('\n').filter(c => c.trim()),
          tone: formData.tone.split(',').map(t => t.trim()).filter(t => t),
          language: formData.language,
          isDefault: formData.isDefault,
        }),
      });

      const data = await res.json();

      if (data.success) {
        alert('Tạo văn phong thành công!');
        router.push('/admin/style-guides');
      } else {
        alert(data.error || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Error creating style guide:', error);
      alert('Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4"
        >
          ← Quay lại
        </Button>
        <h1 className="text-2xl font-bold text-text-primary mb-2">
          Tạo Văn Phong Mới
        </h1>
        <p className="text-text-secondary">
          Tạo văn phong trả lời mới cho Q&A system
        </p>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Tên văn phong <span className="text-error">*</span>
            </label>
            <TextInput
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="VD: Văn phong trả lời pháp luật chuẩn"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Mô tả <span className="text-error">*</span>
            </label>
            <TextArea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Mô tả ngắn gọn về văn phong này..."
              rows={3}
              required
            />
          </div>

          {/* Characteristics */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Đặc điểm <span className="text-error">*</span>
            </label>
            <TextArea
              value={formData.characteristics}
              onChange={(e) => setFormData({ ...formData, characteristics: e.target.value })}
              placeholder="Nhập mỗi đặc điểm trên một dòng&#10;VD:&#10;Ngắn gọn, súc tích&#10;Sử dụng từ ngữ chính thức&#10;Cấu trúc rõ ràng"
              rows={8}
              required
            />
            <p className="text-xs text-text-secondary mt-1">
              Mỗi đặc điểm trên một dòng riêng
            </p>
          </div>

          {/* Tone */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Giọng điệu <span className="text-error">*</span>
            </label>
            <TextInput
              value={formData.tone}
              onChange={(e) => setFormData({ ...formData, tone: e.target.value })}
              placeholder="VD: Chính thức, khách quan, hỗ trợ (ngăn cách bởi dấu phẩy)"
              required
            />
            <p className="text-xs text-text-secondary mt-1">
              Các giọng điệu cách nhau bởi dấu phẩy
            </p>
          </div>

          {/* Language */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Ngôn ngữ
            </label>
            <TextInput
              value={formData.language}
              onChange={(e) => setFormData({ ...formData, language: e.target.value })}
              placeholder="Tiếng Việt"
            />
          </div>

          {/* Is Default */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isDefault"
              checked={formData.isDefault}
              onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
              className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
            />
            <label htmlFor="isDefault" className="text-sm text-text-primary cursor-pointer">
              Đặt làm văn phong mặc định
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4">
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
            >
              {loading ? 'Đang tạo...' : '✅ Tạo văn phong'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.back()}
              disabled={loading}
            >
              Hủy
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
