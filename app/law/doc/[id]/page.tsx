'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AppShell from '@/components/layout/AppShell';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Accordion from '@/components/ui/Accordion';
import TagList from '@/components/content/TagList';

interface Document {
  id: string;
  title: string;
  doc_number: string;
  category: string;
  type: string;
  authority: string;
  issue_date: string;
  effective_date?: string;
  summary: string;
  content: any; // Can be string or object with raw, chapters, source_urls
  tags: string[];
}

interface Chapter {
  title: string;
  content: string;
}

/**
 * Document Detail Page
 * Chi tiết văn bản pháp luật
 */
export default function DocumentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [document, setDocument] = useState<Document | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    if (id) {
      fetchDocument();
    }
  }, [id]);

  const fetchDocument = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/law/documents/${id}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || 'Không thể tải văn bản');
        return;
      }

      setDocument(data.document);
      
      // Parse content into chapters
      if (data.document.content) {
        const contentText = typeof data.document.content === 'object' 
          ? data.document.content.raw || '' 
          : data.document.content;
        parseChapters(contentText);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Không thể tải văn bản. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const parseChapters = (content: string) => {
    // Split content by chapter markers (e.g., "CHƯƠNG I", "Chương 1", etc.)
    const chapterRegex = /(CHƯƠNG|Chương)\s+([IVX\d]+)[:\-\s]+([^\n]+)/gi;
    const matches = [...content.matchAll(chapterRegex)];

    if (matches.length === 0) {
      // No chapters found, show content as single chapter
      setChapters([{ title: 'Nội dung', content }]);
      return;
    }

    const parsed: Chapter[] = [];
    for (let i = 0; i < matches.length; i++) {
      const match = matches[i];
      const title = `${match[1]} ${match[2]}: ${match[3]}`;
      const startIndex = match.index! + match[0].length;
      const endIndex = i < matches.length - 1 ? matches[i + 1].index! : content.length;
      const chapterContent = content.substring(startIndex, endIndex).trim();

      parsed.push({ title, content: chapterContent });
    }

    setChapters(parsed);
  };

  const handleAskAboutDocument = () => {
    // Redirect to home page with pre-filled question
    const question = `Hỏi về ${document?.doc_number || 'văn bản'}: ${document?.title || ''}`;
    router.push(`/?q=${encodeURIComponent(question)}`);
  };

  const handleBookmark = () => {
    // Toggle bookmark (would save to localStorage or backend)
    setBookmarked(!bookmarked);
    // TODO: Save to Supabase bookmarks table
  };

  if (loading) {
    return (
      <AppShell showHeader={true} headerTitle="Chi tiết văn bản" showBackButton={true}>
        <div className="flex items-center justify-center h-64">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-primary border-r-transparent" />
        </div>
      </AppShell>
    );
  }

  if (error || !document) {
    return (
      <AppShell showHeader={true} headerTitle="Chi tiết văn bản" showBackButton={true}>
        <div className="px-4 py-8 text-center">
          <p className="text-error mb-4">{error || 'Không tìm thấy văn bản'}</p>
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
      headerTitle="Chi tiết văn bản"
      showBackButton={true}
      showBottomNav={true}
    >
      <div className="space-y-4 pb-6">
        {/* Header Info */}
        <div className="px-4 pt-4">
          <h1 className="page-title mb-2">{document.title}</h1>
          <p className="text-sm text-muted mb-3">{document.doc_number}</p>
          
          {document.tags && document.tags.length > 0 && (
            <TagList tags={document.tags} maxVisible={5} />
          )}
        </div>

        {/* Meta Info Card */}
        <div className="px-4">
          <Card>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">Loại văn bản:</span>
                <span className="font-medium">{document.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Lĩnh vực:</span>
                <span className="font-medium">{document.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Cơ quan ban hành:</span>
                <span className="font-medium">{document.authority}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Ngày ban hành:</span>
                <span className="font-medium">
                  {new Date(document.issue_date).toLocaleDateString('vi-VN')}
                </span>
              </div>
              {document.effective_date && (
                <div className="flex justify-between">
                  <span className="text-muted">Ngày hiệu lực:</span>
                  <span className="font-medium">
                    {new Date(document.effective_date).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Summary */}
        {document.summary && (
          <div className="px-4">
            <Card variant="outlined">
              <h3 className="font-semibold text-sm mb-2">Tóm tắt</h3>
              <p className="text-sm leading-relaxed">{document.summary}</p>
            </Card>
          </div>
        )}

        {/* Chapters */}
        {chapters.length > 0 && (
          <div className="px-4">
            <h2 className="section-title mb-3">Nội dung chi tiết</h2>
            <div className="space-y-2">
              <Accordion
                items={chapters.map((chapter, index) => ({
                  id: `chapter-${index}`,
                  title: chapter.title,
                  content: (
                    <div className="text-sm leading-relaxed whitespace-pre-line">
                      {chapter.content}
                    </div>
                  ),
                }))}
              />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="px-4 flex gap-3">
          <Button
            variant="primary"
            fullWidth
            onClick={handleAskAboutDocument}
            leftIcon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            }
          >
            Hỏi về văn bản này
          </Button>
          <Button
            variant={bookmarked ? 'accent' : 'secondary'}
            onClick={handleBookmark}
            leftIcon={
              <svg
                className="w-5 h-5"
                fill={bookmarked ? 'currentColor' : 'none'}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                />
              </svg>
            }
          >
            {bookmarked ? 'Đã lưu' : 'Lưu'}
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
