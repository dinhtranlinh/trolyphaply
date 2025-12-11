'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

interface VideoPromptData {
  common?: {
    project_title?: string;
    [key: string]: any;
  };
  segments?: any[];
}

interface VideoPromptDetail {
  name: string;
  filename: string;
  title: string;
  segments: number;
  created: number;
  size: number;
  data: VideoPromptData;
  raw: string;
}

export default function VideoPromptDetailPage({ params }: { params: { name: string } }) {
  const router = useRouter();
  const [prompt, setPrompt] = useState<VideoPromptDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('Full');
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin');
      return;
    }
    fetchPrompt('Full');
  }, []);

  const fetchPrompt = async (segment: string = 'Full') => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/video-prompts/${params.name}?segment=${segment}`);
      const data = await res.json();
      
      if (res.ok && data.success) {
        setPrompt(data.data);
        setEditContent(data.data.raw);
      } else {
        setError(data.error || 'Failed to fetch video prompt');
      }
    } catch (err) {
      setError('Failed to fetch video prompt');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setIsEditing(false);
    fetchPrompt(tab);
  };

  const handleCopyFull = () => {
    if (prompt) {
      navigator.clipboard.writeText(prompt.raw);
      alert('Full JSON copied to clipboard!');
    }
  };

  const handleCopyField = (fieldPath: string) => {
    if (!prompt?.data) return;
    
    try {
      const keys = fieldPath.split('.');
      let value: any = prompt.data;
      
      for (const key of keys) {
        value = value?.[key];
      }
      
      if (value !== undefined) {
        const text = typeof value === 'string' ? value : JSON.stringify(value, null, 2);
        navigator.clipboard.writeText(text);
        alert(`${fieldPath} copied to clipboard!`);
      }
    } catch (err) {
      console.error('Copy error:', err);
    }
  };

  const handleSave = async () => {
    setError('');
    setSaving(true);

    try {
      // Validate JSON
      JSON.parse(editContent);

      const res = await fetch(`/api/admin/video-prompts/${params.name}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editContent }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setIsEditing(false);
        fetchPrompt(activeTab);
        alert('Video prompt updated successfully!');
      } else {
        setError(data.error || 'Failed to update video prompt');
      }
    } catch (err) {
      setError('Invalid JSON format');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) {
      setDeleteConfirm(true);
      return;
    }

    try {
      const res = await fetch(`/api/admin/video-prompts/${params.name}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (res.ok && data.success) {
        router.push('/admin/video-prompts');
      } else {
        setError(data.error || 'Failed to delete video prompt');
      }
    } catch (err) {
      setError('Failed to delete video prompt');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!prompt) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-red-500">Video prompt not found</div>
      </div>
    );
  }

  const tabs = ['Full', ...Array.from({ length: prompt.segments }, (_, i) => `P${i + 1}`)];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/admin/video-prompts"
                className="text-gray-600 hover:text-gray-900"
              >
                ← Back
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{prompt.title}</h1>
                <p className="text-sm text-gray-500 mt-1">
                  {prompt.name} • {prompt.segments} segments
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              {activeTab === 'Full' && !isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Edit
                </button>
              )}
              {isEditing && (
                <>
                  <button
                    onClick={() => setIsEditing(false)}
                    disabled={saving}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </>
              )}
              {!isEditing && (
                <button
                  onClick={handleDelete}
                  className={`px-4 py-2 rounded-lg transition ${
                    deleteConfirm
                      ? 'bg-red-700 text-white'
                      : 'bg-red-600 text-white hover:bg-red-700'
                  }`}
                >
                  {deleteConfirm ? 'Confirm Delete?' : 'Delete'}
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
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

        {/* Tabs Navigation */}
        <div className="bg-white rounded-lg shadow mb-6 overflow-hidden">
          <div className="border-b border-gray-200 overflow-x-auto">
            <nav className="flex space-x-2 px-4" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => handleTabChange(tab)}
                  className={`py-4 px-6 text-sm font-medium whitespace-nowrap border-b-2 transition ${
                    activeTab === tab
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {isEditing ? (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Edit JSON Content</h3>
                  <div className="text-sm text-gray-500">
                    Lines: {editContent.split('\n').length}
                  </div>
                </div>
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full h-[600px] px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  placeholder="Enter JSON content..."
                />
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    JSON Content - {activeTab}
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={handleCopyFull}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition text-sm"
                    >
                      📋 Copy Full JSON
                    </button>
                  </div>
                </div>

                {/* Copy Field Buttons */}
                {prompt.data.segments && prompt.data.segments[0] && (
                  <div className="mb-4 flex flex-wrap gap-2">
                    <span className="text-sm text-gray-600">Quick copy:</span>
                    {['voiceover', 'scene_description', 'camera', 'data_visualization'].map((field) => (
                      <button
                        key={field}
                        onClick={() => handleCopyField(`segments.0.${field}`)}
                        className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition"
                      >
                        {field}
                      </button>
                    ))}
                  </div>
                )}

                {/* JSON Display */}
                <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto text-sm">
                  <code>{prompt.raw}</code>
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* Metadata */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Metadata</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-gray-500">Filename</div>
              <div className="text-gray-900 font-mono text-sm">{prompt.filename}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Created/Modified</div>
              <div className="text-gray-900">
                {new Date(prompt.created).toLocaleString('vi-VN')}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">File Size</div>
              <div className="text-gray-900">
                {(prompt.size / 1024).toFixed(2)} KB
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
