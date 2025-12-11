'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CreateVideoPromptPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [fullJson, setFullJson] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate name
    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    // Validate JSON structure
    try {
      const parsed = JSON.parse(fullJson);
      
      if (!parsed.common) {
        setError('JSON must contain "common" object');
        return;
      }
      
      if (!Array.isArray(parsed.segments) || parsed.segments.length === 0) {
        setError('JSON must contain "segments" array with at least one segment');
        return;
      }
    } catch (err) {
      setError('Invalid JSON format');
      return;
    }

    setCreating(true);

    try {
      const res = await fetch('/api/admin/video-prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          content: fullJson,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        alert('Video prompt created successfully! Segment files generated.');
        router.push(`/admin/video-prompts/${name.trim()}`);
      } else {
        setError(data.error || 'Failed to create video prompt');
      }
    } catch (err) {
      setError('Failed to create video prompt');
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const exampleJson = `{
  "common": {
    "project_title": "Example Video",
    "author": "Your Name",
    "description": "Video description"
  },
  "segments": [
    {
      "segment_id": 1,
      "voiceover": "This is the voiceover text",
      "scene_description": "Scene description here",
      "camera": "Camera movement details",
      "data_visualization": "Data viz instructions"
    }
  ]
}`;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/video-prompts"
              className="text-gray-600 hover:text-gray-900"
            >
              ← Back
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Create Video Prompt</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
                <button
                  type="button"
                  onClick={() => setError('')}
                  className="float-right text-red-900 hover:text-red-700"
                >
                  ×
                </button>
              </div>
            )}

            {/* Name Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., my-video-prompt"
                required
              />
              <p className="mt-1 text-sm text-gray-500">
                This will be used as the filename (without extension)
              </p>
            </div>

            {/* JSON Content Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full JSON Content <span className="text-red-500">*</span>
              </label>
              <textarea
                value={fullJson}
                onChange={(e) => setFullJson(e.target.value)}
                rows={20}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                placeholder="Enter complete JSON with common and segments..."
                required
              />
              <p className="mt-2 text-sm text-gray-500">
                <strong>Required structure:</strong> JSON must contain{' '}
                <code className="px-1 py-0.5 bg-gray-100 rounded">"common"</code> object and{' '}
                <code className="px-1 py-0.5 bg-gray-100 rounded">"segments"</code> array.
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Individual segment files (P1, P2, etc.) will be automatically generated.
              </p>
            </div>

            {/* Example JSON */}
            <details className="border border-gray-200 rounded-lg">
              <summary className="px-4 py-3 cursor-pointer hover:bg-gray-50 font-medium text-gray-700">
                Show Example JSON Structure
              </summary>
              <div className="px-4 py-3 border-t border-gray-200">
                <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto text-xs">
                  <code>{exampleJson}</code>
                </pre>
                <button
                  type="button"
                  onClick={() => setFullJson(exampleJson)}
                  className="mt-3 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition text-sm"
                >
                  Use This Example
                </button>
              </div>
            </details>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={creating}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creating ? 'Creating...' : 'Create Video Prompt'}
              </button>
              <Link
                href="/admin/video-prompts"
                className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
              >
                Cancel
              </Link>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">ℹ️ How it works:</h3>
              <ul className="list-disc list-inside text-sm text-blue-800 space-y-1">
                <li>
                  Your JSON will be saved as <code className="px-1 py-0.5 bg-blue-100 rounded">{'{name}'}-Full.txt</code>
                </li>
                <li>
                  Each segment will be extracted and saved as separate files ({'{name}'}-P1.txt, {'{name}'}-P2.txt, etc.)
                </li>
                <li>Each segment file will include the common metadata plus the specific segment data</li>
                <li>You can edit and regenerate segment files later from the detail page</li>
              </ul>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
