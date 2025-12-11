'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

interface StyleGuide {
  id: string;
  name: string;
  description: string;
  characteristics: string[];
  tone: string[];
  language: string;
  is_default: boolean;
}

export default function EditStyleGuidePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    characteristics: '',
    tone: '',
    language: 'vi',
    isDefault: false,
  });

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin');
      return;
    }
    fetchStyleGuide();
  }, []);

  const fetchStyleGuide = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/style-guides/${params.id}`);
      const data = await res.json();
      
      if (res.ok && data.success) {
        const guide: StyleGuide = data.data;
        setFormData({
          name: guide.name,
          description: guide.description,
          characteristics: guide.characteristics.join(', '),
          tone: guide.tone.join(', '),
          language: guide.language,
          isDefault: guide.is_default,
        });
      } else {
        setError(data.error || 'Failed to fetch style guide');
      }
    } catch (err) {
      setError('Failed to fetch style guide');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      // Parse arrays from comma-separated strings
      const characteristics = formData.characteristics
        .split(',')
        .map((c) => c.trim())
        .filter(Boolean);
      
      const tone = formData.tone
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      if (characteristics.length === 0) {
        setError('At least one characteristic is required');
        setSubmitting(false);
        return;
      }

      if (tone.length === 0) {
        setError('At least one tone is required');
        setSubmitting(false);
        return;
      }

      const payload = {
        name: formData.name,
        description: formData.description,
        characteristics,
        tone,
        language: formData.language,
        isDefault: formData.isDefault,
      };

      const res = await fetch(`/api/admin/style-guides/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        router.push(`/admin/style-guides/${params.id}`);
      } else {
        setError(data.error || 'Failed to update style guide');
      }
    } catch (err) {
      setError('Failed to update style guide');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push(`/admin/style-guides/${params.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={handleCancel}
              className="text-gray-600 hover:text-gray-900"
            >
              ← Back
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Edit Style Guide</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
              <button
                onClick={() => setError('')}
                className="float-right text-red-900 hover:text-red-700"
              >
                ×
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Professional Business Style"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Brief description of this writing style..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Characteristics <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.characteristics}
                onChange={(e) => setFormData({ ...formData, characteristics: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                rows={4}
                placeholder="Comma-separated list: formal, concise, data-driven, objective"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter characteristics separated by commas
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tone <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.tone}
                onChange={(e) => setFormData({ ...formData, tone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                rows={4}
                placeholder="Comma-separated list: professional, respectful, authoritative, neutral"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter tone characteristics separated by commas
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Language <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.language}
                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="vi">Vietnamese (vi)</option>
                <option value="en">English (en)</option>
                <option value="fr">French (fr)</option>
                <option value="de">German (de)</option>
                <option value="es">Spanish (es)</option>
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isDefault"
                checked={formData.isDefault}
                onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isDefault" className="ml-2 block text-sm text-gray-900">
                Set as default style guide
              </label>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <h3 className="text-sm font-medium text-blue-900 mb-2">💡 Tips:</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Be specific with characteristics (e.g., "uses active voice" vs "good writing")</li>
                  <li>• Tone should reflect the emotional quality (formal, casual, empathetic, etc.)</li>
                  <li>• Changes will be applied immediately upon saving</li>
                </ul>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCancel}
                disabled={submitting}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                {submitting ? 'Updating...' : 'Update Style Guide'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
