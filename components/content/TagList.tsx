import React from 'react';
import Chip from '../ui/Chip';

interface TagListProps {
  tags: string[];
  maxDisplay?: number;
  maxVisible?: number; // Alias for maxDisplay
  onTagClick?: (tag: string) => void;
  onRemove?: (tag: string) => void;
  size?: 'sm' | 'md';
  className?: string;
}

/**
 * TagList Component
 * Hiển thị danh sách tags với limit
 */
export default function TagList({
  tags,
  maxDisplay,
  maxVisible,
  onTagClick,
  onRemove,
  size = 'sm',
  className = '',
}: TagListProps) {
  const limit = maxVisible || maxDisplay || 5;
  if (!tags || tags.length === 0) {
    return null;
  }

  const displayTags = tags.slice(0, limit);
  const remainingCount = tags.length - limit;

  return (
    <div className={`flex flex-wrap gap-1.5 items-center ${className}`}>
      {displayTags.map((tag) => (
        <Chip
          key={tag}
          size={size}
          onClick={onTagClick ? () => onTagClick(tag) : undefined}
          onRemove={onRemove ? () => onRemove(tag) : undefined}
        >
          {tag}
        </Chip>
      ))}

      {remainingCount > 0 && (
        <span className="text-xs text-muted font-medium">+{remainingCount}</span>
      )}
    </div>
  );
}
