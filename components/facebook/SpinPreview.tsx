'use client';

import { useState, useEffect } from 'react';

interface SpinPreviewProps {
  template: string;
  userName?: string;
}

export default function SpinPreview({ template, userName = 'Nguyễn Văn A' }: SpinPreviewProps) {
  const [previews, setPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState<number | null>(null);

  useEffect(() => {
    if (!template || template.trim().length === 0) {
      setPreviews([]);
      return;
    }

    const timer = setTimeout(() => {
      generatePreviews();
    }, 500); // Debounce 500ms

    return () => clearTimeout(timer);
  }, [template, userName]);

  const generatePreviews = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/facebook/reply-rules/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template,
          user_name: userName,
          count: 5, // Generate 5 variations for preview
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to generate preview');
      }

      const data = await response.json();
      setPreviews(data.variations || []);
    } catch (err: any) {
      setError(err.message);
      setPreviews([]);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopied(index);
    setTimeout(() => setCopied(null), 2000);
  };

  if (!template || template.trim().length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
        <p className="text-gray-500 text-sm">
          📝 Type a template to see preview variations here
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-500 text-sm mt-2">Generating previews...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700 text-sm">⚠️ {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-gray-700">
          Preview Variations ({previews.length})
        </p>
        <button
          type="button"
          onClick={generatePreviews}
          className="text-xs text-blue-600 hover:text-blue-700"
        >
          🔄 Refresh
        </button>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {previews.map((variation, index) => (
          <div
            key={index}
            className="bg-gray-50 border border-gray-200 rounded-lg p-3 group hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <span className="text-xs text-gray-500 font-medium">#{index + 1}</span>
                <p className="text-sm text-gray-800 mt-1">{variation}</p>
              </div>
              <button
                type="button"
                onClick={() => copyToClipboard(variation, index)}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-blue-600 text-xs"
                title="Copy to clipboard"
              >
                {copied === index ? '✓' : '📋'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {previews.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
          <p className="text-yellow-700 text-sm">
            No variations generated. Check your template syntax.
          </p>
        </div>
      )}
    </div>
  );
}
