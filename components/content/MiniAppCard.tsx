import React from 'react';
import Card from '../ui/Card';
import Chip from '../ui/Chip';

interface MiniAppCardProps {
  slug: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  icon?: string;
  isPublished: boolean;
  onClick?: () => void;
  className?: string;
}

/**
 * MiniAppCard Component
 * Hiển thị mini app trong catalog
 */
export default function MiniAppCard({
  slug,
  title,
  description,
  category,
  tags,
  icon,
  isPublished,
  onClick,
  className = '',
}: MiniAppCardProps) {
  return (
    <Card
      variant="elevated"
      className={`${className} ${!isPublished ? 'opacity-60' : ''}`}
      onClick={onClick}
    >
      {/* Icon + Title */}
      <div className="flex items-start gap-3 mb-2">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
          style={{ background: 'var(--color-primary-soft)' }}
        >
          {icon || '✨'}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm mb-1" style={{ color: 'var(--color-primary)' }}>
            {title}
          </h3>
          <p className="text-xs text-muted">{category}</p>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-muted mb-3 line-clamp-2">{description}</p>

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

      {/* Status Badge */}
      {!isPublished && (
        <div className="mt-3 pt-3 border-t" style={{ borderColor: 'var(--color-border-subtle)' }}>
          <span className="text-xs font-medium text-warning">Chưa xuất bản</span>
        </div>
      )}
    </Card>
  );
}
