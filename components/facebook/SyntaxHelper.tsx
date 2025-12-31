'use client';

import { useState } from 'react';

export default function SyntaxHelper() {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedExample, setCopiedExample] = useState<string | null>(null);

  const examples = [
    {
      title: 'Basic Spin Syntax',
      template: '[Xin chào|Chào bạn|Hi] {full_name}! [Cảm ơn|Thanks] đã [comment|bình luận].',
      description: 'Create variations by wrapping alternatives in [option1|option2|option3]',
    },
    {
      title: 'Nested Spin',
      template: '[Xin chào [bạn|anh|chị]|Chào {first_name}]! Cảm ơn đã quan tâm.',
      description: 'You can nest spin syntax for more complex variations',
    },
    {
      title: 'Multiple Placeholders',
      template: 'Chào {full_name}! Bạn là người {first_name} thật tuyệt vời!',
      description: 'Use multiple placeholders in one template',
    },
    {
      title: 'Long Form Reply',
      template: `Chào {full_name}! 

Cảm ơn bạn đã [comment|để lại bình luận|quan tâm] về [vấn đề|chủ đề|nội dung] này.

[Chúng tôi sẽ|Team mình sẽ|Bên mình sẽ] [trả lời|phản hồi|liên hệ] với bạn [sớm nhất|trong thời gian sớm nhất|ngay khi có thể].

[Chúc bạn một ngày tốt lành|Have a nice day|Cảm ơn bạn]! 🙏`,
      description: 'Multi-line template with line breaks',
    },
  ];

  const copyExample = (template: string) => {
    navigator.clipboard.writeText(template);
    setCopiedExample(template);
    setTimeout(() => setCopiedExample(null), 2000);
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
      >
        <span className="text-sm font-medium text-gray-700">
          📚 Syntax Examples & Tips
        </span>
        <span className="text-gray-500">{isOpen ? '▼' : '▶'}</span>
      </button>

      {isOpen && (
        <div className="p-4 bg-white space-y-4">
          {/* Available Placeholders */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm font-semibold text-blue-900 mb-2">
              Available Placeholders:
            </p>
            <div className="space-y-1 text-xs text-blue-800">
              <div className="flex items-center gap-2">
                <code className="bg-blue-100 px-2 py-1 rounded">{'{ full_name}'}</code>
                <span>→ User's full name (e.g., "Nguyễn Văn A")</span>
              </div>
              <div className="flex items-center gap-2">
                <code className="bg-blue-100 px-2 py-1 rounded">{'{ first_name}'}</code>
                <span>→ User's first name (e.g., "Nguyễn")</span>
              </div>
            </div>
          </div>

          {/* Spin Syntax Rules */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-sm font-semibold text-green-900 mb-2">
              Spin Syntax Rules:
            </p>
            <ul className="list-disc list-inside text-xs text-green-800 space-y-1">
              <li>Wrap alternatives in square brackets: [option1|option2|option3]</li>
              <li>Separate options with pipe character (|)</li>
              <li>Each option must have at least 1 character</li>
              <li>Minimum 2 options per group</li>
              <li>Can nest spin groups for complex variations</li>
              <li>System randomly picks one option from each group</li>
            </ul>
          </div>

          {/* Examples */}
          <div>
            <p className="text-sm font-semibold text-gray-900 mb-2">
              💡 Example Templates:
            </p>
            <div className="space-y-3">
              {examples.map((example, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-xs font-medium text-gray-700">{example.title}</p>
                    <button
                      type="button"
                      onClick={() => copyExample(example.template)}
                      className="text-xs text-blue-600 hover:text-blue-700"
                      title="Copy to clipboard"
                    >
                      {copiedExample === example.template ? '✓ Copied' : '📋 Copy'}
                    </button>
                  </div>
                  <code className="block bg-gray-50 p-2 rounded text-xs text-gray-800 whitespace-pre-wrap font-mono">
                    {example.template}
                  </code>
                  <p className="text-xs text-gray-600 mt-2">{example.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Tips & Best Practices */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm font-semibold text-yellow-900 mb-2">
              ⚡ Tips & Best Practices:
            </p>
            <ul className="list-disc list-inside text-xs text-yellow-800 space-y-1">
              <li>Use 3-5 variations per spin group for best results</li>
              <li>Mix formal and informal language options</li>
              <li>Keep templates between 50-500 characters</li>
              <li>Test preview to ensure natural-sounding variations</li>
              <li>Avoid overusing spin syntax (2-4 groups per template is ideal)</li>
              <li>Make sure all variations make grammatical sense</li>
            </ul>
          </div>

          {/* Common Mistakes */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm font-semibold text-red-900 mb-2">
              ❌ Common Mistakes:
            </p>
            <div className="space-y-2 text-xs text-red-800">
              <div>
                <code className="bg-red-100 px-1 rounded">[option1|]</code>
                <span className="ml-2">→ Empty option not allowed</span>
              </div>
              <div>
                <code className="bg-red-100 px-1 rounded">[only-one-option]</code>
                <span className="ml-2">→ Need at least 2 options</span>
              </div>
              <div>
                <code className="bg-red-100 px-1 rounded">[option1|option2</code>
                <span className="ml-2">→ Missing closing bracket ]</span>
              </div>
              <div>
                <code className="bg-red-100 px-1 rounded">{'{ invalid_placeholder}'}</code>
                <span className="ml-2">→ Only full_name and first_name are supported</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
