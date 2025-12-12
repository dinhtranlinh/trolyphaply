'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AppShell from '@/components/layout/AppShell';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import TagList from '@/components/content/TagList';
import Toast from '@/components/ui/Toast';

interface Prompt {
  id: string;
  title: string;
  body: string;
  category: string;
  tags: string[];
  is_public: boolean;
  created_at: string;
  updated_at?: string;
}

/**
 * Prompt Detail Page
 * View and interact with a single prompt
 */
export default function PromptDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    if (id) {
      fetchPrompt();
    }
  }, [id]);

  const fetchPrompt = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/prompts/${id}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || 'Không thể tải prompt');
        return;
      }

      setPrompt(data.prompt);
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Không thể tải prompt. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!prompt) return;

    try {
      await navigator.clipboard.writeText(prompt.body);
      setToastMessage('Đã copy prompt!');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (err) {
      console.error('Copy error:', err);
      alert('Không thể copy prompt');
    }
  };

  const handleEdit = () => {
    // TODO: Navigate to edit page or open modal
    alert('Chức năng sửa prompt đang phát triển');
  };

  const handleDuplicate = () => {
    // TODO: Duplicate prompt logic
    alert('Chức năng nhân bản prompt đang phát triển');
  };

  if (loading) {
    return (
      <AppShell showHeader={true} headerTitle="Chi tiết Prompt" showBackButton={true}>
        <div className="flex items-center justify-center h-64">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-primary border-r-transparent" />
        </div>
      </AppShell>
    );
  }

  if (error || !prompt) {
    return (
      <AppShell showHeader={true} headerTitle="Chi tiết Prompt" showBackButton={true}>
        <div className="px-4 py-8 text-center">
          <p className="text-error mb-4">{error || 'Không tìm thấy prompt'}</p>
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
      headerTitle="Chi tiết Prompt"
      showBackButton={true}
      showBottomNav={true}
    >
      <div className="space-y-4 p-4 pb-6">
        {/* Title */}
        <div>
          <h1 className="page-title mb-2">{prompt.title}</h1>
          <div className="flex items-center gap-3 text-sm">
            <span
              className="px-2 py-1 rounded text-xs font-medium"
              style={{
                background: 'var(--color-primary-light)',
                color: 'var(--color-primary)',
              }}
            >
              {prompt.category}
            </span>
            {prompt.is_public && (
              <span className="text-muted flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Công khai
              </span>
            )}
          </div>
        </div>

        {/* Tags */}
        {prompt.tags && prompt.tags.length > 0 && (
          <TagList tags={prompt.tags} maxDisplay={10} />
        )}

        {/* Prompt Body */}
        <Card>
          <h3 className="font-semibold text-sm mb-3">Nội dung Prompt</h3>
          <pre
            className="text-sm leading-relaxed whitespace-pre-wrap font-mono p-3 rounded"
            style={{
              background: 'var(--color-bg)',
              border: '1px solid var(--color-border-subtle)',
              maxHeight: '400px',
              overflowY: 'auto',
            }}
          >
            {prompt.body}
          </pre>
        </Card>

        {/* Metadata */}
        <Card variant="outlined">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted">Ngày tạo:</span>
              <span className="font-medium">
                {new Date(prompt.created_at).toLocaleDateString('vi-VN')}
              </span>
            </div>
            {prompt.updated_at && (
              <div className="flex justify-between">
                <span className="text-muted">Cập nhật:</span>
                <span className="font-medium">
                  {new Date(prompt.updated_at).toLocaleDateString('vi-VN')}
                </span>
              </div>
            )}
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            variant="primary"
            fullWidth
            onClick={handleCopy}
            leftIcon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            }
          >
            Copy Prompt
          </Button>
          <Button
            variant="secondary"
            onClick={handleEdit}
            leftIcon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            }
          >
            Sửa
          </Button>
          <Button
            variant="secondary"
            onClick={handleDuplicate}
            leftIcon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            }
          >
            Nhân bản
          </Button>
        </div>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <Toast
          type="success"
          message={toastMessage}
          onClose={() => setShowToast(false)}
        />
      )}
    </AppShell>
  );
}
