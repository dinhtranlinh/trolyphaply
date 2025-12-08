'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { VideoPromptDetail, VideoPromptData, ApiResponse } from '@/types/video-prompt';

export default function VideoPromptDetailPage() {
  const params = useParams();
  const router = useRouter();
  const name = params?.name as string;

  const [prompt, setPrompt] = useState<VideoPromptDetail | null>(null);
  const [fullPrompt, setFullPrompt] = useState<VideoPromptDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('Full');
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (name) {
      // Always fetch Full first to get total segments count
      fetchFullPrompt();
    }
  }, [name]);

  useEffect(() => {
    if (name && fullPrompt && activeTab !== 'Full') {
      fetchPrompt(activeTab);
    }
  }, [activeTab]);

  const fetchFullPrompt = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/video-prompts/${name}?segment=Full`);
      const data: ApiResponse<VideoPromptDetail> = await res.json();

      if (data.success && data.data) {
        setFullPrompt(data.data);
        setPrompt(data.data);
        setEditContent(data.data.raw);
      } else {
        setError(data.error || 'Failed to load prompt');
      }
    } catch (err) {
      setError('Network error');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPrompt = async (segment: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/video-prompts/${name}?segment=${segment}`);
      const data: ApiResponse<VideoPromptDetail> = await res.json();

      if (data.success && data.data) {
        setPrompt(data.data);
        setEditContent(data.data.raw);
      } else {
        setError(data.error || 'Failed to load prompt');
      }
    } catch (err) {
      setError('Network error');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editContent.trim()) {
      alert('Nội dung không được rỗng');
      return;
    }

    // Validate JSON
    try {
      const parsed = JSON.parse(editContent);
      if (!parsed.common || !parsed.segments) {
        alert('JSON phải có "common" và "segments"');
        return;
      }
    } catch (err) {
      alert('JSON không hợp lệ. Vui lòng kiểm tra syntax.');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/video-prompts/${name}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editContent })
      });

      const data: ApiResponse<unknown> = await res.json();

      if (data.success) {
        alert('Đã lưu thành công!');
        setIsEditing(false);
        fetchFullPrompt(); // Reload Full after save
        setActiveTab('Full');
      } else {
        alert(data.error || 'Lưu thất bại');
      }
    } catch (err) {
      alert('Network error');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (isEditing && editContent !== prompt?.raw) {
      if (!confirm('Bạn có thay đổi chưa lưu. Hủy bỏ?')) return;
    }
    setIsEditing(false);
    setEditContent(prompt?.raw || '');
  };

  const tabs = fullPrompt
    ? ['Full', ...Array.from({ length: fullPrompt.data.segments.length }, (_, i) => `P${i + 1}`)]
    : ['Full'];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-6 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href="/admin/video-prompts"
              className="text-white hover:text-blue-100 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">
                {loading ? 'Đang tải...' : prompt?.title || 'Video Prompt'}
              </h1>
              <p className="text-blue-100 text-sm mt-1 font-mono">{name}</p>
            </div>
          </div>

          {!isEditing && !loading && (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-colors shadow-md inline-flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Chỉnh Sửa
            </button>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
            <p className="mt-4 text-gray-600">Đang tải...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-300 text-red-800 px-6 py-4 rounded-lg">
            <p className="font-semibold">Lỗi:</p>
            <p>{error}</p>
          </div>
        )}

        {/* Content */}
        {!loading && !error && prompt && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Tabs */}
            <div className="border-b-2 border-gray-200 bg-gray-50">
              <div className="flex overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => !isEditing && setActiveTab(tab)}
                    disabled={isEditing}
                    className={`px-6 py-4 font-semibold transition-all border-b-4 whitespace-nowrap ${
                      activeTab === tab
                        ? 'border-blue-600 text-blue-600 bg-white'
                        : 'border-transparent text-gray-600 hover:text-blue-600 hover:border-blue-300'
                    } ${isEditing ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                  >
                    {tab === 'Full' ? `📋 Full (${prompt.data.segments.length} segments)` : `🎬 Segment ${tab}`}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {isEditing ? (
                <div>
                  <div className="mb-4 flex items-center gap-4">
                    <h3 className="text-lg font-semibold text-gray-700">Chỉnh sửa JSON</h3>
                    <div className="flex-1"></div>
                    <button
                      onClick={handleCancel}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                    >
                      Hủy
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
                    >
                      {saving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                          Đang lưu...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Lưu
                        </>
                      )}
                    </button>
                  </div>
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full h-[600px] font-mono text-sm p-4 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                    spellCheck={false}
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    💡 JSON phải có cấu trúc: <code className="bg-gray-100 px-2 py-1 rounded">&#123;"common": &#123;...&#125;, "segments": [...]&#125;</code>
                  </p>
                </div>
              ) : (
                <div>
                  {/* JSON Viewer */}
                  <div className="relative">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(prompt.raw);
                        alert('✅ Đã copy prompt vào clipboard!');
                      }}
                      className="absolute top-4 right-4 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-lg inline-flex items-center gap-2 z-10"
                      title="Copy prompt to clipboard"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copy Prompt
                    </button>
                    <div className="bg-gray-900 rounded-lg p-6 overflow-x-auto">
                      <pre className="text-sm text-gray-100 whitespace-pre-wrap">
                        <code>{prompt.raw}</code>
                      </pre>
                    </div>
                  </div>

                  {/* Segment Info */}
                  {activeTab !== 'Full' && prompt.data.segments[0] && (
                    <div className="mt-6 space-y-4">
                      <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded relative">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(prompt.data.segments[0].voiceover);
                            alert('✅ Đã copy Voiceover!');
                          }}
                          className="absolute top-2 right-2 p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                          title="Copy Voiceover"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                        <h4 className="font-semibold text-blue-900 mb-2">🎙️ Voiceover</h4>
                        <p className="text-gray-700 pr-12">{prompt.data.segments[0].voiceover}</p>
                      </div>

                      <div className="bg-purple-50 border-l-4 border-purple-600 p-4 rounded relative">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(prompt.data.segments[0].scene_description);
                            alert('✅ Đã copy Scene Description!');
                          }}
                          className="absolute top-2 right-2 p-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                          title="Copy Scene Description"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                        <h4 className="font-semibold text-purple-900 mb-2">🎬 Scene Description</h4>
                        <p className="text-gray-700 pr-12">{prompt.data.segments[0].scene_description}</p>
                      </div>

                      <div className="bg-green-50 border-l-4 border-green-600 p-4 rounded relative">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(prompt.data.segments[0].camera);
                            alert('✅ Đã copy Camera!');
                          }}
                          className="absolute top-2 right-2 p-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                          title="Copy Camera"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                        <h4 className="font-semibold text-green-900 mb-2">📹 Camera</h4>
                        <p className="text-gray-700 pr-12">{prompt.data.segments[0].camera}</p>
                      </div>

                      {prompt.data.segments[0].data_visualization && (
                        <div className="bg-yellow-50 border-l-4 border-yellow-600 p-4 rounded relative">
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(prompt.data.segments[0].data_visualization || '');
                              alert('✅ Đã copy Data Visualization!');
                            }}
                            className="absolute top-2 right-2 p-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors"
                            title="Copy Data Visualization"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </button>
                          <h4 className="font-semibold text-yellow-900 mb-2">📊 Data Visualization</h4>
                          <p className="text-gray-700 pr-12">{prompt.data.segments[0].data_visualization}</p>
                        </div>
                      )}

                      <div className="flex gap-4 text-sm text-gray-600">
                        <span className="font-semibold">⏱️ Duration: {prompt.data.segments[0].duration_seconds}s</span>
                        <span className="font-semibold">🆔 ID: {prompt.data.segments[0].segment_id}</span>
                      </div>
                    </div>
                  )}

                  {/* Full View Stats */}
                  {activeTab === 'Full' && (
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="text-sm font-semibold text-blue-900 mb-1">Total Segments</h4>
                        <p className="text-2xl font-bold text-blue-700">{prompt.data.segments.length}</p>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <h4 className="text-sm font-semibold text-green-900 mb-1">Total Duration</h4>
                        <p className="text-2xl font-bold text-green-700">
                          {prompt.data.segments.reduce((sum, s) => sum + s.duration_seconds, 0)}s
                        </p>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <h4 className="text-sm font-semibold text-purple-900 mb-1">Language</h4>
                        <p className="text-2xl font-bold text-purple-700">{prompt.data.common.language}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
