'use client';

import { useState } from 'react';

interface TemplateEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}

export default function TemplateEditor({
  value,
  onChange,
  placeholder = 'Enter your template...',
  rows = 8,
}: TemplateEditorProps) {
  const [showHelp, setShowHelp] = useState(false);

  const insertPlaceholder = (placeholder: string) => {
    onChange(value + placeholder);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-gray-700">Template</label>
        <button
          type="button"
          onClick={() => setShowHelp(!showHelp)}
          className="text-xs text-blue-600 hover:text-blue-700"
        >
          {showHelp ? 'Hide Help' : 'Show Help'}
        </button>
      </div>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
        placeholder={placeholder}
      />

      {/* Quick Insert Buttons */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => insertPlaceholder('{full_name}')}
          className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
        >
          + Full Name
        </button>
        <button
          type="button"
          onClick={() => insertPlaceholder('{first_name}')}
          className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
        >
          + First Name
        </button>
        <button
          type="button"
          onClick={() => insertPlaceholder('[option1|option2|option3]')}
          className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
        >
          + Spin Syntax
        </button>
      </div>

      {/* Help Panel */}
      {showHelp && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
          <p className="font-semibold text-blue-900 mb-2">💡 Template Syntax Guide:</p>
          <div className="space-y-2 text-blue-800 text-xs">
            <div>
              <code className="bg-blue-100 px-1 rounded">{'{ full_name}'}</code>
              <span className="ml-2">→ Replaced with user's full name (e.g., "Nguyễn Văn A")</span>
            </div>
            <div>
              <code className="bg-blue-100 px-1 rounded">{'{ first_name}'}</code>
              <span className="ml-2">→ Replaced with user's first name (e.g., "Nguyễn")</span>
            </div>
            <div>
              <code className="bg-blue-100 px-1 rounded">[option1|option2|option3]</code>
              <span className="ml-2">→ Randomly picks one option</span>
            </div>
            <div className="pt-2 border-t border-blue-200">
              <p className="font-medium">Example:</p>
              <code className="block mt-1 bg-blue-100 p-2 rounded">
                Xin chào {'{ full_name}'}! [Cảm ơn bạn|Thanks bạn] đã [quan tâm|comment].
              </code>
            </div>
            <div className="pt-2">
              <p className="font-medium">Requirements:</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Minimum 10 characters</li>
                <li>Maximum 2000 characters</li>
                <li>At least 5 unique variations when using spin syntax</li>
                <li>No empty groups in spin syntax</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
