'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AppShell from '@/components/layout/AppShell';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import TextInput from '@/components/forms/TextInput';
import TextArea from '@/components/forms/TextArea';
import Select from '@/components/forms/Select';
import RadioGroup from '@/components/forms/RadioGroup';
import CheckboxGroup from '@/components/forms/CheckboxGroup';
import Toast from '@/components/ui/Toast';

interface FieldSchema {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'radio' | 'checkbox';
  placeholder?: string;
  options?: string[];
  required?: boolean;
  defaultValue?: any;
}

interface App {
  slug: string;
  name: string;
  description: string;
  category: string;
  icon?: string;
  input_schema: {
    fields: FieldSchema[];
  };
  published: boolean;
}

interface ExecutionResult {
  id: string | null;
  text: string;
  imageUrl: string | null;
}

/**
 * Single Mini-App Page
 * Dynamic form + AI generation + result display
 */
export default function MiniAppPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [app, setApp] = useState<App | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [executing, setExecuting] = useState(false);
  const [result, setResult] = useState<ExecutionResult | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  useEffect(() => {
    if (slug) {
      fetchApp();
    }
  }, [slug]);

  const fetchApp = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/apps/${slug}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || 'Không thể tải ứng dụng');
        return;
      }

      setApp(data.app);

      // Initialize form data with default values
      const initialData: Record<string, any> = {};
      if (data.app.input_schema?.fields) {
        data.app.input_schema.fields.forEach((field: FieldSchema) => {
          initialData[field.id] = field.defaultValue || '';
        });
      }
      setFormData(initialData);
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Không thể tải ứng dụng. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
  };

  const handleGenerate = async () => {
    if (!app) return;

    // Validate required fields
    const schema = app.input_schema;
    if (schema?.fields) {
      for (const field of schema.fields) {
        if (field.required && !formData[field.id]) {
          showToastMessage(`Vui lòng nhập ${field.label}`, 'error');
          return;
        }
      }
    }

    setExecuting(true);
    setError('');

    try {
      const response = await fetch(`/api/run/${slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inputs: formData }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || 'Không thể tạo kết quả');
        showToastMessage(data.error || 'Có lỗi xảy ra', 'error');
        return;
      }

      setResult(data.result);
      showToastMessage('Tạo thành công!', 'success');
    } catch (err) {
      console.error('Execute error:', err);
      setError('Không thể tạo kết quả. Vui lòng thử lại.');
      showToastMessage('Không thể tạo kết quả', 'error');
    } finally {
      setExecuting(false);
    }
  };

  const handleCopy = async () => {
    if (!result?.text) return;

    try {
      await navigator.clipboard.writeText(result.text);
      showToastMessage('Đã copy!', 'success');
    } catch (err) {
      console.error('Copy error:', err);
      showToastMessage('Không thể copy', 'error');
    }
  };

  const handleShare = () => {
    if (!result?.text) return;

    // Open Facebook share dialog
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?quote=${encodeURIComponent(
      result.text
    )}`;
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  const handleRegenerate = () => {
    setResult(null);
    handleGenerate();
  };

  const showToastMessage = (message: string, type: 'success' | 'error') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const renderField = (field: FieldSchema) => {
    const value = formData[field.id] || '';

    switch (field.type) {
      case 'text':
        return (
          <TextInput
            key={field.id}
            label={field.label}
            value={value}
            onChange={(val) => handleFieldChange(field.id, val)}
            placeholder={field.placeholder}
            required={field.required}
          />
        );

      case 'textarea':
        return (
          <TextArea
            key={field.id}
            label={field.label}
            value={value}
            onChange={(val) => handleFieldChange(field.id, val)}
            placeholder={field.placeholder}
            required={field.required}
            rows={4}
          />
        );

      case 'select':
        return (
          <Select
            key={field.id}
            label={field.label}
            value={value}
            onChange={(val) => handleFieldChange(field.id, val)}
            options={
              field.options?.map((opt) => ({ value: opt, label: opt })) || []
            }
            required={field.required}
          />
        );

      case 'radio':
        return (
          <RadioGroup
            key={field.id}
            name={field.id}
            label={field.label}
            options={
              field.options?.map((opt) => ({ value: opt, label: opt })) || []
            }
            value={value}
            onChange={(val) => handleFieldChange(field.id, val)}
            required={field.required}
          />
        );

      case 'checkbox':
        return (
          <CheckboxGroup
            key={field.id}
            label={field.label}
            options={
              field.options?.map((opt) => ({ value: opt, label: opt })) || []
            }
            values={value || []}
            onChange={(val) => handleFieldChange(field.id, val)}
          />
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <AppShell showHeader={true} headerTitle="Ứng dụng AI" showBackButton={true}>
        <div className="flex items-center justify-center h-64">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-primary border-r-transparent" />
        </div>
      </AppShell>
    );
  }

  if (error || !app) {
    return (
      <AppShell showHeader={true} headerTitle="Ứng dụng AI" showBackButton={true}>
        <div className="px-4 py-8 text-center">
          <p className="text-error mb-4">{error || 'Không tìm thấy ứng dụng'}</p>
          <Button variant="secondary" onClick={() => router.back()}>
            Quay lại
          </Button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      showHeader={true}
      headerTitle={app.name}
      showBackButton={true}
      showBottomNav={true}
    >
      <div className="space-y-4 p-4 pb-6">
        {/* App Header */}
        <div className="text-center">
          <div
            className="w-16 h-16 rounded-2xl mx-auto mb-3 flex items-center justify-center text-3xl"
            style={{ background: 'var(--color-primary-soft)' }}
          >
            {app.icon || '✨'}
          </div>
          <h1 className="page-title mb-2">{app.name}</h1>
          <p className="text-sm text-muted">{app.description}</p>
        </div>

        {/* Dynamic Form */}
        {app.input_schema?.fields && app.input_schema.fields.length > 0 && (
          <Card>
            <h3 className="font-semibold text-sm mb-4">Thông tin</h3>
            <div className="space-y-4">
              {app.input_schema.fields.map((field) => renderField(field))}
            </div>
          </Card>
        )}

        {/* Generate Button */}
        {!result && (
          <Button
            variant="accent"
            fullWidth
            size="lg"
            onClick={handleGenerate}
            loading={executing}
            disabled={executing}
          >
            {executing ? 'Đang tạo...' : 'Tạo ngay ✨'}
          </Button>
        )}

        {/* Result Display */}
        {result && (
          <>
            <Card>
              <div className="flex items-center gap-2 mb-3">
                <svg
                  className="w-5 h-5 text-accent"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <h3 className="font-semibold text-sm">Kết quả</h3>
              </div>
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {result.text}
              </div>
              {result.imageUrl && (
                <img
                  src={result.imageUrl}
                  alt="Result"
                  className="mt-4 rounded-lg w-full"
                />
              )}
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button variant="primary" fullWidth onClick={handleCopy}>
                📋 Copy
              </Button>
              <Button variant="secondary" fullWidth onClick={handleShare}>
                📤 Chia sẻ FB
              </Button>
            </div>

            <Button variant="accent" fullWidth onClick={handleRegenerate}>
              🔄 Tạo lại
            </Button>
          </>
        )}
      </div>

      {/* Toast */}
      {showToast && (
        <Toast
          type={toastType}
          message={toastMessage}
          onClose={() => setShowToast(false)}
        />
      )}
    </AppShell>
  );
}
