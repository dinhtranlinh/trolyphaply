'use client';

import React, { useState, useRef, useEffect } from 'react';
import Button from '@/components/ui/Button';
import { resizeImage } from '@/lib/imageUtils';

interface CreateAIPromptFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
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

// LocalStorage helpers
const getCreatorHistory = (): string[] => {
  if (typeof window === 'undefined') return [];
  const history = localStorage.getItem('creator_code_history');
  return history ? JSON.parse(history) : [];
};

const saveCreatorCode = (code: string) => {
  if (typeof window === 'undefined' || !code) return;
  
  const history = getCreatorHistory();
  if (!history.includes(code)) {
    history.unshift(code);
    // Keep only last 10
    if (history.length > 10) history.pop();
    localStorage.setItem('creator_code_history', JSON.stringify(history));
  }
  
  // Save as current creator code
  localStorage.setItem('current_creator_code', code);
};

const getCurrentCreatorCode = (): string => {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('current_creator_code') || '';
};

export default function CreateAIPromptForm({ onSuccess, onCancel }: CreateAIPromptFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    promptTemplate: '',
    creatorCode: '',
    category: 'Portrait',
    tags: '',
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Creator code validation
  const [creatorCodeStatus, setCreatorCodeStatus] = useState<{
    checking: boolean;
    available: boolean;
    message: string;
    suggestions: string[];
  }>({
    checking: false,
    available: true, // Default true since it's optional
    message: '',
    suggestions: [],
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load saved creator code on mount
  useEffect(() => {
    const savedCode = getCurrentCreatorCode();
    if (savedCode) {
      setFormData(prev => ({ ...prev, creatorCode: savedCode }));
    }
  }, []);

  // Get filtered suggestions from history
  const getFilteredSuggestions = (): string[] => {
    const history = getCreatorHistory();
    const input = formData.creatorCode.toLowerCase();
    
    if (!input) return history.slice(0, 5);
    
    return history.filter(code => 
      code.toLowerCase().includes(input)
    ).slice(0, 5);
  };

  // Check creator code availability (only if code is provided)
  const checkCreatorCode = async (code: string) => {
    // If empty, it's valid (anonymous)
    if (!code) {
      setCreatorCodeStatus({
        checking: false,
        available: true,
        message: 'Bỏ trống = Người dùng ẩn danh',
        suggestions: [],
      });
      return;
    }

    if (code.length < 3) {
      setCreatorCodeStatus({
        checking: false,
        available: false,
        message: 'Mã phải từ 3-30 ký tự',
        suggestions: [],
      });
      return;
    }

    setCreatorCodeStatus(prev => ({ ...prev, checking: true }));

    try {
      const response = await fetch(`/api/ai-prompts/check-creator-code?code=${encodeURIComponent(code)}`);
      const data = await response.json();

      // Allow using existing code (not strictly unique anymore)
      setCreatorCodeStatus({
        checking: false,
        available: true, // Always available
        message: data.available ? 'Mã khả dụng' : 'Mã đã tồn tại - Bạn có thể dùng lại nếu là của bạn',
        suggestions: data.suggestions || [],
      });
    } catch (err) {
      console.error('Check creator code error:', err);
      setCreatorCodeStatus({
        checking: false,
        available: true, // Don't block on error
        message: 'Không kiểm tra được mã (vẫn có thể tiếp tục)',
        suggestions: [],
      });
    }
  };

  const handleCreatorCodeChange = (value: string) => {
    setFormData(prev => ({ ...prev, creatorCode: value }));

    // Debounce check
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      checkCreatorCode(value);
    }, 500);
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Vui lòng chọn file ảnh (JPG, PNG, WebP)');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Kích thước ảnh không được vượt quá 5MB');
      return;
    }

    try {
      // Resize image before preview
      const resizedFile = await resizeImage(file, 1200);
      setImageFile(resizedFile);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(resizedFile);
      
      setError('');
    } catch (err) {
      console.error('Image resize error:', err);
      setError('Lỗi xử lý ảnh');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation - creatorCode is now optional
    if (!formData.title || !formData.promptTemplate) {
      setError('Vui lòng điền tiêu đề và prompt template');
      return;
    }

    setSubmitting(true);

    try {
      let imageUrl = '';

      // Upload image if exists
      if (imageFile) {
        setUploading(true);
        const uploadFormData = new FormData();
        uploadFormData.append('file', imageFile);

        const uploadResponse = await fetch('/api/ai-prompts/upload-image', {
          method: 'POST',
          body: uploadFormData,
        });

        const uploadData = await uploadResponse.json();
        
        if (!uploadResponse.ok) {
          throw new Error(uploadData.message || 'Failed to upload image');
        }

        imageUrl = uploadData.imageUrl;
        setUploading(false);
      }

      // Create prompt
      const response = await fetch('/api/ai-prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          prompt_template: formData.promptTemplate,
          example_image_url: imageUrl || null,
          creator_code: formData.creatorCode || null, // NULL for anonymous
          category: formData.category,
          tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create prompt');
      }

      // Save creator code to localStorage for next time
      if (formData.creatorCode) {
        saveCreatorCode(formData.creatorCode);
      }

      onSuccess?.();
    } catch (err: any) {
      console.error('Submit error:', err);
      setError(err.message || 'Đã xảy ra lỗi khi tạo prompt');
    } finally {
      setSubmitting(false);
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Title */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Tiêu đề prompt <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="VD: Chân dung nghệ thuật Fantasy"
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          required
        />
      </div>

      {/* Creator Code - Optional */}
      <div className="relative">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Mã của bạn (nickname) <span className="text-gray-400 font-normal text-xs">(Không bắt buộc)</span>
        </label>
        <input
          type="text"
          value={formData.creatorCode}
          onChange={(e) => handleCreatorCodeChange(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder="Nhập mã của bạn hoặc để trống (ẩn danh)"
          className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 ${
            creatorCodeStatus.checking
              ? 'border-gray-300'
              : creatorCodeStatus.available && formData.creatorCode
              ? 'border-green-500 focus:border-green-500 focus:ring-green-100'
              : formData.creatorCode && !creatorCodeStatus.available
              ? 'border-yellow-500 focus:border-yellow-500 focus:ring-yellow-100'
              : 'border-gray-300 focus:border-blue-500 focus:ring-blue-100'
          }`}
        />
        
        {/* Suggestions dropdown from history */}
        {showSuggestions && getFilteredSuggestions().length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
            <p className="px-3 py-2 text-xs text-gray-500 border-b">Mã đã dùng gần đây:</p>
            {getFilteredSuggestions().map((suggestion, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  handleCreatorCodeChange(suggestion);
                  setShowSuggestions(false);
                }}
                className="w-full px-4 py-2.5 text-left text-sm hover:bg-blue-50 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                <span className="font-medium text-gray-700">@{suggestion}</span>
              </button>
            ))}
          </div>
        )}
        
        {creatorCodeStatus.checking && (
          <p className="mt-1.5 text-sm text-gray-500">Đang kiểm tra...</p>
        )}
        {!creatorCodeStatus.checking && creatorCodeStatus.message && (
          <p className={`mt-1.5 text-sm ${
            creatorCodeStatus.available 
              ? formData.creatorCode ? 'text-green-600' : 'text-gray-500'
              : 'text-yellow-600'
          }`}>
            {creatorCodeStatus.message}
          </p>
        )}
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Danh mục <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          required
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Image Upload */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Ảnh ví dụ (tùy chọn)
        </label>
        <div className="space-y-3">
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
            className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors text-sm text-gray-600"
          >
            {imagePreview ? '✓ Đã chọn ảnh - Click để đổi' : '📷 Chọn ảnh (JPG, PNG, WebP - Max 5MB)'}
          </button>
          
          {imagePreview && (
            <div className="relative w-full aspect-video rounded-lg overflow-hidden">
              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => {
                  setImageFile(null);
                  setImagePreview('');
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Mô tả ngắn
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Mô tả ngắn gọn về prompt này..."
          rows={3}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 resize-none"
        />
      </div>

      {/* Prompt Template */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Prompt mẫu <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData.promptTemplate}
          onChange={(e) => setFormData({ ...formData, promptTemplate: e.target.value })}
          placeholder="Nhập nội dung prompt đầy đủ..."
          rows={6}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 resize-none font-mono text-sm"
          required
        />
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Tags (cách nhau bởi dấu phẩy)
        </label>
        <input
          type="text"
          value={formData.tags}
          onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
          placeholder="VD: fantasy, portrait, elf, magical"
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="secondary"
          fullWidth
          onClick={onCancel}
          disabled={submitting || uploading}
        >
          Hủy
        </Button>
        <Button
          type="submit"
          variant="primary"
          fullWidth
          disabled={submitting || uploading || !creatorCodeStatus.available}
        >
          {uploading ? 'Đang upload ảnh...' : submitting ? 'Đang tạo...' : 'Tạo prompt'}
        </Button>
      </div>
    </form>
  );
}
