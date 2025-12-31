'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Page {
  id: string;
  page_id: string;
  page_name: string;
}

interface ReplyRule {
  id: string;
  page_id: string;
  post_id: string | null;
  name: string;
  trigger_type: 'all' | 'keyword';
  keywords: string[];
  exclude_keywords: string[];
  template: string;
  priority: number;
  enabled: boolean;
}

export default function ReplyRuleEditor({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [ruleId, setRuleId] = useState<string>('');
  const [isNew, setIsNew] = useState(false);
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [previewVariations, setPreviewVariations] = useState<string[]>([]);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [formData, setFormData] = useState<Partial<ReplyRule>>({
    page_id: '',
    post_id: null,
    name: '',
    trigger_type: 'all',
    keywords: [],
    exclude_keywords: [],
    template: '',
    priority: 5,
    enabled: true,
  });

  useEffect(() => {
    params.then((p) => {
      const id = p.id;
      setRuleId(id);
      setIsNew(id === 'new');
      loadData(id);
    });
  }, [params]);

  const loadData = async (id: string) => {
    setLoading(true);
    try {
      let pageOptions: Page[] = [];

      // Load pages
      const pagesRes = await fetch('/api/facebook/pages');
      const pagesData = await pagesRes.json();
      if (pagesData.success) {
        pageOptions = pagesData.pages || [];
        setPages(pageOptions);

        // Set default page if new
        if (id === 'new' && pageOptions.length > 0) {
          setFormData((prev) => ({ ...prev, page_id: pageOptions[0].page_id }));
        }
      }

      // Load rule if editing
      if (id !== 'new') {
        const ruleRes = await fetch(`/api/facebook/reply-rules/${id}`);
        const ruleData = await ruleRes.json();

        if (ruleData.success) {
          const rule = ruleData.rule;
          const matchedPage = pageOptions.find((page) => page.id === rule.page_id);
          const mappedPageId = matchedPage?.page_id || rule.page_id;
          const template =
            rule.template || (rule.reply_templates && rule.reply_templates[0]) || '';

          setFormData({
            id: rule.id,
            page_id: mappedPageId,
            post_id: rule.post_id ?? null,
            name: rule.name || '',
            trigger_type: rule.trigger_type || 'all',
            keywords: Array.isArray(rule.keywords) ? rule.keywords : [],
            exclude_keywords: Array.isArray(rule.exclude_keywords) ? rule.exclude_keywords : [],
            template,
            priority: rule.priority ?? 5,
            enabled: rule.enabled ?? true,
          });
        } else {
          alert('Rule not found');
          router.push('/admin/facebook/reply-rules');
        }
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = async () => {
    if (!formData.template) {
      setMessage({ type: 'error', text: 'Please enter a template first' });
      return;
    }

    setPreviewing(true);
    setMessage(null);

    try {
      const response = await fetch('/api/facebook/reply-rules/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template: formData.template,
          user_name: 'Nguyễn Văn A',
        }),
      });

      const data = await response.json();

      if (data.success) {
        setPreviewVariations(data.variations || []);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to preview' });
      }
    } catch (error) {
      console.error('Failed to preview:', error);
      setMessage({ type: 'error', text: 'Failed to preview template' });
    } finally {
      setPreviewing(false);
    }
  };

  const handleSave = async () => {
    // Validation
    if (!formData.name?.trim()) {
      setMessage({ type: 'error', text: 'Rule name is required' });
      return;
    }

    if (!formData.page_id) {
      setMessage({ type: 'error', text: 'Please select a page' });
      return;
    }

    if (!formData.template?.trim()) {
      setMessage({ type: 'error', text: 'Template is required' });
      return;
    }

    if (formData.trigger_type === 'keyword' && (!formData.keywords || formData.keywords.length === 0)) {
      setMessage({ type: 'error', text: 'Please add at least one keyword' });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const url = isNew
        ? '/api/facebook/reply-rules'
        : `/api/facebook/reply-rules/${ruleId}`;

      const method = isNew ? 'POST' : 'PATCH';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: `Rule ${isNew ? 'created' : 'updated'} successfully!` });
        
        if (isNew) {
          setTimeout(() => {
            router.push('/admin/facebook/reply-rules');
          }, 1500);
        }
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to save rule' });
      }
    } catch (error) {
      console.error('Failed to save rule:', error);
      setMessage({ type: 'error', text: 'Failed to save rule' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-2 text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Link href="/admin/facebook/reply-rules" className="hover:text-gray-900">
          Reply Rules
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">
          {isNew ? 'Create New Rule' : 'Edit Rule'}
        </span>
      </div>

      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {isNew ? 'Create Reply Rule' : 'Edit Reply Rule'}
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Set up automated responses for comments on your Facebook page
        </p>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`p-4 rounded-lg border ${
            message.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rule Name *
                </label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Welcome New Customers"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Facebook Page *
                </label>
                <select
                  value={formData.page_id || ''}
                  onChange={(e) => setFormData({ ...formData, page_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a page</option>
                  {pages.map((page) => (
                    <option key={page.id} value={page.page_id}>
                      {page.page_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Post ID (Optional)
                </label>
                <input
                  type="text"
                  value={formData.post_id || ''}
                  onChange={(e) => setFormData({ ...formData, post_id: e.target.value || null })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Leave empty to apply to all posts"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Specific post ID if you want to target only one post
                </p>
              </div>
            </div>
          </div>

          {/* Trigger Settings */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Trigger Settings</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trigger Type *
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="all"
                      checked={formData.trigger_type === 'all'}
                      onChange={(e) =>
                        setFormData({ ...formData, trigger_type: e.target.value as 'all' | 'keyword' })
                      }
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm text-gray-700">All Comments</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="keyword"
                      checked={formData.trigger_type === 'keyword'}
                      onChange={(e) =>
                        setFormData({ ...formData, trigger_type: e.target.value as 'all' | 'keyword' })
                      }
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm text-gray-700">Keyword Match</span>
                  </label>
                </div>
              </div>

              {formData.trigger_type === 'keyword' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Keywords (comma-separated) *
                    </label>
                    <input
                      type="text"
                      value={formData.keywords?.join(', ') || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          keywords: e.target.value.split(',').map((k) => k.trim()).filter(Boolean),
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., giá, price, bao nhiêu"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Rule will trigger if comment contains any of these keywords
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Exclude Keywords (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={formData.exclude_keywords?.join(', ') || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          exclude_keywords: e.target.value.split(',').map((k) => k.trim()).filter(Boolean),
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., spam, test"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Rule will NOT trigger if comment contains any of these keywords
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Template Editor */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Reply Template *</h2>

            <div className="space-y-4">
              <div>
                <textarea
                  value={formData.template || ''}
                  onChange={(e) => setFormData({ ...formData, template: e.target.value })}
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  placeholder="Xin chào {full_name}! [Cảm ơn bạn|Thanks bạn|Rất cảm ơn] đã quan tâm..."
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                <p className="font-semibold mb-2">💡 Template Syntax:</p>
                <ul className="space-y-1 text-xs">
                  <li>• <code className="bg-blue-100 px-1 rounded">{'{ full_name}'}</code> - User's full name</li>
                  <li>• <code className="bg-blue-100 px-1 rounded">{'{ first_name}'}</code> - User's first name</li>
                  <li>• <code className="bg-blue-100 px-1 rounded">[option1|option2|option3]</code> - Random spin syntax</li>
                  <li>• Minimum 5 unique variations required</li>
                </ul>
              </div>

              <button
                onClick={handlePreview}
                disabled={previewing || !formData.template}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm font-medium"
              >
                {previewing ? 'Generating...' : 'Preview Variations'}
              </button>
            </div>
          </div>

          {/* Advanced Settings */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Advanced Settings</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority (1-10)
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={formData.priority || 5}
                  onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-600 mt-1">
                  <span>Low (1)</span>
                  <span className="font-medium">Current: {formData.priority}</span>
                  <span>High (10)</span>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Higher priority rules are checked first
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.enabled || false}
                  onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <label className="text-sm text-gray-700">Enable this rule immediately</label>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm font-medium"
            >
              {saving ? 'Saving...' : isNew ? 'Create Rule' : 'Save Changes'}
            </button>
            <Link
              href="/admin/facebook/reply-rules"
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
            >
              Cancel
            </Link>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Preview</h2>

            {previewVariations.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm">
                <p>Click "Preview Variations" to see generated responses</p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-gray-600 mb-3">
                  {previewVariations.length} variations generated:
                </p>
                {previewVariations.map((variation, index) => (
                  <div
                    key={index}
                    className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-sm text-gray-700"
                  >
                    <span className="text-xs text-gray-500 font-medium">#{index + 1}</span>
                    <p className="mt-1">{variation}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
