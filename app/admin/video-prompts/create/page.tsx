'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ApiResponse } from '@/types/video-prompt';

const TEMPLATE_JSON = `{
  "common": {
    "project_title": "Your Video Title Here",
    "language": "vi-VN",
    "video_usage": "Web and YouTube, landscape format",
    "format": {
      "aspect_ratio": "16:9",
      "resolution": "4K",
      "frame_rate": 25
    },
    "visual_style": {
      "overall_look": "Hybrid of cinematic live-action and 3D motion graphics",
      "aesthetics": "Ultra-modern, minimalist, trustworthy",
      "color_palette": "Cool tones with tech blue, white and soft gray",
      "ui_elements": "STRICT NO-TEXT MODE. Use only icons, shapes, color bars."
    },
    "characters": {
      "family": "Vietnamese couple around thirty years old",
      "officials": "Civil servants in modern digital office"
    },
    "audio_style": {
      "music": "Soft, modern electronic ambient music",
      "sound_effects": "Light humming, gentle whooshing sounds",
      "voiceover_note": "Vietnamese voiceover với đầy đủ dấu"
    }
  },
  "segments": [
    {
      "segment_id": "segment_01_intro",
      "duration_seconds": 8,
      "voiceover": "Văn bản thuyết minh tiếng Việt có dấu đầy đủ.",
      "scene_description": "Describe the visual scene in detail.",
      "data_visualization": "Describe any data visualization elements.",
      "camera": "Describe camera movement and angles.",
      "onscreen_text": "No text at all."
    }
  ]
}`;

export default function CreateVideoPromptPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [content, setContent] = useState(TEMPLATE_JSON);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    setError(null);

    // Validate name
    if (!name.trim()) {
      setError('Tên prompt không được rỗng');
      return;
    }

    // Validate name format (no spaces, special chars)
    if (!/^[a-zA-Z0-9_-]+$/.test(name)) {
      setError('Tên chỉ được chứa chữ cái, số, dấu gạch ngang và gạch dưới');
      return;
    }

    // Validate JSON
    try {
      const parsed = JSON.parse(content);
      if (!parsed.common || !parsed.segments) {
        setError('JSON phải có "common" và "segments"');
        return;
      }
      if (!Array.isArray(parsed.segments) || parsed.segments.length === 0) {
        setError('Segments phải là mảng không rỗng');
        return;
      }
    } catch (err) {
      setError('JSON không hợp lệ. Vui lòng kiểm tra syntax.');
      return;
    }

    setCreating(true);
    try {
      const res = await fetch('/api/admin/video-prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, content })
      });

      const data: ApiResponse<unknown> = await res.json();

      if (data.success) {
        alert('Tạo video prompt thành công!');
        router.push(`/admin/video-prompts/${name}`);
      } else {
        setError(data.error || 'Tạo thất bại');
      }
    } catch (err) {
      setError('Network error');
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const handleLoadTemplate = () => {
    if (content !== TEMPLATE_JSON) {
      if (!confirm('Bạn đang có nội dung. Tải template sẽ ghi đè. Tiếp tục?')) return;
    }
    setContent(TEMPLATE_JSON);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white py-6 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/video-prompts"
              className="text-white hover:text-green-100 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Tạo Video Prompt Mới</h1>
              <p className="text-green-100 text-sm mt-1">
                Nhập tên và JSON content cho video prompt
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-6">
            {/* Error */}
            {error && (
              <div className="mb-6 bg-red-50 border border-red-300 text-red-800 px-4 py-3 rounded-lg">
                <p className="font-semibold">Lỗi:</p>
                <p>{error}</p>
              </div>
            )}

            {/* Name Input */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tên Prompt <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="VD: VideoThuTucKhaiSinh"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none font-mono"
              />
              <p className="mt-2 text-sm text-gray-500">
                💡 Chỉ dùng chữ cái, số, dấu gạch ngang (-) và gạch dưới (_). Không có khoảng trắng.
              </p>
            </div>

            {/* Content Editor */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-gray-700">
                  JSON Content <span className="text-red-500">*</span>
                </label>
                <button
                  onClick={handleLoadTemplate}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  📄 Tải Template Mẫu
                </button>
              </div>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full h-[500px] font-mono text-sm p-4 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
                spellCheck={false}
              />
              <p className="mt-2 text-sm text-gray-500">
                💡 JSON phải có: <code className="bg-gray-100 px-2 py-1 rounded">&#123;"common": &#123;...&#125;, "segments": [...]&#125;</code>
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <Link
                href="/admin/video-prompts"
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Hủy
              </Link>
              <button
                onClick={handleCreate}
                disabled={creating}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
              >
                {creating ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    Đang tạo...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Tạo Video Prompt
                  </>
                )}
              </button>
            </div>

            {/* Help */}
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">📚 Hướng dẫn</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Tên prompt sẽ được lưu thành file <code>TenPrompt-Full.txt</code></li>
                <li>• Hệ thống tự động tạo file segments: <code>TenPrompt-P1.txt</code>, <code>TenPrompt-P2.txt</code>, ...</li>
                <li>• Mỗi segment là 1 cảnh độc lập trong video</li>
                <li>• Nhấn "Tải Template Mẫu" để xem cấu trúc JSON mẫu</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
