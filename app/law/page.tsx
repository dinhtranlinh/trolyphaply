'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import AppShell from '@/components/layout/AppShell';
import SearchBar from '@/components/ui/SearchBar';
import Chip from '@/components/ui/Chip';
import Button from '@/components/ui/Button';
import BottomSheet from '@/components/ui/BottomSheet';
import EmptyState from '@/components/ui/EmptyState';
import LegalDocCard from '@/components/content/LegalDocCard';
import ProcedureCard from '@/components/content/ProcedureCard';

interface Document {
  id: string;
  title: string;
  doc_number: string;
  category: string;
  type: string;
  authority: string;
  tags: string[];
  issue_date?: string;
  effective_date?: string;
  summary?: string;
}

interface Procedure {
  id: string;
  title: string;
  category: string;
  time_est?: string;
  authority?: string;
  tags: string[];
  notes?: string;
  steps?: any;
  documents?: any;
  fees?: string;
}

type TabType = 'all' | 'documents' | 'procedures';

/**
 * Legal Library Page Content
 * Inner component that uses useSearchParams
 */
function LegalLibraryContent() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);

  // Filter states
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const categories = [
    'Dân sự',
    'Hình sự',
    'Hành chính',
    'Lao động',
    'Đất đai',
    'Doanh nghiệp',
    'Thuế',
    'Hôn nhân và gia đình',
  ];

  // Load initial tab from URL
  useEffect(() => {
    const tab = searchParams.get('tab') as TabType;
    if (tab && ['all', 'documents', 'procedures'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Fetch data when tab or filters change
  useEffect(() => {
    fetchData();
  }, [activeTab, searchQuery, selectedCategories]);

  const fetchData = async () => {
    setLoading(true);
    setError('');

    try {
      if (activeTab === 'all' || activeTab === 'documents') {
        const docsResponse = await fetch(
          `/api/law/documents?search=${encodeURIComponent(searchQuery)}&categories=${selectedCategories.join(',')}`
        );
        if (docsResponse.ok) {
          const data = await docsResponse.json();
          setDocuments(data.documents || []);
        }
      }

      if (activeTab === 'all' || activeTab === 'procedures') {
        const procsResponse = await fetch(
          `/api/law/procedures?search=${encodeURIComponent(searchQuery)}&categories=${selectedCategories.join(',')}`
        );
        if (procsResponse.ok) {
          const data = await procsResponse.json();
          setProcedures(data.procedures || []);
        }
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Không thể tải dữ liệu. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
  };

  const showDocuments = activeTab === 'all' || activeTab === 'documents';
  const showProcedures = activeTab === 'all' || activeTab === 'procedures';

  return (
    <AppShell
      showHeader={true}
      headerTitle="Thư viện pháp luật"
      showBackButton={true}
      showBottomNav={true}
    >
      <div className="space-y-4">
        {/* Filter Bar */}
        <div className="sticky top-14 z-30 p-4 space-y-3" style={{ background: 'var(--color-bg)' }}>
          {/* Tabs */}
          <div className="flex gap-2">
            <Chip
              active={activeTab === 'all'}
              onClick={() => setActiveTab('all')}
            >
              Tất cả
            </Chip>
            <Chip
              active={activeTab === 'documents'}
              onClick={() => setActiveTab('documents')}
            >
              Văn bản
            </Chip>
            <Chip
              active={activeTab === 'procedures'}
              onClick={() => setActiveTab('procedures')}
            >
              Thủ tục
            </Chip>
          </div>

          {/* Search */}
          <SearchBar
            placeholder="Tìm theo từ khóa, số văn bản..."
            value={searchQuery}
            onChange={setSearchQuery}
            onSearch={handleSearch}
          />

          {/* Filter Button */}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setFilterOpen(true)}
            leftIcon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
            }
          >
            Bộ lọc {selectedCategories.length > 0 && `(${selectedCategories.length})`}
          </Button>
        </div>

        {/* Content */}
        <div className="px-4 pb-6 space-y-6">
          {loading && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-primary border-r-transparent" />
              <p className="text-sm text-muted mt-2">Đang tải...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <p className="text-sm text-error">{error}</p>
              <Button variant="secondary" size="sm" onClick={fetchData} className="mt-3">
                Thử lại
              </Button>
            </div>
          )}

          {!loading && !error && (
            <>
              {/* Documents */}
              {showDocuments && documents.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                    <span className="font-semibold text-gray-700">Văn bản pháp luật</span>
                    <span className="text-xs text-blue-600 font-medium">{documents.length} kết quả</span>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {documents.map((doc) => (
                      <LegalDocCard
                        key={doc.id}
                        title={doc.title}
                        code={doc.doc_number}
                        category={doc.category}
                        documentType={doc.type}
                        tags={doc.tags}
                        issuedDate={doc.issue_date}
                        effectiveDate={doc.effective_date}
                        onClick={() => (window.location.href = `/law/doc/${doc.id}`)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Procedures */}
              {showProcedures && procedures.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                    <span className="font-semibold text-gray-700">Thủ tục hành chính</span>
                    <span className="text-xs text-blue-600 font-medium">{procedures.length} kết quả</span>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {procedures.map((proc) => (
                      <ProcedureCard
                        key={proc.id}
                        title={proc.title}
                        category={proc.category}
                        difficulty="medium"
                        estimatedTime={proc.time_est}
                        authority={proc.authority}
                        tags={proc.tags}
                        onClick={() => (window.location.href = `/law/procedure/${proc.id}`)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Empty State */}
              {!loading &&
                documents.length === 0 &&
                procedures.length === 0 && (
                  <EmptyState
                    title="Không tìm thấy kết quả"
                    description="Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc"
                    action={{
                      label: 'Xóa bộ lọc',
                      onClick: () => {
                        setSearchQuery('');
                        clearFilters();
                      },
                    }}
                  />
                )}
            </>
          )}
        </div>
      </div>

      {/* Filter Bottom Sheet */}
      <BottomSheet
        isOpen={filterOpen}
        onClose={() => setFilterOpen(false)}
        title="Bộ lọc"
      >
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-sm mb-3">Lĩnh vực</h3>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <Chip
                  key={cat}
                  active={selectedCategories.includes(cat)}
                  onClick={() => toggleCategory(cat)}
                >
                  {cat}
                </Chip>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="secondary" fullWidth onClick={clearFilters}>
              Xóa bộ lọc
            </Button>
            <Button variant="primary" fullWidth onClick={() => setFilterOpen(false)}>
              Áp dụng
            </Button>
          </div>
        </div>
      </BottomSheet>
    </AppShell>
  );
}

/**
 * Legal Library Page
 * Wrapper component with Suspense boundary
 */
export default function LegalLibraryPage() {
  return (
    <Suspense fallback={
      <AppShell>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="text-xl">Đang tải...</div>
          </div>
        </div>
      </AppShell>
    }>
      <LegalLibraryContent />
    </Suspense>
  );
}
