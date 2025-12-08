import React from 'react';
import Card from '../ui/Card';
import Chip from '../ui/Chip';

interface LegalDocCardProps {
  title: string;
  code: string;
  category: string;
  documentType: string;
  tags: string[];
  issuedDate?: string;
  effectiveDate?: string;
  status?: string;
  onClick?: () => void;
  className?: string;
}

/**
 * LegalDocCard Component
 * Hiển thị văn bản pháp luật trong danh sách
 */
export default function LegalDocCard({
  title,
  code,
  category,
  documentType,
  tags,
  issuedDate,
  effectiveDate,
  status = 'active',
  onClick,
  className = '',
}: LegalDocCardProps) {
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN');
  };

  return (
    <Card variant="outlined" className={className} onClick={onClick}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium px-2 py-0.5 rounded bg-blue-100 text-blue-700">
              {code}
            </span>
            {status === 'active' && (
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
            )}
          </div>
          <h3 className="font-semibold text-sm" style={{ color: 'var(--color-primary)' }}>
            {title}
          </h3>
        </div>

        {/* Document Type Icon */}
        <svg
          className="w-5 h-5 shrink-0 text-muted"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      </div>

      {/* Meta Info */}
      <div className="space-y-1 mb-3">
        <p className="text-xs text-muted">
          <span className="font-medium">Loại:</span> {documentType}
        </p>
        {issuedDate && (
          <p className="text-xs text-muted">
            <span className="font-medium">Ban hành:</span> {formatDate(issuedDate)}
          </p>
        )}
        {effectiveDate && (
          <p className="text-xs text-muted">
            <span className="font-medium">Hiệu lực:</span> {formatDate(effectiveDate)}
          </p>
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
