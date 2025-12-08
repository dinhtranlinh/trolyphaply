'use client';

import React, { useEffect, useState } from 'react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import SearchBar from '@/components/ui/SearchBar';
import TextInput from '@/components/forms/TextInput';
import TextArea from '@/components/forms/TextArea';
import Select from '@/components/forms/Select';

interface Procedure {
  id: string;
  title: string;
  authority: string;
  time_est: string;
  category: string;
  steps: any[];
  documents: any[];
  fees: string | null;
  notes: string | null;
  tags: string[];
  status: string;
  created_at: string;
  updated_at: string;
}

/**
 * Admin Procedures Management Page
 */
export default function AdminProceduresPage() {
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingProc, setEditingProc] = useState<Procedure | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    authority: '',
    timeEst: '',
    category: 'marriage',
    steps: '[]',
    documents: '[]',
    fees: '',
    notes: '',
    tags: '',
    status: 'active',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadProcedures();
  }, [search, categoryFilter]);

  const loadProcedures = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (categoryFilter !== 'all') params.append('category', categoryFilter);

      const response = await fetch(`/api/admin/procedures?${params}`);
      const data = await response.json();
      setProcedures(data.procedures || []);
    } catch (error) {
      console.error('Error loading procedures:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingProc(null);
    setFormData({
      title: '',
      authority: '',
      timeEst: '',
      category: 'marriage',
      steps: '[]',
      documents: '[]',
      fees: '',
      notes: '',
      tags: '',
      status: 'active',
    });
    setShowModal(true);
  };

  const handleEdit = (proc: Procedure) => {
    setEditingProc(proc);
    setFormData({
      title: proc.title,
      authority: proc.authority,
      timeEst: proc.time_est,
      category: proc.category,
      steps: JSON.stringify(proc.steps, null, 2),
      documents: JSON.stringify(proc.documents, null, 2),
      fees: proc.fees || '',
      notes: proc.notes || '',
      tags: proc.tags.join(', '),
      status: proc.status,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        title: formData.title,
        authority: formData.authority,
        timeEst: formData.timeEst,
        category: formData.category,
        steps: JSON.parse(formData.steps || '[]'),
        documents: JSON.parse(formData.documents || '[]'),
        fees: formData.fees || null,
        notes: formData.notes || null,
        tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean),
        status: formData.status,
      };

      const url = editingProc
        ? `/api/admin/procedures/${editingProc.id}`
        : '/api/admin/procedures';
      const method = editingProc ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setShowModal(false);
        loadProcedures();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to save procedure');
      }
    } catch (error) {
      console.error('Error saving procedure:', error);
      alert('Failed to save procedure');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa thủ tục này?')) return;

    try {
      const response = await fetch(`/api/admin/procedures/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        loadProcedures();
      } else {
        alert('Failed to delete procedure');
      }
    } catch (error) {
      console.error('Error deleting procedure:', error);
    }
  };

  const categories = [
    { value: 'all', label: 'Tất cả' },
    { value: 'marriage', label: 'Hôn nhân - Gia đình' },
    { value: 'land', label: 'Đất đai - Nhà đất' },
    { value: 'business', label: 'Doanh nghiệp' },
    { value: 'vehicle', label: 'Phương tiện' },
    { value: 'citizen', label: 'Công dân' },
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
    window.open('/api/admin/legal-library/export?type=procedures', '_blank');
  };

  const handleImport = () => {
    window.location.href = '/admin/documents/import';
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title mb-1">Quản lý Thủ tục</h1>
          <p className="text-muted">{procedures.length} thủ tục</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleImport}>
            📥 Import
          </Button>
          <Button variant="outline" onClick={handleExport}>
            📤 Export
          </Button>
          <Button variant="primary" onClick={handleCreate}>
            ➕ Thêm thủ tục
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Tìm theo tên thủ tục..."
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
        {procedures.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-3">📋</div>
            <p className="text-muted">Chưa có thủ tục nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '2px solid var(--color-border-subtle)' }}>
                  <th className="text-left py-3 px-4 text-sm font-semibold">Tên thủ tục</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold">Lĩnh vực</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold">Thời gian</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold">Trạng thái</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {procedures.map((proc, index) => (
                  <tr
                    key={proc.id}
                    style={{
                      borderBottom:
                        index < procedures.length - 1 ? '1px solid var(--color-border-subtle)' : 'none',
                    }}
                  >
                    <td className="py-3 px-4">
                      <div className="font-medium">{proc.title}</div>
                      <div className="text-sm text-muted">{proc.authority}</div>
                    </td>
                    <td className="py-3 px-4 text-sm">{proc.category}</td>
                    <td className="py-3 px-4 text-sm">{proc.time_est}</td>
                    <td className="py-3 px-4">
                      <span
                        className="px-2 py-1 rounded text-xs"
                        style={{
                          background:
                            proc.status === 'active' ? 'var(--color-success-light)' : 'var(--color-muted)',
                          color: proc.status === 'active' ? 'var(--color-success)' : 'var(--color-text-muted)',
                        }}
                      >
                        {proc.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleEdit(proc)}
                        className="text-primary hover:underline text-sm mr-3"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(proc.id)}
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
            <h2 className="section-title mb-6">{editingProc ? 'Sửa thủ tục' : 'Thêm thủ tục mới'}</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <TextInput
                label="Tên thủ tục *"
                value={formData.title}
                onChange={(val) => setFormData({ ...formData, title: val })}
                required
              />

              <div className="grid grid-cols-2 gap-4">
                <TextInput
                  label="Cơ quan thực hiện *"
                  value={formData.authority}
                  onChange={(val) => setFormData({ ...formData, authority: val })}
                  required
                />
                <TextInput
                  label="Thời gian ước tính *"
                  value={formData.timeEst}
                  onChange={(val) => setFormData({ ...formData, timeEst: val })}
                  placeholder="VD: 3-5 ngày làm việc"
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
                label="Các bước thực hiện (JSON) *"
                value={formData.steps}
                onChange={(val) => setFormData({ ...formData, steps: val })}
                rows={6}
                helperText='Format: [{&quot;step&quot;: 1, &quot;title&quot;: &quot;...&quot;, &quot;description&quot;: &quot;...&quot;}]'
                required
              />

              <TextArea
                label="Hồ sơ cần thiết (JSON) *"
                value={formData.documents}
                onChange={(val) => setFormData({ ...formData, documents: val })}
                rows={4}
                helperText='Format: [{&quot;name&quot;: &quot;...&quot;, &quot;copies&quot;: 1}]'
                required
              />

              <TextInput
                label="Lệ phí"
                value={formData.fees}
                onChange={(val) => setFormData({ ...formData, fees: val })}
                placeholder="VD: 100,000 VNĐ"
              />

              <TextArea
                label="Ghi chú"
                value={formData.notes}
                onChange={(val) => setFormData({ ...formData, notes: val })}
                rows={3}
              />

              <TextInput
                label="Tags (phân cách bằng dấu phẩy)"
                value={formData.tags}
                onChange={(val) => setFormData({ ...formData, tags: val })}
                placeholder="kết hôn, đăng ký, hồ sơ"
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
                  {editingProc ? 'Cập nhật' : 'Tạo mới'}
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
