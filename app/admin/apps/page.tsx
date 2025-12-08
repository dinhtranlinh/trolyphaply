'use client';

import React, { useEffect, useState } from 'react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import SearchBar from '@/components/ui/SearchBar';
import TextInput from '@/components/forms/TextInput';
import TextArea from '@/components/forms/TextArea';
import Select from '@/components/forms/Select';

interface MiniApp {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  category: string;
  status: string;
  type: string;
  input_schema: any;
  prompt_template: string;
  output_schema: any;
  render_config: any;
  share_config: any;
  limits: any;
  created_at: string;
  updated_at: string;
}

interface AppStats {
  app: { id: string; slug: string; name: string };
  totals: {
    views: number;
    submits: number;
    shares: number;
    results: number;
  };
  dailyStats: any[];
}

/**
 * Admin Apps Management Page
 */
export default function AdminAppsPage() {
  const [apps, setApps] = useState<MiniApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [editingApp, setEditingApp] = useState<MiniApp | null>(null);
  const [statsData, setStatsData] = useState<AppStats | null>(null);
  const [formData, setFormData] = useState({
    slug: '',
    name: '',
    description: '',
    category: 'tuvi',
    status: 'draft',
    type: 'text_only',
    inputSchema: '[]',
    promptTemplate: '',
    outputSchema: '{}',
    renderConfig: '{}',
    shareConfig: '{}',
    limits: '{}',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadApps();
  }, [search, categoryFilter, statusFilter]);

  const loadApps = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (categoryFilter !== 'all') params.append('category', categoryFilter);
      if (statusFilter !== 'all') params.append('status', statusFilter);

      const response = await fetch(`/api/admin/apps?${params}`);
      const data = await response.json();
      setApps(data.apps || []);
    } catch (error) {
      console.error('Error loading apps:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingApp(null);
    setFormData({
      slug: '',
      name: '',
      description: '',
      category: 'tuvi',
      status: 'draft',
      type: 'text_only',
      inputSchema: '[]',
      promptTemplate: '',
      outputSchema: '{}',
      renderConfig: '{}',
      shareConfig: '{}',
      limits: '{}',
    });
    setShowModal(true);
  };

  const handleEdit = (app: MiniApp) => {
    setEditingApp(app);
    setFormData({
      slug: app.slug,
      name: app.name,
      description: app.description || '',
      category: app.category,
      status: app.status,
      type: app.type,
      inputSchema: JSON.stringify(app.input_schema, null, 2),
      promptTemplate: app.prompt_template,
      outputSchema: JSON.stringify(app.output_schema || {}, null, 2),
      renderConfig: JSON.stringify(app.render_config || {}, null, 2),
      shareConfig: JSON.stringify(app.share_config || {}, null, 2),
      limits: JSON.stringify(app.limits || {}, null, 2),
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        slug: formData.slug,
        name: formData.name,
        description: formData.description || null,
        category: formData.category,
        status: formData.status,
        type: formData.type,
        inputSchema: JSON.parse(formData.inputSchema),
        promptTemplate: formData.promptTemplate,
        outputSchema: JSON.parse(formData.outputSchema || '{}'),
        renderConfig: JSON.parse(formData.renderConfig || '{}'),
        shareConfig: JSON.parse(formData.shareConfig || '{}'),
        limits: JSON.parse(formData.limits || '{}'),
      };

      const url = editingApp ? `/api/admin/apps/${editingApp.id}` : '/api/admin/apps';
      const method = editingApp ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setShowModal(false);
        loadApps();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to save app');
      }
    } catch (error) {
      console.error('Error saving app:', error);
      alert('Invalid JSON format or server error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa app này?')) return;

    try {
      const response = await fetch(`/api/admin/apps/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        loadApps();
      } else {
        alert('Failed to delete app');
      }
    } catch (error) {
      console.error('Error deleting app:', error);
    }
  };

  const handleClone = async (app: MiniApp) => {
    const newSlug = prompt('Nhập slug cho app mới:', `${app.slug}-copy`);
    if (!newSlug) return;

    try {
      const response = await fetch(`/api/admin/apps/${app.id}/clone`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newSlug }),
      });

      if (response.ok) {
        loadApps();
        alert('App đã được nhân bản thành công!');
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to clone app');
      }
    } catch (error) {
      console.error('Error cloning app:', error);
    }
  };

  const toggleStatus = async (app: MiniApp) => {
    const newStatus = app.status === 'published' ? 'draft' : 'published';

    try {
      const response = await fetch(`/api/admin/apps/${app.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...app,
          status: newStatus,
          inputSchema: app.input_schema,
          promptTemplate: app.prompt_template,
        }),
      });

      if (response.ok) {
        loadApps();
      }
    } catch (error) {
      console.error('Error toggling status:', error);
    }
  };

  const viewStats = async (app: MiniApp) => {
    try {
      const response = await fetch(`/api/admin/apps/${app.id}/stats`);
      const data = await response.json();
      setStatsData(data);
      setShowStatsModal(true);
    } catch (error) {
      console.error('Error loading stats:', error);
      alert('Failed to load statistics');
    }
  };

  const categories = [
    { value: 'all', label: 'Tất cả' },
    { value: 'tuvi', label: 'Tử vi' },
    { value: 'greeting', label: 'Lời chúc' },
    { value: 'poetry', label: 'Thơ' },
    { value: 'caption', label: 'Caption' },
    { value: 'other', label: 'Khác' },
  ];

  const statusOptions = [
    { value: 'all', label: 'Tất cả' },
    { value: 'draft', label: 'Draft' },
    { value: 'published', label: 'Published' },
  ];

  const appTypes = [
    { value: 'text_only', label: 'Text Only' },
    { value: 'image_template', label: 'Image Template' },
    { value: 'svg_dynamic', label: 'SVG Dynamic' },
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

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title mb-1">Quản lý Mini Apps</h1>
          <p className="text-muted">{apps.length} apps</p>
        </div>
        <Button variant="primary" onClick={handleCreate}>
          ➕ Thêm app
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SearchBar value={search} onChange={setSearch} placeholder="Tìm theo tên hoặc slug..." />
          <Select label="Danh mục" value={categoryFilter} onChange={setCategoryFilter} options={categories} />
          <Select label="Trạng thái" value={statusFilter} onChange={setStatusFilter} options={statusOptions} />
        </div>
      </Card>

      {/* Table */}
      <Card>
        {apps.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-3">🎯</div>
            <p className="text-muted">Chưa có app nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '2px solid var(--color-border-subtle)' }}>
                  <th className="text-left py-3 px-4 text-sm font-semibold">Tên app</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold">Slug</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold">Danh mục</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold">Status</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {apps.map((app, index) => (
                  <tr
                    key={app.id}
                    style={{
                      borderBottom: index < apps.length - 1 ? '1px solid var(--color-border-subtle)' : 'none',
                    }}
                  >
                    <td className="py-3 px-4">
                      <div className="font-medium">{app.name}</div>
                      <div className="text-sm text-muted">{app.type}</div>
                    </td>
                    <td className="py-3 px-4 text-sm font-mono">{app.slug}</td>
                    <td className="py-3 px-4 text-sm">{app.category}</td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => toggleStatus(app)}
                        className="px-3 py-1 rounded text-xs transition-colors"
                        style={{
                          background:
                            app.status === 'published' ? 'var(--color-success-light)' : 'var(--color-warning-light)',
                          color: app.status === 'published' ? 'var(--color-success)' : 'var(--color-warning)',
                        }}
                      >
                        {app.status}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button onClick={() => viewStats(app)} className="text-info hover:underline text-sm">
                        📊
                      </button>
                      <button onClick={() => handleClone(app)} className="text-accent hover:underline text-sm">
                        📋
                      </button>
                      <button onClick={() => handleEdit(app)} className="text-primary hover:underline text-sm">
                        Sửa
                      </button>
                      <button onClick={() => handleDelete(app.id)} className="text-error hover:underline text-sm">
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

      {/* Edit/Create Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={() => setShowModal(false)}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h2 className="section-title mb-6">{editingApp ? 'Sửa app' : 'Thêm app mới'}</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <TextInput
                  label="Slug *"
                  value={formData.slug}
                  onChange={(val) => setFormData({ ...formData, slug: val })}
                  placeholder="van-menh-cua-ban"
                  disabled={!!editingApp}
                  required
                />
                <TextInput
                  label="Tên app *"
                  value={formData.name}
                  onChange={(val) => setFormData({ ...formData, name: val })}
                  required
                />
              </div>

              <TextArea
                label="Mô tả"
                value={formData.description}
                onChange={(val) => setFormData({ ...formData, description: val })}
                rows={2}
              />

              <div className="grid grid-cols-3 gap-4">
                <Select
                  label="Danh mục *"
                  value={formData.category}
                  onChange={(val) => setFormData({ ...formData, category: val })}
                  options={categories.filter((c) => c.value !== 'all')}
                />
                <Select
                  label="Loại *"
                  value={formData.type}
                  onChange={(val) => setFormData({ ...formData, type: val })}
                  options={appTypes}
                />
                <Select
                  label="Trạng thái"
                  value={formData.status}
                  onChange={(val) => setFormData({ ...formData, status: val })}
                  options={statusOptions.filter((s) => s.value !== 'all')}
                />
              </div>

              <TextArea
                label="Input Schema (JSON) *"
                value={formData.inputSchema}
                onChange={(val) => setFormData({ ...formData, inputSchema: val })}
                rows={6}
                helperText='Format: [{&quot;name&quot;: &quot;field1&quot;, &quot;label&quot;: &quot;...&quot;, &quot;type&quot;: &quot;text&quot;, &quot;required&quot;: true}]'
                required
              />

              <TextArea
                label="Prompt Template *"
                value={formData.promptTemplate}
                onChange={(val) => setFormData({ ...formData, promptTemplate: val })}
                rows={8}
                helperText="Use {{field_name}} placeholders"
                required
              />

              <details className="border rounded p-4" style={{ borderColor: 'var(--color-border-subtle)' }}>
                <summary className="cursor-pointer font-semibold mb-4">Advanced Config (Optional)</summary>
                <div className="space-y-4">
                  <TextArea
                    label="Output Schema (JSON)"
                    value={formData.outputSchema}
                    onChange={(val) => setFormData({ ...formData, outputSchema: val })}
                    rows={4}
                  />
                  <TextArea
                    label="Render Config (JSON)"
                    value={formData.renderConfig}
                    onChange={(val) => setFormData({ ...formData, renderConfig: val })}
                    rows={4}
                  />
                  <TextArea
                    label="Share Config (JSON)"
                    value={formData.shareConfig}
                    onChange={(val) => setFormData({ ...formData, shareConfig: val })}
                    rows={4}
                  />
                  <TextArea
                    label="Limits (JSON)"
                    value={formData.limits}
                    onChange={(val) => setFormData({ ...formData, limits: val })}
                    rows={4}
                  />
                </div>
              </details>

              <div className="flex gap-3 pt-4">
                <Button variant="secondary" type="button" onClick={() => setShowModal(false)} fullWidth>
                  Hủy
                </Button>
                <Button variant="primary" type="submit" loading={submitting} fullWidth>
                  {editingApp ? 'Cập nhật' : 'Tạo mới'}
                </Button>
              </div>
            </form>
          </Card>
          </div>
        </div>
      )}

      {/* Stats Modal */}
      {showStatsModal && statsData && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={() => setShowStatsModal(false)}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="section-title mb-2">{statsData.app.name}</h2>
            <p className="text-sm text-muted mb-6">/{statsData.app.slug}</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 rounded" style={{ background: 'var(--color-primary-soft)' }}>
                <div className="text-2xl font-bold text-primary">{statsData.totals.views}</div>
                <div className="text-sm text-muted">Views</div>
              </div>
              <div className="text-center p-4 rounded" style={{ background: 'var(--color-success-light)' }}>
                <div className="text-2xl font-bold text-success">{statsData.totals.submits}</div>
                <div className="text-sm text-muted">Submits</div>
              </div>
              <div className="text-center p-4 rounded" style={{ background: 'var(--color-accent-soft)' }}>
                <div className="text-2xl font-bold text-accent">{statsData.totals.shares}</div>
                <div className="text-sm text-muted">Shares</div>
              </div>
              <div className="text-center p-4 rounded" style={{ background: 'var(--color-info-light)' }}>
                <div className="text-2xl font-bold text-info">{statsData.totals.results}</div>
                <div className="text-sm text-muted">Results</div>
              </div>
            </div>

            <Button variant="secondary" onClick={() => setShowStatsModal(false)} fullWidth>
              Đóng
            </Button>
          </Card>
          </div>
        </div>
      )}
    </div>
  );
}
