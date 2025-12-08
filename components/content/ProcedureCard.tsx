import React from 'react';
import Card from '../ui/Card';
import Chip from '../ui/Chip';

interface ProcedureCardProps {
  title: string;
  category: string;
  difficulty: string;
  estimatedTime?: string;
  authority?: string;
  tags: string[];
  onClick?: () => void;
  className?: string;
}

/**
 * ProcedureCard Component
 * Hiển thị thủ tục hành chính trong danh sách
 */
export default function ProcedureCard({
  title,
  category,
  difficulty,
  estimatedTime,
  authority,
  tags,
  onClick,
  className = '',
}: ProcedureCardProps) {
  const difficultyColors = {
    easy: { bg: 'bg-green-100', text: 'text-green-700', label: 'Dễ' },
    medium: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Trung bình' },
    hard: { bg: 'bg-red-100', text: 'text-red-700', label: 'Khó' },
  };

  const difficultyConfig =
    difficultyColors[difficulty as keyof typeof difficultyColors] ||
    difficultyColors.medium;

  return (
    <Card variant="outlined" className={className} onClick={onClick}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="font-semibold text-sm flex-1" style={{ color: 'var(--color-primary)' }}>
          {title}
        </h3>

        {/* Difficulty Badge */}
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded shrink-0 ${difficultyConfig.bg} ${difficultyConfig.text}`}
        >
          {difficultyConfig.label}
        </span>
      </div>

      {/* Category */}
      <p className="text-xs text-muted mb-3">{category}</p>

      {/* Meta Info */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        {estimatedTime && (
          <div className="flex items-center gap-2 text-xs text-muted">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{estimatedTime}</span>
          </div>
        )}
        {authority && (
          <div className="flex items-center gap-2 text-xs text-muted">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
            <span>{authority}</span>
          </div>
        )}
      </div>

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.slice(0, 3).map((tag) => (
            <Chip key={tag} size="sm">
              {tag}
            </Chip>
          ))}
          {tags.length > 3 && (
            <span className="text-xs text-muted">+{tags.length - 3}</span>
          )}
        </div>
      )}
    </Card>
  );
}
