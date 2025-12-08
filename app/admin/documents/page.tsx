'use client';

import React, { useEffect, useState } from 'react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import SearchBar from '@/components/ui/SearchBar';
import TextInput from '@/components/forms/TextInput';
import TextArea from '@/components/forms/TextArea';
import Select from '@/components/forms/Select';

interface LegalDocument {
  id: string;
  title: string;
  doc_number: string | null;
  type: string;
  authority: string;
  issue_date: string;
  effective_date: string;
  summary: string | null;
  content: any;
  tags: string[];
  category: string;
  status: string;
  created_at: string;
  updated_at: string;
}

/**
 * Admin Documents Management Page
 */
export default function AdminDocumentsPage() {
  const [documents, setDocuments] = useState<LegalDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingDoc, setEditingDoc] = useState<LegalDocument | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    docNumber: '',
    type: 'law',
    authority: '',
    issueDate: '',
    effectiveDate: '',
    summary: '',
    content: '{}',
    tags: '',
    category: 'civil',
    status: 'active',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadDocuments();
  }, [search, categoryFilter]);

  const loadDocuments = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (categoryFilter !== 'all') params.append('category', categoryFilter);

      const response = await fetch(`/api/admin/documents?${params}`);
      const data = await response.json();
      setDocuments(data.documents || []);
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingDoc(null);
    setFormData({
      title: '',
      docNumber: '',
      type: 'law',
      authority: '',
      issueDate: '',
      effectiveDate: '',
      summary: '',
      content: '{}',
      tags: '',
      category: 'civil',
      status: 'active',
    });
    setShowModal(true);
  };

  const handleEdit = (doc: LegalDocument) => {
    setEditingDoc(doc);
    setFormData({
      title: doc.title,
      docNumber: doc.doc_number || '',
      type: doc.type,
      authority: doc.authority,
      issueDate: doc.issue_date.split('T')[0],
      effectiveDate: doc.effective_date.split('T')[0],
      summary: doc.summary || '',
      content: JSON.stringify(doc.content, null, 2),
      tags: doc.tags.join(', '),
      category: doc.category,
      status: doc.status,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        title: formData.title,
        docNumber: formData.docNumber || null,
        type: formData.type,
        authority: formData.authority,
        issueDate: formData.issueDate,
        effectiveDate: formData.effectiveDate,
        summary: formData.summary || null,
        content: JSON.parse(formData.content || '{}'),
        tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean),
        category: formData.category,
        status: formData.status,
      };

      const url = editingDoc
        ? `/api/admin/documents/${editingDoc.id}`
        : '/api/admin/documents';
      const method = editingDoc ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setShowModal(false);
        loadDocuments();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to save document');
      }
    } catch (error) {
      console.error('Error saving document:', error);
      alert('Failed to save document');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa văn bản này?')) return;

    try {
      const response = await fetch(`/api/admin/documents/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        loadDocuments();
      } else {
        alert('Failed to delete document');
      }
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  };

  const categories = [
    { value: 'all', label: 'Tất cả' },
    { value: 'civil', label: 'Dân sự' },
    { value: 'criminal', label: 'Hình sự' },
    { value: 'administrative', label: 'Hành chính' },
    { value: 'labor', label: 'Lao động' },
    { value: 'tax', label: 'Thuế' },
    { value: 'other', label: 'Khác' },
  ];

  const documentTypes = [
    { value: 'law', label: 'Luật' },
    { value: 'decree', label: 'Nghị định' },
    { value: 'circular', label: 'Thông tư' },
    { value: 'decision', label: 'Quyết định' },
    { value: 'other', label: 'Khác' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted">Đang tải...</p>
        </div>
      </div>
    );
  }

  const handleExport = () => {
    window.open('/api/admin/legal-library/export?type=documents', '_blank');
  };

  const handleImport = () => {
    window.location.href = '/admin/documents/import';
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title mb-1">Quản lý Văn bản</h1>
          <p className="text-muted">{documents.length} văn bản</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleImport}>
            📥 Import
          </Button>
          <Button variant="outline" onClick={handleExport}>
            📤 Export
          </Button>
          <Button variant="primary" onClick={handleCreate}>
            ➕ Thêm văn bản
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Tìm theo tên hoặc số văn bản..."
          />
          <Select
            label="Lĩnh vực"
            value={categoryFilter}
            onChange={setCategoryFilter}
            options={categories}
          />
        </div>
      </Card>

      {/* Table */}
      <Card>
        {documents.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-3">📜</div>
            <p className="text-muted">Chưa có văn bản nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '2px solid var(--color-border-subtle)' }}>
                  <th className="text-left py-3 px-4 text-sm font-semibold">Tên văn bản</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold">Số VB</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold">Loại</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold">Lĩnh vực</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold">Trạng thái</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc, index) => (
                  <tr
                    key={doc.id}
                    style={{
                      borderBottom:
                        index < documents.length - 1 ? '1px solid var(--color-border-subtle)' : 'none',
                    }}
                  >
                    <td className="py-3 px-4">
                      <div className="font-medium">{doc.title}</div>
                      <div className="text-sm text-muted">{doc.authority}</div>
                    </td>
                    <td className="py-3 px-4 text-sm">{doc.doc_number || '-'}</td>
                    <td className="py-3 px-4 text-sm">{doc.type}</td>
                    <td className="py-3 px-4 text-sm">{doc.category}</td>
                    <td className="py-3 px-4">
                      <span
                        className="px-2 py-1 rounded text-xs"
                        style={{
                          background:
                            doc.status === 'active' ? 'var(--color-success-light)' : 'var(--color-muted)',
                          color: doc.status === 'active' ? 'var(--color-success)' : 'var(--color-text-muted)',
                        }}
                      >
                        {doc.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleEdit(doc)}
                        className="text-primary hover:underline text-sm mr-3"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(doc.id)}
                        className="text-error hover:underline text-sm"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={() => setShowModal(false)}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="section-title mb-6">{editingDoc ? 'Sửa văn bản' : 'Thêm văn bản mới'}</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <TextInput
                label="Tên văn bản *"
                value={formData.title}
                onChange={(val) => setFormData({ ...formData, title: val })}
                required
              />

              <div className="grid grid-cols-2 gap-4">
                <TextInput
                  label="Số văn bản"
                  value={formData.docNumber}
                  onChange={(val) => setFormData({ ...formData, docNumber: val })}
                />
                <Select
                  label="Loại văn bản *"
                  value={formData.type}
                  onChange={(val) => setFormData({ ...formData, type: val })}
                  options={documentTypes}
                />
              </div>

              <TextInput
                label="Cơ quan ban hành *"
                value={formData.authority}
                onChange={(val) => setFormData({ ...formData, authority: val })}
                required
              />

              <div className="grid grid-cols-2 gap-4">
                <TextInput
                  label="Ngày ban hành *"
                  type="date"
                  value={formData.issueDate}
                  onChange={(val) => setFormData({ ...formData, issueDate: val })}
                  required
                />
                <TextInput
                  label="Ngày hiệu lực *"
                  type="date"
                  value={formData.effectiveDate}
                  onChange={(val) => setFormData({ ...formData, effectiveDate: val })}
                  required
                />
              </div>

              <Select
                label="Lĩnh vực *"
                value={formData.category}
                onChange={(val) => setFormData({ ...formData, category: val })}
                options={categories.filter((c) => c.value !== 'all')}
              />

              <TextArea
                label="Tóm tắt"
                value={formData.summary}
                onChange={(val) => setFormData({ ...formData, summary: val })}
                rows={3}
              />

              <TextInput
                label="Tags (phân cách bằng dấu phẩy)"
                value={formData.tags}
                onChange={(val) => setFormData({ ...formData, tags: val })}
                placeholder="dân sự, hợp đồng, tranh chấp"
              />

              <TextArea
                label="Nội dung (JSON)"
                value={formData.content}
                onChange={(val) => setFormData({ ...formData, content: val })}
                rows={6}
                helperText="Format: {&quot;chapters&quot;: [{&quot;title&quot;: &quot;...&quot;, &quot;content&quot;: &quot;...&quot;}]}"
              />

              <Select
                label="Trạng thái"
                value={formData.status}
                onChange={(val) => setFormData({ ...formData, status: val })}
                options={[
                  { value: 'active', label: 'Hoạt động' },
                  { value: 'archived', label: 'Lưu trữ' },
                ]}
              />

              <div className="flex gap-3 pt-4">
                <Button
                  variant="secondary"
                  type="button"
                  onClick={() => setShowModal(false)}
                  fullWidth
                >
                  Hủy
                </Button>
                <Button variant="primary" type="submit" loading={submitting} fullWidth>
                  {editingDoc ? 'Cập nhật' : 'Tạo mới'}
                </Button>
              </div>
            </form>
          </Card>
          </div>
        </div>
      )}
    </div>
  );
}
