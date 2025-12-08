import React from 'react';
import Card from '../ui/Card';
import Chip from '../ui/Chip';

interface PromptCardProps {
  title: string;
  category: string;
  tags: string[];
  isPublic: boolean;
  body?: string;
  onClick?: () => void;
  onCopy?: () => void;
  className?: string;
}

/**
 * PromptCard Component
 * Hiển thị prompt trong danh sách
 */
export default function PromptCard({
  title,
  category,
  tags,
  isPublic,
  body,
  onClick,
  onCopy,
  className = '',
}: PromptCardProps) {
  return (
    <Card variant="outlined" className={`${className}`} onClick={onClick}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="font-semibold text-sm flex-1" style={{ color: 'var(--color-primary)' }}>
          {title}
        </h3>
        {!isPublic && (
          <svg
            className="w-4 h-4 shrink-0 text-muted"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </div>

      {/* Category */}
      <p className="text-xs text-muted mb-3">{category}</p>

      {/* Body Preview (nếu có) */}
      {body && (
        <p className="text-sm text-muted mb-3 line-clamp-2">{body}</p>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {tags.map((tag) => (
            <Chip key={tag} size="sm">
              {tag}
            </Chip>
          ))}
        </div>
      )}

      {/* Action */}
      {onCopy && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onCopy();
          }}
          className="text-xs font-medium flex items-center gap-1.5 hover:underline"
          style={{ color: 'var(--color-primary)' }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
          Copy prompt
        </button>
      )}
    </Card>
  );
}
