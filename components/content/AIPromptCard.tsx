import React from 'react';

interface AIPromptCardProps {
  id: string;
  title: string;
  description?: string;
  promptTemplate: string;
  exampleImageUrl?: string;
  creatorCode?: string | null; // Optional for anonymous users
  category: string;
  tags: string[];
  likesCount: number;
  viewsCount: number;
  onClick?: () => void;
  onCopy?: (prompt: string) => void;
  className?: string;
}

/**
 * AIPromptCard Component - Clean Design như ảnh mẫu
 * Hiển thị AI Image Prompt với ảnh 16:9, description, prompt textarea
 */
export default function AIPromptCard({
  id,
  title,
  description,
  promptTemplate,
  exampleImageUrl,
  creatorCode,
  category,
  tags,
  likesCount,
  viewsCount,
  onClick,
  onCopy,
  className = '',
}: AIPromptCardProps) {
  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(promptTemplate);
    onCopy?.(promptTemplate);
  };

  return (
    <div
      className={`bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-all ${className}`}
      onClick={onClick}
    >
      {/* Ảnh ví dụ 16:9 hoặc SVG placeholder */}
      <div className="relative w-full aspect-video bg-gradient-to-br from-blue-50 to-purple-50">
        {exampleImageUrl ? (
          <img
            src={exampleImageUrl}
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          // SVG Placeholder khi không có ảnh
          <div className="flex items-center justify-center h-full">
            <svg className="w-20 h-20 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
        )}
        
        {/* Category badge */}
        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white/90 backdrop-blur-sm text-gray-700 shadow-sm">
            {category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
          {title}
        </h3>

        {/* Description */}
        {description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-3">
            {description}
          </p>
        )}

        {/* Prompt Section */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">
              PROMPT
            </span>
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy Prompt
            </button>
          </div>
          
          <div className="relative">
            <textarea
              value={promptTemplate}
              readOnly
              className="w-full p-3 text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-lg resize-none focus:outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
              rows={4}
            />
          </div>
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {tags.slice(0, 4).map((tag, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-md"
              >
                #{tag}
              </span>
            ))}
            {tags.length > 4 && (
              <span className="px-2 py-0.5 text-xs text-gray-500">
                +{tags.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Footer: Creator & Stats */}
        <div className="flex items-center justify-between text-sm text-gray-500 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">
              {creatorCode ? `@${creatorCode}` : 'Ẩn danh'}
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              {viewsCount}
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
              {likesCount}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
