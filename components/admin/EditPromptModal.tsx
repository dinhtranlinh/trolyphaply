'use client';

import React, { useState, useEffect, useRef } from 'react';
import Button from '@/components/ui/Button';
import { resizeImage } from '@/lib/imageUtils';

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

interface EditPromptModalProps {
  prompt: AIPrompt | null;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CATEGORIES = [
  'Portrait',
  'Landscape',
  'Product',
  'Abstract',
  'Video',
  'Interior',
  'Food',
  'Business',
  'Other',
];

export default function EditPromptModal({ prompt, open, onClose, onSuccess }: EditPromptModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    prompt_template: '',
    creator_code: '',
    category: 'Portrait',
    tags: '',
    is_public: true,
  });
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [newImagePreview, setNewImagePreview] = useState<string>('');
  const [removeCurrentImage, setRemoveCurrentImage] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (prompt) {
      setFormData({
        title: prompt.title,
        description: prompt.description || '',
        prompt_template: prompt.prompt_template,
        creator_code: prompt.creator_code || '',
        category: prompt.category,
        tags: prompt.tags.join(', '),
        is_public: prompt.is_public,
      });
      setCurrentImageUrl(prompt.example_image_url);
      setNewImageFile(null);
      setNewImagePreview('');
      setRemoveCurrentImage(false);
    }
  }, [prompt]);

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Vui lòng chọn file ảnh (JPG, PNG, WebP)');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError('Kích thước ảnh không được vượt quá 5MB');
      return;
    }

    try {
      // Resize image before upload
      const resizedFile = await resizeImage(file, 1200);
      setNewImageFile(resizedFile);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewImagePreview(reader.result as string);
      };
      reader.readAsDataURL(resizedFile);

      setError('');
    } catch (err) {
      console.error('Image resize error:', err);
      setError('Lỗi xử lý ảnh');
    }
  };

  const handleRemoveNewImage = () => {
    setNewImageFile(null);
    setNewImagePreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveCurrentImage = () => {
    setRemoveCurrentImage(true);
    setCurrentImageUrl(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt) return;

    setError('');
    setSaving(true);

    try {
      let finalImageUrl = currentImageUrl;

      // Upload new image if selected
      if (newImageFile) {
        setUploading(true);
        const uploadFormData = new FormData();
        uploadFormData.append('file', newImageFile);

        const uploadResponse = await fetch('/api/ai-prompts/upload-image', {
          method: 'POST',
          body: uploadFormData,
        });

        const uploadData = await uploadResponse.json();
        
        if (!uploadResponse.ok) {
          throw new Error(uploadData.message || 'Failed to upload image');
        }

        finalImageUrl = uploadData.imageUrl;
        setUploading(false);
      }

      // If user chose to remove current image and didn't upload new one
      if (removeCurrentImage && !newImageFile) {
        finalImageUrl = null;
      }

      const response = await fetch(`/api/ai-prompts/${prompt.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          prompt_template: formData.prompt_template,
          creator_code: formData.creator_code || null,
          category: formData.category,
          tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
          is_public: formData.is_public,
          example_image_url: finalImageUrl,
        }),
      });

      if (!response.ok) {
        let errorMessage = 'Failed to update prompt';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
          console.error('API Error:', errorData);
        } catch (e) {
          console.error('Failed to parse error response');
        }
        throw new Error(errorMessage);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Update error:', err);
      setError(err.message || 'Đã xảy ra lỗi khi cập nhật prompt');
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  if (!open || !prompt) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Sửa Prompt</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Tiêu đề <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              required
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Ảnh ví dụ
            </label>
            
            {/* Current Image or New Preview */}
            {(currentImageUrl || newImagePreview) && (
              <div className="mb-3 relative w-full aspect-video bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={newImagePreview || currentImageUrl || ''}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={newImagePreview ? handleRemoveNewImage : handleRemoveCurrentImage}
                  className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  title="Xóa ảnh"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                {newImagePreview && (
                  <div className="absolute top-2 left-2 px-2 py-1 bg-blue-600 text-white text-xs font-medium rounded">
                    Ảnh mới
                  </div>
                )}
              </div>
            )}

            {/* Upload Button */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleImageSelect}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-sm text-gray-600 hover:text-blue-600"
            >
              <svg className="w-5 h-5 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {currentImageUrl || newImagePreview ? 'Thay đổi ảnh' : 'Tải ảnh lên'}
            </button>
            <p className="mt-1.5 text-xs text-gray-500">
              JPG, PNG, WebP. Tối đa 5MB. Ảnh sẽ tự động resize về 1200px.
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Mô tả
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Prompt Template */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Prompt Template <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.prompt_template}
              onChange={(e) => setFormData(prev => ({ ...prev, prompt_template: e.target.value }))}
              rows={6}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 font-mono text-sm"
              required
            />
          </div>

          {/* Creator Code */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Mã người tạo
            </label>
            <input
              type="text"
              value={formData.creator_code}
              onChange={(e) => setFormData(prev => ({ ...prev, creator_code: e.target.value }))}
              placeholder="Để trống = Ẩn danh"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Danh mục <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              required
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Tags (phân cách bằng dấu phẩy)
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
              placeholder="portrait, fantasy, magic"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Is Public */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is_public"
              checked={formData.is_public}
              onChange={(e) => setFormData(prev => ({ ...prev, is_public: e.target.checked }))}
              className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-100"
            />
            <label htmlFor="is_public" className="text-sm font-medium text-gray-700">
              Công khai (hiển thị trên trang chủ)
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={saving || uploading}
            >
              {uploading ? 'Đang upload ảnh...' : saving ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              fullWidth
              onClick={onClose}
              disabled={saving || uploading}
            >
              Hủy
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
