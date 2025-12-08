'use client';

import React, { useState } from 'react';

interface AccordionItem {
  id: string;
  title: string;
  content: React.ReactNode;
}

interface AccordionProps {
  items: AccordionItem[];
  allowMultiple?: boolean;
  defaultOpenIds?: string[];
  className?: string;
}

/**
 * Accordion Component
 * Collapsible sections - dùng cho legal documents
 */
export default function Accordion({
  items,
  allowMultiple = false,
  defaultOpenIds = [],
  className = '',
}: AccordionProps) {
  const [openIds, setOpenIds] = useState<string[]>(defaultOpenIds);

  const toggleItem = (id: string) => {
    if (allowMultiple) {
      setOpenIds((prev) =>
        prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
      );
    } else {
      setOpenIds((prev) => (prev.includes(id) ? [] : [id]));
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {items.map((item) => {
        const isOpen = openIds.includes(item.id);

        return (
          <div
            key={item.id}
            className="card border"
            style={{ borderColor: 'var(--color-border-subtle)' }}
          >
            {/* Header */}
            <button
              onClick={() => toggleItem(item.id)}
              className="w-full flex items-center justify-between py-3 px-4 text-left hover:bg-gray-50 transition-colors rounded-lg"
            >
              <span className="font-semibold text-sm" style={{ color: 'var(--color-text-main)' }}>
                {item.title}
              </span>
              <svg
                className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                style={{ color: 'var(--color-text-muted)' }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* Content */}
            {isOpen && (
              <div className="px-4 pb-4 pt-2 text-sm" style={{ color: 'var(--color-text-main)' }}>
                {item.content}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
