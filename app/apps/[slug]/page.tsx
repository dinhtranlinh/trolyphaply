'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface Field {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'number' | 'date' | 'radio';
  required?: boolean;
  maxLength?: number;
  minLength?: number;
  min?: number;
  max?: number;
  options?: any[];
  placeholder?: string;
  description?: string;
}

interface InputSchema {
  fields: Field[];
}

interface App {
  id: string;
  slug: string;
  name: string;
  description: string;
  input_schema: InputSchema;
  status: string;
}

export default function AppRunnerPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [app, setApp] = useState<App | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<Record<string, any>>({});

  useEffect(() => {
    loadApp();
  }, [slug]);

  const loadApp = async () => {
    try {
      const response = await fetch(`/api/apps/${slug}`);
      if (!response.ok) {
        if (response.status === 404) {
          setError('App không tồn tại');
        } else if (response.status === 403) {
          setError('App này hiện không khả dụng');
        } else {
          setError('Không thể tải app');
        }
        setLoading(false);
        return;
      }

      const data = await response.json();
      
      if (!data.success) {
        setError(data.error || 'Không thể tải app');
        setLoading(false);
        return;
      }

      const appData = data.app;

      // Parse input_schema if it's a string
      if (typeof appData.input_schema === 'string') {
        try {
          appData.input_schema = JSON.parse(appData.input_schema);
        } catch (e) {
          console.error('Failed to parse input_schema:', e);
          appData.input_schema = { fields: [] };
        }
      }

      // Handle both array format and object format
      let fields = [];
      if (Array.isArray(appData.input_schema)) {
        fields = appData.input_schema;
      } else if (appData.input_schema?.fields && Array.isArray(appData.input_schema.fields)) {
        fields = appData.input_schema.fields;
      } else {
        console.error('Invalid input_schema structure:', appData.input_schema);
      }

      // Normalize to standard format
      appData.input_schema = { fields };

      setApp(appData);
      
      // Initialize form data with empty values
      const initialData: Record<string, any> = {};
      fields.forEach((field: Field) => {
        initialData[field.name] = '';
      });
      setFormData(initialData);
      setLoading(false);
    } catch (err) {
      console.error('Load app error:', err);
      setError('Có lỗi xảy ra');
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const response = await fetch(`/api/run/${slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Có lỗi xảy ra khi xử lý');
      }

      const result = await response.json();
      
      // Redirect to result page if resultId exists
      if (result.resultId) {
        router.push(`/r/${result.resultId}`);
      }
    } catch (err: any) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  const handleFieldChange = (fieldName: string, value: any) => {
    setFormData({ ...formData, [fieldName]: value });
  };

  const renderField = (field: Field) => {
    const value = formData[field.name] || '';

    // Mobile-optimized input styling
    const commonProps = {
      id: field.name,
      name: field.name,
      required: field.required,
      placeholder: field.placeholder,
      value,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        handleFieldChange(field.name, e.target.value);
      },
      className: 'w-full px-4 py-3.5 text-base border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all',
      style: { fontSize: '16px' }, // Prevent iOS zoom
    };

    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            {...commonProps}
            rows={4}
            maxLength={field.maxLength}
            minLength={field.minLength}
          />
        );

      case 'select':
        return (
          <select {...commonProps}>
            <option value="">-- Chọn --</option>
            {field.options?.map((option, idx) => {
              // Handle both string and object format
              const optionValue = typeof option === 'object' ? option.value : option;
              const optionLabel = typeof option === 'object' ? option.label : option;
              return (
                <option key={`${field.name}-${optionValue}-${idx}`} value={optionValue}>
                  {optionLabel}
                </option>
              );
            })}
          </select>
        );

      case 'radio':
        return (
          <div className="space-y-3">
            {field.options?.map((option, idx) => {
              const optionValue = typeof option === 'object' ? option.value : option;
              const optionLabel = typeof option === 'object' ? option.label : option;
              return (
                <label
                  key={`${field.name}-${optionValue}-${idx}`}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  <input
                    type="radio"
                    name={field.name}
                    value={optionValue}
                    checked={value === optionValue}
                    onChange={(e) => handleFieldChange(field.name, e.target.value)}
                    required={field.required}
                    className="w-4 h-4 text-indigo-600 focus:ring-2 focus:ring-indigo-500"
                  />
                  <span className="text-base">{optionLabel}</span>
                </label>
              );
            })}
          </div>
        );

      case 'date':
        return (
          <input
            {...commonProps}
            type="date"
          />
        );

      case 'number':
        return (
          <input
            {...commonProps}
            type="number"
            inputMode="numeric"
            pattern="[0-9]*"
            min={field.min}
            max={field.max}
          />
        );

      case 'text':
      default:
        return (
          <input
            {...commonProps}
            type="text"
            maxLength={field.maxLength}
            minLength={field.minLength}
          />
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-indigo-50 to-white">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-600 mb-4"></div>
          <p className="text-gray-600 font-medium">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (error && !app) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Oops!</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/apps')}
            className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Quay về danh sách
          </button>
        </div>
      </div>
    );
  }

  if (!app) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-gray-50">
      {/* Sticky Header - Mobile Optimized */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Go back"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-lg font-bold text-gray-900 line-clamp-1">{app.name}</h1>
            </div>
          </div>
          <div className="text-2xl">✨</div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 sm:py-8">
        {/* App Description */}
        {app.description && (
          <div className="mb-6 text-center">
            <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
              {app.description}
            </p>
          </div>
        )}

        {/* Form Card - Mobile First */}
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {app.input_schema.fields.map((field) => (
              <div key={field.name} className="space-y-2">
                <label
                  htmlFor={field.name}
                  className="block text-base font-semibold text-gray-900"
                >
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                {renderField(field)}
                {field.description && (
                  <p className="text-sm text-gray-500">{field.description}</p>
                )}
              </div>
            ))}

            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3">
                <span className="text-xl">⚠️</span>
                <p className="text-sm text-red-800 flex-1">{error}</p>
              </div>
            )}

            {/* Submit Button - Large Touch Target */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-lg font-bold rounded-xl hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-95 shadow-lg"
              style={{ minHeight: '56px' }}
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Đang tạo kết quả...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <span>🪄</span>
                  Tạo ngay miễn phí
                </span>
              )}
            </button>
          </form>
        </div>

        {/* Social Proof - Mobile Friendly */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
            <span>👥</span>
            <span className="font-medium">Đã có hàng nghìn người sử dụng</span>
          </p>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-400">
            Powered by <span className="font-semibold text-indigo-600">Trợ Lý Pháp Lý</span>
          </p>
        </div>
      </div>
    </div>
  );
}
